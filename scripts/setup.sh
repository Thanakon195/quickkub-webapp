#!/bin/bash

# ========================================
# 🚀 QUICKKUB PAYMENT GATEWAY - SETUP SCRIPT
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Node.js is installed
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
}

# Function to check if npm is installed
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."

    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists"
    fi

    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.local.example frontend/.env.local
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists"
    fi

    # Admin .env
    if [ ! -f "admin/.env" ]; then
        cp admin/env.example admin/.env
        print_success "Created admin/.env"
    else
        print_warning "admin/.env already exists"
    fi
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend

    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Backend dependencies installed"
    else
        print_warning "Backend node_modules already exists"
    fi

    cd ..
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend

    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_warning "Frontend node_modules already exists"
    fi

    cd ..
}

# Function to install admin dependencies
install_admin_deps() {
    print_status "Installing admin panel dependencies..."
    cd admin

    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Admin panel dependencies installed"
    else
        print_warning "Admin panel node_modules already exists"
    fi

    cd ..
}

# Function to install landing page dependencies
install_landing_deps() {
    print_status "Installing landing page dependencies..."
    cd landing

    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Landing page dependencies installed"
    else
        print_warning "Landing page node_modules already exists"
    fi

    cd ..
}

# Function to build Docker images
build_docker_images() {
    print_status "Building Docker images..."

    # Build backend image
    print_status "Building backend image..."
    docker build -t quickkub-backend ./backend

    # Build frontend image
    print_status "Building frontend image..."
    docker build -t quickkub-frontend ./frontend

    # Build admin image
    print_status "Building admin image..."
    docker build -t quickkub-admin ./admin

    # Build landing image
    print_status "Building landing image..."
    docker build -t quickkub-landing ./landing

    print_success "All Docker images built successfully"
}

# Function to start services with Docker Compose
start_services() {
    print_status "Starting services with Docker Compose..."

    cd devops

    # Start all services
    docker-compose up -d

    print_success "All services started successfully"
    cd ..
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30

    # Run migrations
    cd backend
    npm run migration:run
    cd ..

    print_success "Database migrations completed"
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."

    cd backend
    npm run seed
    cd ..

    print_success "Database seeded successfully"
}

# Function to check service health
check_services() {
    print_status "Checking service health..."

    # Wait for services to be ready
    sleep 10

    # Check backend health
    if curl -f http://localhost:3002/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi

    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is running"
    else
        print_warning "Frontend health check failed"
    fi

    # Check admin panel
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        print_success "Admin panel is running"
    else
        print_warning "Admin panel health check failed"
    fi

    # Check landing page
    if curl -f http://localhost:3004 >/dev/null 2>&1; then
        print_success "Landing page is running"
    else
        print_warning "Landing page health check failed"
    fi
}

# Function to display final information
display_info() {
    echo ""
    echo "========================================"
    echo "🎉 QUICKKUB PAYMENT GATEWAY SETUP COMPLETE!"
    echo "========================================"
    echo ""
    echo "🌐 Services are now running at:"
    echo "   • Frontend:     http://localhost:3000"
    echo "   • Admin Panel:  http://localhost:3001"
    echo "   • Backend API:  http://localhost:3002"
    echo "   • Landing Page: http://localhost:3004"
    echo "   • API Docs:     http://localhost:3002/docs"
    echo ""
    echo "🗄️ Database Tools:"
    echo "   • PgAdmin:      http://localhost:8080"
    echo "   • Redis Commander: http://localhost:8081"
    echo "   • Bull Board:   http://localhost:8082"
    echo ""
    echo "📧 Default Credentials:"
    echo "   • PgAdmin: admin@quickkub.com / admin123"
    echo "   • MinIO Console: minioadmin / minioadmin"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   • View logs:    docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Restart:      docker-compose restart"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Visit http://localhost:3000 to explore the frontend"
    echo "   2. Visit http://localhost:3001 to access the admin panel"
    echo "   3. Check http://localhost:3002/docs for API documentation"
    echo "   4. Review the README.md for development guidelines"
    echo ""
    echo "🚀 Happy coding!"
    echo ""
}

# Main setup function
main() {
    echo "========================================"
    echo "🚀 QUICKKUB PAYMENT GATEWAY SETUP"
    echo "========================================"
    echo ""

    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_node
    check_npm
    print_success "All prerequisites met"

    # Create environment files
    create_env_files

    # Install dependencies
    install_backend_deps
    install_frontend_deps
    install_admin_deps
    install_landing_deps

    # Build Docker images
    build_docker_images

    # Start services
    start_services

    # Run migrations and seed database
    run_migrations
    seed_database

    # Check service health
    check_services

    # Display final information
    display_info
}

# Run main function
main "$@"
