import { Stack, StackProps } from 'aws-cdk-lib';
import { Table, ITable, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {
  DYNAMODB_EVENTS_TABLE,
  DYNAMODB_VENUES_TABLE,
  DYNAMODB_USERS_TABLE,
  DYNAMODB_LISTINGS_TABLE,
  DYNAMODB_BIDS_TABLE,
  DYNAMODB_TRANSACTIONS_TABLE,
  USER_ID_KEY,
  LISTING_ID_KEY,
  BID_ID_KEY,
  TRANSACTION_ID_KEY,
  SELLER_ID_KEY,
  EVENT_ID_KEY,
  STATUS_KEY,
  BIDDER_ID_KEY,
  BUYER_ID_KEY,
  CREATED_AT_KEY,
  SELLER_CREATED_AT_INDEX,
  EVENT_CREATED_AT_INDEX,
  STATUS_CREATED_AT_INDEX,
  LISTING_CREATED_AT_INDEX,
  BIDDER_CREATED_AT_INDEX,
  BUYER_CREATED_AT_INDEX,
} from '../constants';

export class DynamoDbStack extends Stack {
  public readonly eventsTable: ITable;
  public readonly venuesTable: ITable;
  public readonly usersTable: Table;
  public readonly listingsTable: Table;
  public readonly bidsTable: Table;
  public readonly transactionsTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import existing tables
    this.eventsTable = Table.fromTableName(
      this, 'EventsTable', DYNAMODB_EVENTS_TABLE
    );

    this.venuesTable = Table.fromTableName(
      this, 'VenuesTable', DYNAMODB_VENUES_TABLE
    );

    // Users table
    this.usersTable = new Table(this, 'UsersTable', {
      tableName: DYNAMODB_USERS_TABLE,
      partitionKey: { name: USER_ID_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Listings table with GSIs
    this.listingsTable = new Table(this, 'ListingsTable', {
      tableName: DYNAMODB_LISTINGS_TABLE,
      partitionKey: { name: LISTING_ID_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // GSI1: sellerId-createdAt (seller's listings)
    this.listingsTable.addGlobalSecondaryIndex({
      indexName: SELLER_CREATED_AT_INDEX,
      partitionKey: { name: SELLER_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // GSI2: eventId-createdAt (event listings)
    this.listingsTable.addGlobalSecondaryIndex({
      indexName: EVENT_CREATED_AT_INDEX,
      partitionKey: { name: EVENT_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // GSI3: status-createdAt (active listings)
    this.listingsTable.addGlobalSecondaryIndex({
      indexName: STATUS_CREATED_AT_INDEX,
      partitionKey: { name: STATUS_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // Bids table with GSIs
    this.bidsTable = new Table(this, 'BidsTable', {
      tableName: DYNAMODB_BIDS_TABLE,
      partitionKey: { name: BID_ID_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // GSI1: listingId-createdAt (listing bids)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: LISTING_CREATED_AT_INDEX,
      partitionKey: { name: LISTING_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // GSI2: bidderId-createdAt (user's bids)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: BIDDER_CREATED_AT_INDEX,
      partitionKey: { name: BIDDER_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // Transactions table with GSIs
    this.transactionsTable = new Table(this, 'TransactionsTable', {
      tableName: DYNAMODB_TRANSACTIONS_TABLE,
      partitionKey: { name: TRANSACTION_ID_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // GSI1: sellerId-createdAt (seller sales)
    this.transactionsTable.addGlobalSecondaryIndex({
      indexName: SELLER_CREATED_AT_INDEX,
      partitionKey: { name: SELLER_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });

    // GSI2: buyerId-createdAt (buyer purchases)
    this.transactionsTable.addGlobalSecondaryIndex({
      indexName: BUYER_CREATED_AT_INDEX,
      partitionKey: { name: BUYER_ID_KEY, type: AttributeType.STRING },
      sortKey: { name: CREATED_AT_KEY, type: AttributeType.STRING },
    });
  }
}