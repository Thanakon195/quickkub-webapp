#!/bin/bash

# QuickKub Payment Gateway - Quick Setup Script
# สคริปต์ง่ายๆ สำหรับตั้งค่าทั้งหมดในครั้งเดียว

set -e

echo "🚀 QuickKub Payment Gateway - Quick Setup"
echo "=========================================="
echo ""

# ตรวจสอบว่าเป็น root user หรือไม่
if [ "$EUID" -ne 0 ]; then
    echo "❌ กรุณารันสคริปต์นี้ด้วย sudo"
    echo "   sudo bash quick-setup.sh"
    exit 1
fi

# ฟังก์ชันสำหรับถามข้อมูล
ask_question() {
    local question="$1"
    local default="$2"
    local answer

    if [ -n "$default" ]; then
        read -p "$question [$default]: " answer
        echo "${answer:-$default}"
    else
        read -p "$question: " answer
        echo "$answer"
    fi
}

echo "📝 กรุณากรอกข้อมูลต่อไปนี้:"
echo ""

# ขอข้อมูลโดเมน
DOMAIN=$(ask_question "🌐 โดเมนหลัก (เช่น: your-domain.com)")
if [ -z "$DOMAIN" ]; then
    echo "❌ โดเมนไม่สามารถเป็นค่าว่างได้"
    exit 1
fi

# ขอข้อมูลอีเมล
ADMIN_EMAIL=$(ask_question "📧 อีเมลสำหรับ admin" "admin@$DOMAIN")

# ขอข้อมูล SMTP
echo ""
echo "📧 ตั้งค่า SMTP (สำหรับส่งอีเมล)"
SMTP_HOST=$(ask_question "SMTP Host" "smtp.gmail.com")
SMTP_PORT=$(ask_question "SMTP Port" "587")
SMTP_USER=$(ask_question "SMTP User (อีเมล)")
SMTP_PASS=$(ask_question "SMTP Password (App Password)")

# ขอข้อมูล database
echo ""
DB_PASSWORD=$(ask_question "🗄️ Database Password (กด Enter ให้ระบบสร้างให้)")

# สร้าง password แบบสุ่มถ้าไม่กรอก
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    echo "🔐 สร้าง Database Password อัตโนมัติ: $DB_PASSWORD"
fi

echo ""
echo "🚀 เริ่มต้นตั้งค่าระบบ..."
echo ""

# ขั้นตอนที่ 1: อัพเดทระบบ
echo "📦 ขั้นตอนที่ 1: อัพเดทระบบ..."
apt update
apt upgrade -y

# ขั้นตอนที่ 2: ติดตั้ง packages
echo "📦 ขั้นตอนที่ 2: ติดตั้ง packages..."
apt install -y curl wget git nano htop ufw fail2ban nginx certbot python3-certbot-nginx

# ขั้นตอนที่ 3: ติดตั้ง Docker
echo "🐳 ขั้นตอนที่ 3: ติดตั้ง Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
    rm get-docker.sh
fi

# ขั้นตอนที่ 4: ติดตั้ง Docker Compose
echo "🐳 ขั้นตอนที่ 4: ติดตั้ง Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# ขั้นตอนที่ 5: ตั้งค่า Firewall
echo "🔥 ขั้นตอนที่ 5: ตั้งค่า Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ขั้นตอนที่ 6: สร้างโฟลเดอร์
echo "📁 ขั้นตอนที่ 6: สร้างโฟลเดอร์..."
mkdir -p /opt/payment-gateway
mkdir -p /var/log/payment-gateway
mkdir -p /var/uploads/payment-gateway
mkdir -p /var/uploads/admin
mkdir -p /var/backups/payment-gateway

