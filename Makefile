.PHONY: build clean deploy dev test help

# Default target
help:
	@echo "TickX Build Commands:"
	@echo "  make build          - Build all components"
	@echo "  make deploy         - Deploy infrastructure to AWS"
	@echo "  make docker-build   - Build and push Docker image to ECR"
	@echo "  make deploy-all     - Full deployment (infrastructure + image)"
	@echo "  make clean          - Clean all build artifacts"
	@echo "  make dev-frontend   - Start frontend development server"
	@echo "  make dev-backend    - Start backend development server"
	@echo "  make test           - Run all tests"

# Build all components
build:
	@echo "Building backend..."
	cd backend && mvn clean package -DskipTests
	@echo "Building frontend..."
	cd frontend && npm install && npm run build
	@echo "Building infrastructure..."
	cd cdk && npm install && npm run build

# Deploy infrastructure to AWS
deploy:
	@echo "Deploying infrastructure..."
	export CDK_DEFAULT_ACCOUNT=536697263581 && \
	export CDK_DEFAULT_REGION=us-east-1 && \
	cd cdk && npm run deploy

# Build and push Docker image to ECR
docker-build:
	@echo "Building and pushing Docker image..."
	$(eval ECR_URI := $(shell aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/tickx-backend)
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(ECR_URI)
	cd backend && docker build -t tickx-backend .
	docker tag tickx-backend:latest $(ECR_URI):latest
	docker push $(ECR_URI):latest

# Full deployment (infrastructure + image)
deploy-all: build deploy docker-build
	@echo "Full deployment complete!"

# Development servers
dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm install && npm run dev

dev-backend:
	@echo "Starting backend development server..."
	cd backend && mvn spring-boot:run

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && mvn test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Clean all build artifacts
clean:
	@echo "Cleaning backend..."
	cd backend && mvn clean
	@echo "Cleaning frontend..."
	cd frontend && rm -rf dist node_modules
	@echo "Cleaning infrastructure..."
	cd infrastructure/cdk && rm -rf cdk.out node_modules

# Individual component builds
build-backend:
	cd backend && mvn clean package -DskipTests

build-frontend:
	cd frontend && npm install && npm run build

build-infrastructure:
	cd cdk && npm install && npm run build