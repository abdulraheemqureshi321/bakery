import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

// Hoist mocks
const {
  categories,
  products,
  members,
  settings,
  MockCategory,
  MockProduct,
  MockMember,
  MockSetting,
} = vi.hoisted(() => {
  const categories: any[] = [];
  const products: any[] = [];
  const members: any[] = [];
  const settings: any[] = [
    { key: 'site_name', value: 'SoulTalk Pastry', isPublic: true },
    { key: 'whatsapp_number', value: '+60 12-345 6789', isPublic: true },
    { key: 'store_address', value: '42 Baker Street, Kuala Lumpur', isPublic: true },
    { key: 'opening_hours', value: 'Tue - Sun: 10:00 AM - 8:00 PM', isPublic: true },
  ];

  const MockCategory = {
    find(query: any = {}) {
      let list = [...categories];
      if (query.isActive !== undefined) {
        list = list.filter((c) => c.isActive === query.isActive);
      }
      return {
        sort: (sortObj: any) => {
          if (sortObj?.sortOrder) {
            list.sort((a, b) => a.sortOrder - b.sortOrder);
          }
          return Promise.resolve(list);
        },
        then: (resolve: any, reject: any) => Promise.resolve(list).then(resolve, reject),
      };
    },
    async findById(id: any) {
      return categories.find((c) => c._id.toString() === String(id)) || null;
    },
    async findOne(query: any) {
      return (
        categories.find((c) => {
          if (query.slug && c.slug !== query.slug) return false;
          return true;
        }) || null
      );
    },
    async create(data: any) {
      const doc = {
        _id: data._id || new mongoose.Types.ObjectId().toString(),
        ...data,
      };
      categories.push(doc);
      return doc;
    },
  };

  const MockProduct = {
    find(query: any = {}) {
      let list = [...products];
      if (query.isActive !== undefined) {
        list = list.filter((p) => p.isActive === query.isActive);
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

      const queryObj: any = {
        _list: list,
        _sort: null,
        _skip: 0,
        _limit: 100,
        sort(s: any) {
          queryObj._sort = s;
          return queryObj;
        },
        skip(n: number) {
          queryObj._skip = n;
          return queryObj;
        },
        limit(n: number) {
          queryObj._limit = n;
          return queryObj;
        },
        populate() {
          return queryObj;
        },
        then(resolve: any, reject: any) {
          let sorted = [...queryObj._list];
          if (queryObj._sort) {
            if (queryObj._sort.price === 1) sorted.sort((a, b) => a.price - b.price);
            if (queryObj._sort.price === -1) sorted.sort((a, b) => b.price - a.price);
            if (queryObj._sort.createdAt === -1)
              sorted.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
          }
          const paged = sorted.slice(
            queryObj._skip,
            queryObj._skip + queryObj._limit
          );
          return Promise.resolve(paged).then(resolve, reject);
        },
      };

      return queryObj;
    },
    async countDocuments(query: any = {}) {
      let list = [...products];
      if (query.isActive !== undefined) {
        list = list.filter((p) => p.isActive === query.isActive);
      }
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
        then: (resolve: any, reject: any) => Promise.resolve(match || null).then(resolve, reject),
      };
    },
    async findById(id: any) {
      const match = products.find((p) => p._id.toString() === String(id));
      if (!match) return null;
      return {
        ...match,
        async save() {
          const idx = products.findIndex((p) => p._id.toString() === String(id));
          if (idx !== -1) products[idx] = this;
          return this;
        },
      };
    },
    async create(data: any) {
      const doc = {
        _id: data._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
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
    async findOne(query: any) {
      return members.find((m) => m.email === query.email) || null;
    },
    findById(id: any) {
      const m = members.find((item) => item._id.toString() === String(id));
      return {
        select: async () => m,
        then: (resolve: any, reject: any) => Promise.resolve(m).then(resolve, reject),
      };
    },
  };

  const MockSetting = {
    find(query: any = {}) {
      let list = [...settings];
      if (query.isPublic !== undefined) {
        list = list.filter((s) => s.isPublic === query.isPublic);
      }
      return Promise.resolve(list);
    },
  };

  return {
    categories,
    products,
    members,
    settings,
    MockCategory,
    MockProduct,
    MockMember,
    MockSetting,
  };
});

// Mock models
vi.mock('../models', () => ({
  Category: MockCategory,
  Product: MockProduct,
  Member: MockMember,
  Setting: MockSetting,
}));
vi.mock('../services/cloudinaryService', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    publicId: 'sample_id',
  }),
  deleteImage: vi.fn().mockResolvedValue(undefined),
}));

import request from 'supertest';
import app from '../app';
import {
  buildWhatsAppLink,
  buildProductEnquiryLink,
  buildPartyBagsEnquiryLink,
} from '../utils/helpers';

