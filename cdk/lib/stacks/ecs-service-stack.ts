import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, LogDrivers } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import {
  APP_NAME,
  ECS_TASK_MEMORY, 
  ECS_TASK_CPU, 
  ECS_DESIRED_COUNT, 
  ECS_CONTAINER_PORT,
  LOAD_BALANCER_PORT,
  DYNAMODB_ACTIONS,
  DYNAMODB_EVENTS_TABLE, 
  DYNAMODB_VENUES_TABLE,
  DYNAMODB_USERS_TABLE,
  DYNAMODB_LISTINGS_TABLE,
  DYNAMODB_BIDS_TABLE,
  DYNAMODB_TRANSACTIONS_TABLE,
  SSM_ACTIONS,
  SSM_TICKETMASTER_API_KEY,
  HEALTH_CHECK_PATH,
  HEALTH_CHECK_INTERVAL_SECONDS,
  HEALTH_CHECK_TIMEOUT_SECONDS,
  HEALTH_CHECK_RETRIES,
  HEALTH_CHECK_START_PERIOD_SECONDS,
  HEALTH_CHECK_HEALTHY_THRESHOLD,
  HEALTH_CHECK_UNHEALTHY_THRESHOLD
} from '../constants';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

export interface EcsServiceStackProps extends StackProps {
  vpc: IVpc;
  eventsTable: ITable;
  venuesTable: ITable;
}

export class EcsServiceStack extends Stack {
  public readonly fargateService: ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props);

    // ECS Cluster
    const cluster = new Cluster(this, `${APP_NAME}-Cluster`, {
      vpc: props.vpc,
      clusterName: `${APP_NAME}-Cluster`,
    });

    // ApplicationLoadBalancedFargateService
    this.fargateService = new ApplicationLoadBalancedFargateService(this, `${APP_NAME}-Service`, {
      cluster,
      serviceName: `${APP_NAME}-Service`,
      cpu: ECS_TASK_CPU,
      memoryLimitMiB: ECS_TASK_MEMORY,
      desiredCount: ECS_DESIRED_COUNT,
      taskImageOptions: {
        image: ContainerImage.fromAsset('../backend', {
          platform: Platform.LINUX_AMD64,
        }),
        containerPort: ECS_CONTAINER_PORT,
        environment: {
          AWS_REGION: this.region,
          EVENTS_TABLE: DYNAMODB_EVENTS_TABLE,
          VENUES_TABLE: DYNAMODB_VENUES_TABLE,
          USERS_TABLE: DYNAMODB_USERS_TABLE,
          LISTINGS_TABLE: DYNAMODB_LISTINGS_TABLE,
          BIDS_TABLE: DYNAMODB_BIDS_TABLE,
          TRANSACTIONS_TABLE: DYNAMODB_TRANSACTIONS_TABLE,
          TM_API_KEY_PARAM: SSM_TICKETMASTER_API_KEY,
          SYNC_ENABLED: 'true',
        },
        logDriver: LogDrivers.awsLogs({
          streamPrefix: APP_NAME.toLocaleLowerCase(),
          logGroup: new LogGroup(this, `${APP_NAME}-ServiceLogs`, {
            logGroupName: `${APP_NAME}-ServiceLogs`,
            retention: RetentionDays.ONE_YEAR,
            removalPolicy: RemovalPolicy.DESTROY,
          }),
        }),
      },
      publicLoadBalancer: true,
      listenerPort: LOAD_BALANCER_PORT,
      healthCheck: {
        command: ['CMD-SHELL', `wget --no-verbose --tries=1 --spider http://localhost:${ECS_CONTAINER_PORT}${HEALTH_CHECK_PATH} || exit 1`],
        interval: Duration.seconds(HEALTH_CHECK_INTERVAL_SECONDS),
        timeout: Duration.seconds(HEALTH_CHECK_TIMEOUT_SECONDS),
        retries: HEALTH_CHECK_RETRIES,
        startPeriod: Duration.seconds(HEALTH_CHECK_START_PERIOD_SECONDS),
      }
    });

    // Configure health check path
    this.fargateService.targetGroup.configureHealthCheck({
        path: HEALTH_CHECK_PATH,
        interval: Duration.seconds(HEALTH_CHECK_INTERVAL_SECONDS),
        timeout: Duration.seconds(HEALTH_CHECK_TIMEOUT_SECONDS),
        healthyThresholdCount: HEALTH_CHECK_HEALTHY_THRESHOLD,
        unhealthyThresholdCount: HEALTH_CHECK_UNHEALTHY_THRESHOLD,
      });

    // Add DynamoDB permissions
    this.fargateService.taskDefinition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: DYNAMODB_ACTIONS,
        resources: [
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_EVENTS_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_EVENTS_TABLE}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_VENUES_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_VENUES_TABLE}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_USERS_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_USERS_TABLE}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_LISTINGS_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_LISTINGS_TABLE}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_BIDS_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_BIDS_TABLE}/index/*`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_TRANSACTIONS_TABLE}`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${DYNAMODB_TRANSACTIONS_TABLE}/index/*`,
        ],
      })
    );

    // Add SSM parameter permissions
    this.fargateService.taskDefinition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: SSM_ACTIONS,
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${SSM_TICKETMASTER_API_KEY}`,
        ],
      })
    );

    // Outputs
    new CfnOutput(this, 'ApiUrl', {
      value: `http://${this.fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'Backend API URL for frontend configuration',
    });
  }
}