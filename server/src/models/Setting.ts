import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISetting extends Document {
  _id: Types.ObjectId;
  key: string;
  value: any;
  label: string;
  group: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    label: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);
