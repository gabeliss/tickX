# TickX

A ticket marketplace application that aggregates events from Ticketmaster and displays them in a modern React frontend.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: AWS Lambda + API Gateway + DynamoDB
- **Infrastructure**: AWS CDK (TypeScript)
- **Data Source**: Ticketmaster Discovery API

## Project Structure

```
tickX/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   ├── services/  # API client
│   │   └── hooks/     # Custom React hooks
│   └── package.json
│
├── backend/           # AWS CDK + Lambda functions
│   ├── src/
│   │   ├── lambdas/   # Lambda handlers
│   │   └── utils/     # Shared utilities
│   ├── lib/           # CDK stack definition
│   └── package.json
│
└── shared/            # Shared TypeScript types
    └── types/
```

## Prerequisites

- Node.js 20.x or later
- npm
- AWS CLI configured with credentials (access to the shared AWS account)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tickX
```

### 2. Configure AWS Credentials

Make sure your AWS CLI is configured with access to the shared AWS account:

```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_DEFAULT_REGION=us-east-1
```

Verify access:

```bash
aws sts get-caller-identity
```

### 3. Frontend Setup

The frontend connects to the already-deployed AWS backend, so you can run it immediately:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

That's it! The API endpoint and Ticketmaster API key are already configured in the deployed infrastructure.

## Deploying Backend Changes

If you need to make changes to the backend infrastructure:

```bash
cd backend
npm install

# Preview what will change
npm run diff

# Deploy changes
npm run deploy
```

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run synth` | Generate CloudFormation template |
| `npm run diff` | Preview infrastructure changes |
| `npm run deploy` | Deploy to AWS |
| `npm run test` | Run tests |

## AWS Resources

The following resources are deployed to AWS:

| Resource | Name | Purpose |
|----------|------|---------|
| DynamoDB | `TickX-Events` | Event storage with GSIs for filtering |
| DynamoDB | `TickX-Venues` | Venue storage |
| Lambda | `TickX-SyncEvents` | Syncs events from Ticketmaster (runs daily at 4 AM UTC) |
| Lambda | `TickX-GetEvents` | API handler for events |
| Lambda | `TickX-GetVenues` | API handler for venues |
| API Gateway | `TickX API` | REST API endpoints |
| SSM Parameter | `/tickx/ticketmaster-api-key` | Ticketmaster API key (already configured) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events (supports city, category, keyword filters) |
| GET | `/events/{eventId}` | Get single event |
| GET | `/venues` | List venues by city |
| GET | `/venues/{venueId}` | Get single venue |

### Example Requests

```bash
# Get events in Chicago
curl "https://astjniigq5.execute-api.us-east-1.amazonaws.com/v1/events?city=Chicago"

# Search events by keyword
curl "https://astjniigq5.execute-api.us-east-1.amazonaws.com/v1/events?keyword=concert"

# Get events by category
curl "https://astjniigq5.execute-api.us-east-1.amazonaws.com/v1/events?category=Music"
```

## Manually Triggering Event Sync

The sync Lambda runs automatically daily. To trigger it manually:

```bash
aws lambda invoke \
  --function-name TickX-SyncEvents \
  --invocation-type Event \
  /dev/null
```

## Troubleshooting

### "No events showing"

1. Check if the sync Lambda has run: Look at CloudWatch logs for `TickX-SyncEvents`
2. Manually trigger a sync (see above)

### "API Gateway 5xx errors"

1. Check CloudWatch logs for the relevant Lambda function
2. Verify DynamoDB tables exist and have data

### "CDK deploy fails"

1. Ensure AWS credentials are configured correctly
2. Run `npm run build` before deploying
3. Check you have the required IAM permissions

## Development Notes

- The frontend connects directly to the deployed AWS API (no local backend server needed)
- Event data is currently limited to Chicago and New York (~9k events)
- Keyword search uses DynamoDB Scan (plan to migrate to OpenSearch for production scale)
