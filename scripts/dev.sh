#!/bin/bash

# QuickKub Payment Gateway Development Script
# Usage: ./scripts/dev.sh [service]

set -e

SERVICE=${1:-all}

echo "🔧 Starting QuickKub Payment Gateway development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to start specific service
start_service() {
    local service=$1
    echo "🚀 Starting $service..."

    case $service in
        "backend")
            cd backend
            npm install
            npm run start:dev
            ;;
        "frontend")
            cd frontend
            npm install
            npm run dev
            ;;
        "admin")
            cd admin
            npm install
            npm start
            ;;
        "landing")
            cd landing
            npm install
            npm run dev
            ;;
        *)
            echo "❌ Unknown service: $service"
            echo "Available services: backend, frontend, admin, landing"
            exit 1
            ;;
    esac
}

# Function to start all services with Docker Compose
start_all() {
    echo "🐳 Starting all services with Docker Compose..."
    cd devops

    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "📋 Creating .env file from example..."
        cp ../env.example .env
    fi

    # Start services
    docker-compose up --build -d

    echo "⏳ Waiting for services to start..."
    sleep 30

    # Check service status
    docker-compose ps

    echo "🎉 Development environment is ready!"
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
    echo "   View logs: docker-compose logs -f [service]"
    echo "   Stop services: docker-compose down"
    echo "   Restart service: docker-compose restart [service]"
    echo "   Rebuild service: docker-compose up --build [service]"
}

# Main execution
case $SERVICE in
    "all")
        start_all
        ;;
    "backend"|"frontend"|"admin"|"landing")
        start_service $SERVICE
        ;;
    *)
        echo "❌ Invalid service: $SERVICE"
        echo "Usage: ./scripts/dev.sh [service]"
        echo "Available services: all, backend, frontend, admin, landing"
        exit 1
        ;;
esac
