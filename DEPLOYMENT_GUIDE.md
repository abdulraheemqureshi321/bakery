# SoulTalk Pastry - Production Deployment Guide

This guide outlines the complete process for deploying the SoulTalk Pastry platform to a production environment.

---

## 1. Architecture Overview

- **Backend**: Node.js 20+ / Express REST API with TypeScript, Mongoose ODM, Helmet security headers, rate limiting, and NoSQL injection sanitization.
- **Frontend**: Vite + React 19 Single Page Application, fully code-split with lazy loading, optimized for mobile devices and modern desktop browsers.
- **Database**: MongoDB Atlas (Replica Set recommended for atomic transactions).
- **Media & Images**: Cloudinary Media CDN with automated format and compression optimization (`f_auto, q_auto`).

---

## 2. Infrastructure Prerequisites

1. **Domain Names & DNS**:
   - Storefront frontend: `soultalkpastry.com` (or `www.soultalkpastry.com`)
   - API Server: `api.soultalkpastry.com`
2. **MongoDB Atlas**:
   - M0 (free sandbox for staging) or M10+ (production dedicated tier with automatic backups).
   - Network Access: Add production server elastic IP address to IP access list.
3. **Cloudinary Account**:
   - Cloud Name, API Key, API Secret.
4. **Server Environment**:
   - Linux (Ubuntu 22.04 LTS recommended) with Node.js 20 LTS, npm, and PM2 installed.

---

## 3. Server Deployment (Backend)

### Step 3.1: Clone and Install
```bash
git clone <repository_url> /var/www/soultalk_pastry
cd /var/www/soultalk_pastry/server
npm ci --omit=dev
```

### Step 3.2: Configure Production Environment Variables
Create `.env` inside `/var/www/soultalk_pastry/server/`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/soultalk?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<generate_with_crypto_randomBytes_64>
JWT_REFRESH_SECRET=<generate_with_crypto_randomBytes_64>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
CLIENT_URL=https://soultalkpastry.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> **Generating Secure Keys**:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Step 3.3: Build Server
```bash
npm run build
```

### Step 3.4: Bootstrap the Initial Administrator (NO Sample Data)
Run the dedicated admin creation script to provision your production administrator:
```bash
npm run admin:create -- +60123456789 YourSuperSecurePassword123! "SoulTalk Admin"
```
*Note: This command directly creates the administrator credentials without inserting any mock/sample products, categories, or dummy orders.*

### Step 3.5: Run via PM2 Process Manager
```bash
npm install -g pm2
pm2 start dist/index.js --name "soultalk-api" -i max
pm2 save
pm2 startup
```

---

## 4. Client Deployment (Frontend)

The frontend is a static SPA that can be hosted on Nginx, Cloudflare Pages, Vercel, or AWS S3 + CloudFront.

### Step 4.1: Build Static Assets
In `/var/www/soultalk_pastry/client`:
```bash
# Create client production environment
echo "VITE_API_URL=https://api.soultalkpastry.com/api/v1" > .env.production

# Install dependencies and build
npm ci
npm run build
```
The compiled, code-split assets will be generated in `dist/`.

### Step 4.2: Nginx Configuration Example
```nginx
# API Backend Proxy
server {
    server_name api.soultalkpastry.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 12M; # Support up to 10MB spreadsheet imports
    }

    listen 443 ssl http2;
    # SSL certificates managed via Certbot / Let's Encrypt
}

# Frontend Single Page Application
server {
    server_name soultalkpastry.com www.soultalkpastry.com;
    root /var/www/soultalk_pastry/client/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(?:css|js|woff2?|svg|png|jpg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl http2;
}
```

---

## 5. Security & Maintenance Checklist

1. **SSL/TLS Certificates**: Enable automatic renewal via `certbot --nginx`.
2. **MongoDB Backups**: Ensure MongoDB Atlas continuous Cloud Backups are enabled with 7-day point-in-time recovery.
3. **Log Rotation**: Configure PM2 logrotate (`pm2 install pm2-logrotate`).
4. **Environment Safety**: Never commit `.env` or `.env.production` to version control.
