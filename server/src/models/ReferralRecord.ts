import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReferralRecord extends Document {
  _id: Types.ObjectId;
  referrer: Types.ObjectId;
  referee: Types.ObjectId;
  rewardStatus: 'pending' | 'granted' | 'expired';
  trigger: 'registration' | 'first_order';
  rewardType?: string; // 'points' | 'voucher' | 'both'
  rewardValue?: number;
  rewardDetails?: {
    referrerPoints?: number;
    refereePoints?: number;
    referrerVoucherCode?: string;
    refereeVoucherCode?: string;
  };
  order?: Types.ObjectId;
  grantedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralRecordSchema = new Schema<IReferralRecord>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    referee: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    rewardStatus: {
      type: String,
      enum: ['pending', 'granted', 'expired'],
      default: 'pending',
    },
    trigger: {
      type: String,
      enum: ['registration', 'first_order'],
      default: 'first_order',
    },
    rewardType: { type: String, default: 'points' },
    rewardValue: { type: Number, default: 0 },
    rewardDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    grantedAt: { type: Date },
  },
  { timestamps: true }
);

referralRecordSchema.index({ referrer: 1 });
referralRecordSchema.index({ referee: 1 }, { unique: true });
referralRecordSchema.index({ rewardStatus: 1 });

export const ReferralRecord = mongoose.model<IReferralRecord>(
  'ReferralRecord',
  referralRecordSchema
);
