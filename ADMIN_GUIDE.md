# SoulTalk Pastry - Administrator Operations Guide

Welcome to the SoulTalk Pastry Administrator Manual. This guide explains how to manage bakery operations, fulfill orders, configure marketing rewards, and import member data.

Access the Admin Dashboard at: `/admin` (or `/admin/login`).

---

## 1. Product & Category Management

### Categories (`/admin/categories`)
- **Organize Your Storefront**: Create categories such as *Signature Cakes*, *Artisanal Pastries*, *Party Bags*, or *Seasonal Specials*.
- **Ordering**: Set `sortOrder` (e.g., 1, 2, 3) to determine the display hierarchy in the storefront catalog.

### Products (`/admin/products` & `/admin/products/new`)
- **Product Details**: Name, category, base price (RM), and rich description.
- **High-Definition Imagery**: Upload multiple images via Cloudinary. Images are automatically transformed to next-generation WebP formats for mobile visitors.
- **Option Variants**: Add custom options like *Size* (e.g. 6-inch, 8-inch, +RM 30), *Flavor* (e.g. Dark Chocolate, Earl Grey), or *Dietary* (e.g. Less Sweet).
- **Customization Flag (`supportsCustomization`)**: Enable this toggle to prompt customers for custom cake piping text or special decoration requests during ordering.
- **Featured Flag (`featured`)**: Toggling on highlights the product in the storefront hero showcase and home page recommendations.
- **Activate / Deactivate**: Deactivate seasonal items without deleting their historical order records.

---

## 2. Order Management & Fulfillment (`/admin/orders`)

### Order Lifecycle & Status Progression
1. **Pending**: New order placed by customer.
2. **Confirmed**: Kitchen has accepted the order and scheduled baking.
3. **Completed**: Cake is collected or delivered.
   - *Automated Loyalty Trigger*: When an order is marked `Completed`, customer points are credited according to your earn rules.
   - *Automated Referral Trigger*: If your referral trigger is set to `first_order`, marking a referee's first order as `Completed` automatically grants referral rewards to the referrer!
4. **Cancelled**: Customer or bakery cancels the order.
   - *Automated Refund Engine*: Any redeemed points are automatically restored to the member's wallet, and used vouchers are unlinked and restored. If points were already credited, they are safely reversed.

### Fulfillment Types
- **Self-Collection (Pickup)**: Customer will arrive at the bakery at the requested time slot.
- **Delivery**: Driver delivery to customer's address with optional delivery instructions.

---

## 3. Member Management & Bulk Excel Import

### Member Roster (`/admin/members`)
- View and search members by name, phone number, or referral code.
- Manually edit contact details or toggle account status (`active`, `inactive`, `suspended`).
- Add individual members manually with the **Add Member** button.

### Excel Bulk Import (`/admin/members/import`)
- **File Support**: Upload `.xlsx`, `.xls`, or `.csv` files up to 10MB.
- **Flexible Column Mapping**: Intelligently detects columns such as `Name`, `Phone`, `Birthday`, and `Email`. If column headers differ, an interactive dropdown mapping screen allows you to align them easily.
- **Interactive Preview**: Before saving, review:
  - *Valid Rows*: Clean records ready to import.
  - *Invalid Rows*: Rows with missing phone numbers or malformed entries.
  - *Duplicate Rows*: Customers already existing in the system (skipped to protect data integrity).
- **Download Error CSV**: Download a detailed CSV listing exact row numbers and validation failure reasons for records that could not be imported.
- **Import Execution**: Imported members are assigned a unique referral code and can immediately claim their account via OTP login or password setup.

---

## 4. Points & Voucher Loyalty Engine

### Loyalty Points Configuration (`/admin/settings`)
- **Earn Ratio**: Set points earned per RM spent (default: 1 point per RM 1).
- **Redemption Value**: Monetary value per point (e.g., 0.01 = 100 points equals RM 1.00 discount).
- **Minimum Redemption**: Minimum points required to redeem at checkout (e.g., 100 points).
- **Maximum Share**: Maximum percentage of cart payable with points (e.g., 50%).

### Manual Points Adjustments (`/admin/points/adjust` or `/admin/members/:id`)
- Manually credit or debit customer points with an audit reason (e.g., "Goodwill compensation for delivery delay", "VIP anniversary gift").

### Vouchers Management (`/admin/vouchers`)
- **Create Vouchers**: Define coupon code (e.g., `SWEETTREAT10`), discount type (`percentage` or `fixed`), minimum spend requirement, expiry dates, and usage limits.
- **Voucher Distribution**:
  - *Issue to All Members*: Distribute holiday vouchers to all registered members with one click.
  - *Issue to Specific Members*: Reward selected loyal customers directly to their account wallets.

---

## 5. Referral Program Management (`/admin/referrals`)

### Referral Hub & Leaderboard
- **Analytics Cards**: Review Total Referrals, Rewards Granted, and Pending First-Order Completions.
- **Top Referrers Leaderboard**: Identify your most influential brand advocates, their successful invite count, and current points balance.
- **Referrals Table**: Search and filter by referee, referrer, or status (`Granted` / `Pending`).

### Referral Settings Configuration (`/admin/settings`)
- `referral_trigger`: Trigger reward either immediately on `registration` or when referee completes their `first_order`.
- `referral_reward_type`: Reward referrer with `points`, `voucher`, or `both`.
- `referral_reward_value`: Referrer points amount (default: 50).
- `referral_referee_reward_type`: Welcome bonus for the referee (`points`, `voucher`, `both`, or `none`).
- `referral_referee_reward_value`: Referee bonus points amount (default: 25).
