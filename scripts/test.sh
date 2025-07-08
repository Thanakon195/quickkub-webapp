#!/bin/bash

# QuickKub Payment Gateway Testing Script
# Usage: ./scripts/test.sh [service] [type]

set -e

SERVICE=${1:-all}
TYPE=${2:-unit}

echo "🧪 QuickKub Testing Script"

# Function to run backend tests
test_backend() {
    local test_type=$1
    echo "🔧 Running backend tests ($test_type)..."
    cd backend

    case $test_type in
        "unit")
            npm run test
            ;;
        "e2e")
            npm run test:e2e
            ;;
        "coverage")
            npm run test:cov
            ;;
        "watch")
            npm run test:watch
            ;;
        *)
            echo "❌ Unknown test type: $test_type"
            echo "Available types: unit, e2e, coverage, watch"
            exit 1
            ;;
    esac
}

# Function to run frontend tests
test_frontend() {
    local test_type=$1
    echo "🌐 Running frontend tests ($test_type)..."
    cd frontend

    case $test_type in
        "unit")
            npm run test
            ;;
        "e2e")
            npm run test:e2e
            ;;
        "lint")
            npm run lint
            ;;
        "build")
            npm run build
            ;;
        *)
            echo "❌ Unknown test type: $test_type"
            echo "Available types: unit, e2e, lint, build"
            exit 1
            ;;
    esac
}

# Function to run admin tests
test_admin() {
    local test_type=$1
    echo "🛠️ Running admin tests ($test_type)..."
    cd admin

    case $test_type in
        "unit")
            npm test
            ;;
        "build")
            npm run build
            ;;
        "lint")
            npm run lint
            ;;
        *)
            echo "❌ Unknown test type: $test_type"
            echo "Available types: unit, build, lint"
            exit 1
            ;;
    esac
}

# Function to run all tests
test_all() {
    local test_type=$1
    echo "🧪 Running all tests ($test_type)..."

    # Backend tests
    test_backend $test_type

    # Frontend tests
    test_frontend $test_type

    # Admin tests
    test_admin $test_type

    echo "✅ All tests completed!"
}

# Function to run integration tests
test_integration() {
    echo "🔗 Running integration tests..."

    # Start services
    cd devops
    docker-compose up -d

    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30

    # Run integration tests
    cd ../backend
    npm run test:e2e

    # Stop services
    cd ../devops
    docker-compose down

    echo "✅ Integration tests completed!"
}

# Function to run performance tests
test_performance() {
    echo "⚡ Running performance tests..."

    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        echo "❌ k6 is not installed. Please install k6 first."
        echo "Installation: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi

    # Run performance tests
    k6 run tests/performance/load-test.js

    echo "✅ Performance tests completed!"
}

# Main execution
case $SERVICE in
    "all")
        test_all $TYPE
        ;;
    "backend")
        test_backend $TYPE
        ;;
    "frontend")
        test_frontend $TYPE
        ;;
    "admin")
        test_admin $TYPE
        ;;
    "integration")
        test_integration
        ;;
    "performance")
        test_performance
        ;;
    *)
        echo "❌ Invalid service: $SERVICE"
        echo "Usage: ./scripts/test.sh [service] [type]"
        echo "Available services: all, backend, frontend, admin, integration, performance"
        echo "Available types: unit, e2e, coverage, watch, lint, build"
        exit 1
        ;;
esac
