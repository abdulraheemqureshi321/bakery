import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  variantPriceModifier: number;
  customizationNotes?: string;
  lineTotal: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  voucherDiscount: number;
  pointsDiscount: number;
  voucherCode?: string;
  deliveryFee: number;
  totalAmount: number;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsCredited: boolean;
  voucherUsed?: Types.ObjectId;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedVariants: { type: Schema.Types.Mixed },
    variantPriceModifier: { type: Number, default: 0 },
    customizationNotes: { type: String },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    voucherDiscount: { type: Number, default: 0 },
    pointsDiscount: { type: Number, default: 0 },
    voucherCode: { type: String },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    pointsCredited: { type: Boolean, default: false },
    voucherUsed: { type: Schema.Types.ObjectId, ref: 'MemberVoucher' },
    fulfillmentType: { type: String, enum: ['pickup', 'delivery'], required: true },
    pickupTime: { type: String },
    deliveryAddress: { type: String },
    deliveryNotes: { type: String },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ member: 1 });
orderSchema.index({ member: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