# ขั้นตอนที่ 7: Clone โปรเจค (ถ้ายังไม่มี)
echo "📥 ขั้นตอนที่ 7: เตรียมโปรเจค..."
if [ ! -d "/opt/payment-gateway/.git" ]; then
    echo "⚠️  ไม่พบโปรเจคใน /opt/payment-gateway"
    echo "   กรุณา Clone โปรเจคก่อน:"
    echo "   cd /opt && git clone https://github.com/YOUR_USERNAME/quickkub-payment-gateway.git payment-gateway"
    echo ""
    echo "   หรือถ้าคุณมีโปรเจคอยู่แล้ว ให้ copy ไปที่ /opt/payment-gateway"
    exit 1
fi

cd /opt/payment-gateway

# ขั้นตอนที่ 8: สร้าง environment files
echo "⚙️ ขั้นตอนที่ 8: สร้าง environment files..."

# สร้าง secrets แบบสุ่ม
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/")
WEBHOOK_SECRET=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# สร้างไฟล์ .env.production
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=payment_user
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=payment_gateway

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_DB=0

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=noreply@$DOMAIN

# Payment Gateway Configuration
PAYMENT_GATEWAY_URL=https://$DOMAIN
PAYMENT_GATEWAY_API_KEY=$(openssl rand -hex 32)
PAYMENT_GATEWAY_WEBHOOK_SECRET=$WEBHOOK_SECRET

# Admin Configuration
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=admin123456
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_ADMIN_URL=https://admin.$DOMAIN

# Admin Frontend Configuration
REACT_APP_API_URL=https://api.$DOMAIN
REACT_APP_ADMIN_URL=https://admin.$DOMAIN
REACT_APP_FRONTEND_URL=https://$DOMAIN

# Security Configuration
CORS_ORIGIN=https://$DOMAIN,https://admin.$DOMAIN
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
SESSION_SECRET=$SESSION_SECRET
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true

# SSL/TLS Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem

# Backup Configuration
BACKUP_PATH=/var/backups/payment-gateway
BACKUP_RETENTION_DAYS=30

# Monitoring Configuration
HEALTH_CHECK_URL=https://$DOMAIN/health
MONITORING_EMAIL=monitor@$DOMAIN

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/payment-gateway/app.log

# Monitoring Configuration
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# File Upload Configuration
UPLOAD_MAX_SIZE=10mb
UPLOAD_PATH=/var/uploads/payment-gateway
EOF

# สร้างไฟล์ backend/.env
cat > backend/.env << EOF
# Backend Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=payment_user
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=payment_gateway
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_DB=0

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=noreply@$DOMAIN

# Payment Gateway Configuration
PAYMENT_GATEWAY_URL=https://$DOMAIN
PAYMENT_GATEWAY_API_KEY=$(openssl rand -hex 32)
PAYMENT_GATEWAY_WEBHOOK_SECRET=$WEBHOOK_SECRET

# Admin Configuration
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=admin123456
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Security Configuration
CORS_ORIGIN=https://$DOMAIN,https://admin.$DOMAIN
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/payment-gateway/app.log

# Monitoring Configuration
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# File Upload Configuration
UPLOAD_MAX_SIZE=10mb
UPLOAD_PATH=/var/uploads/payment-gateway

# Session Configuration
SESSION_SECRET=$SESSION_SECRET
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
EOF

# สร้างไฟล์ frontend/.env.local
cat > frontend/.env.local << EOF
# Frontend Production Environment Configuration
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_ADMIN_URL=https://admin.$DOMAIN

# Authentication Configuration
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_PROVIDER=local

# Payment Configuration
NEXT_PUBLIC_PAYMENT_GATEWAY_URL=https://$DOMAIN
NEXT_PUBLIC_PAYMENT_METHODS=credit_card,bank_transfer,crypto
NEXT_PUBLIC_CURRENCY=THB

# Analytics Configuration
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# Feature Flags
NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE=true
NEXT_PUBLIC_FEATURE_DARK_MODE=true
NEXT_PUBLIC_FEATURE_NOTIFICATIONS=true

# Security Configuration
NEXT_PUBLIC_CSP_NONCE=
NEXT_PUBLIC_HSTS_ENABLED=true

