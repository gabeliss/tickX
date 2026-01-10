# TickX

A ticket marketplace application that aggregates events from Ticketmaster and displays them in a modern React frontend.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Java 17 + Spring Boot 3 + Gradle + Lambda
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK (TypeScript)
- **Build Tool**: Make
- **Data Source**: Ticketmaster Discovery API

## Project Structure

```
tickX/
├── frontend/              # React SPA
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API client
│   │   └── hooks/         # Custom React hooks
│   └── package.json
│
├── backend/               # Java Spring Boot Lambda
│   ├── src/main/java/     # Java source code
│   │   └── com/tickx/
│   │       ├── handler/   # Lambda handlers
│   │       ├── service/   # Business logic
│   │       ├── repository/# DynamoDB repositories
│   │       └── model/     # Domain models
│   └── build.gradle
│
├── cdk/                   # AWS CDK infrastructure
│   ├── lib/               # CDK stacks
│   └── bin/               # CDK app entry
│
├── shared/                # Shared TypeScript types
│   └── types/
│
└── Makefile               # Build orchestration
```

## Prerequisites

- Node.js 20.x or later
- Java 17
- Gradle 8.5+
- Docker
- AWS CLI configured with credentials
- Make (usually pre-installed on macOS/Linux)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tickX
```

### 2. Configure AWS Credentials

```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Build with Make

#### Build entire workspace

```bash
# Build all components
make build

# Or build individual components
make build-backend
make build-frontend
make build-infrastructure
```

### 4. Backend Setup

#### Run Locally with Docker (recommended)

```bash
cd backend

# Build the Docker image
docker build -t tickx-backend .

# Run the container (requires AWS credentials for DynamoDB access)
docker run -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION=us-east-1 \
  tickx-backend
```

The API will be available at `http://localhost:8080`

#### Run Locally with Gradle (alternative)

If you have Java 17 and Gradle installed:

```bash
cd backend
./gradlew clean build -x test
java -jar build/libs/tickx-backend-0.0.1-SNAPSHOT.jar
```

#### Deploy to AWS

```bash
# Deploy infrastructure
make deploy

# Or full deployment (infrastructure + Lambda functions)
make deploy-all
```

After deployment, note the `ApiUrl` output - this is your API Gateway URL.

### 5. Frontend Setup

```bash
cd frontend
npm install

# Set the API URL (from the deployment output)
export VITE_API_URL=https://<your-api-gateway-id>.execute-api.us-east-1.amazonaws.com/prod

# Or for local development:
export VITE_API_URL=http://localhost:8080

npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

### Workspace (Root)

| Command | Description |
|---------|-------------|
| `make build` | Build all components |
| `make deploy` | Deploy infrastructure to AWS |
| `make deploy-all` | Full deployment (infrastructure + Lambda functions) |
| `make clean` | Clean all build artifacts |
| `make dev-frontend` | Start frontend development server |
| `make dev-backend` | Start backend development server |
| `make test` | Run all tests |

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
| `./gradlew clean build` | Build the project |
| `./gradlew bootRun` | Run locally |
| `./gradlew test` | Run tests |

### Infrastructure

| Command | Description |
|---------|-------------|
| `npm run build` | Build CDK app |
| `npm run synth` | Generate CloudFormation template |
| `npm run diff` | Preview infrastructure changes |
| `npm run deploy` | Deploy to AWS |
| `npm run destroy` | Destroy the stack |

## AWS Resources

| Resource | Name | Purpose |
|----------|------|---------|
| DynamoDB | `TickX-Events` | Event storage with GSIs for filtering |
| DynamoDB | `TickX-Venues` | Venue storage |
| DynamoDB | `TickX-Users` | User accounts and profiles |
| DynamoDB | `TickX-Listings` | Ticket listings with seller workflow |
| DynamoDB | `TickX-Bids` | Bidding system for listings |
| DynamoDB | `TickX-Transactions` | Purchase and payment records |
| Lambda | `TickX-EventsLambda` | Events API handler |
| Lambda | `TickX-ListingsLambda` | Listings API handler |
| Lambda | `TickX-VenuesLambda` | Venues API handler |
| Lambda | `TickX-SyncLambda` | Ticketmaster sync handler |
| API Gateway | `TickX-API` | REST API gateway |
| EventBridge | `TickX-SyncRule` | Daily sync schedule |
| SSM Parameter | `/tickx/ticketmaster-api-key` | Ticketmaster API key |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events (supports city, category, keyword filters) |
| GET | `/events/{eventId}` | Get single event |
| GET | `/venues` | List venues by city |
| GET | `/venues/{venueId}` | Get single venue |
| GET | `/listings` | List ticket listings |
| POST | `/listings` | Create new listing |
| GET | `/listings/{listingId}` | Get single listing |
| PUT | `/listings/{listingId}` | Update listing |
| DELETE | `/listings/{listingId}` | Delete listing |
| POST | `/sync` | Manually trigger Ticketmaster sync |
| GET | `/health` | Health check endpoint |

### Example Requests

```bash
# Get events in Chicago
curl "http://<api-url>/events?city=chicago"

# Search events by keyword
curl "http://<api-url>/events?keyword=concert"

# Get events by category
curl "http://<api-url>/events?category=concert"

# Trigger manual sync
curl -X POST "http://<api-url>/sync"
```

## Manually Triggering Event Sync

The sync runs automatically daily at 4 AM UTC. To trigger manually:

```bash
curl -X POST "http://<api-url>/sync"
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `EVENTS_TABLE` | DynamoDB events table name | `TickX-Events` |
| `VENUES_TABLE` | DynamoDB venues table name | `TickX-Venues` |
| `TM_API_KEY_PARAM` | SSM parameter for TM API key | `/tickx/ticketmaster-api-key` |
| `SYNC_ENABLED` | Enable scheduled sync | `true` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

## Troubleshooting

### "No events showing"

1. Check CloudWatch logs for the Lambda functions
2. Verify the sync has run: `curl -X POST https://<api-gateway-url>/sync`
3. Check DynamoDB tables have data

### "Backend not responding"

1. Check API Gateway logs in CloudWatch
2. Check Lambda function logs in CloudWatch
3. Verify API Gateway integration configuration

### "CDK deploy fails"

1. Ensure AWS credentials are configured
2. Run `npm install` in the cdk directory
3. Ensure Java 17 is installed (not Java 21 or 25)
4. Check Lambda function size limits

## Development Notes

- The backend uses Lambda functions with API Gateway
- Event data is limited to Chicago and New York (~9k events)
- Keyword search uses DynamoDB Scan (plan to migrate to OpenSearch for production)
- The sync job runs daily at 4 AM UTC via EventBridge
