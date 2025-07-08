#!/bin/bash

# QuickKub Payment Gateway Production Setup Script
# Usage: ./scripts/setup-production.sh

set -e

echo "🚀 QuickKub Payment Gateway Production Setup"
echo "=============================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and log back in, then run this script again."
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "📝 Creating production environment file..."
    cp env.example .env.production

    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    S3_ACCESS_KEY=$(openssl rand -hex 16)
    S3_SECRET_KEY=$(openssl rand -hex 32)

    # Update environment file
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env.production
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env.production
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
    sed -i "s/S3_ACCESS_KEY=.*/S3_ACCESS_KEY=$S3_ACCESS_KEY/" .env.production
    sed -i "s/S3_SECRET_KEY=.*/S3_SECRET_KEY=$S3_SECRET_KEY/" .env.production

    echo "✅ Production environment file created with secure passwords"
    echo "📋 Please edit .env.production to configure your domain and other settings"
fi

# Create backup directory
sudo mkdir -p /backup/quickkub
sudo chown $USER:$USER /backup/quickkub

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl
sudo chown $USER:$USER /etc/nginx/ssl

# Setup firewall
echo "🔥 Setting up firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000
sudo ufw deny 3001
sudo ufw deny 3002
sudo ufw deny 8080
sudo ufw deny 8081
sudo ufw deny 8082
sudo ufw deny 9000
sudo ufw deny 9001

# Create systemd service for auto-start
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/quickkub.service > /dev/null <<EOF
[Unit]
Description=QuickKub Payment Gateway
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f devops/docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f devops/docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable quickkub.service

# Create cron jobs for backup and health check
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/scripts/health-check.sh") | crontab -

echo ""
echo "✅ Production setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.production with your domain and settings"
echo "2. Configure your domain DNS to point to this server"
echo "3. Run: ./scripts/deploy.sh production"
echo "4. Set up SSL certificates with Let's Encrypt"
echo ""
echo "🔗 Useful commands:"
echo "   Start services: sudo systemctl start quickkub"
echo "   Stop services: sudo systemctl stop quickkub"
echo "   View logs: docker-compose -f devops/docker-compose.prod.yml logs -f"
echo "   View status: docker-compose -f devops/docker-compose.prod.yml ps"
