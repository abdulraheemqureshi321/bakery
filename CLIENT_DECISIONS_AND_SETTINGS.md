# SoulTalk Pastry - Client Business Decisions & Settings Mapping

This document details all customizable business policies, operational parameters, and marketing rules, showing exactly where each is configured in the System Settings (`/admin/settings`).

---

## 1. Storefront & Contact Information

| Business Decision | Setting Key | Default Value | Description / Where Configured |
| :--- | :--- | :--- | :--- |
| **Store Name** | `store_name` | `SoulTalk Pastry` | Displayed across storefront header, footer, page titles, and WhatsApp enquiry messages. |
| **WhatsApp Contact Number** | `whatsapp_number` | `+60123456789` | Destination phone number for all order enquiry buttons and direct WhatsApp chat links. |
| **Store Physical Address** | `store_address` | `123 Bakery Lane, Bangsar, 59100 Kuala Lumpur` | Shown on homepage, contact page, and during checkout when customer selects "Self-Collection". |
| **Pickup Time Slots** | `pickup_time_slots` | `["10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00"]` | Available time intervals presented to customers choosing in-store collection at checkout. |
| **Default Country Code** | `default_country_code` | `+60` | Auto-prepended to customer phone numbers when registering or logging in without country code. |

---

## 2. Order & Delivery Rules

| Business Decision | Setting Key | Default Value | Description / Where Configured |
| :--- | :--- | :--- | :--- |
| **Delivery Fee Structure** | `delivery_fee_rules` | `{"flat": 12, "freeAbove": 120}` | Flat delivery fee in MYR, and minimum order threshold for automated free delivery. |
| **Enabled Payment Methods** | `enabled_payment_methods` | `["pay_in_store", "cash_on_delivery", "bank_transfer"]` | Payment methods made selectable at checkout. Can be updated dynamically without code changes. |
| **Currency Symbol** | `currency_symbol` | `RM` | Prefix used across storefront prices, checkout summaries, and invoices. |
| **Currency Code** | `currency` | `MYR` | ISO 4217 currency identifier. |

---

## 3. Loyalty Points Program

| Business Decision | Setting Key | Default Value | Description / Where Configured |
| :--- | :--- | :--- | :--- |
| **Points Earn Ratio** | `points_earn_ratio` | `1` | Number of loyalty points earned per RM 1.00 spent on subtotal. |
| **Points Redemption Value** | `points_redeem_ratio` | `0.01` | Value of 1 loyalty point (e.g., 0.01 means 100 points = RM 1.00 discount). |
| **Minimum Points to Redeem** | `points_min_redeem` | `100` | Minimum points balance a customer must hold before points redemption slider/input unlocks at checkout. |
| **Maximum Order Share** | `points_max_order_share_percent` | `50` | Maximum percentage of an order's subtotal that can be discounted using loyalty points (e.g., max 50%). |
| **Points Credit Event** | `points_credit_event` | `completed` | When points are added to member balance (default: when admin marks order as `Completed`). |

---

## 4. Referral & Word-of-Mouth Program

| Business Decision | Setting Key | Default Value | Description / Where Configured |
| :--- | :--- | :--- | :--- |
| **Referral Reward Trigger** | `referral_trigger` | `first_order` | Choice of trigger: `'registration'` (rewards given immediately on sign up) or `'first_order'` (rewards given when referee completes first order). |
| **Referrer Reward Type** | `referral_reward_type` | `points` | Reward given to the advocate: `'points'`, `'voucher'`, or `'both'`. |
| **Referrer Reward Points** | `referral_reward_value` | `50` | Number of points credited to referrer upon successful trigger. |
| **Referrer Voucher Code** | `referral_reward_voucher_code` | `""` | Optional voucher code issued to referrer if reward type is `'voucher'` or `'both'`. |
| **Referee Welcome Reward Type**| `referral_referee_reward_type` | `points` | Reward given to the new friend: `'points'`, `'voucher'`, `'both'`, or `'none'`. |
| **Referee Welcome Points** | `referral_referee_reward_value` | `25` | Welcome bonus points credited to new member upon joining via referral. |
| **Referee Voucher Code** | `referral_referee_reward_voucher_code`| `""` | Optional welcome voucher issued to referee. |

---

## 5. Security & Operational Rules

| Business Decision | Setting Key / Env | Default Value | Description / Where Configured |
| :--- | :--- | :--- | :--- |
| **OTP Verification Cooldown** | Hardcoded Policy | `60 seconds` | Time between successive OTP request attempts to prevent SMS spam. |
| **OTP Expiry Window** | Hardcoded Policy | `10 minutes` | Lifetime of a single-use verification code. |
| **Maximum OTP Failed Attempts**| Hardcoded Policy | `3 attempts` | Account temporarily locked from OTP requests after 3 consecutive wrong entries. |
| **Session Lifetime** | `JWT_ACCESS_EXPIRES_IN` | `15m` | Token security window before silent background refresh. |
| **Refresh Token Lifetime** | `JWT_REFRESH_EXPIRES_IN` | `7d` | Stay logged in duration across devices. |
