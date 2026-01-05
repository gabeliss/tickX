# TickX Backend

Java Spring Boot API for the TickX ticket marketplace application.

## Prerequisites

- Java 21
- Maven 3.9+
- Docker (for containerized deployment)
- AWS CLI configured with credentials

## Local Development

### Build and Run Locally

```bash
# Build the application
mvn clean package -DskipTests

# Run the application
mvn spring-boot:run

# Or run the JAR directly
java -jar target/tickx-backend-0.0.1-SNAPSHOT.jar
```

The API will be available at `http://localhost:8080`

### Run with Docker

```bash
# Build Docker image
docker build -t tickx-backend .

# Run container
docker run -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION=us-east-1 \
  tickx-backend
```

### Testing

```bash
# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report
```

## Environment Variables

The backend uses these environment variables (automatically set by CDK deployment):

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `EVENTS_TABLE` | DynamoDB events table name | `TickX-Events` |
| `VENUES_TABLE` | DynamoDB venues table name | `TickX-Venues` |
| `TM_API_KEY_PARAM` | SSM parameter for Ticketmaster API key | `/tickx/ticketmaster-api-key` |
| `SYNC_ENABLED` | Enable scheduled sync | `true` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events (supports city, category, keyword filters) |
| GET | `/events/{eventId}` | Get single event |
| GET | `/venues` | List venues by city |
| GET | `/venues/{venueId}` | Get single venue |
| POST | `/sync` | Manually trigger Ticketmaster sync |
| GET | `/health` | Health check endpoint |

## Deployment to AWS

The backend is deployed as a containerized service on AWS ECS Fargate using CDK:

```bash
# From the root directory
make deploy
```

This will:
1. Create ECR repository
2. Build and push Docker image
3. Deploy ECS Fargate service with Application Load Balancer
4. Configure DynamoDB and SSM permissions
5. Set up CloudWatch logging

## Configuration

The application configuration is in `src/main/resources/application.yml`:

- **Server port**: 8080 (matches CDK ECS_CONTAINER_PORT)
- **DynamoDB tables**: Uses environment variables set by CDK
- **Logging**: CloudWatch integration via CDK
- **Health checks**: `/health` endpoint for ALB health checks

## Troubleshooting

### "No events showing"
1. Check if sync has run: `curl -X POST http://localhost:8080/sync`
2. Verify DynamoDB tables exist and have data
3. Check AWS credentials are configured

### "Connection refused"
1. Ensure Java 21 is installed
2. Check if port 8080 is available
3. Verify AWS credentials for DynamoDB access

### "Container fails to start"
1. Check CloudWatch logs at `/ecs/tickx-backend`
2. Verify Ticketmaster API key parameter exists in SSM
3. Check ECS service health in AWS Console