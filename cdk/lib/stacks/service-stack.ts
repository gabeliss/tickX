import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Table, ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { APP_NAME } from '../constants';

interface ServiceStackProps extends StackProps {
  eventsTable: ITable;
  venuesTable: ITable;
  usersTable: ITable;
  listingsTable: ITable;
  bidsTable: ITable;
  transactionsTable: ITable;
}

export class ServiceStack extends Stack {
  public readonly eventsLambda: Function;
  public readonly listingsLambda: Function;
  public readonly venuesLambda: Function;
  public readonly syncLambda: Function;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    // Common Lambda environment variables
    const lambdaEnvironment = {
      EVENTS_TABLE: props.eventsTable.tableName,
      VENUES_TABLE: props.venuesTable.tableName,
      USERS_TABLE: props.usersTable.tableName,
      LISTINGS_TABLE: props.listingsTable.tableName,
      BIDS_TABLE: props.bidsTable.tableName,
      TRANSACTIONS_TABLE: props.transactionsTable.tableName,
      TM_API_KEY_PARAM: '/tickx/ticketmaster-api-key',
      SYNC_ENABLED: 'false',
    };

    // Common Lambda configuration
    const lambdaConfig = {
      runtime: Runtime.JAVA_17,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: lambdaEnvironment,
    };

    // Events Lambda
    this.eventsLambda = new Function(this, 'EventsLambda', {
      ...lambdaConfig,
      handler: 'com.tickx.handler.EventsHandler',
      code: Code.fromAsset('../backend/build/libs/tickx-backend-0.0.1-SNAPSHOT-lambda.jar'),
      description: `Events handler - deployed ${new Date().toISOString()}`,
    });

    // Listings Lambda
    this.listingsLambda = new Function(this, 'ListingsLambda', {
      ...lambdaConfig,
      handler: 'com.tickx.handler.ListingsHandler',
      code: Code.fromAsset('../backend/build/libs/tickx-backend-0.0.1-SNAPSHOT-lambda.jar'),
      description: `Listings handler - deployed ${new Date().toISOString()}`,
    });

    // Venues Lambda
    this.venuesLambda = new Function(this, 'VenuesLambda', {
      ...lambdaConfig,
      handler: 'com.tickx.handler.VenuesHandler',
      code: Code.fromAsset('../backend/build/libs/tickx-backend-0.0.1-SNAPSHOT-lambda.jar'),
      description: `Venues handler - deployed ${new Date().toISOString()}`,
    });

    // Sync Lambda
    this.syncLambda = new Function(this, 'SyncLambda', {
      ...lambdaConfig,
      timeout: Duration.minutes(5),
      handler: 'com.tickx.handler.SyncHandler',
      code: Code.fromAsset('../backend/build/libs/tickx-backend-0.0.1-SNAPSHOT-lambda.jar'),
      description: `Sync handler - deployed ${new Date().toISOString()}`,
    });

    // Grant DynamoDB permissions to all Lambdas
    const lambdas = [this.eventsLambda, this.listingsLambda, this.venuesLambda, this.syncLambda];
    const tables = [
      props.eventsTable,
      props.venuesTable,
      props.usersTable,
      props.listingsTable,
      props.bidsTable,
      props.transactionsTable,
    ];

    lambdas.forEach(lambda => {
      tables.forEach(table => {
        table.grantReadWriteData(lambda);
        // Grant access to GSI indexes
        lambda.addToRolePolicy(new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['dynamodb:Query'],
          resources: [`${table.tableArn}/index/*`],
        }));
      });

      // Grant SSM parameter access
      lambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/tickx/*`],
      }));
    });

    // Schedule sync Lambda to run daily at 4 AM UTC
    new Rule(this, 'SyncScheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '4' }),
      targets: [new LambdaFunction(this.syncLambda)],
    });
  }
}