# 🚀 คู่มือการ Deploy QuickKub Payment Gateway บน Windows Server

## 📋 สิ่งที่ต้องเตรียม

### 1. Windows Server

- **OS**: Windows Server 2019+ หรือ Windows 10/11 Pro
- **RAM**: อย่างน้อย 8GB (แนะนำ 16GB+)
- **Storage**: อย่างน้อย 100GB
- **CPU**: 4 cores+ (แนะนำ 8 cores+)

### 2. Software Requirements

- Docker Desktop for Windows
- Git for Windows
- PowerShell 5.1+ หรือ PowerShell Core 7+

## 🔧 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Docker Desktop

1. ดาวน์โหลด Docker Desktop จาก https://www.docker.com/products/docker-desktop
2. ติดตั้งและเปิดใช้งาน Docker Desktop
3. เปิดใช้งาน WSL 2 (Windows Subsystem for Linux)
4. Restart เครื่อง

### 2. ติดตั้ง Git

1. ดาวน์โหลด Git จาก https://git-scm.com/download/win
2. ติดตั้งและตั้งค่า user name และ email

### 3. Clone โปรเจค

```powershell
# Clone โปรเจค
git clone https://github.com/your-username/payment-gateway.git
cd payment-gateway

# สร้างไฟล์ environment สำหรับ production
Copy-Item env.example .env.production
```

### 4. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env.production`:

```powershell
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
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# API URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_URL=https://yourdomain.com

# Admin Tools
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=your_pgadmin_password
```

### 5. สร้าง Production Setup Script

```powershell
# สร้างไฟล์ setup-production.ps1
New-Item -Path "scripts/setup-production.ps1" -ItemType File
```

เนื้อหาไฟล์ `scripts/setup-production.ps1`:

```powershell
# QuickKub Payment Gateway Production Setup Script for Windows
# Usage: .\scripts\setup-production.ps1

Write-Host "🚀 QuickKub Payment Gateway Production Setup" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose file exists
$composeFile = "devops/docker-compose.prod.yml"
if (-not (Test-Path $composeFile)) {
    Write-Host "❌ Docker Compose file not found: $composeFile" -ForegroundColor Red
    exit 1
}

# Create production environment file if not exists
if (-not (Test-Path ".env.production")) {
    Write-Host "📝 Creating production environment file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.production"

    # Generate secure passwords
    $dbPassword = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $redisPassword = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $jwtSecret = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $s3AccessKey = -join ((48..57) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    $s3SecretKey = -join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    # Update environment file
    $content = Get-Content ".env.production"
    $content = $content -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPassword"
    $content = $content -replace "REDIS_PASSWORD=.*", "REDIS_PASSWORD=$redisPassword"
    $content = $content -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    $content = $content -replace "S3_ACCESS_KEY=.*", "S3_ACCESS_KEY=$s3AccessKey"
    $content = $content -replace "S3_SECRET_KEY=.*", "S3_SECRET_KEY=$s3SecretKey"
    $content | Set-Content ".env.production"

    Write-Host "✅ Production environment file created with secure passwords" -ForegroundColor Green
    Write-Host "📋 Please edit .env.production to configure your domain and other settings" -ForegroundColor Yellow
}

# Create backup directory
$backupDir = "C:\backup\quickkub"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory -Force
    Write-Host "✅ Backup directory created: $backupDir" -ForegroundColor Green
}

# Create Windows Task for auto-start
Write-Host "🔧 Creating Windows Task for auto-start..." -ForegroundColor Yellow
$taskName = "QuickKubStartup"
$action = New-ScheduledTaskAction -Execute "docker-compose" -Argument "-f devops/docker-compose.prod.yml up -d" -WorkingDirectory (Get-Location)
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force

Write-Host ""
Write-Host "✅ Production setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.production with your domain and settings"
Write-Host "2. Configure your domain DNS to point to this server"
Write-Host "3. Run: .\scripts\deploy-production.ps1"
Write-Host "4. Set up SSL certificates with Let's Encrypt"
Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Yellow
Write-Host "   Start services: docker-compose -f devops/docker-compose.prod.yml up -d"
Write-Host "   Stop services: docker-compose -f devops/docker-compose.prod.yml down"
Write-Host "   View logs: docker-compose -f devops/docker-compose.prod.yml logs -f"
Write-Host "   View status: docker-compose -f devops/docker-compose.prod.yml ps"
```

### 6. สร้าง Production Deploy Script

```powershell
# สร้างไฟล์ deploy-production.ps1
New-Item -Path "scripts/deploy-production.ps1" -ItemType File
```

เนื้อหาไฟล์ `scripts/deploy-production.ps1`:

