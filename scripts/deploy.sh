#!/bin/bash

# QuickKub Payment Gateway Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="devops/docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Deploying QuickKub Payment Gateway to ${ENVIRONMENT}..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo "📋 Loading environment variables from .env.${ENVIRONMENT}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.${ENVIRONMENT} file found. Using default values."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f "$COMPOSE_FILE" up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose -f "$COMPOSE_FILE" ps

# Health checks
echo "🏥 Running health checks..."

# Backend health check
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Frontend health check
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Admin health check
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Admin Panel is healthy"
else
    echo "❌ Admin Panel health check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Admin Panel: http://localhost:3001"
echo "   Backend API: http://localhost:3002"
echo "   API Docs: http://localhost:3002/docs"
echo "   Landing Page: http://localhost:3004"
echo ""
echo "🔧 Management URLs:"
echo "   pgAdmin: http://localhost:8080"
echo "   Redis Commander: http://localhost:8081"
echo "   Bull Board: http://localhost:8082"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop services: docker-compose -f $COMPOSE_FILE down"
echo "   Restart services: docker-compose -f $COMPOSE_FILE restart"
