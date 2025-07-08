# คู่มือการ Deploy QuickKub Payment Gateway

คู่มือนี้จะสอนวิธีการ deploy ระบบ QuickKub Payment Gateway บน production server

## 📋 ความต้องการของระบบ

### Server Requirements

- **OS**: Ubuntu 20.04 LTS หรือใหม่กว่า
- **RAM**: ขั้นต่ำ 4GB (แนะนำ 8GB+)
- **Storage**: ขั้นต่ำ 20GB (แนะนำ 50GB+)
- **CPU**: ขั้นต่ำ 2 cores (แนะนำ 4 cores+)
- **Network**: ขั้นต่ำ 100Mbps

### Domain Requirements

- โดเมนที่ชี้มาที่ server IP
- DNS records สำหรับ subdomains:
  - `api.your-domain.com`
  - `admin.your-domain.com`

## 🚀 ขั้นตอนการ Deploy

### ขั้นตอนที่ 1: เตรียม Server

1. **เชื่อมต่อ SSH เข้า server**

```bash
ssh root@your-server-ip
```

2. **อัพเดทระบบ**

```bash
apt update && apt upgrade -y
```

3. **ติดตั้ง dependencies พื้นฐาน**

```bash
apt install -y curl wget git nano htop
```

### ขั้นตอนที่ 2: Clone โปรเจค

1. **Clone โปรเจคจาก GitHub**

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/quickkub-payment-gateway.git
cd quickkub-payment-gateway
```

2. **ตั้งค่าสิทธิ์ไฟล์**

```bash
chmod +x scripts/*.sh
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

1. **รันสคริปต์ตั้งค่า environment**

```bash
./scripts/setup-env.sh
```

2. **กรอกข้อมูลที่จำเป็น:**
   - โดเมนหลัก (เช่น: your-domain.com)
   - อีเมลสำหรับ admin
   - SMTP settings (Gmail, SendGrid, etc.)
   - Database password

### ขั้นตอนที่ 4: ตั้งค่า DNS Records

ตั้งค่า DNS records ใน domain provider ของคุณ:

```
Type    Name    Value
A       @       your-server-ip
A       api     your-server-ip
A       admin   your-server-ip
```

### ขั้นตอนที่ 5: ตั้งค่า Domain และ SSL

1. **รันสคริปต์ตั้งค่า domain และ SSL**

```bash
./scripts/setup-domain.sh
```

2. **รอ DNS propagation (5-30 นาที)**

3. **ตรวจสอบ SSL certificate**

```bash
certbot certificates
```

### ขั้นตอนที่ 6: Deploy ระบบ

1. **รันสคริปต์ deploy**

```bash
./scripts/deploy-production.sh
```

2. **รอให้ระบบ deploy เสร็จ (ประมาณ 10-15 นาที)**

3. **ตรวจสอบสถานะ containers**

```bash
docker-compose ps
```

## 🔍 การตรวจสอบระบบ

### ตรวจสอบ Health Check

```bash
curl -f https://your-domain.com/health
```

### ตรวจสอบ Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Admin logs
docker-compose logs -f admin
```

### ตรวจสอบ Services

```bash
# ตรวจสอบ systemd services
systemctl status payment-gateway
systemctl status payment-gateway-monitor

# ตรวจสอบ Nginx
systemctl status nginx
```

## 🔐 การเข้าถึงระบบ

### URLs

- **Frontend**: https://your-domain.com
- **API**: https://api.your-domain.com
- **Admin Panel**: https://admin.your-domain.com

### Admin Credentials

- **Email**: admin@your-domain.com
- **Password**: admin123456

⚠️ **สำคัญ**: เปลี่ยนรหัสผ่าน admin ทันทีหลังจากเข้าสู่ระบบครั้งแรก

## 📊 Monitoring และ Maintenance

### การตรวจสอบระบบ

```bash
# ตรวจสอบ resource usage
htop

# ตรวจสอบ disk usage
df -h

# ตรวจสอบ memory usage
free -h

# ตรวจสอบ Docker containers
docker stats
```

### การ Backup

ระบบจะทำ backup อัตโนมัติทุกวัน:

- Database backup
- Upload files backup
- Backup เก็บไว้ 30 วัน

### การ Update ระบบ

```bash
# Pull code ใหม่
git pull origin main

# Deploy ใหม่
./scripts/deploy-production.sh
```

## 🛠️ การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Container ไม่ start

```bash
# ตรวจสอบ logs
docker-compose logs [service-name]

# Restart container
docker-compose restart [service-name]
```

#### 2. SSL Certificate ไม่ทำงาน

```bash
# ตรวจสอบ certificate
certbot certificates

# Renew certificate
certbot renew
```

#### 3. Database Connection Error

```bash
# ตรวจสอบ database container
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

#### 4. Nginx Error

```bash
# ตรวจสอบ Nginx config
nginx -t

# ตรวจสอบ Nginx logs
tail -f /var/log/nginx/error.log
```

### การ Restart ระบบ

```bash
# Restart ทั้งหมด
systemctl restart payment-gateway

# หรือ restart แยก
docker-compose restart
```

## 🔒 Security Checklist

- [ ] เปลี่ยน admin password
- [ ] ตั้งค่า firewall rules
- [ ] เปิดใช้งาน SSL/TLS
- [ ] ตั้งค่า security headers
- [ ] เปิดใช้งาน rate limiting
- [ ] ตั้งค่า backup
- [ ] เปิดใช้งาน monitoring
- [ ] ตั้งค่า log rotation

## 📞 การติดต่อ Support

หากพบปัญหาในการ deploy:

1. ตรวจสอบ logs ของ service ที่มีปัญหา
2. ตรวจสอบ system resources
3. ตรวจสอบ network connectivity
4. ตรวจสอบ DNS settings
5. ติดต่อ support พร้อมข้อมูล:
   - Error messages
   - System logs
   - Configuration files

## 📚 เอกสารเพิ่มเติม

- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Security Guide](./SECURITY.md)
