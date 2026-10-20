import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
