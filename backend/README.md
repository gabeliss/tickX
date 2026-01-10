# TickX Backend

Java Spring Boot API deployed as AWS Lambda functions.

## Current Architecture: Lambda

```bash
# Build Lambda JAR
./gradlew clean build

# Deploy via CDK (from root)
make deploy
```

## Alternative: Docker/ECS

If you need to switch back to containerized deployment:

```bash
# Build Docker image
docker build -t tickx-backend .

# Run locally
docker run -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION=us-east-1 \
  tickx-backend
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region |
| `EVENTS_TABLE` | DynamoDB events table |
| `VENUES_TABLE` | DynamoDB venues table |
| `USERS_TABLE` | DynamoDB users table |
| `LISTINGS_TABLE` | DynamoDB listings table |
| `BIDS_TABLE` | DynamoDB bids table |
| `TRANSACTIONS_TABLE` | DynamoDB transactions table |