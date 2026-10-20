# SoulTalk Pastry — Artisanal Bakery & Membership Platform

A full-stack online ordering web platform for a cake/bakery brand featuring membership tiers, reward points ledger, vouchers, and referral mechanisms with mobile-first UI and WhatsApp ordering concierges.

---

## 🛠 Technology Stack

- **Frontend**: React 18/19 (Vite) + TypeScript + React Router + Tailwind CSS v4 + TanStack Query
- **Backend**: Node.js + Express + TypeScript, REST API under `/api/v1`
- **Database**: MongoDB with Mongoose (with schema prepared for replica-set transactional ledgers)
- **Media**: Cloudinary (backend upload with format/size validation and `publicId` deletion)
- **Auth**: JWT access + refresh tokens in `httpOnly` secure cookies, bcrypt, zod validation, helmet, cors, express-rate-limit
- **Excel Import**: SheetJS (`xlsx`) on the backend
- **Testing**: Vitest + Supertest for backend endpoints, isolated unit & integration tests

---

## 📁 Repository Layout

```
soultalk_pastry/
├── client/                     # Vite + React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/                # Axios API client with automatic token refresh
│   │   ├── components/         # ProtectedRoute, AdminRoute, Navbar, Footer, Layouts
│   │   ├── context/            # AuthContext, SettingsContext (live brand & WhatsApp links)
│   │   ├── pages/              # Home, Login, Register, OtpLogin, SetPassword, Profile
│   │   │   └── admin/          # AdminSettingsPage
│   │   └── types/              # Frontend TypeScript definitions
│   ├── .env.example
│   └── vite.config.ts
├── server/                     # Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Environment, MongoDB, Cloudinary
│   │   ├── controllers/        # Auth, Settings, Upload controllers
│   │   ├── middleware/         # Auth, Admin guard, Zod validation, ErrorHandler
│   │   ├── models/             # Mongoose schemas: Member, Category, Product, Order,
│   │   │                       # Voucher, PointsTransaction, ReferralRecord, Setting
│   │   ├── routes/             # Auth, Admin, Public endpoints
│   │   ├── services/           # AuthService, SettingsService, CloudinaryService, SmsProvider
│   │   ├── utils/              # Phone normalization, referral generator, AppError
│   │   ├── validators/         # Zod schemas
│   │   ├── __tests__/          # Vitest suites (phone, auth, otp, upload)
│   │   └── seed.ts             # Database seeder (Admin, sample members, all default settings)
│   ├── .env.example
│   └── package.json
└── PHASE_1_HANDOVER_AND_REMAINING_WORK.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (e.g. MongoDB Atlas or local MongoDB)
- Cloudinary account credentials (optional for Phase 1 dev; mock supported)

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and Cloudinary keys
npm install
npm run seed     # Seeds default admin, members, and settings
npm run dev      # Starts server on http://localhost:5000
```

Default credentials seeded:
- **Admin**: Phone `+60100000000` or Email `admin@soultalkpastry.com` / Password: `admin123`
- **Sample Member**: Phone `+60121111111` or Email `alice@example.com` / Password: `member123`

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev      # Starts client on http://localhost:5173
```

### 4. Running Backend Tests
```bash
cd server
npm test         # Runs all 33 unit and integration tests via Vitest
```

---

## 🔒 Security & Best Practices Implemented

- **JWT in httpOnly Cookies**: Access tokens (15m expiry) and Refresh tokens (7d expiry) are strictly stored in `httpOnly`, `sameSite: 'lax'` cookies to prevent XSS credential theft.
- **Role-Based Access Control**: `/api/v1/admin/*` routes strictly require `admin` role middleware.
- **Input Sanitization & Zod**: All incoming request bodies and queries are validated with strict Zod schemas before hitting controllers.
- **Phone Normalization**: Strips spaces, dashes, dots, and handles country-code variants with default prefix `+60` from settings.
- **OTP Protection**: Verification codes expire in 5 minutes, enforce a 60-second cooldown per phone, and lock out after 5 consecutive failed attempts.
- **Cloudinary Security**: File uploads restricted to JPG, PNG, WebP up to 5MB, uploaded through backend memory buffers.
