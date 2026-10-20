# SoulTalk Pastry — Phase 1 Handover & Project Roadmap

> **Document Purpose**: This document provides a complete status report of **Phase 1** implementation, architectural decisions, completed files, test results, and a comprehensive breakdown of the remaining work for **Phases 2 through 7**. Any AI model or engineer can pick up this repository and continue without missing context.

---

## 📌 Executive Summary of Phase 1

### What Was Built
1. **Repository Layout**:
   - `/server` (Node.js + Express + TypeScript + Mongoose + Vitest)
   - `/client` (Vite + React 18/19 + TypeScript + Tailwind CSS v4 + TanStack Query + React Router)
   - Root `README.md`, `.env.example` in both client and server, ESLint and Prettier setups.
2. **Server Architecture**:
   - `server/src/app.ts` with Helmet, CORS (credentials: true), global and auth-specific rate limiting, cookie parser, and central `errorHandler`.
   - Zod validation middleware `validate(schema)` covering all incoming payloads.
3. **Mongoose Entity Schemas (All Models Settled)**:
   - `Member`: Phone primary identifier (normalized, unique), name, email, birthday, passwordHash (nullable for imported members), role (`member` | `admin`), status (`active` | `inactive` | `suspended`), referralCode (auto-generated 8-char hex), pointsBalance, referredBy (ref Member), OTP fields (`otpCode`, `otpExpiresAt`, `otpAttempts`, `otpLastRequestAt`).
   - `Category`: Name, slug, description, sortOrder, isActive.
   - `Product`: Name, slug, price, category (ref Category), images `[{ url, publicId }]`, description, variants `[{ name, options, priceModifiers }]`, supportsCustomization, featured, isActive.
   - `Order`: Member (ref Member), orderNumber, snapshot items `[{ product, productName, productPrice, quantity, selectedVariants, variantPriceModifier, customizationNotes, lineTotal }]`, subtotal, discountAmount, deliveryFee, totalAmount, pointsEarned, pointsRedeemed, voucherUsed (ref MemberVoucher), fulfillmentType (`pickup` | `delivery`), pickupTime, deliveryAddress, deliveryNotes, paymentMethod, paymentStatus, status (`pending` | `confirmed` | `completed` | `cancelled`).
   - `Voucher` & `MemberVoucher`: Code, discount type (`percentage` | `fixed`), value, thresholds, date validity, per-member limit, instance usage tracking.
   - `PointsTransaction`: Ledger tracking `earn`, `redeem`, `adjust`, `refund`, `balanceAfter`, `relatedOrder`, `createdBy`.
   - `ReferralRecord`: Referrer, referee, reward status, reward details, timestamp.
   - `Setting`: Dynamic key/value configuration with type hints (`string`, `number`, `boolean`, `array`, `json`), group categories, and `isPublic` flag.
4. **Phone Normalization Utility (`server/src/utils/phone.ts`)**:
   - Strips spaces, dashes, dots, parentheses.
   - Converts leading `00` to `+`.
   - Prepends country code (default `+60` from Settings) for local numbers.
   - Rigorously tested with 10 unit tests in `phone.test.ts`.
5. **Authentication & Membership Services**:
   - **Registration**: Auto-generates unique 8-character referral code, hashes password with bcrypt (12 rounds), validates referral code if supplied, issues access & refresh tokens in secure `httpOnly` cookies.
   - **Login**: Supports both normalized phone or email with password verification.
   - **OTP Claim & Login**: `SmsProvider` interface with `ConsoleSmsProvider` logging OTP codes to server terminal. Enforces 5-minute expiry, 60-second request cooldown, and 5-attempt brute-force lockout.
   - **Set Password**: Allows OTP-verified imported members to claim their account and set their initial permanent password.
   - **JWT Cookie Flow**: Access token (15m) + Refresh token (7d) in `httpOnly` cookies with `/api/v1/auth/refresh` silent rotation and `/api/v1/auth/logout`.
   - **Role Guard**: `requireAdmin` middleware protecting admin endpoints.
6. **Dynamic Settings Service & Seed Script**:
   - Database seeder (`server/src/seed.ts`) seeds:
     - Admin: `admin@soultalkpastry.com` / `admin123` (Phone: `+60100000000`)
     - 3 Sample Members: Alice Tan, Bob Lee, Carol Wong (Password: `member123`)
     - 17 Default Settings: Store info, WhatsApp number (`60123456789`), brand colors (`#D4708F`), pickup time slots, delivery fees, payment methods, points earn/redeem ratios, and referral reward values.
   - Public endpoint `GET /api/v1/public/settings` returns safe subset for storefront without authentication.
   - Admin endpoints `GET /api/v1/admin/settings`, `PUT /api/v1/admin/settings/:key`, `PUT /api/v1/admin/settings` (bulk).
