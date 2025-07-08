#!/bin/bash

# QuickKub Payment Gateway - Environment Setup Script
# สำหรับตั้งค่า environment variables บน Linux server

set -e

echo "🚀 เริ่มต้นตั้งค่า Environment Variables สำหรับ QuickKub Payment Gateway..."

# ตรวจสอบว่าอยู่ในโฟลเดอร์ที่ถูกต้อง
if [ ! -f "docker-compose.yml" ] && [ ! -f "devops/docker-compose.yml" ]; then
    echo "❌ ไม่พบไฟล์ docker-compose.yml กรุณารันสคริปต์นี้ในโฟลเดอร์หลักของโปรเจค"
    exit 1
fi

# ฟังก์ชันสำหรับสร้าง password แบบสุ่ม
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# ฟังก์ชันสำหรับสร้าง JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/"
}

# ฟังก์ชันสำหรับสร้าง webhook secret
generate_webhook_secret() {
    openssl rand -hex 32
}

echo "📝 กรุณากรอกข้อมูลต่อไปนี้:"
echo ""

# ขอข้อมูลโดเมน
read -p "🌐 โดเมนหลัก (เช่น: your-domain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ โดเมนไม่สามารถเป็นค่าว่างได้"
    exit 1
fi

# ขอข้อมูลอีเมล
read -p "📧 อีเมลสำหรับ admin (เช่น: admin@$DOMAIN): " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="admin@$DOMAIN"
fi

# ขอข้อมูล SMTP
read -p "📧 SMTP Host (เช่น: smtp.gmail.com): " SMTP_HOST
if [ -z "$SMTP_HOST" ]; then
    SMTP_HOST="smtp.gmail.com"
fi

read -p "📧 SMTP Port (เช่น: 587): " SMTP_PORT
if [ -z "$SMTP_PORT" ]; then
    SMTP_PORT="587"
fi

read -p "📧 SMTP User (อีเมล): " SMTP_USER
read -p "📧 SMTP Password (App Password): " SMTP_PASS

# ขอข้อมูล database
read -p "🗄️ Database Password: " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(generate_password)
    echo "🔐 สร้าง Database Password อัตโนมัติ: $DB_PASSWORD"
fi

# สร้าง secrets แบบสุ่ม
JWT_SECRET=$(generate_jwt_secret)
WEBHOOK_SECRET=$(generate_webhook_secret)
REDIS_PASSWORD=$(generate_password)
SESSION_SECRET=$(generate_password)

echo ""
echo "🔐 สร้าง secrets แบบสุ่ม:"
echo "   JWT Secret: ${JWT_SECRET:0:20}..."
echo "   Webhook Secret: ${WEBHOOK_SECRET:0:20}..."
echo "   Redis Password: ${REDIS_PASSWORD:0:20}..."
echo "   Session Secret: ${SESSION_SECRET:0:20}..."
echo ""

# สร้างไฟล์ .env.production
echo "📄 สร้างไฟล์ .env.production..."
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
PAYMENT_GATEWAY_API_KEY=$(generate_webhook_secret)
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
echo "📄 สร้างไฟล์ backend/.env..."
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
PAYMENT_GATEWAY_API_KEY=$(generate_webhook_secret)
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
echo "📄 สร้างไฟล์ frontend/.env.local..."
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
echo "📄 สร้างไฟล์ admin/.env..."
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

echo ""
echo "✅ ตั้งค่า Environment Variables เสร็จสิ้น!"
echo ""
echo "📋 สรุปข้อมูลที่สำคัญ:"
echo "   🌐 โดเมนหลัก: $DOMAIN"
echo "   📧 Admin Email: $ADMIN_EMAIL"
echo "   🔐 Admin Password: admin123456"
echo "   🗄️ Database Password: $DB_PASSWORD"
echo "   🔑 JWT Secret: ${JWT_SECRET:0:20}..."
echo "   🔗 Webhook Secret: ${WEBHOOK_SECRET:0:20}..."
echo ""
echo "⚠️  ข้อควรระวัง:"
echo "   1. เปลี่ยน Admin Password หลังจากเข้าสู่ระบบครั้งแรก"
echo "   2. เก็บ secrets ไว้ในที่ปลอดภัย"
echo "   3. ตั้งค่า SSL certificate สำหรับโดเมน"
echo "   4. ตั้งค่า DNS records สำหรับ subdomains (api, admin)"
echo ""
echo "🚀 ขั้นตอนต่อไป:"
echo "   1. ตั้งค่า DNS records"
echo "   2. ตั้งค่า SSL certificate"
echo "   3. รัน docker-compose up --build -d"
echo "   4. เข้าสู่ระบบ admin และเปลี่ยนรหัสผ่าน"
echo ""
