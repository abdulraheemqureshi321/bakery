export interface Member {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  role: 'member' | 'admin';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  referralCode: string;
  referredBy?: string;
  pointsBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingItem {
  _id: string;
  key: string;
  value: any;
  label: string;
  group: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isPublic: boolean;
}

export type PublicSettings = Record<string, any>;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
  priceModifiers?: number[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: Category | string;
  images: ProductImage[];
  description: string;
  variants: ProductVariant[];
  supportsCustomization: boolean;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  id: string; // Composite key: `${productId}_${JSON.stringify(variants)}`
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
  variantPriceModifier: number;
  customizationNotes?: string;
  unitPrice: number;
}

export interface OrderItem {
  product: string | Product;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  variantPriceModifier: number;
  customizationNotes?: string;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  member:
    | string
    | {
        _id: string;
        name: string;
        phone: string;
        email?: string;
      };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  voucherDiscount?: number;
  pointsDiscount?: number;
  voucherCode?: string;
  deliveryFee: number;
  totalAmount: number;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsCredited?: boolean;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPreviewResult {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  voucherDiscount: number;
  pointsDiscount: number;
  pointsRedeemed: number;
  discountAmount: number;
  totalAmount: number;
  estimatedPointsEarned: number;
  voucherCode?: string;
  currency: string;
  currencySymbol: string;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    selectedVariants?: Record<string, string>;
    customizationNotes?: string;
  }>;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  date?: string;
  paymentMethod: string;
  notes?: string;
  voucherId?: string;
  voucherCode?: string;
  redeemPoints?: number;
}

export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  totalUsageLimit?: number;
  perMemberLimit: number;
  totalUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberVoucher {
  _id: string;
  member: string;
  voucher: Voucher;
  isUsed: boolean;
  usedAt?: string;
  usedInOrder?: string;
  issuedAt: string;
  expiresAt: string;
  status: 'available' | 'used' | 'expired';
}

export interface PointsTransaction {
  _id: string;
  member: string;
  type: 'earn' | 'redeem' | 'adjust' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedOrder?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  createdAt: string;
}

export interface PointsRules {
  earnRatio: number;
  redeemRatio: number;
  minRedeem: number;
  maxOrderSharePercent: number;
  creditEvent: string;
}

export interface ReferralRules {
  trigger: 'registration' | 'first_order';
  referrerRewardType: 'points' | 'voucher' | 'both';
  referrerRewardPoints: number;
  referrerRewardVoucherCode?: string;
  refereeRewardType: 'points' | 'voucher' | 'both' | 'none';
  refereeRewardPoints: number;
  refereeRewardVoucherCode?: string;
}

export interface ReferralItem {
  _id: string;
  refereeName: string;
  refereePhone: string;
  joinedAt: string;
  rewardStatus: 'pending' | 'granted' | 'expired';
  trigger: 'registration' | 'first_order';
  grantedAt?: string;
  rewardDetails?: {
    referrerPoints?: number;
    refereePoints?: number;
    referrerVoucherCode?: string;
    refereeVoucherCode?: string;
  };
  order?: {
    orderNumber: string;
    totalAmount: number;
  };
}

export interface MemberReferralOverview {
  referralCode: string;
  referralLink: string;
  rules: ReferralRules;
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalPointsEarned: number;
  };
  referrals: ReferralItem[];
}

export interface AdminReferralRecord {
  _id: string;
  referrer: {
    _id: string;
    name: string;
    phone: string;
    referralCode: string;
    email?: string;
  };
  referee: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    createdAt: string;
  };
  rewardStatus: 'pending' | 'granted' | 'expired';
  trigger: 'registration' | 'first_order';
  rewardType: string;
  rewardValue: number;
  rewardDetails?: any;
  order?: {
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  grantedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReferralStats {
  overview: {
    totalReferrals: number;
    grantedRewards: number;
    pendingRewards: number;
  };
  topReferrers: Array<{
    memberId: string;
    name: string;
    phone: string;
    referralCode: string;
    pointsBalance: number;
    totalReferrals: number;
    grantedReferrals: number;
  }>;
}

