import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMember extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  birthday?: Date;
  passwordHash: string | null;
  role: 'member' | 'admin';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  referralCode: string;
  referredBy?: Types.ObjectId;
  pointsBalance: number;
  refreshToken?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  otpLastRequestAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    birthday: { type: Date },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'Member' },
    pointsBalance: { type: Number, default: 0, min: 0 },
    refreshToken: { type: String },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLastRequestAt: { type: Date },
  },
  { timestamps: true }
);

memberSchema.index({ referredBy: 1 });

export const Member = mongoose.model<IMember>('Member', memberSchema);
