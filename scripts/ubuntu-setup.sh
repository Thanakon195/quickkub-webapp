#!/bin/bash

# QuickKub Payment Gateway - Ubuntu 22.04 Setup Script
# สคริปต์ง่ายๆ สำหรับตั้งค่า Ubuntu 22.04

echo "🚀 เริ่มต้นตั้งค่า Ubuntu 22.04 สำหรับ QuickKub Payment Gateway..."
echo ""

# ตรวจสอบว่าเป็น root user หรือไม่
if [ "$EUID" -ne 0 ]; then
    echo "❌ กรุณารันสคริปต์นี้ด้วย sudo"
    echo "   sudo bash ubuntu-setup.sh"
    exit 1
fi

echo "📦 ขั้นตอนที่ 1: อัพเดทระบบ..."
apt update
apt upgrade -y

echo "📦 ขั้นตอนที่ 2: ติดตั้ง packages ที่จำเป็น..."
apt install -y curl wget git nano htop ufw fail2ban

echo "📦 ขั้นตอนที่ 3: ติดตั้ง Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $SUDO_USER

echo "📦 ขั้นตอนที่ 4: ติดตั้ง Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "📦 ขั้นตอนที่ 5: ติดตั้ง Nginx และ Certbot..."
apt install -y nginx certbot python3-certbot-nginx

echo "🔥 ขั้นตอนที่ 6: ตั้งค่า Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "📁 ขั้นตอนที่ 7: สร้างโฟลเดอร์ที่จำเป็น..."
mkdir -p /opt/payment-gateway
mkdir -p /var/log/payment-gateway
mkdir -p /var/uploads/payment-gateway
mkdir -p /var/uploads/admin
mkdir -p /var/backups/payment-gateway

echo "🔧 ขั้นตอนที่ 8: ตั้งค่าสิทธิ์..."
chown -R $SUDO_USER:$SUDO_USER /opt/payment-gateway
chown -R www-data:www-data /var/log/payment-gateway
chown -R www-data:www-data /var/uploads/payment-gateway
chown -R www-data:www-data /var/uploads/admin
chown -R www-data:www-data /var/backups/payment-gateway

echo ""
echo "✅ ตั้งค่า Ubuntu 22.04 เสร็จสิ้น!"
echo ""
echo "📋 สรุปสิ่งที่ติดตั้ง:"
echo "   ✅ Docker และ Docker Compose"
echo "   ✅ Nginx Web Server"
echo "   ✅ Certbot (SSL certificates)"
echo "   ✅ UFW Firewall"
echo "   ✅ Fail2ban (Security)"
echo "   ✅ โฟลเดอร์ที่จำเป็น"
echo ""
echo "🚀 ขั้นตอนต่อไป:"
echo "   1. Clone โปรเจค: cd /opt && git clone [your-repo] payment-gateway"
echo "   2. ตั้งค่า environment: ./scripts/setup-env.sh"
echo "   3. ตั้งค่า domain: ./scripts/setup-domain.sh"
echo "   4. Deploy: ./scripts/deploy-production.sh"
echo ""
echo "💡 คำแนะนำ:"
echo "   - รีสตาร์ท server หลังจากติดตั้ง Docker"
echo "   - ตรวจสอบ Docker: docker --version"
echo "   - ตรวจสอบ Docker Compose: docker-compose --version"
echo ""
