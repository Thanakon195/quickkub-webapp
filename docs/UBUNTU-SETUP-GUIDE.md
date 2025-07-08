# 🚀 คู่มือตั้งค่า QuickKub Payment Gateway บน Ubuntu 22.04

คู่มือง่ายๆ สำหรับตั้งค่าระบบบน Ubuntu 22.04 x64

## 📋 สิ่งที่ต้องเตรียม

### Server Requirements

- **OS**: Ubuntu 22.04 LTS x64
- **RAM**: ขั้นต่ำ 4GB (แนะนำ 8GB+)
- **Storage**: ขั้นต่ำ 20GB (แนะนำ 50GB+)
- **CPU**: ขั้นต่ำ 2 cores
- **Network**: ขั้นต่ำ 100Mbps

### Domain Requirements

- โดเมนที่ชี้มาที่ server IP
- DNS access สำหรับตั้งค่า subdomains

## 🎯 ขั้นตอนการตั้งค่า (ทีละสเต็ป)

### สเต็ปที่ 1: เชื่อมต่อ Server

1. **เปิด Terminal หรือ SSH client**
2. **เชื่อมต่อ SSH เข้า server**

```bash
ssh root@your-server-ip
```

### สเต็ปที่ 2: เตรียมระบบ

1. **ดาวน์โหลดสคริปต์ตั้งค่า**

```bash
cd /tmp
wget https://raw.githubusercontent.com/Thanakon195/quickkub-payment-gateway/main/scripts/ubuntu-setup.sh
```

2. **รันสคริปต์ตั้งค่า**

```bash
chmod +x ubuntu-setup.sh
sudo bash ubuntu-setup.sh
```

3. **รอให้ติดตั้งเสร็จ (ประมาณ 5-10 นาที)**

### สเต็ปที่ 3: Clone โปรเจค

1. **ไปที่โฟลเดอร์ /opt**

```bash
cd /opt
```

2. **Clone โปรเจคจาก GitHub**

```bash
git clone https://github.com/YOUR_USERNAME/quickkub-payment-gateway.git payment-gateway
cd payment-gateway
```

3. **ตั้งค่าสิทธิ์สคริปต์**

```bash
chmod +x scripts/*.sh
```

### สเต็ปที่ 4: ตั้งค่า Environment

1. **รันสคริปต์ตั้งค่า environment**

```bash
./scripts/setup-env.sh
```

2. **กรอกข้อมูลตามที่ระบบถาม:**
   - **โดเมน**: your-domain.com
   - **Admin Email**: admin@your-domain.com
   - **SMTP Host**: smtp.gmail.com
   - **SMTP Port**: 587
   - **SMTP User**: your-email@gmail.com
   - **SMTP Password**: your-app-password
   - **Database Password**: (กด Enter ให้ระบบสร้างให้)

### สเต็ปที่ 5: ตั้งค่า DNS

1. **ไปที่ domain provider ของคุณ**
2. **ตั้งค่า DNS records:**

```
Type: A
Name: @
Value: your-server-ip

Type: A
Name: api
Value: your-server-ip

Type: A
Name: admin
Value: your-server-ip
```

3. **รอ DNS propagation (5-30 นาที)**

### สเต็ปที่ 6: ตั้งค่า Domain และ SSL

1. **รันสคริปต์ตั้งค่า domain**

```bash
./scripts/setup-domain.sh
```

2. **รอให้ระบบตั้งค่า SSL certificate**

### สเต็ปที่ 7: Deploy ระบบ

1. **รันสคริปต์ deploy**

```bash
./scripts/deploy-production.sh
```

2. **รอให้ระบบ deploy เสร็จ (ประมาณ 10-15 นาที)**

### สเต็ปที่ 8: ตรวจสอบระบบ

1. **ตรวจสอบ containers**

```bash
docker-compose ps
```

2. **ตรวจสอบ health check**

```bash
curl -f https://your-domain.com/health
```

## 🔐 การเข้าถึงระบบ

### URLs

- **Frontend**: https://your-domain.com
- **API**: https://api.your-domain.com
- **Admin Panel**: https://admin.your-domain.com

### Admin Login

- **Email**: admin@your-domain.com
- **Password**: admin123456

⚠️ **สำคัญ**: เปลี่ยนรหัสผ่าน admin ทันที!

## 🛠️ คำสั่งที่มีประโยชน์

### ตรวจสอบระบบ

```bash
# ดู containers
docker-compose ps

# ดู logs
docker-compose logs -f backend

# ตรวจสอบ disk
df -h

# ตรวจสอบ memory
free -h

# ตรวจสอบ CPU
htop
```

### การจัดการระบบ

```bash
# Restart ระบบ
docker-compose restart

# Stop ระบบ
docker-compose down

# Start ระบบ
docker-compose up -d

# Update ระบบ
git pull
./scripts/deploy-production.sh
```

### การแก้ไขปัญหา

```bash
# ดู logs ของ service
docker-compose logs [service-name]

# Restart service เดียว
docker-compose restart [service-name]

# ตรวจสอบ SSL
certbot certificates

# ตรวจสอบ Nginx
systemctl status nginx
```

## ❓ ปัญหาที่พบบ่อย

### 1. Container ไม่ start

```bash
# ดู logs
docker-compose logs [service-name]

# ตรวจสอบ disk space
df -h

# ตรวจสอบ memory
free -h
```

### 2. ไม่สามารถเข้าถึงเว็บไซต์ได้

```bash
# ตรวจสอบ Nginx
systemctl status nginx

# ตรวจสอบ firewall
ufw status

# ตรวจสอบ DNS
nslookup your-domain.com
```

### 3. SSL ไม่ทำงาน

```bash
# ตรวจสอบ certificate
certbot certificates

# Renew certificate
certbot renew
```

### 4. Database Error

```bash
# ตรวจสอบ database
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

## 📞 การติดต่อ Support

หากพบปัญหา:

1. **เก็บข้อมูล error**
2. **รันคำสั่งตรวจสอบ**
3. **ส่งข้อมูลให้ support:**
   - Error message
   - System logs
   - Configuration

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งานแล้ว!

**URLs ที่สำคัญ:**

- 🌐 Frontend: https://your-domain.com
- 🔗 API: https://api.your-domain.com
- 👨‍💼 Admin: https://admin.your-domain.com

**ข้อมูล Login:**

- 📧 Email: admin@your-domain.com
- 🔐 Password: admin123456

**คำแนะนำ:**

- เปลี่ยนรหัสผ่าน admin ทันที
- ตรวจสอบการทำงานของระบบ
- ตั้งค่า backup และ monitoring
- อ่านคู่มือเพิ่มเติมใน docs/
