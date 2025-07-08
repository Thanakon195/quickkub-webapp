#!/bin/bash

# QuickKub Payment Gateway Monitoring Script
# Usage: ./scripts/monitor.sh [action]

set -e

ACTION=${1:-status}

echo "📊 QuickKub System Monitoring"

# Function to check service status
check_status() {
    echo "🔍 Checking service status..."

    if [ -f "devops/docker-compose.yml" ]; then
        cd devops
        docker-compose ps
    else
        echo "❌ Docker Compose file not found"
        exit 1
    fi
}

# Function to check service health
check_health() {
    echo "🏥 Running health checks..."

    # Backend health check
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo "✅ Backend: Healthy"
    else
        echo "❌ Backend: Unhealthy"
    fi

    # Frontend health check
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend: Healthy"
    else
        echo "❌ Frontend: Unhealthy"
    fi

    # Admin health check
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Admin Panel: Healthy"
    else
        echo "❌ Admin Panel: Unhealthy"
    fi

    # Database health check
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ pgAdmin: Healthy"
    else
        echo "❌ pgAdmin: Unhealthy"
    fi

    # Redis health check
    if curl -f http://localhost:8081 > /dev/null 2>&1; then
        echo "✅ Redis Commander: Healthy"
    else
        echo "❌ Redis Commander: Unhealthy"
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    echo "📋 Showing logs for $service..."

    cd devops

    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $service
    fi
}

# Function to show system resources
show_resources() {
    echo "💻 System Resources:"
    echo ""

    # CPU usage
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

    # Memory usage
    echo "Memory Usage:"
    free -h | grep "Mem:" | awk '{print $3 "/" $2}'

    # Disk usage
    echo "Disk Usage:"
    df -h / | tail -1 | awk '{print $5}'

    # Docker containers
    echo "Docker Containers:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Function to show database stats
show_db_stats() {
    echo "🗄️ Database Statistics:"

    # Connect to database and run queries
    cd devops
    docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
        SELECT
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
        FROM pg_stats
        WHERE schemaname = 'public'
        ORDER BY tablename, attname;
    "
}

# Function to show queue stats
show_queue_stats() {
    echo "📋 Queue Statistics:"

    # Connect to Redis and check queue stats
    cd devops
    docker-compose exec redis redis-cli --eval - <<EOF
        local keys = redis.call('keys', '*')
        local stats = {}

        for i, key in ipairs(keys) do
            local keyType = redis.call('type', key)
            if keyType == 'list' or keyType == 'set' or keyType == 'zset' then
                local count = redis.call(keyType == 'list' and 'llen' or keyType == 'set' and 'scard' or 'zcard', key)
                table.insert(stats, {key, keyType, count})
            end
        end

        return stats
EOF
}

# Function to show API metrics
show_api_metrics() {
    echo "🌐 API Metrics:"

    # Get API response times
    echo "Testing API endpoints..."

    # Health endpoint
    start_time=$(date +%s%N)
    curl -s http://localhost:3002/health > /dev/null
    end_time=$(date +%s%N)
    health_time=$(( (end_time - start_time) / 1000000 ))
    echo "Health endpoint: ${health_time}ms"

    # API docs endpoint
    start_time=$(date +%s%N)
    curl -s http://localhost:3002/docs > /dev/null
    end_time=$(date +%s%N)
    docs_time=$(( (end_time - start_time) / 1000000 ))
    echo "API docs endpoint: ${docs_time}ms"
}

# Function to show error logs
show_errors() {
    echo "🚨 Recent Errors:"

    cd devops

    # Show error logs from all services
    docker-compose logs --tail=50 | grep -i "error\|exception\|failed" || echo "No recent errors found"
}

# Function to show performance metrics
show_performance() {
    echo "⚡ Performance Metrics:"

    # Show container resource usage
    echo "Container Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

    echo ""
    echo "System Load:"
    uptime

    echo ""
    echo "Memory Usage:"
    free -h
}

# Main execution
case $ACTION in
    "status")
        check_status
        ;;
    "health")
        check_health
        ;;
    "logs")
        show_logs $2
        ;;
    "resources")
        show_resources
        ;;
    "database")
        show_db_stats
        ;;
    "queue")
        show_queue_stats
        ;;
    "api")
        show_api_metrics
        ;;
    "errors")
        show_errors
        ;;
    "performance")
        show_performance
        ;;
    "all")
        check_status
        echo ""
        check_health
        echo ""
        show_resources
        echo ""
        show_api_metrics
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./scripts/monitor.sh [action]"
        echo "Available actions:"
        echo "  status      - Show service status"
        echo "  health      - Run health checks"
        echo "  logs [service] - Show logs"
        echo "  resources   - Show system resources"
        echo "  database    - Show database stats"
        echo "  queue       - Show queue stats"
        echo "  api         - Show API metrics"
        echo "  errors      - Show recent errors"
        echo "  performance - Show performance metrics"
        echo "  all         - Run all checks"
        exit 1
        ;;
esac