# Performance Configuration
NEXT_PUBLIC_IMAGE_OPTIMIZATION=true
NEXT_PUBLIC_COMPRESSION_ENABLED=true

# Monitoring Configuration
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_LOG_LEVEL=error

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=th
NEXT_PUBLIC_SUPPORTED_LOCALES=th,en

# Social Media
NEXT_PUBLIC_SOCIAL_FACEBOOK=
NEXT_PUBLIC_SOCIAL_TWITTER=
NEXT_PUBLIC_SOCIAL_LINKEDIN=
EOF

# สร้างไฟล์ admin/.env
cat > admin/.env << EOF
# Admin Panel Production Environment Configuration
NODE_ENV=production

# API Configuration
REACT_APP_API_URL=https://api.$DOMAIN
REACT_APP_ADMIN_URL=https://admin.$DOMAIN
REACT_APP_FRONTEND_URL=https://$DOMAIN

# Authentication Configuration
REACT_APP_AUTH_ENABLED=true
REACT_APP_AUTH_PROVIDER=local
REACT_APP_SESSION_TIMEOUT=3600000

# Admin Configuration
REACT_APP_ADMIN_EMAIL=$ADMIN_EMAIL
REACT_APP_ADMIN_ROLE=super_admin
REACT_APP_MAX_LOGIN_ATTEMPTS=5
REACT_APP_LOCKOUT_DURATION=900000

# Dashboard Configuration
REACT_APP_DASHBOARD_REFRESH_INTERVAL=30000
REACT_APP_CHART_UPDATE_INTERVAL=60000
REACT_APP_NOTIFICATION_CHECK_INTERVAL=30000

# Security Configuration
REACT_APP_CSP_ENABLED=true
REACT_APP_HSTS_ENABLED=true
REACT_APP_CSRF_PROTECTION=true

# Monitoring Configuration
REACT_APP_SENTRY_DSN=
REACT_APP_LOG_LEVEL=error
REACT_APP_HEALTH_CHECK_ENABLED=true

# Feature Flags
REACT_APP_FEATURE_AUDIT_LOG=true
REACT_APP_FEATURE_REAL_TIME_MONITORING=true
REACT_APP_FEATURE_BULK_OPERATIONS=true
REACT_APP_FEATURE_EXPORT_DATA=true

# File Upload Configuration
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx
REACT_APP_UPLOAD_PATH=/var/uploads/admin

# Reporting Configuration
REACT_APP_REPORT_GENERATION_ENABLED=true
REACT_APP_REPORT_SCHEDULING_ENABLED=true
REACT_APP_REPORT_RETENTION_DAYS=365

# Backup Configuration
REACT_APP_BACKUP_ENABLED=true
REACT_APP_BACKUP_SCHEDULE=daily
REACT_APP_BACKUP_RETENTION_DAYS=30

# Internationalization
REACT_APP_DEFAULT_LOCALE=th
REACT_APP_SUPPORTED_LOCALES=th,en
REACT_APP_DATE_FORMAT=DD/MM/YYYY
REACT_APP_TIME_FORMAT=HH:mm:ss
EOF

# ตั้งค่าสิทธิ์ไฟล์
chmod 600 .env.production
chmod 600 backend/.env
chmod 600 frontend/.env.local
chmod 600 admin/.env