7. **Cloudinary Upload Service**:
   - `server/src/services/cloudinaryService.ts` handles memory buffer uploads via stream, validates JPG/PNG/WebP format and 5MB max size.
   - Endpoints: `POST /api/v1/admin/uploads` and `DELETE /api/v1/admin/uploads/:publicId(*)`.
   - Validated with unit & integration tests (`upload.test.ts`).
8. **Client Frontend (Mobile-First Shell)**:
   - Modern glassmorphism UI styled with Tailwind CSS v4 and Google Font Outfit.
   - Dynamic brand color loading from Settings CSS variables (`--brand-primary`).
   - `SettingsContext` with helper `buildWhatsAppUrl(text)` using `wa.me` URL-encoding.
   - `AuthContext` with silent refresh interceptor in `api/client.ts`.
   - Pages:
     - `HomePage`: Mobile-first hero, membership perks, WhatsApp direct enquiry.
     - `LoginPage`: Phone/Email login with link to OTP alternative.
     - `RegisterPage`: Responsive registration form with referral code support.
     - `OtpLoginPage`: 2-step OTP request & 6-digit verification with dev tips.
     - `SetPasswordPage`: Account claim password setup.
     - `ProfilePage`: Points balance, member details, unique referral link with one-click copy.
     - `AdminSettingsPage`: Tabbed settings editor by group, Cloudinary logo uploader, color picker, and real-time saves.
     - `Navbar`, `Footer`, `AdminLayout` (with sidebar navigation and placeholder routes).

---

## 🧪 Phase 1 Test Results

All 33 backend tests pass cleanly with zero failures and zero ESLint errors:

| Test Suite | Tests | Result | Description |
|---|---|---|---|
| `phone.test.ts` | 10 | ✅ Passed | Normalization, country code prefixing, stripping characters, validation |
| `upload.test.ts` | 4 | ✅ Passed | Admin RBAC guard, mime-type validation (400), Cloudinary upload & delete |
| `otp.test.ts` | 8 | ✅ Passed | OTP request, verification, 60s cooldown (429), expiry (400), attempt limits (429), set-password |
| `auth.test.ts` | 11 | ✅ Passed | Register, duplicate phone (409), Zod validation (400), referralCode linking, phone login, email login, wrong password (401), `/me`, logout, token refresh |
| **Total** | **33** | **100% Passed** | **0 errors, 0 lints** |

---

## 📋 Roadmap for Remaining Phases (Phases 2 to 7)

### Phase 2: Products & Categories (COMPLETED ✅)
- **Goal**: Product catalog display, category browse, option variants with price modifiers, WhatsApp entry points, and admin management with Cloudinary.
- **Backend Completed**:
  - Full CRUD endpoints for `/api/v1/admin/categories` and `/api/v1/admin/products` with Cloudinary image cleanup.
  - Public endpoints: `GET /api/v1/public/categories`, `GET /api/v1/public/products` (filtering by category slug/id, sorting by price_asc, price_desc, newest, search, pagination), and `GET /api/v1/public/products/:slug`.
  - Seed script: Populated 5 categories and 10 realistic pastry products to MongoDB Atlas.
  - Helpers: `buildWhatsAppLink`, `buildGeneralContactLink`, `buildProductEnquiryLink`, `buildPartyBagsEnquiryLink`, `buildOrderEnquiryLink`, `buildReferralWhatsAppMessage`.
  - 61/61 backend tests passing (`browse_flow.test.ts`, `catalog.test.ts`, `whatsapp.test.ts`, `upload.test.ts`, `phone.test.ts`, `otp.test.ts`, `auth.test.ts`).
- **Frontend Completed**:
  - Storefront Home (`/`): Hero, featured cakes carousel, category quick-links, Party Bags banner.
  - Catalog (`/products`): Category filter chips, search input, price/newest sorting, customization badges.
  - Product Detail (`/products/:slug`): Multi-image gallery, variant selectors with dynamic price updates, customization WhatsApp button, Phase 3 Add-to-Cart placeholder.
  - Contact (`/contact`): Store address, opening hours, phone, one-tap WhatsApp concierge button.
  - Site-wide floating WhatsApp button with pulse animation.
  - Admin Products (`/admin/products`): List table, thumbnails, category badges, active toggle, delete modal.
  - Admin Product Form (`/admin/products/new`, `/admin/products/:id/edit`): Cloudinary multi-image upload & preview, dynamic variant builder.
  - Admin Categories (`/admin/categories`): Modal category management and sort ordering.

### Phase 3: Ordering & Cart (COMPLETED ✅)
- **Goal**: Full cart state, server-side price recalculation, PaymentProvider interface, and WhatsApp order confirmation.
- **Backend Completed**:
  - `PaymentProvider` interface with `PayInStoreProvider` and `CashOnDeliveryProvider` implementations. Active methods sourced from Settings (`enabled_payment_methods`).
  - Order creation endpoint: `POST /api/v1/orders` (Auth-required).
  - Server recalculates every item price, variant modifier, subtotal, delivery fee (from Settings: flat fee RM 12 / free above RM 120), and total. Client prices are strictly ignored.
  - Order status lifecycle: `pending` -> `confirmed` -> `completed` -> `cancelled`.
  - Admin order endpoints: `GET /api/v1/admin/orders`, `PUT /api/v1/admin/orders/:id/status`.
  - Member order endpoints: `GET /api/v1/orders/my-orders`, `GET /api/v1/orders/:id`.
  - Preview endpoint: `POST /api/v1/orders/preview` for live cart and checkout pricing calculation.
  - WhatsApp order message helper: Pre-filled message with order reference and customer name.
  - 73/73 backend tests passing.
