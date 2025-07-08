#!/bin/bash

# ========================================
# 🚀 QuickKub Payment Gateway - Production Deployment Script
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="quickkub-payment-gateway"
ENV_FILE=".env.production"
DOCKER_COMPOSE_FILE="devops/docker-compose.production.yml"
BACKUP_DIR="/var/backups/quickkub"
LOG_DIR="/var/log/quickkub"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found. Please create it first."
        exit 1
    fi

    # Check if running as root or with sudo
    if [ "$EUID" -ne 0 ]; then
        log_warning "This script should be run with sudo for production deployment."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_success "System requirements check passed"
}

create_directories() {
    log_info "Creating necessary directories..."

    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    sudo mkdir -p devops/nginx/logs
    sudo mkdir -p devops/nginx/ssl
    sudo mkdir -p devops/nginx/webroot
    sudo mkdir -p devops/monitoring/grafana/dashboards
    sudo mkdir -p devops/monitoring/grafana/datasources

    log_success "Directories created"
}

backup_existing() {
    if [ -d "$PROJECT_NAME" ]; then
        log_info "Creating backup of existing deployment..."

        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        sudo cp -r $PROJECT_NAME $BACKUP_DIR/$BACKUP_NAME

        log_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

setup_environment() {
    log_info "Setting up environment..."

    # Load environment variables
    source $ENV_FILE

    # Validate required environment variables
    required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
        "MINIO_ROOT_PASSWORD"
        "GRAFANA_PASSWORD"
        "DOMAIN_NAME"
        "SSL_EMAIL"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done

    log_success "Environment setup completed"
}

build_images() {
    log_info "Building Docker images..."

    # Build backend
    log_info "Building backend image..."
    docker build -f backend/Dockerfile.prod -t quickkub-backend:latest backend/

    # Build frontend
    log_info "Building frontend image..."
    docker build -f frontend/Dockerfile.prod -t quickkub-frontend:latest frontend/

    # Build admin
    log_info "Building admin image..."
    docker build -f admin/Dockerfile.prod -t quickkub-admin:latest admin/

    log_success "Docker images built successfully"
}

deploy_services() {
    log_info "Deploying services..."

    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true

    # Start services
    log_info "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30

    log_success "Services deployed successfully"
}

run_migrations() {
    log_info "Running database migrations..."

    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T backend npm run migrate:run || {
        log_error "Migration failed"
        exit 1
    }

    log_success "Database migrations completed"
}

seed_database() {
    log_info "Seeding database..."

    docker-compose -f $DOCKER_COMPOSE_FILE exec -T backend npm run migrate:seed || {
        log_warning "Database seeding failed or already completed"
    }

    log_success "Database seeding completed"
}

setup_ssl() {
    log_info "Setting up SSL certificates..."

    # Check if certificates already exist
    if [ -f "devops/nginx/ssl/live/$DOMAIN_NAME/fullchain.pem" ]; then
        log_info "SSL certificates already exist, renewing..."
        docker-compose -f $DOCKER_COMPOSE_FILE run --rm certbot renew
    else
        log_info "Requesting new SSL certificates..."
        docker-compose -f $DOCKER_COMPOSE_FILE run --rm certbot
    fi

    log_success "SSL setup completed"
}

health_check() {
    log_info "Performing health checks..."

    # Check backend health
    log_info "Checking backend health..."
    if curl -f http://localhost:3002/health/ping > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi

    # Check frontend health
    log_info "Checking frontend health..."
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi

    # Check admin health
    log_info "Checking admin health..."
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Admin panel is healthy"
    else
        log_error "Admin panel health check failed"
        return 1
    fi

    log_success "All health checks passed"
}

setup_monitoring() {
    log_info "Setting up monitoring..."

    # Create Prometheus configuration
    cat > devops/monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'quickkub-backend'
    static_configs:
      - targets: ['backend:3002']
    metrics_path: '/metrics'

  - job_name: 'quickkub-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'

  - job_name: 'quickkub-admin'
    static_configs:
      - targets: ['admin:3001']
    metrics_path: '/metrics'
EOF

    # Create Grafana datasource
    cat > devops/monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    log_success "Monitoring setup completed"
}

setup_backup() {
    log_info "Setting up automated backups..."

    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup database
pg_dump -h postgres -U $POSTGRES_USER -d $POSTGRES_DB > /tmp/backup.sql

# Upload to S3
aws s3 cp /tmp/backup.sql s3://$S3_BUCKET/backups/$(date +%Y%m%d)/backup-$(date +%Y%m%d-%H%M%S).sql

# Clean up
rm /tmp/backup.sql

echo "Backup completed: $(date)"
EOF

    chmod +x scripts/backup.sh

    log_success "Backup setup completed"
}

show_status() {
    log_info "Deployment Status:"
    echo

    # Show running containers
    docker-compose -f $DOCKER_COMPOSE_FILE ps

    echo
    log_info "Service URLs:"
    echo "Frontend: http://localhost:3000"
    echo "Admin Panel: http://localhost:3001"
    echo "API: http://localhost:3002"
    echo "Grafana: http://localhost:3001 (admin/${GRAFANA_PASSWORD})"
    echo "Kibana: http://localhost:5601"
    echo "Prometheus: http://localhost:9090"
    echo "MinIO Console: http://localhost:9001"

    echo
    log_info "Next steps:"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Update environment variables with your domain"
    echo "3. Run SSL certificate setup: ./scripts/setup-ssl.sh"
    echo "4. Configure monitoring alerts"
    echo "5. Set up automated backups"
}

main() {
    echo "========================================"
    echo "🚀 QuickKub Payment Gateway - Production Deployment"
    echo "========================================"
    echo

    check_requirements
    create_directories
    backup_existing
    setup_environment
    build_images
    deploy_services
    run_migrations
    seed_database
    setup_monitoring
    setup_backup
    health_check

    echo
    log_success "Production deployment completed successfully!"
    echo

    show_status
}

# Run main function
main "$@"
