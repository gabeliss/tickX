# TickX

A ticket marketplace application that aggregates events from Ticketmaster and displays them in a modern React frontend.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Java 21 + Spring Boot 3 + ECS Fargate
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK (TypeScript)
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
├── backend/               # Java Spring Boot API
│   ├── src/main/java/     # Java source code
│   │   └── com/tickx/
│   │       ├── controller/# REST controllers
│   │       ├── service/   # Business logic
│   │       ├── repository/# DynamoDB repositories
│   │       └── model/     # Domain models
│   ├── cdk/               # AWS CDK infrastructure
│   ├── Dockerfile
│   └── pom.xml
│
└── shared/                # Shared TypeScript types (frontend)
    └── types/
```

## Prerequisites

- Node.js 20.x or later
- Java 21
- Maven 3.9+
- Docker
- AWS CLI configured with credentials

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

### 3. Backend Setup

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

#### Run Locally with Maven (alternative)

If you have Java 21 and Maven installed:

```bash
cd backend
mvn clean package -DskipTests
java -jar target/tickx-backend-0.0.1-SNAPSHOT.jar
```

#### Deploy to AWS

```bash
cd backend/cdk

# Install dependencies
npm install

# Preview what will be deployed
npm run diff

# Deploy to AWS
npm run deploy
```

After deployment, note the `ApiUrl` output - this is your backend URL.

### 4. Frontend Setup

```bash
cd frontend
npm install

# Set the API URL (from the backend deployment output)
export VITE_API_URL=http://<your-alb-dns-name>

# Or for local development against local backend:
export VITE_API_URL=http://localhost:8080

npm run dev
```

The app will be available at `http://localhost:5173`

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
| `./mvnw clean package` | Build the project |
| `./mvnw spring-boot:run` | Run locally |
| `./mvnw test` | Run tests |

### Infrastructure (backend/cdk)

| Command | Description |
|---------|-------------|
| `npm run synth` | Generate CloudFormation template |
| `npm run diff` | Preview infrastructure changes |
| `npm run deploy` | Deploy to AWS |
| `npm run destroy` | Destroy the stack |

## AWS Resources

| Resource | Name | Purpose |
|----------|------|---------|
| DynamoDB | `TickX-Events` | Event storage with GSIs for filtering |
| DynamoDB | `TickX-Venues` | Venue storage |
| ECS Fargate | `TickX-Backend` | Java Spring Boot API |
| ALB | `TickX-ALB` | Load balancer for the API |
| VPC | `TickXVpc` | Network infrastructure |
| SSM Parameter | `/tickx/ticketmaster-api-key` | Ticketmaster API key |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events (supports city, category, keyword filters) |
| GET | `/events/{eventId}` | Get single event |
| GET | `/venues` | List venues by city |
| GET | `/venues/{venueId}` | Get single venue |
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

1. Check CloudWatch logs for the ECS service
2. Verify the sync has run: `curl -X POST http://<api-url>/sync`
3. Check DynamoDB tables have data

### "Backend not responding"

1. Check ECS service health in AWS Console
2. Check ALB target group health
3. Review CloudWatch logs at `/ecs/tickx-backend`

### "CDK deploy fails"

1. Ensure Docker is running (needed to build the image)
2. Ensure AWS credentials are configured
3. Run `npm install` in the cdk directory

## Development Notes

- The backend connects to the existing DynamoDB tables
- Event data is limited to Chicago and New York (~9k events)
- Keyword search uses DynamoDB Scan (plan to migrate to OpenSearch for production)
- The sync job runs daily at 4 AM UTC automatically
