import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  referralCode: z.string().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Phone or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const requestOtpSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const setPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const updateSettingSchema = z.object({
  value: z.any(),
});

export const bulkUpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.any(),
    })
  ),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// Product Schemas
export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string().min(1, 'Public ID is required'),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  options: z.array(z.string().min(1)).min(1, 'At least one option is required'),
  priceModifiers: z.array(z.number()).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(150),
  slug: z.string().min(1).max(150).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category ID is required'),
  images: z.array(productImageSchema).default([]),
  description: z.string().default(''),
  variants: z.array(productVariantSchema).default([]),
  supportsCustomization: z.boolean().default(false),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// Public Product Query
export const productQuerySchema = z.object({
  category: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  search: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// Order Schemas
export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  selectedVariants: z.record(z.string()).optional(),
  customizationNotes: z.string().max(500).optional(),
});

export const previewOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required'),
  fulfillmentType: z.enum(['pickup', 'delivery']),
  voucherId: z.string().optional().or(z.literal('')),
  voucherCode: z.string().optional().or(z.literal('')),
  redeemPoints: z.coerce.number().min(0).optional(),
  pointsToRedeem: z.coerce.number().min(0).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required in the cart'),
  fulfillmentType: z.enum(['pickup', 'delivery']),
  pickupTime: z.string().optional(),
  deliveryAddress: z.string().max(500).optional(),
  deliveryNotes: z.string().max(500).optional(),
  date: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(500).optional(),
  voucherId: z.string().optional().or(z.literal('')),
  voucherCode: z.string().optional().or(z.literal('')),
  redeemPoints: z.coerce.number().min(0).optional(),
  pointsToRedeem: z.coerce.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.fulfillmentType === 'pickup') {
      return Boolean(data.pickupTime && data.pickupTime.trim().length > 0);
    }
    return true;
  },
  {
    message: 'Pickup time slot is required for pickup orders',
    path: ['pickupTime'],
  }
).refine(
  (data) => {
    if (data.fulfillmentType === 'delivery') {
      return Boolean(data.deliveryAddress && data.deliveryAddress.trim().length > 0);
    }
    return true;
  },
  {
    message: 'Delivery address is required for delivery orders',
    path: ['deliveryAddress'],
  }
);

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
  notes: z.string().max(500).optional(),
});

export const orderQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Member Schemas (Phase 4)
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  phone: z.string().min(1, 'Phone cannot be empty').max(25).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
});

export const adminCreateMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(25),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  role: z.enum(['member', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const adminUpdateMemberSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  phone: z.string().min(1, 'Phone cannot be empty').max(25).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  role: z.enum(['member', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  pointsBalance: z.number().min(0).optional(),
});

// Points & Vouchers Schemas (Phase 5)
export const createVoucherSchema = z.object({
  code: z.string().min(1, 'Voucher code is required').max(30).trim(),
  name: z.string().min(1, 'Voucher name is required').max(100).trim(),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0.01, 'Discount value must be greater than 0'),
  minOrderAmount: z.number().min(0).optional(),
  minSpend: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  validDays: z.number().min(1).optional(),
  totalUsageLimit: z.number().int().min(1).optional(),
  perMemberLimit: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export const updateVoucherSchema = createVoucherSchema.partial();

export const issueVoucherSchema = z.object({
  voucherId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  allMembers: z.boolean().optional(),
  target: z.enum(['all', 'selected']).optional(),
});

export const adminAdjustPointsSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
  reason: z.string().min(1, 'Reason is required').max(255),
});

export const validateVoucherSchema = z.object({
  voucherCode: z.string().min(1, 'Voucher code is required'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
});


