import { App } from 'aws-cdk-lib';
import { DynamoDbStack, ServiceStack, ApiGatewayStack } from './stacks';
import { APP_NAME, AWS_REGION } from './constants';

export class TickXApp extends App {
  constructor() {
    super();

    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || AWS_REGION.US_EAST_1,
    };

    // DynamoDB Stack
    const dynamoDbStack = new DynamoDbStack(this, `${APP_NAME}-DynamoDb`, {
      env,
    });

    // Service Stack
    const serviceStack = new ServiceStack(this, `${APP_NAME}-Service`, {
      env,
      eventsTable: dynamoDbStack.eventsTable,
      venuesTable: dynamoDbStack.venuesTable,
      usersTable: dynamoDbStack.usersTable,
      listingsTable: dynamoDbStack.listingsTable,
      bidsTable: dynamoDbStack.bidsTable,
      transactionsTable: dynamoDbStack.transactionsTable,
    });

    // API Gateway Stack
    const apiGatewayStack = new ApiGatewayStack(this, `${APP_NAME}-ApiGateway`, {
      env,
      eventsLambda: serviceStack.eventsLambda,
      listingsLambda: serviceStack.listingsLambda,
      venuesLambda: serviceStack.venuesLambda,
    });

    // Stack dependencies
    serviceStack.addDependency(dynamoDbStack);
    apiGatewayStack.addDependency(serviceStack);
  }
}