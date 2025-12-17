import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class TickXStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================================================
    // DYNAMODB TABLES (import existing tables)
    // ==========================================================================

    const eventsTable = dynamodb.Table.fromTableName(
      this, 'EventsTable', 'TickX-Events'
    );

    const venuesTable = dynamodb.Table.fromTableName(
      this, 'VenuesTable', 'TickX-Venues'
    );

    // ==========================================================================
    // VPC
    // ==========================================================================

    const vpc = new ec2.Vpc(this, 'TickXVpc', {
      maxAzs: 2,
      natGateways: 1, // Reduce cost for MVP
    });

    // ==========================================================================
    // ECS CLUSTER
    // ==========================================================================

    const cluster = new ecs.Cluster(this, 'TickXCluster', {
      vpc,
      clusterName: 'TickX-Cluster',
      containerInsights: true,
    });

    // ==========================================================================
    // DOCKER IMAGE
    // ==========================================================================

    const dockerImage = new ecr_assets.DockerImageAsset(this, 'TickXImage', {
      directory: path.join(__dirname, '../..'), // backend-java directory
      file: 'Dockerfile',
      platform: ecr_assets.Platform.LINUX_AMD64, // Build for x86_64 (Fargate default)
    });

    // ==========================================================================
    // TASK DEFINITION
    // ==========================================================================

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TickXTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    // Grant permissions to access DynamoDB (explicit policy for imported tables)
    taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
        ],
        resources: [
          `arn:aws:dynamodb:${this.region}:${this.account}:table/TickX-Events`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/TickX-Events/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/TickX-Venues`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/TickX-Venues/index/*`,
        ],
      })
    );

    // Grant permission to read SSM parameter
    taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/tickx/ticketmaster-api-key`,
        ],
      })
    );

    // Add container
    const container = taskDefinition.addContainer('TickXContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'tickx',
        logGroup: new logs.LogGroup(this, 'TickXLogGroup', {
          logGroupName: '/ecs/tickx-backend',
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
      environment: {
        AWS_REGION: this.region,
        EVENTS_TABLE: 'TickX-Events',
        VENUES_TABLE: 'TickX-Venues',
        TM_API_KEY_PARAM: '/tickx/ticketmaster-api-key',
        SYNC_ENABLED: 'true',
      },
      healthCheck: {
        command: ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    container.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    });

    // ==========================================================================
    // ALB + FARGATE SERVICE
    // ==========================================================================

    const alb = new elbv2.ApplicationLoadBalancer(this, 'TickXALB', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'TickX-ALB',
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
    });

    const fargateService = new ecs.FargateService(this, 'TickXService', {
      cluster,
      taskDefinition,
      desiredCount: 1, // MVP: single instance
      serviceName: 'TickX-Backend',
      assignPublicIp: false,
    });

    listener.addTargets('TickXTarget', {
      port: 8080,
      targets: [fargateService],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // ==========================================================================
    // OUTPUTS
    // ==========================================================================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'LoadBalancerArn', {
      value: alb.loadBalancerArn,
      description: 'ALB ARN',
    });
  }
}
