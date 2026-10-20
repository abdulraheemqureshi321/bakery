import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Hoist mock storage
const {
  orders,
  products,
  members,
  settings,
  MockOrder,
  MockProduct,
  MockMember,
  MockSetting,
  MockPointsTransaction,
  MockMemberVoucher,
  MockVoucher,
  MockReferralRecord,
} = vi.hoisted(() => {
  const orders: any[] = [];
  const products: any[] = [];
  const members: any[] = [];
  const settings: any[] = [
    { key: 'delivery_fee_rules', value: { flat: 12, freeAbove: 120 }, isPublic: true },
    { key: 'enabled_payment_methods', value: ['pay_in_store', 'cash_on_delivery'], isPublic: true },
    { key: 'points_earn_ratio', value: 1, isPublic: true },
    { key: 'currency', value: 'MYR', isPublic: true },
    { key: 'currency_symbol', value: 'RM', isPublic: true },
  ];

  const MockProduct = {
    find(query: any = {}) {
      let list = [...products];
      if (query._id && query._id.$in) {
        const idStrings = query._id.$in.map((id: any) => id.toString());
        list = list.filter((p) => idStrings.includes(p._id.toString()));
      }
      if (query.isActive !== undefined) {
        list = list.filter((p) => p.isActive === query.isActive);
      }
      return Promise.resolve(list);
    },
    findById(id: any) {
      const match = products.find((p) => p._id.toString() === String(id));
      return Promise.resolve(match || null);
    },
  };

  const MockSetting = {
    async findOne(query: any) {
      return settings.find((s) => s.key === query.key) || null;
    },
  };

  const MockMember = {
    async findById(id: any) {
      const match = members.find((m) => m._id.toString() === String(id));
      if (!match) return null;
      return {
        ...match,
        pointsBalance: match.pointsBalance || 0,
        async save() {
          return this;
        },
      };
    },
  };

  const MockPointsTransaction = {
    create: vi.fn().mockImplementation((data: any) => {
      const arr = Array.isArray(data) ? data : [data];
      return Promise.resolve(arr);
    }),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    }),
    countDocuments: vi.fn().mockResolvedValue(0),
  };

  const MockMemberVoucher = {
    findOne: vi.fn().mockResolvedValue(null),
    findOneAndUpdate: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
  };

  const MockVoucher = {
    findById: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
  };

  const MockOrder = {
    find(query: any = {}) {
      let list = [...orders];
      if (query.member) {
        list = list.filter((o) => o.member.toString() === query.member.toString());
      }
      if (query.status) {
        list = list.filter((o) => o.status === query.status);
      }

      const chain: any = {
        _skip: 0,
        _limit: 100,
        sort() {
          return chain;
        },
        skip(n: number) {
          chain._skip = n;
          return chain;
        },
        limit(n: number) {
          chain._limit = n;
          return chain;
        },
        populate() {
          return chain;
        },
        then(resolve: any, reject: any) {
          const slice = list.slice(chain._skip, chain._skip + chain._limit);
          return Promise.resolve(slice).then(resolve, reject);
        },
      };

      return chain;
    },
    async countDocuments(query: any = {}) {
      let list = [...orders];
      if (query.member) {
        list = list.filter((o) => o.member.toString() === query.member.toString());
      }
      if (query.status) {
        list = list.filter((o) => o.status === query.status);
      }
      return list.length;
    },
    findOne(query: any) {
      const match = orders.find((o) => {
        if (query.orderNumber && o.orderNumber !== query.orderNumber) return false;
        return true;
      });
      return Promise.resolve(match || null);
    },
    findById(id: any) {
      const match = orders.find((o) => o._id.toString() === String(id));
      return {
        populate: () => {
          if (!match) return Promise.resolve(null);
          const memberObj = members.find((m) => m._id.toString() === match.member.toString());
          return Promise.resolve({
            ...match,
            member: memberObj || { _id: match.member, name: 'Customer' },
            async save() {
              const idx = orders.findIndex((o) => o._id.toString() === String(id));
              if (idx !== -1) orders[idx] = this;
              return this;
            },
          });
        },
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          const doc = {
            ...match,
            async save() {
              const idx = orders.findIndex((o) => o._id.toString() === String(id));
              if (idx !== -1) orders[idx] = this;
              return this;
            },
          };
          return Promise.resolve(doc).then(resolve, reject);
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
      orders.push(doc);
      return doc;
    },
  };

  const MockReferralRecord = {
    findOne: () => ({ session: () => ({ then: (r: any) => Promise.resolve(null).then(r) }) }),
    findOneAndUpdate: () => ({ populate: () => Promise.resolve(null) }),
    create: () => Promise.resolve({}),
  };

  return {
    orders,
    products,
    members,
    settings,
    MockOrder,
    MockProduct,
    MockMember,
    MockSetting,
    MockPointsTransaction,
    MockMemberVoucher,
    MockVoucher,
    MockReferralRecord,
  };
});

