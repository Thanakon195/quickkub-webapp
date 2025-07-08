#!/bin/bash

# QuickKub Payment Gateway Backup Script
# Usage: ./scripts/backup.sh [type]

set -e

TYPE=${1:-all}
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 QuickKub Backup Script"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to backup database
backup_database() {
    echo "🗄️ Backing up database..."

    cd devops

    # Create database backup
    docker-compose exec -T postgres pg_dump -U quickkub_user quickkub_db > "../$BACKUP_DIR/database_$DATE.sql"

    # Compress backup
    gzip "../$BACKUP_DIR/database_$DATE.sql"

    echo "✅ Database backup completed: $BACKUP_DIR/database_$DATE.sql.gz"
}

# Function to backup Redis data
backup_redis() {
    echo "🔴 Backing up Redis data..."

    cd devops

    # Create Redis backup
    docker-compose exec -T redis redis-cli BGSAVE

    # Wait for backup to complete
    sleep 5

    # Copy Redis dump file
    docker cp quickkub-redis:/data/dump.rdb "../$BACKUP_DIR/redis_$DATE.rdb"

    # Compress backup
    gzip "../$BACKUP_DIR/redis_$DATE.rdb"

    echo "✅ Redis backup completed: $BACKUP_DIR/redis_$DATE.rdb.gz"
}

# Function to backup MinIO data
backup_minio() {
    echo "📦 Backing up MinIO data..."

    cd devops

    # Create MinIO backup
    docker-compose exec -T minio mc mirror /data "../$BACKUP_DIR/minio_$DATE"

    # Compress backup
    tar -czf "../$BACKUP_DIR/minio_$DATE.tar.gz" -C "../$BACKUP_DIR" "minio_$DATE"
    rm -rf "../$BACKUP_DIR/minio_$DATE"

    echo "✅ MinIO backup completed: $BACKUP_DIR/minio_$DATE.tar.gz"
}

# Function to backup configuration files
backup_config() {
    echo "⚙️ Backing up configuration files..."

    # Create config backup
    tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
        backend/.env* \
        frontend/.env* \
        admin/.env* \
        devops/.env* \
        devops/docker-compose*.yml \
        devops/nginx/ \
        scripts/ \
        package*.json

    echo "✅ Configuration backup completed: $BACKUP_DIR/config_$DATE.tar.gz"
}

# Function to backup logs
backup_logs() {
    echo "📋 Backing up logs..."

    cd devops

    # Create logs backup
    docker-compose logs > "../$BACKUP_DIR/logs_$DATE.txt"

    # Compress backup
    gzip "../$BACKUP_DIR/logs_$DATE.txt"

    echo "✅ Logs backup completed: $BACKUP_DIR/logs_$DATE.txt.gz"
}

# Function to backup all
backup_all() {
    echo "💾 Creating complete backup..."

    backup_database
    backup_redis
    backup_minio
    backup_config
    backup_logs

    # Create backup manifest
    cat > "$BACKUP_DIR/manifest_$DATE.txt" <<EOF
QuickKub Backup Manifest
Date: $(date)
Type: Complete Backup
Files:
$(ls -la $BACKUP_DIR/*_$DATE.*)
EOF

    echo "✅ Complete backup completed!"
    echo "📁 Backup location: $BACKUP_DIR"
    echo "📄 Manifest: $BACKUP_DIR/manifest_$DATE.txt"
}

# Function to restore database
restore_database() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        echo "❌ Backup file is required"
        echo "Usage: ./scripts/backup.sh restore-db <backup_file>"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file not found: $backup_file"
        exit 1
    fi

    echo "🔄 Restoring database from $backup_file..."

    cd devops

    # Stop services
    docker-compose down

    # Restore database
    if [[ $backup_file == *.gz ]]; then
        gunzip -c "../$backup_file" | docker-compose exec -T postgres psql -U quickkub_user -d quickkub_db
    else
        docker-compose exec -T postgres psql -U quickkub_user -d quickkub_db < "../$backup_file"
    fi

    # Start services
    docker-compose up -d

    echo "✅ Database restore completed!"
}

# Function to list backups
list_backups() {
    echo "📋 Available backups:"
    echo ""

    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR" | grep -E "\.(sql|rdb|tar|txt)\.gz$" | sort -k9
    else
        echo "No backups found"
    fi
}

# Function to cleanup old backups
cleanup_backups() {
    local days=${1:-30}

    echo "🧹 Cleaning up backups older than $days days..."

    find "$BACKUP_DIR" -name "*.gz" -mtime +$days -delete

    echo "✅ Cleanup completed!"
}

# Main execution
case $TYPE in
    "all")
        backup_all
        ;;
    "database")
        backup_database
        ;;
    "redis")
        backup_redis
        ;;
    "minio")
        backup_minio
        ;;
    "config")
        backup_config
        ;;
    "logs")
        backup_logs
        ;;
    "restore-db")
        restore_database $2
        ;;
    "list")
        list_backups
        ;;
    "cleanup")
        cleanup_backups $2
        ;;
    *)
        echo "❌ Invalid type: $TYPE"
        echo "Usage: ./scripts/backup.sh [type]"
        echo "Available types:"
        echo "  all         - Complete backup"
        echo "  database    - Database backup only"
        echo "  redis       - Redis backup only"
        echo "  minio       - MinIO backup only"
        echo "  config      - Configuration backup only"
        echo "  logs        - Logs backup only"
        echo "  restore-db <file> - Restore database"
        echo "  list        - List available backups"
        echo "  cleanup [days] - Cleanup old backups"
        exit 1
        ;;
esac
