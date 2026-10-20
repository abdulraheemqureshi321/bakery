import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVoucher extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  totalUsageLimit?: number;
  perMemberLimit: number;
  totalUsed: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    totalUsageLimit: { type: Number },
    perMemberLimit: { type: Number, default: 1 },
    totalUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Voucher = mongoose.model<IVoucher>('Voucher', voucherSchema);

// MemberVoucher - tracks voucher issuance and usage per member
export interface IMemberVoucher extends Document {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  voucher: Types.ObjectId;
  isUsed: boolean;
  usedAt?: Date;
  usedInOrder?: Types.ObjectId;
  issuedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memberVoucherSchema = new Schema<IMemberVoucher>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    voucher: { type: Schema.Types.ObjectId, ref: 'Voucher', required: true },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    usedInOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

memberVoucherSchema.index({ member: 1, voucher: 1 });
memberVoucherSchema.index({ member: 1, isUsed: 1 });

export const MemberVoucher = mongoose.model<IMemberVoucher>('MemberVoucher', memberVoucherSchema);
