# SoulTalk Pastry - Complete Fullstack Vercel Deployment Guide

Deploy **both the frontend (Vite React SPA) and backend (Express API)** seamlessly to Vercel in a single unified deployment.

---

## How It Works

1. **Frontend**: Built from `client/` into `client/dist`. Vercel automatically hosts it on its high-speed global Edge CDN.
2. **Backend**: Powered by Vercel Serverless Functions via [`api/index.ts`](./api/index.ts). Vercel routes all `/api/*` network requests to your Express application connected to MongoDB Atlas.
3. **Unified Domain**: Both run under the exact same domain (e.g. `https://your-bakery.vercel.app`), completely eliminating cross-origin CORS issues and cookie sharing complexities!

---

## 3-Step Vercel Deployment

### Step 1: Import Your Repository on Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository: **`abdulraheemqureshi321/bakery`** and click **Import**.

### Step 2: Keep Default Root Directory
- **Root Directory**: Leave it as **`./`** (Root of the project).
- **Framework Preset**: Vercel will auto-detect or leave as **Other**.
- **Build Settings**: Vercel will automatically read [`vercel.json`](./vercel.json) (Build command: `npm run vercel-build`, Output directory: `client/dist`).

### Step 3: Add Production Environment Variables
In the **Environment Variables** section on Vercel, copy and paste the following variables:

| Variable Name | Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `MONGODB_URI` | `mongodb+srv://admin_db_user:hPS8pBY3HjqcX3ef@cluster0.jkbffcv.mongodb.net/soultalk?appName=Cluster0` | MongoDB Atlas cluster connection |
| `JWT_ACCESS_SECRET` | `novex_super_secret_jwt_key_2024_change_in_production` | JWT signing secret for member sessions |
| `JWT_REFRESH_SECRET` | `novex_super_refresh_jwt_key_2024_change_in_production` | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Stay-logged-in session duration |
| `CLOUDINARY_CLOUD_NAME` | `urckuzfd` | Cloudinary CDN cloud name |
| `CLOUDINARY_API_KEY` | `736848766536229` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `rDbWDP6X4bMxzPy8FudmAEjthWA` | Cloudinary API Secret |
| `CLIENT_URL` | Leave blank or set to your Vercel URL once generated (e.g., `https://your-bakery.vercel.app`) | Used for shareable referral links |

*(Note: `VITE_API_URL` is NOT required because the frontend automatically defaults to `/api/v1` on the same domain!)*

---

### Step 4: Click "Deploy" 🎉
Vercel will:
1. Run `npm install`.
2. Build the optimized, code-split frontend assets into `client/dist`.
3. Bundle the backend serverless function at `/api`.
4. Provide you with your live URL (e.g., `https://bakery-xxx.vercel.app`).

---

## Verifying Your Live Deployment

Once deployed:
1. **Storefront**: Open the URL in your phone or browser -> Browse cakes, add to cart, and check out.
2. **Health Check**: Visit `https://your-bakery.vercel.app/api/v1/health` -> Returns `{"success": true, "message": "SoulTalk Pastry API is running"}`.
3. **Admin Portal**: Visit `https://your-bakery.vercel.app/admin` -> Log in with your admin credentials to manage products, orders, and members.
