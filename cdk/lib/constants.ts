export const APP_NAME = 'TickX';

// DynamoDB
export const DYNAMODB_EVENTS_TABLE = `${APP_NAME}-Events`;
export const DYNAMODB_VENUES_TABLE = `${APP_NAME}-Venues`;

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