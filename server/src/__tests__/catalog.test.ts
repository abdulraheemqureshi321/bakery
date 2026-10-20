import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

const {
  categories,
  products,
  MockCategory,
  MockProduct,
  MockMember,
  MockSetting,
} = vi.hoisted(() => {
  const categories: any[] = [];
  const products: any[] = [];

  const MockCategory = {
    find(query: any = {}) {
      let list = [...categories];
      if (query.isActive !== undefined) {
        list = list.filter((c) => c.isActive === query.isActive);
      }
      return {
        sort: (_sortObj?: any) => {
          return Promise.resolve(list);
        },
        then: (resolve: any, reject: any) => {
          return Promise.resolve(list).then(resolve, reject);
        },
      };
    },
    async findById(id: any) {
      const match = categories.find((c) => c._id.toString() === String(id));
      if (!match) return null;
      return {
        ...match,
        async save() {
          const idx = categories.findIndex((c) => c._id.toString() === String(id));
          if (idx !== -1) categories[idx] = this;
          return this;
        },
      };
    },
    async findOne(query: any) {
      const match = categories.find((c) => {
        if (query.slug && c.slug !== query.slug) return false;
        if (query._id && query._id.$ne && c._id.toString() === query._id.$ne.toString())
          return false;
        return true;
      });
      return match || null;
    },
    async create(data: any) {
      const hexId = new mongoose.Types.ObjectId().toString();
      const doc = {
        _id: data._id || hexId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      categories.push(doc);
      return doc;
    },
    async findByIdAndDelete(id: any) {
      const idx = categories.findIndex((c) => c._id.toString() === String(id));
      if (idx !== -1) categories.splice(idx, 1);
      return { deletedCount: 1 };
    },
    async countDocuments() {
      return 0;
    },
  };

  const MockProduct = {
    find(query: any = {}) {
      let list = [...products];
      if (query.isActive !== undefined) {
        list = list.filter((p) => p.isActive === query.isActive);
      }
      if (query.featured !== undefined) {
        list = list.filter((p) => p.featured === query.featured);
      }
      if (query.category) {
        list = list.filter((p) => {
          const catId = p.category?._id ? p.category._id.toString() : p.category.toString();
          return catId === query.category.toString();
        });
      }
      if (query.$or) {
        list = list.filter((p) => {
          return query.$or.some((clause: any) => {
            if (clause.name?.$regex) {
              const regex = new RegExp(clause.name.$regex, 'i');
              return regex.test(p.name);
            }
            if (clause.description?.$regex) {
              const regex = new RegExp(clause.description.$regex, 'i');
              return regex.test(p.description);
            }
            return false;
          });
        });
      }

      let currentLimit = list.length;
      let currentSkip = 0;

      const chain: any = {
        populate: () => chain,
        sort: (sortObj: any) => {
          if (sortObj?.price === 1) list.sort((a, b) => a.price - b.price);
          else if (sortObj?.price === -1) list.sort((a, b) => b.price - a.price);
          else if (sortObj?.name === 1) list.sort((a, b) => a.name.localeCompare(b.name));
          else list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          return chain;
        },
        skip: (n: number) => {
          currentSkip = n;
          return chain;
        },
        limit: (n: number) => {
          currentLimit = n;
          return chain;
        },
        then: (resolve: any, reject: any) => {
          return Promise.resolve(list.slice(currentSkip, currentSkip + currentLimit)).then(
            resolve,
            reject
          );
        },
      };
      return chain;
    },
    async countDocuments(query: any = {}) {
      let list = [...products];
      if (query.isActive !== undefined) list = list.filter((p) => p.isActive === query.isActive);
      if (query.category) {
        list = list.filter((p) => {
          const catId = p.category?._id ? p.category._id.toString() : p.category.toString();
          return catId === query.category.toString();
        });
      }
      return list.length;
    },
    findOne(query: any) {
      const match = products.find((p) => {
        if (query.slug && p.slug !== query.slug) return false;
        if (query.isActive !== undefined && p.isActive !== query.isActive) return false;
        return true;
      });
      return {
        populate: () => Promise.resolve(match || null),
        then: (resolve: any, reject: any) => {
          return Promise.resolve(match || null).then(resolve, reject);
        },
      };
    },
    async findById(id: any) {
      const match = products.find((p) => p._id.toString() === String(id));
      if (!match) return null;
      return {
        ...match,
        populate: () => match,
        async save() {
          const idx = products.findIndex((p) => p._id.toString() === String(id));
          if (idx !== -1) products[idx] = this;
          return this;
        },
      };
    },
    async create(data: any) {
      const hexId = new mongoose.Types.ObjectId().toString();
      const doc = {
        _id: data._id || hexId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      products.push(doc);
      return doc;
    },
    async findByIdAndDelete(id: any) {
      const idx = products.findIndex((p) => p._id.toString() === String(id));
      if (idx !== -1) products.splice(idx, 1);
      return { deletedCount: 1 };
    },
  };

  const MockMember = {
    findById: (id: any) => ({
      then: (res: any) => res({ _id: id, role: 'admin', isActive: true }),
    }),
  };

  const MockSetting = {
    findOne: async () => null,
  };

  return {
    categories,
    products,
    MockCategory,
    MockProduct,
    MockMember,
    MockSetting,
  };
});

vi.mock('../models', () => {
  return {
    Category: MockCategory,
    Product: MockProduct,
    Member: MockMember,
    Setting: MockSetting,
  };
});

import supertest from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import env from '../config/env';

const request = supertest(app);

describe('Catalog & Product APIs (Phase 2)', () => {
  const adminToken = jwt.sign(
    { id: 'admin_test_123', role: 'admin' },
    env.JWT_ACCESS_SECRET
  );

  let categoryCakesId: string;
  let categoryPartyId: string;

  beforeEach(async () => {
    categories.length = 0;
    products.length = 0;

    const cat1 = await MockCategory.create({
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Celebration Cakes',
      slug: 'celebration-cakes',
      sortOrder: 1,
      isActive: true,
    });
    categoryCakesId = cat1._id;

    const cat2 = await MockCategory.create({
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Party Bags',
      slug: 'party-bags',
      sortOrder: 2,
      isActive: true,
    });
    categoryPartyId = cat2._id;

    // Seed 3 products
    await MockProduct.create({
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Classic Velvet Cake',
      slug: 'classic-velvet-cake',
      price: 120,
      category: categoryCakesId,
      featured: true,
      supportsCustomization: true,
      isActive: true,
      images: [{ url: 'https://img.com/1.jpg', publicId: 'velvet_1' }],
      variants: [
        {
          name: 'Size',
          options: ['6-inch', '8-inch'],
          priceModifiers: [0, 40],
        },
      ],
      description: 'Velvety smooth cocoa sponge.',
    });

    await MockProduct.create({
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Matcha Crêpe Cake',
      slug: 'matcha-crepe-cake',
      price: 140,
      category: categoryCakesId,
      featured: false,
      supportsCustomization: false,
      isActive: true,
      images: [{ url: 'https://img.com/2.jpg', publicId: 'matcha_1' }],
      variants: [],
      description: 'Thin layered crepes with matcha cream.',
    });

    await MockProduct.create({
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Kids Favor Party Bag',
      slug: 'kids-favor-party-bag',
      price: 90,
      category: categoryPartyId,
      featured: true,
      supportsCustomization: true,
      isActive: true,
      images: [{ url: 'https://img.com/3.jpg', publicId: 'party_1' }],
      variants: [],
      description: 'Festive bag of baked treats.',
    });
  });

  /* ----------------------------------------------------
     PUBLIC CATALOG TESTS
  ---------------------------------------------------- */
  describe('Public Endpoints', () => {
    it('GET /api/v1/public/categories returns all active categories', async () => {
      const res = await request.get('/api/v1/public/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories.length).toBe(2);
      expect(res.body.data.categories[0].name).toBe('Celebration Cakes');
    });

    it('GET /api/v1/public/products returns paginated products', async () => {
      const res = await request.get('/api/v1/public/products?limit=2&page=1');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.totalPages).toBe(2);
    });

    it('GET /api/v1/public/products filters by category slug', async () => {
      const res = await request.get('/api/v1/public/products?category=party-bags');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].name).toBe('Kids Favor Party Bag');
    });

    it('GET /api/v1/public/products searches by keyword', async () => {
      const res = await request.get('/api/v1/public/products?search=matcha');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].name).toBe('Matcha Crêpe Cake');
    });

    it('GET /api/v1/public/products sorts by price ascending', async () => {
      const res = await request.get('/api/v1/public/products?sort=price_asc');
      expect(res.status).toBe(200);
      expect(res.body.data.products[0].price).toBe(90);
      expect(res.body.data.products[2].price).toBe(140);
    });

    it('GET /api/v1/public/products/featured returns only featured items', async () => {
      const res = await request.get('/api/v1/public/products/featured');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBe(2);
      res.body.data.products.forEach((p: any) => {
        expect(p.featured).toBe(true);
      });
    });

    it('GET /api/v1/public/products/:slug returns detailed product info', async () => {
      const res = await request.get('/api/v1/public/products/classic-velvet-cake');
      expect(res.status).toBe(200);
      expect(res.body.data.product.name).toBe('Classic Velvet Cake');
      expect(res.body.data.product.supportsCustomization).toBe(true);
      expect(res.body.data.product.variants.length).toBe(1);
    });

    it('GET /api/v1/public/products/:slug returns 404 for non-existent product', async () => {
      const res = await request.get('/api/v1/public/products/non-existent-cake');
      expect(res.status).toBe(404);
    });
  });

  /* ----------------------------------------------------
     ADMIN CRUD TESTS
  ---------------------------------------------------- */
  describe('Admin Category & Product Management', () => {
    it('POST /api/v1/admin/categories creates a category', async () => {
      const res = await request
        .post('/api/v1/admin/categories')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send({
          name: 'Petit Pastries',
          description: 'Bite-sized treats',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.category.slug).toBe('petit-pastries');
      expect(categories.length).toBe(3);
    });

    it('POST /api/v1/admin/products creates a product with multiple images and variants', async () => {
      const res = await request
        .post('/api/v1/admin/products')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send({
          name: 'Lemon Tart Box',
          price: 55,
          category: categoryCakesId,
          images: [
            { url: 'https://img.com/lemon1.jpg', publicId: 'lemon_1' },
            { url: 'https://img.com/lemon2.jpg', publicId: 'lemon_2' },
          ],
          description: 'Tangy lemon curd.',
          variants: [
            {
              name: 'Box Size',
              options: ['4 pcs', '8 pcs'],
              priceModifiers: [0, 45],
            },
          ],
          supportsCustomization: false,
          featured: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.product.name).toBe('Lemon Tart Box');
      expect(res.body.data.product.images.length).toBe(2);
      expect(res.body.data.product.variants.length).toBe(1);
    });

    it('DELETE /api/v1/admin/products/:id deletes product', async () => {
      const firstProduct = products[0];
      const res = await request
        .delete(`/api/v1/admin/products/${firstProduct._id}`)
        .set('Cookie', [`accessToken=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Product deleted');
      expect(products.length).toBe(2);
    });
  });
});
