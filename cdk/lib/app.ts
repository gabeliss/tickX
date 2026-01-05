import { App } from 'aws-cdk-lib';
import { DynamoDbStack } from './stacks/dynamodb-stack';
import { VpcStack } from './stacks/vpc-stack';
import { EcsServiceStack } from './stacks/ecs-service-stack';
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

    // VPC Stack
    const vpcStack = new VpcStack(this, `${APP_NAME}-Vpc`, {
      env,
    });

    // ECS Service Stack
    const ecsServiceStack = new EcsServiceStack(this, `${APP_NAME}-EcsService`, {
      env,
      vpc: vpcStack.vpc,
      eventsTable: dynamoDbStack.eventsTable,
      venuesTable: dynamoDbStack.venuesTable,
    });

    // Stack dependencies
    ecsServiceStack.addDependency(vpcStack);
    ecsServiceStack.addDependency(dynamoDbStack);
  }
}