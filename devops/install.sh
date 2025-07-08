#!/bin/bash

# ========================================
# QuickKub Payment Gateway Auto-Installer
# ========================================
# This script automatically installs and configures
# the QuickKub Payment Gateway system

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

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to install dependencies based on OS
install_dependencies() {
    local os=$(detect_os)
    print_status "Detected OS: $os"

    case $os in
        "ubuntu")
            print_status "Installing dependencies on Ubuntu..."
            sudo apt-get update
            sudo apt-get install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
            ;;
        "centos")
            print_status "Installing dependencies on CentOS..."
            sudo yum update -y
            sudo yum install -y curl wget git unzip
            ;;
        "macos")
            print_status "Installing dependencies on macOS..."
            if ! command_exists brew; then
                print_status "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install curl wget git
            ;;
        *)
            print_warning "Unsupported OS. Please install dependencies manually."
            ;;
    esac
}

# Function to install Node.js
install_nodejs() {
    if command_exists node; then
        local version=$(node --version)
        print_status "Node.js already installed: $version"
        return
    fi

    print_status "Installing Node.js 18..."
    local os=$(detect_os)

    case $os in
        "ubuntu")
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "centos")
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        "macos")
            brew install node@18
            brew link node@18 --force
            ;;
        *)
            print_error "Cannot install Node.js automatically on this OS"
            exit 1
            ;;
    esac

    print_success "Node.js installed: $(node --version)"
}

# Function to install Docker
install_docker() {
    if command_exists docker; then
        print_status "Docker already installed: $(docker --version)"
        return
    fi

    print_status "Installing Docker..."
    local os=$(detect_os)

    case $os in
        "ubuntu")
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            ;;
        "centos")
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            ;;
        "macos")
            print_status "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
            print_status "After installation, restart your terminal and run this script again"
            exit 1
            ;;
        *)
            print_error "Cannot install Docker automatically on this OS"
            exit 1
            ;;
    esac

    print_success "Docker installed: $(docker --version)"
}

# Function to install Docker Compose
install_docker_compose() {
    if command_exists docker-compose; then
        print_status "Docker Compose already installed: $(docker-compose --version)"
        return
    fi

    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    print_success "Docker Compose installed: $(docker-compose --version)"
}

# Function to install PM2
install_pm2() {
    if command_exists pm2; then
        print_status "PM2 already installed: $(pm2 --version)"
        return
    fi

    print_status "Installing PM2..."
    sudo npm install -g pm2

    print_success "PM2 installed: $(pm2 --version)"
}

# Function to generate SSL certificate
generate_ssl() {
    if [ ! -f "devops/ssl/quickkub.crt" ]; then
        print_status "Generating SSL certificate..."
        mkdir -p devops/ssl

        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout devops/ssl/quickkub.key \
            -out devops/ssl/quickkub.crt \
            -subj "/C=TH/ST=Bangkok/L=Bangkok/O=QuickKub/OU=IT/CN=quickkub.local"

        print_success "SSL certificate generated"
    else
        print_status "SSL certificate already exists"
    fi
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."

    # Copy environment file
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Environment file created from template"
    else
        print_warning "Environment file already exists"
    fi

    # Generate secrets
    if ! grep -q "your-super-secret-jwt-key" .env; then
        print_status "Generating secure secrets..."

        # Generate JWT secret
        JWT_SECRET=$(openssl rand -base64 64)
        sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env

        # Generate TOTP secret
        TOTP_SECRET=$(openssl rand -base64 32)
        sed -i "s/your-totp-secret-key/$TOTP_SECRET/g" .env

        # Generate webhook HMAC secret
        WEBHOOK_SECRET=$(openssl rand -base64 32)
        sed -i "s/your_webhook_hmac_secret/$WEBHOOK_SECRET/g" .env

        print_success "Secure secrets generated"
    fi
}

# Function to build and start services
start_services() {
    print_status "Building and starting services..."

    # Build images
    docker-compose -f devops/docker-compose.yml build

    # Start services
    docker-compose -f devops/docker-compose.yml up -d

    print_success "Services started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."

    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose -f devops/docker-compose.yml exec -T postgres pg_isready -U quickkub_user -d quickkub_db; do
        sleep 2
    done

    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose -f devops/docker-compose.yml exec -T redis redis-cli ping; do
        sleep 2
    done

    # Wait for MinIO
    print_status "Waiting for MinIO..."
    until curl -f http://localhost:9000/minio/health/live; do
        sleep 2
    done

    print_success "All services are ready"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Wait for backend to be ready
    until curl -f http://localhost:3002/health; do
        sleep 5
    done

    # Run migrations
    docker-compose -f devops/docker-compose.yml exec backend npm run migration:run

    print_success "Database migrations completed"
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."

    # Run seeders
    docker-compose -f devops/docker-compose.yml exec backend npm run seed

    print_success "Database seeded successfully"
}

# Function to print access information
print_access_info() {
    echo ""
    echo "========================================"
    echo "🚀 QuickKub Payment Gateway Installed!"
    echo "========================================"
    echo ""
    echo "📱 Access URLs:"
    echo "   Landing Page:     http://localhost:3004"
    echo "   Frontend:         http://localhost:3000"
    echo "   Admin Panel:      http://localhost:3001"
    echo "   API Docs:         http://localhost:3002/docs"
    echo "   API Health:       http://localhost:3002/health"
    echo ""
    echo "🔧 Admin Tools:"
    echo "   PgAdmin:          http://localhost:8080"
    echo "   Redis Commander:  http://localhost:8081"
    echo "   Bull Board:       http://localhost:8082"
    echo "   MinIO Console:    http://localhost:9001"
    echo ""
    echo "🔑 Default Credentials:"
    echo "   PgAdmin:          admin@quickkub.com / admin123"
    echo "   MinIO Console:    minioadmin / minioadmin"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Visit http://localhost:3004 to see the landing page"
    echo "   2. Visit http://localhost:3001 to access admin panel"
    echo "   3. Check API docs at http://localhost:3002/docs"
    echo "   4. Configure payment providers in .env file"
    echo ""
    echo "🛠️ Useful Commands:"
    echo "   View logs:        docker-compose -f devops/docker-compose.yml logs -f"
    echo "   Stop services:    docker-compose -f devops/docker-compose.yml down"
    echo "   Restart services: docker-compose -f devops/docker-compose.yml restart"
    echo ""
    echo "📞 Support:"
    echo "   Email: support@quickkub.com"
    echo "   Line: @quickkub-support"
    echo "   Telegram: @quickkub_support"
    echo ""
    echo "========================================"
}

# Main installation function
main() {
    echo ""
    echo "========================================"
    echo "🚀 QuickKub Payment Gateway Installer"
    echo "========================================"
    echo ""

    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root"
        exit 1
    fi

    # Install dependencies
    install_dependencies

    # Install Node.js
    install_nodejs

    # Install Docker
    install_docker

    # Install Docker Compose
    install_docker_compose

    # Install PM2
    install_pm2

    # Generate SSL certificate
    generate_ssl

    # Setup environment
    setup_environment

    # Start services
    start_services

    # Wait for services
    wait_for_services

    # Run migrations
    run_migrations

    # Seed database
    seed_database

    # Print access information
    print_access_info
}

# Run main function
main "$@"