- **Frontend Completed**:
  - Cart drawer (`CartDrawer.tsx`) with quantity adjustments and persistent localStorage sync.
  - Active "Add to Bag" button with variant price modifier recalculation on product detail page.
  - Checkout flow (`/checkout`): Login guard with return path; Fulfillment selection (Pickup with time slots from Settings, or Delivery with address validation and dynamic fee preview); Payment method radio selector; clearly marked Phase 5 spot for vouchers and points.
  - Order confirmation screen (`/orders/confirmation/:id`) with readable order number (`ST-YYYYMMDD-XXXX`) and WhatsApp chat button.
  - Member Order History page (`/orders`) with status pills and receipt details modal.
  - Admin Orders Dashboard (`/admin/orders`) with status filter tabs and detail modal.

### Phase 4: Points System
- **Goal**: Points accumulation and redemption with ledger audit and transactional integrity.
- **Backend**:
  - MongoDB replica set session transactions (`session.withTransaction`) for any points modification.
  - Earn rules from Settings: `points_earn_ratio` (e.g. 1 RM = 1 point). Points credited when order status transitions to `completed`.
  - Redeem rules from Settings: `points_redeem_ratio` (e.g. 1 point = RM 0.01), `points_min_redeem`, `points_max_redeem_per_order`.
  - Server recalculation: Checkout validates member points balance, calculates maximum deductible amount, and deducts points transactionally.
  - Refund logic: When an order is `cancelled`, points redeemed are refunded and points earned are reverted.
  - `PointsTransaction` ledger entries for every balance delta with `balanceAfter`.
  - Admin endpoints to view member points ledger and execute manual adjustments with reason.
- **Frontend**:
  - Checkout points redemption toggle and slider / input.
  - Member points ledger tab on `ProfilePage` showing earn/redeem history.
  - Admin member points adjustment modal.

### Phase 5: Vouchers
- **Goal**: Promo voucher engine with usage limits, member wallet, and checkout application.
- **Backend**:
  - Voucher rules: `percentage` or `fixed`, `minOrderAmount`, `maxDiscount`, date validity window, per-member usage limit, global usage limit.
  - `MemberVoucher` instance created upon claiming or admin bulk issuance.
  - Checkout voucher application: Server validation in transaction, checks expiry, minimum order amount, and marks voucher as used upon order placement.
  - Stacking rules: Settings govern whether vouchers can stack with points redemption.
  - Admin Voucher CRUD (`/api/v1/admin/vouchers`) and issuance tool.
- **Frontend**:
  - Member voucher wallet view.
  - Checkout voucher promo code input & selection modal.
  - Admin Voucher management page.

### Phase 6: Referrals & Member Excel Import
- **Goal**: Referral reward automation and bulk Excel onboarding.
- **Backend**:
  - Referral reward trigger: When referee completes their first order (or on registration, based on Setting `referral_trigger`), grant configured points or voucher to both referrer and referee within a database transaction.
  - `ReferralRecord` status updated to `granted`.
  - **Excel Import (`xlsx` SheetJS)**:
    - Admin endpoint `POST /api/v1/admin/members/import` accepting `.xlsx` file.
    - Expected columns: `Name`, `Phone`, `Birthday`, `Email`.
    - Normalizes phone numbers with `normalizePhone`.
    - Bulk upserts members (`passwordHash: null` for imported members so they claim via OTP).
    - Returns structured error and success summary (imported count, updated count, skipped invalid rows).
  - Admin fallback manual member entry endpoint.
- **Frontend**:
  - Admin Member Import page with drag-and-drop Excel upload, column mapping preview, and error log.
  - Admin Referral Record list view.

### Phase 7: Polish, E2E Tests & Production Readiness
- **Goal**: Rigorous mobile audit, Playwright E2E testing, and production deployment preparation.
- **Tasks**:
  - Audit UI responsiveness at 375px (iPhone SE/mini) and desktop widths (1280px+).
  - Playwright test flows:
    1. Visitor registration -> Profile -> Referral link copy.
    2. Imported member OTP claim -> Set password -> Login.
    3. Product browse -> Add to Cart -> Checkout -> WhatsApp link generation.
    4. Admin login -> Edit settings -> Upload image -> Verify persistence.
  - Cloudinary responsive image transforms (`w_auto`, `dpr_auto`, `q_auto`).
  - Production security checklist: CORS origin restriction, secure cookie flags, rate limit calibration.