describe('Phase 2 E2E Browse Flow & WhatsApp Integration', () => {
  const catBirthdayId = new mongoose.Types.ObjectId().toString();
  const catPartyBagsId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    categories.length = 0;
    products.length = 0;

    // Seed test categories
    categories.push(
      {
        _id: catBirthdayId,
        name: 'Celebration Cakes',
        slug: 'celebration-cakes',
        sortOrder: 1,
        isActive: true,
      },
      {
        _id: catPartyBagsId,
        name: 'Party Bags & Favors',
        slug: 'party-bags',
        sortOrder: 2,
        isActive: true,
      }
    );

    // Seed test products
    products.push(
      {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Signature Rose Lychee Cake',
        slug: 'signature-rose-lychee-cake',
        price: 48,
        category: catBirthdayId,
        description: 'Floral lychee sponge with delicate French rose Chantilly cream.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-rose-lychee',
            publicId: 'cake_rose_lychee',
          },
        ],
        variants: [
          {
            name: 'Size',
            options: ['6 inch (serves 6-8)', '8 inch (serves 10-14)'],
            priceModifiers: [0, 20],
          },
        ],
        supportsCustomization: true,
        featured: true,
        isActive: true,
        createdAt: new Date('2026-10-01'),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Belgian Dark Chocolate Cake',
        slug: 'belgian-dark-chocolate-cake',
        price: 52,
        category: catBirthdayId,
        description: '70% Valrhona dark chocolate mousse with crisp praline feuilletine.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-chocolate',
            publicId: 'cake_chocolate',
          },
        ],
        variants: [
          {
            name: 'Size',
            options: ['6 inch', '8 inch'],
            priceModifiers: [0, 22],
          },
        ],
        supportsCustomization: false,
        featured: false,
        isActive: true,
        createdAt: new Date('2026-10-05'),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Kids Joy Party Treat Bag',
        slug: 'kids-joy-party-treat-bag',
        price: 18,
        category: catPartyBagsId,
        description: 'Assorted artisan butter cookies, mini financiers, and fruit gummies.',
        images: [
          {
            url: 'https://images.unsplash.com/photo-party-bag',
            publicId: 'party_bag_joy',
          },
        ],
        variants: [],
        supportsCustomization: true,
        featured: true,
        isActive: true,
        createdAt: new Date('2026-10-10'),
      }
    );
  });

  describe('1. Storefront Public Navigation & Catalog Flow', () => {
    it('returns sorted categories for navigation and filter chips', async () => {
      const res = await request(app).get('/api/v1/public/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toHaveLength(2);
      expect(res.body.data.categories[0].name).toBe('Celebration Cakes');
      expect(res.body.data.categories[1].name).toBe('Party Bags & Favors');
    });

    it('filters products by category slug', async () => {
      const res = await request(app)
        .get('/api/v1/public/products')
        .query({ category: 'celebration-cakes' });

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(2);
      expect(
        res.body.data.products.every(
          (p: any) => p.category.toString() === catBirthdayId
        )
      ).toBe(true);
    });

    it('sorts products by price ascending', async () => {
      const res = await request(app)
        .get('/api/v1/public/products')
        .query({ sort: 'price_asc' });

      expect(res.status).toBe(200);
      const prices = res.body.data.products.map((p: any) => p.price);
      expect(prices).toEqual([18, 48, 52]);
    });

    it('sorts products by price descending', async () => {
      const res = await request(app)
        .get('/api/v1/public/products')
        .query({ sort: 'price_desc' });

      expect(res.status).toBe(200);
      const prices = res.body.data.products.map((p: any) => p.price);
      expect(prices).toEqual([52, 48, 18]);
    });

    it('searches products by keyword in name and description', async () => {
      const res = await request(app)
        .get('/api/v1/public/products')
        .query({ search: 'Valrhona' });

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].slug).toBe('belgian-dark-chocolate-cake');
    });

    it('paginates products correctly', async () => {
      const res = await request(app)
        .get('/api/v1/public/products')
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(2);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.totalPages).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    it('retrieves detailed product info by slug including options and customization flag', async () => {
      const res = await request(app).get(
        '/api/v1/public/products/signature-rose-lychee-cake'
      );

      expect(res.status).toBe(200);
      expect(res.body.data.product.name).toBe('Signature Rose Lychee Cake');
      expect(res.body.data.product.supportsCustomization).toBe(true);
      expect(res.body.data.product.variants).toHaveLength(1);
      expect(res.body.data.product.variants[0].name).toBe('Size');
      expect(res.body.data.product.variants[0].priceModifiers).toEqual([0, 20]);
    });
  });

  describe('2. WhatsApp Entry Points & Pre-filled Messaging', () => {
    const storePhone = '+60 12-345 6789';

    it('generates product enquiry link with selected variant and product page URL', () => {
      const url = buildProductEnquiryLink(storePhone, {
        productName: 'Signature Rose Lychee Cake',
        variants: { Size: '8 inch (serves 10-14)' },
        pageUrl: 'http://localhost:5173/products/signature-rose-lychee-cake',
        isCustom: false,
      });

      expect(url).toContain('https://wa.me/60123456789?text=');
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain('Signature Rose Lychee Cake');
      expect(decoded).toContain('Size: 8 inch (serves 10-14)');
      expect(decoded).toContain(
        'http://localhost:5173/products/signature-rose-lychee-cake'
      );
    });

    it('generates customization enquiry link when product supports customization', () => {
      const url = buildProductEnquiryLink(storePhone, {
        productName: 'Signature Rose Lychee Cake',
        variants: { Size: '8 inch' },
        isCustom: true,
      });

      const decoded = decodeURIComponent(url);
      expect(decoded).toContain(
        'I am interested in customizing your "Signature Rose Lychee Cake"'
      );
    });

    it('generates dedicated Party Bags enquiry link with guests, date, and theme', () => {
      const url = buildPartyBagsEnquiryLink(storePhone, {
        guestCount: 50,
        eventDate: '2026-11-20',
        theme: 'Pastel Garden Party',
      });

      const decoded = decodeURIComponent(url);
      expect(decoded).toContain('Party Bags / Celebration Favors');
      expect(decoded).toContain('Estimated Guests/Bags: 50');
      expect(decoded).toContain('Target Event Date: 2026-11-20');
      expect(decoded).toContain('Theme / Preferences: Pastel Garden Party');
    });
  });
});
