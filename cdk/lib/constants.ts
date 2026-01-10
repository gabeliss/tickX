export const APP_NAME = 'TickX';

// DynamoDB Tables
export const DYNAMODB_EVENTS_TABLE = `${APP_NAME}-Events`;
export const DYNAMODB_VENUES_TABLE = `${APP_NAME}-Venues`;
export const DYNAMODB_USERS_TABLE = `${APP_NAME}-Users`;
export const DYNAMODB_LISTINGS_TABLE = `${APP_NAME}-Listings`;
export const DYNAMODB_BIDS_TABLE = `${APP_NAME}-Bids`;
export const DYNAMODB_TRANSACTIONS_TABLE = `${APP_NAME}-Transactions`;

// DynamoDB Keys
export const USER_ID_KEY = 'userId';
export const LISTING_ID_KEY = 'listingId';
export const BID_ID_KEY = 'bidId';
export const TRANSACTION_ID_KEY = 'transactionId';
export const SELLER_ID_KEY = 'sellerId';
export const EVENT_ID_KEY = 'eventId';
export const STATUS_KEY = 'status';
export const BIDDER_ID_KEY = 'bidderId';
export const BUYER_ID_KEY = 'buyerId';
export const CREATED_AT_KEY = 'createdAt';

// GSI Names
export const SELLER_CREATED_AT_INDEX = 'sellerId-createdAt-index';
export const EVENT_CREATED_AT_INDEX = 'eventId-createdAt-index';
export const STATUS_CREATED_AT_INDEX = 'status-createdAt-index';
export const LISTING_CREATED_AT_INDEX = 'listingId-createdAt-index';
export const BIDDER_CREATED_AT_INDEX = 'bidderId-createdAt-index';
export const BUYER_CREATED_AT_INDEX = 'buyerId-createdAt-index';

// ECS Configuration
export const ECS_TASK_MEMORY = 1024;
export const ECS_TASK_CPU = 512;
export const ECS_DESIRED_COUNT = 1;
export const ECS_CONTAINER_PORT = 8080;

// Load Balancer
export const LOAD_BALANCER_PORT = 80;

// SSM Parameters
export const SSM_TICKETMASTER_API_KEY = '/tickx/ticketmaster-api-key';

// VPC Configuration
export const VPC_MAX_AZS = 2;
export const VPC_NAT_GATEWAYS = 1;
export const VPC_CIDR_MASK = 24;

// AWS Regions
export const AWS_REGION = {
  US_EAST_1: 'us-east-1',
  EU_WEST_1: 'eu-west-1',
  US_WEST_2: 'us-west-2',
};

// DynamoDB Actions
export const DYNAMODB_ACTIONS = [
  'dynamodb:GetItem',
  'dynamodb:PutItem',
  'dynamodb:UpdateItem',
  'dynamodb:DeleteItem',
  'dynamodb:Query',
  'dynamodb:Scan',
  'dynamodb:BatchGetItem',
  'dynamodb:BatchWriteItem',
];

// SSM Actions
export const SSM_ACTIONS = ['ssm:GetParameter'];

// Health Check Configuration
export const HEALTH_CHECK_PATH = '/health';
export const HEALTH_CHECK_INTERVAL_SECONDS = 30;
export const HEALTH_CHECK_TIMEOUT_SECONDS = 5;
export const HEALTH_CHECK_RETRIES = 3;
export const HEALTH_CHECK_START_PERIOD_SECONDS = 60;
export const HEALTH_CHECK_HEALTHY_THRESHOLD = 2;
export const HEALTH_CHECK_UNHEALTHY_THRESHOLD = 3;