import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPointsTransaction extends Document {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  type: 'earn' | 'redeem' | 'adjust' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedOrder?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

const pointsTransactionSchema = new Schema<IPointsTransaction>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    type: { type: String, enum: ['earn', 'redeem', 'adjust', 'refund'], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

pointsTransactionSchema.index({ member: 1, createdAt: -1 });

export const PointsTransaction = mongoose.model<IPointsTransaction>(
  'PointsTransaction',
  pointsTransactionSchema
);
