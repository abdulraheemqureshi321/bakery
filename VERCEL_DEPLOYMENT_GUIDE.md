# Deploying SoulTalk Pastry to Vercel

This guide walks you through deploying the SoulTalk Pastry platform to [Vercel](https://vercel.com).

---

## 🚀 Recommended Architecture

For production e-commerce platforms with background processing, order state machines, and continuous Excel parsing:
- **Frontend (Storefront & Admin UI)**: Hosted on **Vercel** (Global Edge CDN, instantaneous loads, automated SSL).
- **Backend (REST API)**: Hosted on **Render**, **Railway**, **Fly.io**, or **Ubuntu VPS** (Persistent Node.js environment connected to MongoDB Atlas).

---

## Part 1: Deploying the Frontend to Vercel (5-Minute Quick Setup)

Because your code is already pushed to GitHub at `https://github.com/abdulraheemqureshi321/bakery.git`, connecting it to Vercel takes only a few clicks:

### Step 1: Import Project in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Choose **Continue with GitHub** and select your repository: **`abdulraheemqureshi321/bakery`**.

### Step 2: Configure Project Settings
In the configuration screen:
1. **Project Name**: `soultalk-pastry` (or your preferred name).
2. **Framework Preset**: Select **Vite** (Vercel will usually auto-detect this).
3. **Root Directory**: Click **Edit** and choose **`client`**. *(Crucial step!)*
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   *(All defaults match `client/vercel.json` already committed to the repo).*

### Step 3: Add Environment Variables
Under **Environment Variables**, add:
- `VITE_API_URL`: The URL of your live backend API with `/api/v1` appended.
  - *Example (if using Render)*: `https://soultalk-api.onrender.com/api/v1`
  - *Example (if using custom domain)*: `https://api.soultalkpastry.com/api/v1`

### Step 4: Click Deploy!
- Vercel will build the frontend chunks in ~30 seconds and provide you with a live URL (e.g. `https://soultalk-pastry.vercel.app`).
- Single Page App routing (e.g. `/account`, `/products`, `/admin`, `/r/:code`) works automatically due to `client/vercel.json`.

---

## Part 2: Hosting the Backend API

If you don't already have the backend running on a cloud host, here is the fastest 3-minute free deployment on **Render**:

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `abdulraheemqureshi321/bakery`.
3. Set the settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add your **Environment Variables** in Render:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://admin_db_user:hPS8pBY3HjqcX3ef@cluster0.jkbffcv.mongodb.net/soultalk?appName=Cluster0`
   - `JWT_ACCESS_SECRET`: `novex_super_secret_jwt_key_2024_change_in_production`
   - `JWT_REFRESH_SECRET`: `novex_super_refresh_jwt_key_2024_change_in_production`
   - `CLOUDINARY_CLOUD_NAME`: `urckuzfd`
   - `CLOUDINARY_API_KEY`: `736848766536229`
   - `CLOUDINARY_API_SECRET`: `rDbWDP6X4bMxzPy8FudmAEjthWA`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://soultalk-pastry.vercel.app`)
5. Click **Deploy Web Service**.
6. Copy the Render URL (e.g. `https://soultalk-pastry-api.onrender.com`) and paste `https://soultalk-pastry-api.onrender.com/api/v1` into your Vercel `VITE_API_URL` setting!