# ขั้นตอนที่ 9: ตั้งค่า Nginx
echo "🔧 ขั้นตอนที่ 9: ตั้งค่า Nginx..."
cat > /etc/nginx/sites-available/payment-gateway << EOF
# Payment Gateway Nginx Configuration
server {
    listen 80;
    server_name $DOMAIN api.$DOMAIN admin.$DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL Configuration (จะถูกแทนที่โดย Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health Check
    location /health {
        proxy_pass http://backend:3000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API
    location / {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # CORS Headers
        add_header Access-Control-Allow-Origin "https://$DOMAIN, https://admin.$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;

        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://$DOMAIN, https://admin.$DOMAIN" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
}

server {
    listen 443 ssl http2;
    server_name admin.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Admin Panel
    location / {
        proxy_pass http://admin:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# เปิดใช้งาน site
ln -sf /etc/nginx/sites-available/payment-gateway /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# ตรวจสอบ Nginx configuration
nginx -t

# รีสตาร์ท Nginx
systemctl restart nginx
systemctl enable nginx

# ขั้นตอนที่ 10: ขอ SSL certificate
echo "🔐 ขั้นตอนที่ 10: ขอ SSL certificate..."
certbot --nginx -d $DOMAIN -d api.$DOMAIN -d admin.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL

# ตั้งค่า auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# ตั้งค่าสิทธิ์
chown -R www-data:www-data /var/log/payment-gateway
chown -R www-data:www-data /var/uploads/payment-gateway
chown -R www-data:www-data /var/uploads/admin
chown -R www-data:www-data /var/backups/payment-gateway

# ขั้นตอนที่ 11: Deploy ระบบ
echo "🚀 ขั้นตอนที่ 11: Deploy ระบบ..."

# หยุด containers ที่ทำงานอยู่
docker-compose down 2>/dev/null || true

# ลบ images เก่า
docker system prune -f

# Build และ start containers
docker-compose up --build -d

# รอให้ containers เริ่มทำงาน
echo "⏳ รอให้ containers เริ่มทำงาน..."
sleep 30

# ตรวจสอบสถานะ containers
echo "🔍 ตรวจสอบสถานะ containers..."
docker-compose ps

# ตั้งค่า systemd service
cat > /etc/systemd/system/payment-gateway.service << EOF
[Unit]
Description=QuickKub Payment Gateway
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/payment-gateway
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable payment-gateway.service

# ตั้งค่า backup cron job
cat > /etc/cron.daily/payment-gateway-backup << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/payment-gateway/\$(date +%Y%m%d_%H%M%S)"
mkdir -p "\$BACKUP_DIR"

# Backup uploads
if [ -d "/var/uploads/payment-gateway" ]; then
    cp -r /var/uploads/payment-gateway "\$BACKUP_DIR/"
fi

if [ -d "/var/uploads/admin" ]; then
    cp -r /var/uploads/admin "\$BACKUP_DIR/"
fi

# Backup database
cd /opt/payment-gateway
docker-compose exec -T postgres pg_dump -U payment_user payment_gateway > "\$BACKUP_DIR/database.sql"

# ลบ backup เก่า (เก็บไว้ 30 วัน)
find /var/backups/payment-gateway -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
EOF

chmod +x /etc/cron.daily/payment-gateway-backup

echo ""
echo "✅ ตั้งค่าเสร็จสิ้น!"
echo ""
echo "🎉 QuickKub Payment Gateway พร้อมใช้งาน!"
echo ""
echo "📋 สรุปข้อมูลที่สำคัญ:"
echo "   🌐 โดเมนหลัก: https://$DOMAIN"
echo "   🔗 API: https://api.$DOMAIN"
echo "   👨‍💼 Admin Panel: https://admin.$DOMAIN"
echo "   📧 Admin Email: $ADMIN_EMAIL"
echo "   🔐 Admin Password: admin123456"
echo "   🗄️ Database Password: $DB_PASSWORD"
echo ""
echo "⚠️  ข้อควรระวัง:"
echo "   1. เปลี่ยน Admin Password หลังจากเข้าสู่ระบบครั้งแรก"
echo "   2. เก็บ secrets ไว้ในที่ปลอดภัย"
echo "   3. ตรวจสอบการทำงานของระบบทั้งหมด"
echo ""
echo "🔍 คำสั่งสำหรับตรวจสอบ:"
echo "   - ตรวจสอบ containers: docker-compose ps"
echo "   - ดู logs: docker-compose logs -f [service]"
echo "   - ตรวจสอบ SSL: certbot certificates"
echo "   - ตรวจสอบ Nginx: systemctl status nginx"
echo ""
echo "🚀 ระบบพร้อมใช้งาน!"
echo ""