// Mock models
vi.mock('../models', () => ({
  Order: MockOrder,
  Product: MockProduct,
  Member: MockMember,
  Setting: MockSetting,
  PointsTransaction: MockPointsTransaction,
  MemberVoucher: MockMemberVoucher,
  Voucher: MockVoucher,
  ReferralRecord: MockReferralRecord,
}));

import request from 'supertest';
import app from '../app';

describe('Phase 3 Order & Pricing Engine', () => {
  const memberId = new mongoose.Types.ObjectId().toString();
  const otherMemberId = new mongoose.Types.ObjectId().toString();
  const cakeId = new mongoose.Types.ObjectId().toString();
  const pastryId = new mongoose.Types.ObjectId().toString();

  let memberToken: string;
  let adminToken: string;

  beforeEach(() => {
    orders.length = 0;
    products.length = 0;
    members.length = 0;

    // Seed members
    members.push(
      {
        _id: memberId,
        name: 'Alice Tan',
        phone: '+60123456789',
        email: 'alice@example.com',
        role: 'member',
        isActive: true,
      },
      {
        _id: otherMemberId,
        name: 'Bob Lee',
        phone: '+60198765432',
        email: 'bob@example.com',
        role: 'member',
        isActive: true,
      }
    );

    // Seed products
    products.push(
      {
        _id: cakeId,
        name: 'Signature Rose Lychee Cake',
        price: 48,
        isActive: true,
        variants: [
          {
            name: 'Size',
            options: ['6 inch', '8 inch'],
            priceModifiers: [0, 20],
          },
        ],
      },
      {
        _id: pastryId,
        name: 'Matcha Opera Slice',
        price: 15,
        isActive: true,
        variants: [],
      }
    );

    // Create JWT tokens
    memberToken = jwt.sign(
      { id: memberId, role: 'member' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    adminToken = jwt.sign(
      { id: memberId, role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  });

  describe('1. Cart & Pricing Preview (POST /api/v1/orders/preview)', () => {
    it('calculates verified subtotal with variant price modifiers', async () => {
      const res = await request(app)
        .post('/api/v1/orders/preview')
        .send({
          fulfillmentType: 'pickup',
          items: [
            {
              productId: cakeId,
              quantity: 2,
              selectedVariants: { Size: '8 inch' }, // +20 each -> 68 * 2 = 136
            },
            {
              productId: pastryId,
              quantity: 1, // 15 * 1 = 15
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subtotal).toBe(151); // 136 + 15
      expect(res.body.data.deliveryFee).toBe(0); // pickup fee is always 0
      expect(res.body.data.totalAmount).toBe(151);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.items[0].variantPriceModifier).toBe(20);
      expect(res.body.data.items[0].lineTotal).toBe(136);
    });

    it('calculates flat delivery fee when subtotal is below free threshold', async () => {
      const res = await request(app)
        .post('/api/v1/orders/preview')
        .send({
          fulfillmentType: 'delivery',
          items: [
            {
              productId: pastryId,
              quantity: 2, // 15 * 2 = 30 (< 120 threshold)
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotal).toBe(30);
      expect(res.body.data.deliveryFee).toBe(12); // Flat RM12 fee
      expect(res.body.data.totalAmount).toBe(42); // 30 + 12
    });

    it('waives delivery fee (FREE) when subtotal reaches free threshold', async () => {
      const res = await request(app)
        .post('/api/v1/orders/preview')
        .send({
          fulfillmentType: 'delivery',
          items: [
            {
              productId: cakeId,
              quantity: 2, // 48 * 2 = 96
              selectedVariants: { Size: '8 inch' }, // +20 * 2 = 40 -> 136 (>= 120)
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotal).toBe(136);
      expect(res.body.data.deliveryFee).toBe(0); // Free delivery threshold met!
      expect(res.body.data.totalAmount).toBe(136);
    });
  });

  describe('2. Order Security: Client Tampered Prices are Ignored', () => {
    it('ignores client-sent prices and computes exclusively from database', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`accessToken=${memberToken}`])
        .send({
          fulfillmentType: 'pickup',
          pickupTime: '2:00 PM',
          paymentMethod: 'pay_in_store',
          items: [
            {
              productId: cakeId,
              quantity: 1,
              // Attempted price injection / tampering
              price: 0.01,
              productPrice: 0.01,
              variantPriceModifier: -50,
              lineTotal: 0.01,
              selectedVariants: { Size: '8 inch' },
            },
          ],
        });

      expect(res.status).toBe(201);
      const order = res.body.data.order;
      // Server must have computed 48 (base) + 20 (modifier) = 68.00
      expect(order.subtotal).toBe(68);
      expect(order.totalAmount).toBe(68);
      expect(order.items[0].productPrice).toBe(48);
      expect(order.items[0].variantPriceModifier).toBe(20);
      expect(order.items[0].lineTotal).toBe(68);
      expect(order.orderNumber).toMatch(/^ST-\d{8}-[A-Z0-9]{4}$/);
      expect(order.status).toBe('pending');
    });
  });

  describe('3. Order Validation & Fulfillment Requirements', () => {
    it('rejects pickup order without pickupTime', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`accessToken=${memberToken}`])
        .send({
          fulfillmentType: 'pickup',
          paymentMethod: 'pay_in_store',
          items: [{ productId: pastryId, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toContain('Pickup time slot is required');
    });

    it('rejects delivery order without deliveryAddress', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`accessToken=${memberToken}`])
        .send({
          fulfillmentType: 'delivery',
          paymentMethod: 'cash_on_delivery',
          items: [{ productId: pastryId, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toContain('Delivery address is required');
    });

    it('rejects disabled payment methods', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`accessToken=${memberToken}`])
        .send({
          fulfillmentType: 'pickup',
          pickupTime: '12:00 PM',
          paymentMethod: 'unauthorized_crypto_method',
          items: [{ productId: pastryId, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('is not enabled');
    });
  });

  describe('4. Member Orders & Admin Management Flow', () => {
    let createdOrderId: string;

    beforeEach(async () => {
      // Place a sample order
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`accessToken=${memberToken}`])
        .send({
          fulfillmentType: 'delivery',
          deliveryAddress: '123 Jalan Ampang, Kuala Lumpur',
          paymentMethod: 'cash_on_delivery',
          items: [{ productId: cakeId, quantity: 1 }],
        });

      createdOrderId = res.body.data.order._id;
    });

    it('allows member to list their orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Cookie', [`accessToken=${memberToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0]._id).toBe(createdOrderId);
    });

    it('allows member to view their order detail', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${createdOrderId}`)
        .set('Cookie', [`accessToken=${memberToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.order.deliveryAddress).toBe('123 Jalan Ampang, Kuala Lumpur');
    });

    it('prevents another member from accessing an order they do not own', async () => {
      const otherToken = jwt.sign(
        { id: otherMemberId, role: 'member' },
        env.JWT_ACCESS_SECRET
      );

      const res = await request(app)
        .get(`/api/v1/orders/${createdOrderId}`)
        .set('Cookie', [`accessToken=${otherToken}`]);

      expect(res.status).toBe(403);
    });

    it('allows admin to list all orders and filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders?status=pending')
        .set('Cookie', [`accessToken=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
    });

    it('allows admin to transition order status to confirmed and completed', async () => {
      // Transition to confirmed
      const confirmRes = await request(app)
        .put(`/api/v1/admin/orders/${createdOrderId}/status`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send({ status: 'confirmed' });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.order.status).toBe('confirmed');

      // Transition to completed
      const completeRes = await request(app)
        .put(`/api/v1/admin/orders/${createdOrderId}/status`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send({ status: 'completed', paymentStatus: 'paid' });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.order.status).toBe('completed');
      expect(completeRes.body.data.order.paymentStatus).toBe('paid');
    });
  });
});
