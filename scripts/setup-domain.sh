#!/bin/bash

# QuickKub Payment Gateway - Domain Setup Script
# สำหรับตั้งค่า DNS และ SSL certificate

set -e

echo "🌐 เริ่มต้นตั้งค่า Domain และ SSL Certificate..."

# ตรวจสอบว่ามีไฟล์ .env.production หรือไม่
if [ ! -f ".env.production" ]; then
    echo "❌ ไม่พบไฟล์ .env.production กรุณารัน scripts/setup-env.sh ก่อน"
    exit 1
fi

# อ่านโดเมนจากไฟล์ .env.production
DOMAIN=$(grep "PAYMENT_GATEWAY_URL" .env.production | cut -d'=' -f2 | sed 's|https://||')
if [ -z "$DOMAIN" ]; then
    echo "❌ ไม่พบโดเมนในไฟล์ .env.production"
    exit 1
fi

echo "🌐 โดเมนที่ตรวจพบ: $DOMAIN"
echo ""

# ตรวจสอบว่าเป็น root user หรือไม่
if [ "$EUID" -ne 0 ]; then
    echo "❌ กรุณารันสคริปต์นี้ด้วย sudo"
    exit 1
fi

# อัพเดทระบบ
echo "📦 อัพเดทระบบ..."
apt update && apt upgrade -y

# ติดตั้ง dependencies
echo "📦 ติดตั้ง dependencies..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# ตั้งค่า Nginx
echo "🔧 ตั้งค่า Nginx..."
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
echo "🔍 ตรวจสอบ Nginx configuration..."
nginx -t

# รีสตาร์ท Nginx
echo "🔄 รีสตาร์ท Nginx..."
systemctl restart nginx
systemctl enable nginx

# ขอ SSL certificate
echo "🔐 ขอ SSL certificate..."
certbot --nginx -d $DOMAIN -d api.$DOMAIN -d admin.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# ตั้งค่า auto-renewal
echo "⏰ ตั้งค่า SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# สร้างโฟลเดอร์สำหรับ logs และ uploads
echo "📁 สร้างโฟลเดอร์ที่จำเป็น..."
mkdir -p /var/log/payment-gateway
mkdir -p /var/uploads/payment-gateway
mkdir -p /var/uploads/admin
mkdir -p /var/backups/payment-gateway

# ตั้งค่าสิทธิ์
chown -R www-data:www-data /var/log/payment-gateway
chown -R www-data:www-data /var/uploads/payment-gateway
chown -R www-data:www-data /var/uploads/admin
chown -R www-data:www-data /var/backups/payment-gateway

# ตั้งค่า firewall
echo "🔥 ตั้งค่า Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ ตั้งค่า Domain และ SSL Certificate เสร็จสิ้น!"
echo ""
echo "📋 สรุปข้อมูลที่สำคัญ:"
echo "   🌐 โดเมนหลัก: https://$DOMAIN"
echo "   🔗 API: https://api.$DOMAIN"
echo "   👨‍💼 Admin Panel: https://admin.$DOMAIN"
echo "   📧 SSL Email: admin@$DOMAIN"
echo ""
echo "⚠️  ข้อควรระวัง:"
echo "   1. ตรวจสอบ DNS records ว่าชี้มาที่ server IP นี้"
echo "   2. รอ DNS propagation (อาจใช้เวลา 5-30 นาที)"
echo "   3. ตรวจสอบ SSL certificate ว่าทำงานถูกต้อง"
echo ""
echo "🚀 ขั้นตอนต่อไป:"
echo "   1. ตรวจสอบ DNS records"
echo "   2. รัน docker-compose up --build -d"
echo "   3. ตรวจสอบการทำงานของระบบ"
echo ""
echo "🔍 คำสั่งสำหรับตรวจสอบ:"
echo "   - ตรวจสอบ Nginx: systemctl status nginx"
echo "   - ตรวจสอบ SSL: certbot certificates"
echo "   - ตรวจสอบ Logs: tail -f /var/log/nginx/error.log"
echo ""
