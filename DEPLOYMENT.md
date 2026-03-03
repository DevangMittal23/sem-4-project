# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Domain name
- SSL certificate
- PostgreSQL database
- Python 3.8+
- Node.js 16+

---

## 📦 Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.9 python3.9-venv python3-pip -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE career_platform;
CREATE USER career_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE career_platform TO career_user;
\q
```

### 3. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/career-platform
cd /var/www/career-platform

# Clone repository
git clone <your-repo-url> .

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install gunicorn
```

### 4. Environment Configuration

Create `/var/www/career-platform/backend/.env`:

```env
DATABASE_URL=postgresql://career_user:your_secure_password@localhost/career_platform
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Initialize Database

```bash
cd /var/www/career-platform/backend
source ../venv/bin/activate
python seed_db.py
```

### 6. Create Systemd Service

Create `/etc/systemd/system/career-platform.service`:

```ini
[Unit]
Description=Career Platform FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/career-platform/backend
Environment="PATH=/var/www/career-platform/venv/bin"
ExecStart=/var/www/career-platform/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

### 7. Start Backend Service

```bash
sudo systemctl daemon-reload
sudo systemctl start career-platform
sudo systemctl enable career-platform
sudo systemctl status career-platform
```

---

## 🎨 Frontend Deployment

### 1. Build Frontend

```bash
cd /var/www/career-platform/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/career-platform`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/career-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/career-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🐳 Docker Deployment

### 1. Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: career_platform
      POSTGRES_USER: career_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://career_user:your_secure_password@db/career_platform
      SECRET_KEY: your-super-secret-key
    depends_on:
      - db
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Deploy with Docker

```bash
docker-compose up -d
```

---

## ☁️ AWS Deployment

### Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: RDS PostgreSQL
- **Load Balancer**: Application Load Balancer

### 1. Frontend to S3

```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 2. Backend to EC2

```bash
# SSH to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow backend deployment steps above
```

### 3. RDS Database

```bash
# Update .env with RDS endpoint
DATABASE_URL=postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/career_platform
```

---

## 🔧 Environment Variables

### Production Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=generate-a-strong-random-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (update with your domain)
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Environment
ENVIRONMENT=production
DEBUG=False
```

### Production Frontend

Update `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.your-domain.com',
        changeOrigin: true
      }
    }
  }
})
```

---

## 📊 Monitoring Setup

### 1. Application Logs

```bash
# View backend logs
sudo journalctl -u career-platform -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Database Monitoring

```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 3. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop -y

# Check system resources
htop
```

---

## 🔒 Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Configure firewall (UFW)
- [ ] Disable root SSH login
- [ ] Set up fail2ban
- [ ] Regular security updates
- [ ] Database backups
- [ ] Rate limiting
- [ ] CORS configuration

### Firewall Setup

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 💾 Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/career-platform"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U career_user career_platform > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | sudo crontab -
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/career-platform
            git pull
            source venv/bin/activate
            cd backend
            pip install -r requirements.txt
            sudo systemctl restart career-platform
      
      - name: Build and Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync dist/ s3://your-bucket-name
```

---

## 📈 Performance Optimization

### Backend
- Use Gunicorn with multiple workers
- Enable database connection pooling
- Implement Redis caching
- Use async operations where possible

### Frontend
- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement lazy loading
- Optimize images

### Database
- Create indexes on frequently queried columns
- Regular VACUUM and ANALYZE
- Connection pooling
- Query optimization

---

## 🆘 Troubleshooting

### Backend not starting
```bash
sudo systemctl status career-platform
sudo journalctl -u career-platform -n 50
```

### Database connection issues
```bash
sudo -u postgres psql
\l  # List databases
\du # List users
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review Nginx configuration
5. Check firewall rules

---

**Note**: Always test deployment in a staging environment before production!
