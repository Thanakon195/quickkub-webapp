# QuickKub Payment Gateway Troubleshooting Guide

## Overview

คู่มือการแก้ไขปัญหาที่พบบ่อยใน QuickKub Payment Gateway

## Common Issues

### 1. Docker Issues

#### Problem: Docker containers won't start

**Symptoms:**

- Containers exit immediately after starting
- Error messages in docker logs

**Solutions:**

```bash
# Check Docker status
docker info

# Check available disk space
df -h

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Clean up Docker
docker system prune -a
docker volume prune
```

#### Problem: Port conflicts

**Symptoms:**

- Error: "port is already in use"
- Services can't bind to ports

**Solutions:**

```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Kill process using port
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - '3001:3000'  # Change from 3000:3000
```

#### Problem: Permission denied

**Symptoms:**

- "permission denied" errors
- Can't access mounted volumes

**Solutions:**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Database Issues

#### Problem: Database connection failed

**Symptoms:**

- "Connection refused" errors
- Backend can't connect to PostgreSQL

**Solutions:**

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database configuration
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "\l"
```

#### Problem: Migration errors

**Symptoms:**

- Migration fails to run
- Database schema out of sync

**Solutions:**

```bash
# Reset database
./scripts/migrate.sh reset

# Run migrations manually
cd backend
npm run migration:run

# Check migration status
npm run migration:show
```

#### Problem: Database performance issues

**Symptoms:**

- Slow queries
- High CPU usage
- Connection timeouts

**Solutions:**

```bash
# Check database performance
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
"

# Analyze tables
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "ANALYZE;"

# Check connection pool
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
SELECT
    count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
"
```

### 3. Backend Issues

#### Problem: Backend won't start

**Symptoms:**

- Backend container exits
- Error messages in logs

**Solutions:**

```bash
# Check backend logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env

# Test database connection
docker-compose exec backend npm run health:check

# Rebuild backend
docker-compose build backend
docker-compose up backend
```

#### Problem: API endpoints not responding

**Symptoms:**

- 404 errors
- Timeout errors
- CORS errors

**Solutions:**

```bash
# Check if backend is running
curl http://localhost:3002/health

# Check API documentation
curl http://localhost:3002/docs

# Check CORS configuration
curl -H "Origin: http://localhost:3000" -v http://localhost:3002/health

# Restart backend
docker-compose restart backend
```

#### Problem: Memory issues

**Symptoms:**

- Out of memory errors
- Slow response times
- Container crashes

**Solutions:**

```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

# Check for memory leaks
docker-compose exec backend npm run start:debug
```

### 4. Frontend Issues

#### Problem: Frontend won't build

**Symptoms:**

- Build errors
- TypeScript errors
- Missing dependencies

**Solutions:**

```bash
# Install dependencies
cd frontend
npm install

# Clear cache
npm run build -- --no-cache

# Check TypeScript
npx tsc --noEmit

# Fix linting issues
npm run lint -- --fix
```

#### Problem: Frontend not loading

**Symptoms:**

- White screen
- JavaScript errors
- Network errors

**Solutions:**

```bash
# Check frontend logs
docker-compose logs frontend

# Check if frontend is running
curl http://localhost:3000

# Check browser console for errors
# Open browser dev tools (F12)

# Restart frontend
docker-compose restart frontend
```

#### Problem: API calls failing

**Symptoms:**

- Network errors
- CORS errors
- 401/403 errors

**Solutions:**

```bash
# Check API URL configuration
echo $NEXT_PUBLIC_API_URL

# Test API endpoint
curl http://localhost:3002/health

# Check authentication
curl -H "Authorization: Bearer <token>" http://localhost:3002/api/v1/users

# Check CORS headers
curl -H "Origin: http://localhost:3000" -v http://localhost:3002/health
```

### 5. Admin Panel Issues

#### Problem: Admin panel not loading

**Symptoms:**

- White screen
- JavaScript errors
- Authentication issues

**Solutions:**

```bash
# Check admin logs
docker-compose logs admin

# Check if admin is running
curl http://localhost:3001

# Rebuild admin
docker-compose build admin
docker-compose up admin

# Check environment variables
docker-compose exec admin env
```

#### Problem: Admin authentication issues

**Symptoms:**

- Can't login
- Session expired
- Permission denied

**Solutions:**

```bash
# Check JWT configuration
docker-compose exec backend env | grep JWT

# Check user database
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
SELECT id, email, role FROM users;
"

# Reset admin password
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
UPDATE users SET password = 'new-hashed-password' WHERE email = 'admin@quickkub.com';
"
```

### 6. Redis Issues

#### Problem: Redis connection failed

**Symptoms:**

- Queue jobs not processing
- Cache not working
- Redis connection errors

**Solutions:**

```bash
# Check Redis status
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping

# Restart Redis
docker-compose restart redis
```

#### Problem: Queue jobs stuck

**Symptoms:**

- Jobs not processing
- Queue backlog
- Failed jobs

**Solutions:**

```bash
# Check queue status
curl http://localhost:8082

# Check Redis queue
docker-compose exec redis redis-cli LLEN bull:payment:wait

# Clear failed jobs
docker-compose exec redis redis-cli DEL bull:payment:failed

# Restart queue workers
docker-compose restart backend
```

### 7. MinIO Issues

#### Problem: MinIO not accessible

**Symptoms:**

- File upload errors
- Storage connection failed
- 403/404 errors

**Solutions:**

```bash
# Check MinIO status
docker-compose ps minio

# Check MinIO logs
docker-compose logs minio

# Test MinIO connection
curl http://localhost:9000/minio/health/live

# Check MinIO console
curl http://localhost:9001

