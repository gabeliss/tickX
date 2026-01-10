.PHONY: build clean deploy deploy-ddb dev test help

# Default target
help:
	@echo "TickX Build Commands:"
	@echo "  make build          - Build frontend and infrastructure"
	@echo "  make deploy         - Deploy Lambda-based infrastructure to AWS"
	@echo "  make deploy-ddb     - Deploy DynamoDB tables only"
	@echo "  make deploy-all     - Full deployment (build + deploy)"
	@echo "  make clean          - Clean all build artifacts"
	@echo "  make dev-frontend   - Start frontend development server"
	@echo "  make dev-backend    - Start backend development server"
	@echo "  make test           - Run all tests"

# Build all components
build:
	@echo "Building backend..."
	export JAVA_HOME=$(/usr/libexec/java_home -v 17) && \
	export PATH=$$JAVA_HOME/bin:$$PATH && \
	cd backend && ./gradlew clean build -x test
	@echo "Building frontend..."
	cd frontend && npm install && npm run build
	@echo "Building infrastructure..."
	cd cdk && npm install && npm run build

# Deploy infrastructure to AWS (includes Lambda build)
deploy:
	@echo "Building backend for Lambda deployment..."
	export JAVA_HOME=$(/usr/libexec/java_home -v 17) && \
	export PATH=$$JAVA_HOME/bin:$$PATH && \
	cd backend && ./gradlew clean build -x test
	@echo "Deploying Lambda-based infrastructure..."
	export CDK_DEFAULT_ACCOUNT=536697263581 && \
	export CDK_DEFAULT_REGION=us-east-1 && \
	export AWS_REGION=us-east-1 && \
	cd cdk && npm run deploy

# Deploy DynamoDB tables only
deploy-ddb:
	@echo "Deploying DynamoDB tables..."
	export CDK_DEFAULT_ACCOUNT=536697263581 && \
	export CDK_DEFAULT_REGION=us-east-1 && \
	cd cdk && npx cdk deploy TickX-DynamoDb

# Full deployment (same as deploy for Lambda)
deploy-all: build deploy
	@echo "Lambda deployment complete!"

# Development servers
dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm install && npm run dev

dev-frontend-deployed:
	@echo "Starting frontend with deployed API..."
	cd frontend && VITE_API_URL=https://e3o505t943.execute-api.us-east-1.amazonaws.com/prod npm run dev

dev-backend:
	@echo "Starting backend development server..."
	cd backend && ./gradlew bootRun

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && ./gradlew test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Clean all build artifacts
clean:
	@echo "Cleaning frontend..."
	cd frontend && rm -rf dist node_modules
	@echo "Cleaning infrastructure..."
	cd cdk && rm -rf cdk.out node_modules

# Individual component builds
build-frontend:
	cd frontend && npm install && npm run build

build-infrastructure:
	cd cdk && npm install && npm run build