```powershell
# QuickKub Payment Gateway Production Deployment Script for Windows
# Usage: .\scripts\deploy-production.ps1

param(
    [string]$Environment = "production"
)

Write-Host "🚀 Deploying QuickKub Payment Gateway to $Environment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose file exists
$composeFile = "devops/docker-compose.$Environment.yml"
if (-not (Test-Path $composeFile)) {
    Write-Host "❌ Docker Compose file not found: $composeFile" -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path ".env.$Environment") {
    Write-Host "📋 Loading environment variables from .env.$Environment" -ForegroundColor Yellow
    Get-Content ".env.$Environment" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  No .env.$Environment file found. Using default values." -ForegroundColor Yellow
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f $composeFile down --remove-orphans

# Remove old images
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
docker system prune -f

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose -f $composeFile up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "📊 Checking service status..." -ForegroundColor Yellow
docker-compose -f $composeFile ps

# Health checks
Write-Host "🏥 Running health checks..." -ForegroundColor Yellow

# Backend health check
try {
    Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
    exit 1
}

# Frontend health check
try {
    Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Out-Null
    Write-Host "✅ Frontend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend health check failed" -ForegroundColor Red
    exit 1
}

# Admin health check
try {
    Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Out-Null
    Write-Host "✅ Admin Panel is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Admin Panel health check failed" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Admin Panel: http://localhost:3001"
Write-Host "   Backend API: http://localhost:3002"
Write-Host "   API Docs: http://localhost:3002/docs"
Write-Host "   Landing Page: http://localhost:3004"
Write-Host ""
Write-Host "🔧 Management URLs:" -ForegroundColor Yellow
Write-Host "   pgAdmin: http://localhost:8080"
Write-Host "   Redis Commander: http://localhost:8081"
Write-Host "   Bull Board: http://localhost:8082"
Write-Host "   MinIO Console: http://localhost:9001"
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker-compose -f $composeFile logs -f"
Write-Host "   Stop services: docker-compose -f $composeFile down"
Write-Host "   Restart services: docker-compose -f $composeFile restart"
```

### 7. Deploy ระบบ

```powershell
# รัน production setup
.\scripts\setup-production.ps1

# แก้ไข .env.production ตามที่ต้องการ

# Deploy ระบบ
.\scripts\deploy-production.ps1
```

## 🔒 การตั้งค่าความปลอดภัย

### 1. Windows Firewall

```powershell
# เปิดใช้งาน Windows Firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# อนุญาต HTTP และ HTTPS
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# ปิด port อื่นๆ ที่ไม่จำเป็น
New-NetFirewallRule -DisplayName "Block Docker Ports" -Direction Inbound -Protocol TCP -LocalPort 3000,3001,3002,8080,8081,8082,9000,9001 -Action Block
```

### 2. SSL Certificate (สำหรับ Production)

```powershell
# ติดตั้ง Certbot for Windows
# ดาวน์โหลดจาก https://certbot.eff.org/instructions?ws=other&os=windows

# ขอ SSL certificate
certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com
```

## 📊 การ Monitor และ Maintenance

### 1. Windows Task Scheduler

```powershell
# สร้าง task สำหรับ backup
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\path\to\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "QuickKubBackup" -Action $action -Trigger $trigger

# สร้าง task สำหรับ health check
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\path\to\health-check.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)
Register-ScheduledTask -TaskName "QuickKubHealthCheck" -Action $action -Trigger $trigger
```

### 2. Backup Script

```powershell
# สร้างไฟล์ backup.ps1
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\backup\quickkub"

# Backup database
docker exec quickkub-postgres-prod pg_dump -U quickkub_user quickkub_prod > "$backupDir\db_$date.sql"

# Cleanup old backups (keep last 7 days)
Get-ChildItem "$backupDir\*.sql" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item
```

## 🔄 การ Update ระบบ

```powershell
# Pull latest code
git pull origin main

# Rebuild และ restart services
.\scripts\deploy-production.ps1
```

## 📞 การ Troubleshoot

### ปัญหาที่พบบ่อย:

1. **Docker Desktop ไม่ start**
   - ตรวจสอบ WSL 2 เปิดใช้งานหรือไม่
   - ตรวจสอบ Hyper-V เปิดใช้งานหรือไม่

2. **Container ไม่ start**

   ```powershell
   docker-compose -f devops/docker-compose.prod.yml logs <service-name>
   ```

3. **Port ถูกใช้งาน**

   ```powershell
   netstat -ano | findstr :3000
   ```

4. **Memory usage สูง**
   ```powershell
   docker stats
   docker system prune -f
   ```

## 🎯 Best Practices

1. **Security**
   - ใช้ Windows Defender หรือ antivirus อื่นๆ
   - เปิดใช้งาน Windows Update
   - ใช้ strong passwords
   - ตั้งค่า User Account Control (UAC)

2. **Performance**
   - ใช้ SSD สำหรับ storage
   - ตั้งค่า Docker Desktop memory limit
   - ใช้ Windows Performance Monitor

3. **Backup**
   - ใช้ Windows Backup หรือ third-party tools
   - เก็บ backup ไว้ใน external storage
   - ทดสอบ restore อย่างสม่ำเสมอ

4. **Monitoring**
   - ใช้ Windows Event Viewer
   - ตั้งค่า Windows Performance Counters
   - ใช้ third-party monitoring tools
