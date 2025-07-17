# VPS Deployment Guide for School Management System

## Overview

This guide will help you deploy your NestJS School Management System API to a VPS with proper CORS configuration.

## CORS Configuration Summary

### What's Been Configured:

✅ **Dynamic Origin Handling** - Supports multiple frontend URLs
✅ **Development Mode** - Allows all origins in development
✅ **Production Mode** - Restricts to specific allowed domains
✅ **Comprehensive Headers** - Supports all necessary HTTP headers
✅ **Credentials Support** - Enables cookie-based authentication
✅ **Multiple HTTP Methods** - GET, POST, PUT, PATCH, DELETE, OPTIONS

### Environment-Based CORS:

- **Development**: Allows all origins for easy testing
- **Production**: Only allows specified domains for security

## Pre-Deployment Checklist

### 1. Server Requirements

- **Node.js** 18+ installed
- **PostgreSQL** database server
- **PM2** or similar process manager
- **Nginx** (recommended for reverse proxy)
- **SSL Certificate** (Let's Encrypt recommended)

### 2. Environment Configuration

- Update `.env.production` with your actual values
- Generate secure JWT secrets
- Configure production database URL
- Set your actual domain names

## Step-by-Step Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE postgres;
CREATE USER school_admin WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE school_management_db TO school_admin;
\q
```

### Step 3: Application Deployment

```bash
# Clone your repository
git clone <your-repo-url>
cd eduX-backend

# Install dependencies
npm install

# Copy production environment file
cp .env.production .env

# Edit environment variables
nano .env
# Update DATABASE_URL, JWT_SECRET, CORS_ORIGIN, FRONTEND_URL
```

### Step 4: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Step 5: Build and Start Application

```bash
# Build the application
npm run build

# Start with PM2
pm2 start dist/main.js --name "school-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 6: Nginx Configuration

Create Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/school-api
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (backup - your app handles this)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/school-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-api-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Variables Configuration

### Required Production Variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://school_admin:password@localhost:5432/school_management_db"
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12
CORS_ORIGIN="https://your-frontend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Optional Variables:

```env
# Multiple frontend domains
ADMIN_URL="https://admin.yourdomain.com"
MOBILE_APP_URL="https://app.yourdomain.com"

# Logging
LOG_LEVEL="info"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## CORS Configuration Details

### Current CORS Setup Supports:

1. **Multiple Origins**: Can handle multiple frontend domains
2. **Dynamic Origin Validation**: Checks against allowed list
3. **Development Flexibility**: Allows all origins in development
4. **Production Security**: Restricts to specific domains
5. **Credentials Support**: Enables authentication cookies
6. **Preflight Requests**: Handles OPTIONS requests properly

### Adding New Frontend Domains:

To add new allowed origins, update the CORS configuration in `src/main.ts`:

```typescript
// Add your production domains here
allowedOrigins.push('https://yournewdomain.com');
allowedOrigins.push('https://admin.yournewdomain.com');
```

Or use environment variables:

```env
CORS_ORIGIN="https://domain1.com,https://domain2.com"
```

## Testing CORS Configuration

### Test from Browser Console:

```javascript
// Test API call from your frontend domain
fetch('https://your-api-domain.com/api/setup/classes', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer your-token',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('CORS Error:', error));
```

### Test with cURL:

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://your-api-domain.com/api/setup/classes

# Test actual request
curl -X GET \
  -H "Origin: https://your-frontend-domain.com" \
  -H "Content-Type: application/json" \
  https://your-api-domain.com/api/setup/classes
```

## Monitoring and Maintenance

### PM2 Commands:

```bash
# Check status
pm2 status

# View logs
pm2 logs school-api

# Restart application
pm2 restart school-api

# Monitor resources
pm2 monit
```

### Database Backup:

```bash
# Create backup
pg_dump -U school_admin -h localhost school_management_db > backup.sql

# Restore backup
psql -U school_admin -h localhost school_management_db < backup.sql
```

### Application Updates:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart school-api
```

## Security Considerations

### 1. Environment Variables:

- Never commit `.env.production` to version control
- Use strong, unique JWT secrets
- Regularly rotate secrets

### 2. Database Security:

- Use strong database passwords
- Limit database user permissions
- Enable PostgreSQL SSL if needed

### 3. Network Security:

- Use firewall (ufw) to limit open ports
- Only allow necessary ports (80, 443, 22)
- Consider VPN for database access

### 4. CORS Security:

- Never use `*` for origins in production
- Regularly review allowed origins
- Monitor for unauthorized access attempts

## Troubleshooting

### Common CORS Issues:

1. **"Access to fetch blocked by CORS"**
   - Check if your frontend domain is in allowed origins
   - Verify environment variables are loaded correctly

2. **"Preflight request failed"**
   - Ensure OPTIONS method is allowed
   - Check if all required headers are in allowedHeaders

3. **"Credentials not allowed"**
   - Verify `credentials: true` in both frontend and backend
   - Ensure origin is specifically listed (not wildcard)

### Debug CORS:

Add temporary logging in `src/main.ts`:

```typescript
origin: function (origin, callback) {
  console.log('CORS Origin:', origin);
  console.log('Allowed Origins:', allowedOrigins);
  // ... rest of logic
}
```

## Support and Maintenance

### Regular Tasks:

- Monitor application logs
- Check SSL certificate expiration
- Update dependencies regularly
- Backup database weekly
- Monitor server resources

### Performance Optimization:

- Enable Nginx gzip compression
- Set up Redis for caching (optional)
- Monitor database query performance
- Use CDN for static assets (if any)

Your NestJS application is now configured with comprehensive CORS support and ready for VPS deployment! 🚀
