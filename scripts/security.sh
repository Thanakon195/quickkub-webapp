#!/bin/bash

# QuickKub Payment Gateway Security Script
# Usage: ./scripts/security.sh [action]

set -e

ACTION=${1:-scan}

echo "🔒 QuickKub Security Script"

# Function to scan for vulnerabilities
scan_vulnerabilities() {
    echo "🔍 Scanning for vulnerabilities..."

    # Check if npm audit is available
    if command -v npm &> /dev/null; then
        echo "📦 Scanning npm dependencies..."
        cd backend && npm audit
        cd ../frontend && npm audit
        cd ../admin && npm audit
    else
        echo "⚠️ npm not found, skipping dependency scan"
    fi

    # Check for exposed ports
    echo "🔌 Checking exposed ports..."
    netstat -tuln | grep LISTEN

    # Check for weak file permissions
    echo "📁 Checking file permissions..."
    find . -type f -perm /o+w -ls | head -10

    # Check for environment files
    echo "🔐 Checking for exposed environment files..."
    find . -name ".env*" -type f -ls
}

# Function to check SSL/TLS configuration
check_ssl() {
    echo "🔐 Checking SSL/TLS configuration..."

    # Check if certificates exist
    if [ -f "devops/nginx/ssl/cert.pem" ]; then
        echo "✅ SSL certificate found"
        openssl x509 -in devops/nginx/ssl/cert.pem -text -noout | grep -E "Subject:|Issuer:|Not After:"
    else
        echo "⚠️ SSL certificate not found"
    fi

    # Check certificate expiration
    if [ -f "devops/nginx/ssl/cert.pem" ]; then
        echo "📅 Certificate expiration:"
        openssl x509 -in devops/nginx/ssl/cert.pem -noout -dates
    fi
}

# Function to check firewall rules
check_firewall() {
    echo "🔥 Checking firewall rules..."

    # Check iptables rules
    if command -v iptables &> /dev/null; then
        echo "📋 iptables rules:"
        iptables -L -n
    else
        echo "⚠️ iptables not available"
    fi

    # Check ufw status
    if command -v ufw &> /dev/null; then
        echo "🛡️ UFW status:"
        ufw status
    else
        echo "⚠️ UFW not available"
    fi
}

# Function to check Docker security
check_docker_security() {
    echo "🐳 Checking Docker security..."

    # Check for running containers
    echo "📦 Running containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

    # Check for privileged containers
    echo "⚠️ Privileged containers:"
    docker ps --filter "label=privileged=true" --format "table {{.Names}}\t{{.Image}}"

    # Check for exposed ports
    echo "🔌 Exposed ports:"
    docker ps --format "table {{.Names}}\t{{.Ports}}"

    # Check for root user in containers
    echo "👤 Containers running as root:"
    docker ps --format "{{.Names}}" | while read container; do
        if docker exec $container whoami 2>/dev/null | grep -q root; then
            echo "  $container"
        fi
    done
}

# Function to check database security
check_database_security() {
    echo "🗄️ Checking database security..."

    cd devops

    # Check database connections
    echo "🔗 Database connections:"
    docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
        SELECT
            datname,
            usename,
            client_addr,
            state,
            query_start
        FROM pg_stat_activity
        WHERE datname IS NOT NULL;
    "

    # Check for weak passwords
    echo "🔐 Checking for weak passwords..."
    docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
        SELECT
            usename,
            passwd IS NULL as no_password
        FROM pg_user
        WHERE passwd IS NULL;
    "
}

# Function to check API security
check_api_security() {
    echo "🌐 Checking API security..."

    # Check for CORS configuration
    echo "🔗 CORS configuration:"
    curl -H "Origin: http://malicious-site.com" -v http://localhost:3002/health 2>&1 | grep -i "access-control"

    # Check for rate limiting
    echo "⏱️ Rate limiting test:"
    for i in {1..5}; do
        curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health
        echo ""
        sleep 1
    done

    # Check for exposed endpoints
    echo "🔍 Checking for exposed endpoints:"
    curl -s http://localhost:3002/docs | grep -o 'href="[^"]*"' | head -10
}

# Function to check file integrity
check_file_integrity() {
    echo "📄 Checking file integrity..."

    # Create checksums for important files
    echo "🔢 Creating checksums for important files..."

    find . -name "*.env*" -o -name "docker-compose*.yml" -o -name "package*.json" | while read file; do
        if [ -f "$file" ]; then
            echo "$(sha256sum "$file")"
        fi
    done > "$BACKUP_DIR/checksums_$(date +%Y%m%d_%H%M%S).txt"

    echo "✅ File integrity check completed"
}

# Function to generate security report
generate_security_report() {
    echo "📊 Generating security report..."

    local report_file="security_report_$(date +%Y%m%d_%H%M%S).txt"

    {
        echo "QuickKub Security Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""

        echo "1. VULNERABILITY SCAN"
        echo "===================="
        scan_vulnerabilities

        echo ""
        echo "2. SSL/TLS CONFIGURATION"
        echo "======================="
        check_ssl

        echo ""
        echo "3. DOCKER SECURITY"
        echo "================="
        check_docker_security

        echo ""
        echo "4. DATABASE SECURITY"
        echo "==================="
        check_database_security

        echo ""
        echo "5. API SECURITY"
        echo "=============="
        check_api_security

    } > "$report_file"

    echo "✅ Security report generated: $report_file"
}

# Function to apply security fixes
apply_security_fixes() {
    echo "🔧 Applying security fixes..."

    # Update dependencies
    echo "📦 Updating dependencies..."
    cd backend && npm audit fix
    cd ../frontend && npm audit fix
    cd ../admin && npm audit fix

    # Set proper file permissions
    echo "📁 Setting file permissions..."
    find . -name "*.env*" -exec chmod 600 {} \;
    find . -name "*.key" -exec chmod 600 {} \;
    find . -name "*.pem" -exec chmod 600 {} \;

    # Restart services
    echo "🔄 Restarting services..."
    cd ../devops
    docker-compose restart

    echo "✅ Security fixes applied!"
}

# Main execution
case $ACTION in
    "scan")
        scan_vulnerabilities
        ;;
    "ssl")
        check_ssl
        ;;
    "firewall")
        check_firewall
        ;;
    "docker")
        check_docker_security
        ;;
    "database")
        check_database_security
        ;;
    "api")
        check_api_security
        ;;
    "integrity")
        check_file_integrity
        ;;
    "report")
        generate_security_report
        ;;
    "fix")
        apply_security_fixes
        ;;
    "all")
        scan_vulnerabilities
        echo ""
        check_ssl
        echo ""
        check_docker_security
        echo ""
        check_database_security
        echo ""
        check_api_security
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./scripts/security.sh [action]"
        echo "Available actions:"
        echo "  scan        - Scan for vulnerabilities"
        echo "  ssl         - Check SSL/TLS configuration"
        echo "  firewall    - Check firewall rules"
        echo "  docker      - Check Docker security"
        echo "  database    - Check database security"
        echo "  api         - Check API security"
        echo "  integrity   - Check file integrity"
        echo "  report      - Generate security report"
        echo "  fix         - Apply security fixes"
        echo "  all         - Run all security checks"
        exit 1
        ;;
esac
