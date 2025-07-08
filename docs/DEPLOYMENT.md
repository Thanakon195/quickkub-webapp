# 🚀 คู่มือการ Deploy QuickKub Payment Gateway บนเซิร์ฟเวอร์จริง

## 📋 สิ่งที่ต้องเตรียม

### 1. เซิร์ฟเวอร์

git remote add origin https://github.com/Thanakon195/PaymentGateway.git

- **OS**: Ubuntu 20.04+ หรือ CentOS 8+
- **RAM**: อย่างน้อย 4GB (แนะนำ 8GB+)
- **Storage**: อย่างน้อย 50GB
- **CPU**: 2 cores+ (แนะนำ 4 cores+)

### 2. Domain Name

- Domain สำหรับ production (เช่น `payment.yourdomain.com`)
- SSL Certificate (Let's Encrypt หรือ Commercial)

### 3. Software Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🔧 ขั้นตอนการติดตั้ง

### 1. เตรียมเซิร์ฟเวอร์

```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# เพิ่ม user เข้า docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone โปรเจค

```bash
# Clone โปรเจค
git clone https://github.com/Thanakon195/Payment-Gateway.git
cd payment-gateway

git clone https://Thanakon195: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@github.com/Thanakon195/PaymentGateway.git
cd PaymentGateway
https://Thanakon195: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@github.com/Thanakon195/Payment-Gateway.git

cd PaymentGateway

# สร้างไฟล์ environment สำหรับ production
cp env.example .env.production
```

### 3. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env.production`:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=quickkub_prod
DB_USERNAME=quickkub_user
DB_PASSWORD=your_secure_password_here

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# S3/MinIO Configuration
S3_ACCESS_KEY=your_minio_access_key
S3_SECRET_KEY=your_minio_secret_key
S3_BUCKET=quickkub-files

# CORS Configuration
CORS_ORIGIN=https://psa-asiadigital.com/,https://admin.psa-asiadigital.com/

# API URLs
NEXT_PUBLIC_API_URL=https://api.psa-asiadigital.com
NEXT_PUBLIC_ADMIN_URL=https://admin.psa-asiadigital.com
REACT_APP_API_URL=https://api.psa-asiadigital.com
REACT_APP_FRONTEND_URL=https://psa-asiadigital.com

# Admin Tools
PGADMIN_EMAIL=admin@psa-asiadigital.com
PGADMIN_PASSWORD=your_pgadmin_password
```

### 4. ตั้งค่า Nginx และ SSL

#### สร้างไฟล์ Nginx configuration:

```bash
# สร้างโฟลเดอร์สำหรับ SSL
sudo mkdir -p /etc/nginx/ssl

# สร้างไฟล์ Nginx config
sudo nano /etc/nginx/sites-available/quickkub
```

เนื้อหาไฟล์ Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com admin.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### ติดตั้ง SSL Certificate:

```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# ขอ SSL certificate
sudo certbot --nginx -d yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com

# เปิดใช้งาน Nginx config
sudo ln -s /etc/nginx/sites-available/quickkub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Deploy ระบบ

```bash
# ให้สิทธิ์ execute กับ deploy script
chmod +x scripts/deploy.sh

# Deploy ระบบ
./scripts/deploy.sh production
```

### 6. ตรวจสอบการทำงาน

```bash
# ตรวจสอบสถานะ containers
docker-compose -f devops/docker-compose.prod.yml ps

# ตรวจสอบ logs
docker-compose -f devops/docker-compose.prod.yml logs -f

# ทดสอบ API
curl https://api.yourdomain.com/health
```

## 🔒 การตั้งค่าความปลอดภัย

### 1. Firewall Configuration

```bash
# เปิดใช้งาน UFW
sudo ufw enable

# อนุญาต SSH
sudo ufw allow ssh

# อนุญาต HTTP และ HTTPS
sudo ufw allow 80
sudo ufw allow 443

# ปิด port อื่นๆ ที่ไม่จำเป็น
sudo ufw deny 3000
sudo ufw deny 3001
sudo ufw deny 3002
sudo ufw deny 8080
sudo ufw deny 8081
sudo ufw deny 8082
sudo ufw deny 9000
sudo ufw deny 9001
```

### 2. Database Security

```bash
# เปลี่ยน default password
# ใช้ strong password ใน .env.production

# จำกัดการเข้าถึง database จากภายนอก
# ใช้ internal Docker network เท่านั้น
```

### 3. SSL/TLS Configuration

```bash
# ตั้งค่า SSL ใน Nginx ให้ใช้ TLS 1.2+ เท่านั้น
# ใช้ strong ciphers
# เปิดใช้งาน HSTS
```

## 📊 การ Monitor และ Maintenance

### 1. Log Management

```bash
# ดู logs ของ services
docker-compose -f devops/docker-compose.prod.yml logs -f backend
docker-compose -f devops/docker-compose.prod.yml logs -f frontend

# ตั้งค่า log rotation
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 2. Backup Strategy

```bash
# สร้าง script สำหรับ backup
nano scripts/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/quickkub"

# Backup database
docker exec quickkub-postgres-prod pg_dump -U quickkub_user quickkub_prod > $BACKUP_DIR/db_$DATE.sql

# Backup volumes
docker run --rm -v quickkub_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 3. Health Monitoring

```bash
# สร้าง health check script
nano scripts/health-check.sh
```

```bash
#!/bin/bash

# Check if services are running
if ! curl -f https://api.yourdomain.com/health > /dev/null 2>&1; then
    echo "Backend is down!" | mail -s "QuickKub Alert" admin@yourdomain.com
fi

if ! curl -f https://yourdomain.com > /dev/null 2>&1; then
    echo "Frontend is down!" | mail -s "QuickKub Alert" admin@yourdomain.com
fi
```

## 🔄 การ Update ระบบ

### 1. Update Code

```bash
# Pull latest code
git pull origin main

# Rebuild และ restart services
./scripts/deploy.sh production
```

### 2. Database Migration

```bash
# Run migrations
docker exec quickkub-backend-prod npm run migration:run
```

### 3. Rollback Plan

```bash
# Rollback to previous version
git checkout <previous-commit>
./scripts/deploy.sh production
```

## 📞 การ Troubleshoot

### ปัญหาที่พบบ่อย:

1. **Container ไม่ start**

   ```bash
   docker-compose -f devops/docker-compose.prod.yml logs <service-name>
   ```

2. **Database connection error**

   ```bash
   docker exec quickkub-postgres-prod psql -U quickkub_user -d quickkub_prod
   ```

3. **SSL certificate expired**

   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

4. **Memory usage สูง**
   ```bash
   docker stats
   docker system prune -f
   ```

## 📈 การ Scale ระบบ

### 1. Horizontal Scaling

```bash
# Scale backend services
docker-compose -f devops/docker-compose.prod.yml up -d --scale backend=3
```

### 2. Load Balancer

ใช้ Nginx หรือ HAProxy สำหรับ load balancing

### 3. Database Scaling

- ใช้ PostgreSQL replication
- ใช้ Redis cluster
- ใช้ external managed database (AWS RDS, Google Cloud SQL)

## 🎯 Best Practices

1. **Security**
   - เปลี่ยน default passwords
   - ใช้ strong passwords
   - เปิดใช้งาน firewall
   - ใช้ SSL/TLS
   - ตั้งค่า CORS อย่างเหมาะสม

2. **Performance**
   - ใช้ CDN สำหรับ static files
   - ตั้งค่า caching
   - ใช้ database indexing
   - Monitor resource usage

3. **Monitoring**
   - ใช้ monitoring tools (Prometheus, Grafana)
   - ตั้งค่า alerting
   - เก็บ logs อย่างเหมาะสม
   - ทำ backup อย่างสม่ำเสมอ

4. **Documentation**
   - เก็บ documentation ไว้ใน repository
   - ใช้ README files
   - ตั้งค่า API documentation

## 📞 Support

หากมีปัญหาหรือต้องการความช่วยเหลือ:

- สร้าง issue ใน GitHub repository
- ติดต่อทีม development
- ดู documentation เพิ่มเติมใน `/docs` folder
