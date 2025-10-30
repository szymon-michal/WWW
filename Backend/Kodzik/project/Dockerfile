# Multi-stage build for Spring Boot application
FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Create non-root user for security
RUN groupadd -r dentistplus && useradd -r -g dentistplus dentistplus

# Copy the built jar from builder stage
COPY --from=builder /app/target/dentist-plus-backend-*.jar app.jar

# Change ownership to non-root user
RUN chown dentistplus:dentistplus app.jar

# Switch to non-root user
USER dentistplus

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]