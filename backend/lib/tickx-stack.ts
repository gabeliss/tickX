import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

// SSM parameter name for Ticketmaster API key
const TM_API_KEY_PARAM_NAME = '/tickx/ticketmaster-api-key';

export class TickXStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =========================================================================
    // DynamoDB Tables
    // =========================================================================

    // Events Table
    const eventsTable = new dynamodb.Table(this, 'EventsTable', {
      tableName: 'TickX-Events',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
    });

    // GSI1: Events by City + Date
    eventsTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: Events by Category + Date
    eventsTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI3: Events by Venue + Date
    eventsTable.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Venues Table
    const venuesTable = new dynamodb.Table(this, 'VenuesTable', {
      tableName: 'TickX-Venues',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
    });

    // GSI1: Venues by City
    venuesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // =========================================================================
    // Lambda Functions - Sync
    // =========================================================================

    // Common environment variables
    const commonEnv = {
      EVENTS_TABLE: eventsTable.tableName,
      VENUES_TABLE: venuesTable.tableName,
      NODE_OPTIONS: '--enable-source-maps',
    };

    // Sync Events Lambda
    const syncEventsLambda = new lambdaNodejs.NodejsFunction(this, 'SyncEventsLambda', {
      functionName: 'TickX-SyncEvents',
      entry: path.join(__dirname, '../src/lambdas/sync-events/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(10),
      memorySize: 1024,
      environment: commonEnv,
      description: 'Syncs events from Ticketmaster API to DynamoDB',
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: [],
      },
    });

    // Grant permissions
    eventsTable.grantReadWriteData(syncEventsLambda);
    venuesTable.grantReadWriteData(syncEventsLambda);

    // Grant permission to read SSM SecureString parameter
    syncEventsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${TM_API_KEY_PARAM_NAME}`,
        ],
      })
    );

    // Add SSM parameter name to environment
    syncEventsLambda.addEnvironment('TM_API_KEY_PARAM', TM_API_KEY_PARAM_NAME);

    // Schedule: Run every hour
    const syncEventsRule = new events.Rule(this, 'SyncEventsRule', {
      ruleName: 'TickX-SyncEventsSchedule',
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      description: 'Triggers event sync from Ticketmaster every hour',
    });
    syncEventsRule.addTarget(new targets.LambdaFunction(syncEventsLambda));

    // =========================================================================
    // Lambda Functions - API
    // =========================================================================

    // Get Events Lambda
    const getEventsLambda = new lambdaNodejs.NodejsFunction(this, 'GetEventsLambda', {
      functionName: 'TickX-GetEvents',
      entry: path.join(__dirname, '../src/lambdas/api-events/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: commonEnv,
      description: 'API handler for getting events',
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: [],
      },
    });
    eventsTable.grantReadData(getEventsLambda);

    // Get Venues Lambda
    const getVenuesLambda = new lambdaNodejs.NodejsFunction(this, 'GetVenuesLambda', {
      functionName: 'TickX-GetVenues',
      entry: path.join(__dirname, '../src/lambdas/api-venues/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: commonEnv,
      description: 'API handler for getting venues',
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: [],
      },
    });
    venuesTable.grantReadData(getVenuesLambda);

    // =========================================================================
    // API Gateway
    // =========================================================================

    const api = new apigateway.RestApi(this, 'TickXApi', {
      restApiName: 'TickX API',
      description: 'TickX Ticket Marketplace API',
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Events endpoints
    const eventsResource = api.root.addResource('events');
    eventsResource.addMethod('GET', new apigateway.LambdaIntegration(getEventsLambda));

    const eventByIdResource = eventsResource.addResource('{eventId}');
    eventByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getEventsLambda));

    // Venues endpoints
    const venuesResource = api.root.addResource('venues');
    venuesResource.addMethod('GET', new apigateway.LambdaIntegration(getVenuesLambda));

    const venueByIdResource = venuesResource.addResource('{venueId}');
    venueByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getVenuesLambda));

    // =========================================================================
    // Outputs
    // =========================================================================

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'TickX API Gateway URL',
    });

    new cdk.CfnOutput(this, 'EventsTableName', {
      value: eventsTable.tableName,
      description: 'DynamoDB Events Table Name',
    });

    new cdk.CfnOutput(this, 'VenuesTableName', {
      value: venuesTable.tableName,
      description: 'DynamoDB Venues Table Name',
    });

    new cdk.CfnOutput(this, 'SyncEventsLambdaArn', {
      value: syncEventsLambda.functionArn,
      description: 'Sync Events Lambda ARN (invoke manually for initial sync)',
    });
  }
}
