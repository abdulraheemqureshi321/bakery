import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductVariant {
  name: string;
  options: string[];
  priceModifiers?: number[];
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  category: Types.ObjectId;
  images: IProductImage[];
  description: string;
  variants: IProductVariant[];
  supportsCustomization: boolean;
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    options: [{ type: String }],
    priceModifiers: [{ type: Number }],
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [productImageSchema],
    description: { type: String, default: '', trim: true },
    variants: [productVariantSchema],
    supportsCustomization: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ isActive: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