# Restart MinIO
docker-compose restart minio
```

#### Problem: File upload issues

**Symptoms:**

- Upload fails
- File not found
- Permission denied

**Solutions:**

```bash
# Check bucket permissions
docker-compose exec minio mc ls /data

# Create bucket if missing
docker-compose exec minio mc mb /data/quickkub-storage

# Set bucket policy
docker-compose exec minio mc policy set public /data/quickkub-storage
```

## Performance Issues

### 1. Slow Response Times

**Diagnosis:**

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3002/health

# Check database performance
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
"

# Check system resources
docker stats
```

**Solutions:**

```bash
# Optimize database queries
# Add indexes
# Enable query caching
# Increase connection pool size

# Optimize application
# Enable compression
# Use CDN for static assets
# Implement caching
```

### 2. High Memory Usage

**Diagnosis:**

```bash
# Check memory usage
free -h
docker stats

# Check for memory leaks
docker-compose exec backend npm run start:debug
```

**Solutions:**

```bash
# Increase memory limits
# Optimize code
# Implement garbage collection
# Use streaming for large files
```

### 3. High CPU Usage

**Diagnosis:**

```bash
# Check CPU usage
top
docker stats

# Check process list
docker-compose exec backend ps aux
```

**Solutions:**

```bash
# Optimize algorithms
# Use caching
# Implement pagination
# Use background jobs
```

## Security Issues

### 1. Authentication Problems

**Symptoms:**

- Invalid tokens
- Session expired
- Permission denied

**Solutions:**

```bash
# Check JWT configuration
docker-compose exec backend env | grep JWT

# Verify token
curl -H "Authorization: Bearer <token>" http://localhost:3002/api/v1/auth/verify

# Check user permissions
docker-compose exec postgres psql -U quickkub_user -d quickkub_db -c "
SELECT u.email, r.name as role
FROM users u
JOIN roles r ON u.role_id = r.id;
"
```

### 2. CORS Issues

**Symptoms:**

- CORS errors in browser
- API calls blocked

**Solutions:**

```bash
# Check CORS configuration
docker-compose exec backend env | grep CORS

# Test CORS headers
curl -H "Origin: http://localhost:3000" -v http://localhost:3002/health

# Update CORS configuration
# In backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

### 3. Rate Limiting Issues

**Symptoms:**

- Too many requests errors
- API throttling

**Solutions:**

```bash
# Check rate limiting configuration
docker-compose exec backend env | grep RATE_LIMIT

# Test rate limiting
for i in {1..10}; do
  curl http://localhost:3002/health
done

# Adjust rate limiting
# In backend/src/app.module.ts
ThrottlerModule.forRoot({
  ttl: 60000,
  limit: 100,
})
```

## Network Issues

### 1. DNS Resolution

**Symptoms:**

- Can't resolve hostnames
- Connection timeouts

**Solutions:**

```bash
# Check DNS resolution
nslookup localhost
ping localhost

# Check /etc/hosts
cat /etc/hosts

# Restart network service
sudo systemctl restart systemd-resolved
```

### 2. Firewall Issues

**Symptoms:**

- Connection refused
- Port not accessible

**Solutions:**

```bash
# Check firewall status
sudo ufw status

# Allow ports
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp

# Check iptables
sudo iptables -L
```

### 3. Proxy Issues

**Symptoms:**

- Connection timeouts
- SSL errors

**Solutions:**

```bash
# Check proxy configuration
echo $http_proxy
echo $https_proxy

# Test without proxy
curl --noproxy "*" http://localhost:3002/health

# Configure Docker proxy
# In /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://proxy:port"
Environment="HTTPS_PROXY=http://proxy:port"
```

## Log Analysis

### 1. Viewing Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs -t
```

### 2. Log Analysis

```bash
# Search for errors
docker-compose logs | grep -i error

# Search for specific patterns
docker-compose logs | grep -i "payment.*failed"

# Count log entries
docker-compose logs | wc -l

# Export logs to file
docker-compose logs > logs.txt
```

### 3. Log Rotation

```bash
# Configure log rotation
# In docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Recovery Procedures

### 1. Service Recovery

```bash
# Restart specific service
docker-compose restart backend

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

### 2. Data Recovery

```bash
# Backup before recovery
./scripts/backup.sh all

# Restore from backup
./scripts/backup.sh restore-db backups/database_20240115_120000.sql.gz

# Reset database
./scripts/migrate.sh reset
```

### 3. System Recovery

```bash
# Stop all services
docker-compose down

# Clean up
docker system prune -a
docker volume prune

# Restart from scratch
./scripts/deploy.sh production
```

## Monitoring and Alerting

### 1. Health Checks

```bash
# Run health checks
./scripts/monitor.sh health

# Check service status
./scripts/monitor.sh status

# Monitor resources
./scripts/monitor.sh resources
```

### 2. Performance Monitoring

```bash
# Check API performance
./scripts/monitor.sh api

# Check database performance
./scripts/monitor.sh database

# Generate performance report
./scripts/monitor.sh performance
```

### 3. Security Monitoring

```bash
# Run security scan
./scripts/security.sh scan

# Check for vulnerabilities
./scripts/security.sh all

# Generate security report
./scripts/security.sh report
```

## Getting Help

### 1. Self-Service

- Check this troubleshooting guide
- Review documentation
- Search existing issues
- Check logs for errors

### 2. Community Support

- GitHub Issues: https://github.com/your-org/quickkub-payment-gateway/issues
- Discord: https://discord.gg/quickkub
- Stack Overflow: Tag with `quickkub`

### 3. Professional Support

- Email: support@quickkub.com
- Phone: +66-2-XXX-XXXX
- Emergency: +66-8X-XXX-XXXX

### 4. Bug Reports

When reporting bugs, please include:

- Operating system and version
- Docker version
- Node.js version
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior
