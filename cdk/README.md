# TickX Infrastructure

AWS CDK infrastructure for the TickX application.

## Prerequisites

- Node.js 20+
- AWS CLI configured
- Docker running
- CDK CLI: `npm install -g aws-cdk`

## Setup

1. **Create Ticketmaster API key parameter:**
```bash
aws ssm put-parameter \
  --name "/tickx/ticketmaster-api-key" \
  --value "your-api-key" \
  --type "SecureString"
```

2. **Bootstrap CDK (first time only):**
```bash
npx cdk bootstrap
```

## Deploy

```bash
# From root directory
make deploy

# Or from cdk directory
npm install
npm run deploy
```

This deploys all three stacks: TickX-DynamoDb, TickX-Vpc, and TickX-EcsService.

After deployment, note the `ApiUrl` output for frontend configuration.

## Architecture

- **VPC**: 2 AZs, public/private subnets, 1 NAT gateway
- **ECS Fargate**: Containerized backend with ALB
- **DynamoDB**: Imports existing TickX-Events and TickX-Venues tables

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run deploy` | Deploy to AWS |
| `npm run destroy` | Delete all resources |

## Troubleshooting

- **Deploy fails**: Ensure Docker is running and AWS credentials are configured
- **Container fails**: Check CloudWatch logs at `/ecs/tickx-backend`
- **API not accessible**: Verify ALB target group health in AWS Console