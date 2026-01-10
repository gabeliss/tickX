# Build stage
FROM --platform=linux/amd64 gradle:8.5-jdk17-alpine AS build
WORKDIR /app

# Copy Gradle files
COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew ./

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon

# Copy source and build
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM --platform=linux/amd64 eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S tickx && adduser -S tickx -G tickx
USER tickx

# Copy built jar
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]