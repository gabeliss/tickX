import { Stack, StackProps } from 'aws-cdk-lib';
import { Table, ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { DYNAMODB_EVENTS_TABLE, DYNAMODB_VENUES_TABLE } from '../constants';

export class DynamoDbStack extends Stack {
  public readonly eventsTable: ITable;
  public readonly venuesTable: ITable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import existing tables
    this.eventsTable = Table.fromTableName(
      this, 'EventsTable', DYNAMODB_EVENTS_TABLE
    );

    this.venuesTable = Table.fromTableName(
      this, 'VenuesTable', DYNAMODB_VENUES_TABLE
    );
  }
}