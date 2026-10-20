import { Category, ICategory, Product, IProduct } from '../models';
import { AppError } from '../utils/AppError';
import * as cloudinaryService from './cloudinaryService';
import mongoose from 'mongoose';

// Helper to slugify a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ============================================================
   CATEGORIES
   ============================================================ */

export async function getAllCategories(includeInactive: boolean = false): Promise<ICategory[]> {
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryById(id: string): Promise<ICategory> {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<ICategory> {
  let slug = data.slug ? slugify(data.slug) : slugify(data.name);

  // Ensure unique slug
  let existing = await Category.findOne({ slug });
  let counter = 1;
  while (existing) {
    slug = `${slugify(data.slug || data.name)}-${counter++}`;
    existing = await Category.findOne({ slug });
  }

  return Category.create({
    name: data.name.trim(),
    slug,
    description: data.description?.trim(),
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
  });
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }>
): Promise<ICategory> {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (data.name) category.name = data.name.trim();
  if (data.description !== undefined) category.description = data.description?.trim();
  if (data.sortOrder !== undefined) category.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) category.isActive = data.isActive;

  if (data.slug) {
    const newSlug = slugify(data.slug);
    if (newSlug !== category.slug) {
      const existing = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Category slug already in use', 409);
      }
      category.slug = newSlug;
    }
  }

  await category.save();
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if any product is assigned to this category
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    throw new AppError(
      `Cannot delete category. ${productsCount} products are assigned to it. Deactivate it instead.`,
      400
    );
  }

  await Category.findByIdAndDelete(id);
}

/* ============================================================
   PRODUCTS
   ============================================================ */

export interface ProductQueryOptions {
  category?: string; // category id or category slug
  featured?: boolean;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface PaginatedProducts {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProducts(options: ProductQueryOptions): Promise<PaginatedProducts> {
  const {
    category,
    featured,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
    includeInactive = false,
  } = options;

  const filter: any = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (featured !== undefined) {
    filter.featured = featured;
  }

  // Handle category filter: support either ObjectId or slug
  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        filter.category = catDoc._id;
      } else {
        // Category not found by slug -> return empty result
        return { products: [], total: 0, page, limit, totalPages: 0 };
      }
    }
  }

  // Search by name or description
  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  // Sorting
  let sortOption: any = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'name_asc') sortOption = { name: 1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getFeaturedProducts(limit: number = 6): Promise<IProduct[]> {
  return Product.find({ featured: true, isActive: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function getProductBySlug(slug: string): Promise<IProduct> {
  const product = await Product.findOne({ slug, isActive: true }).populate(
    'category',
    'name slug description'
  );
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

export async function getProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

export async function createProduct(data: {
  name: string;
  slug?: string;
  price: number;
  category: string;
  images?: Array<{ url: string; publicId: string }>;
  description?: string;
  variants?: Array<{ name: string; options: string[]; priceModifiers?: number[] }>;
  supportsCustomization?: boolean;
  featured?: boolean;
  isActive?: boolean;
}): Promise<IProduct> {
  // Validate category exists
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) {
    throw new AppError('Selected category does not exist', 400);
  }

  let slug = data.slug ? slugify(data.slug) : slugify(data.name);

  // Ensure unique slug
  let existing = await Product.findOne({ slug });
  let counter = 1;
  while (existing) {
    slug = `${slugify(data.slug || data.name)}-${counter++}`;
    existing = await Product.findOne({ slug });
  }

  return Product.create({
    name: data.name.trim(),
    slug,
    price: data.price,
    category: new mongoose.Types.ObjectId(data.category),
    images: data.images || [],
    description: data.description?.trim() || '',
    variants: data.variants || [],
    supportsCustomization: data.supportsCustomization ?? false,
    featured: data.featured ?? false,
    isActive: data.isActive ?? true,
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    slug?: string;
    price: number;
    category: string;
    images?: Array<{ url: string; publicId: string }>;
    description?: string;
    variants?: Array<{ name: string; options: string[]; priceModifiers?: number[] }>;
    supportsCustomization?: boolean;
    featured?: boolean;
    isActive?: boolean;
  }>
): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw new AppError('Selected category does not exist', 400);
    }
    product.category = new mongoose.Types.ObjectId(data.category);
  }

  if (data.name) product.name = data.name.trim();
  if (data.price !== undefined) product.price = data.price;
  if (data.description !== undefined) product.description = data.description.trim();
  if (data.variants !== undefined) product.variants = data.variants;
  if (data.supportsCustomization !== undefined) product.supportsCustomization = data.supportsCustomization;
  if (data.featured !== undefined) product.featured = data.featured;
  if (data.isActive !== undefined) product.isActive = data.isActive;

  // Cloudinary image sync: if images are replaced/removed, delete unused images from Cloudinary
  if (data.images !== undefined) {
    const oldPublicIds = new Set(product.images.map((img) => img.publicId));
    const newPublicIds = new Set(data.images.map((img) => img.publicId));

    // Delete removed images from Cloudinary
    for (const oldId of oldPublicIds) {
      if (!newPublicIds.has(oldId)) {
        // Fire and forget / catch error so update doesn't fail if already removed
        cloudinaryService.deleteImage(oldId).catch((err) => {
          console.warn(`Could not delete removed Cloudinary image ${oldId}:`, err);
        });
      }
    }
    product.images = data.images;
  }

  if (data.slug) {
    const newSlug = slugify(data.slug);
    if (newSlug !== product.slug) {
      const existing = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Product slug already in use', 409);
      }
      product.slug = newSlug;
    }
  }

  await product.save();
  return product.populate('category', 'name slug');
}

export async function deleteProduct(id: string): Promise<void> {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Delete all Cloudinary images associated with this product
  for (const img of product.images) {
    if (img.publicId) {
      cloudinaryService.deleteImage(img.publicId).catch((err) => {
        console.warn(`Failed to delete Cloudinary image ${img.publicId} on product delete:`, err);
      });
    }
  }

  await Product.findByIdAndDelete(id);
}
