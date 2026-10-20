import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Mock storage
const {
  orders,
  products,
  members,
  vouchers,
  memberVouchers,
  pointsTransactions,
  settings,
  MockOrder,
  MockProduct,
  MockMember,
  MockVoucher,
  MockMemberVoucher,
  MockPointsTransaction,
  MockSetting,
  MockReferralRecord,
} = vi.hoisted(() => {
  const orders: any[] = [];
  const products: any[] = [];
  const members: any[] = [];
  const vouchers: any[] = [];
  const memberVouchers: any[] = [];
  const pointsTransactions: any[] = [];
  const settings: any[] = [
    { key: 'delivery_fee_rules', value: { flat: 10, freeAbove: 150 }, isPublic: true },
    { key: 'enabled_payment_methods', value: ['pay_in_store', 'cash_on_delivery'], isPublic: true },
    { key: 'points_earn_ratio', value: 1, isPublic: true },
    { key: 'points_redeem_ratio', value: 0.01, isPublic: true },
    { key: 'points_min_redeem', value: 100, isPublic: true },
    { key: 'points_max_order_share_percent', value: 50, isPublic: true },
    { key: 'points_credit_event', value: 'order_completed', isPublic: true },
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
    findById(id: any) {
      const match = members.find((m) => m._id.toString() === String(id));
      const chain: any = {
        select: () => chain,
        session: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          const doc = {
            ...match,
            pointsBalance: match.pointsBalance ?? 0,
            async save() {
              match.pointsBalance = this.pointsBalance;
              const idx = members.findIndex((m) => m._id.toString() === String(id));
              if (idx !== -1) members[idx] = match;
              return this;
            },
          };
          return Promise.resolve(doc).then(resolve, reject);
        },
      };
      return chain;
    },
    find(query: any = {}) {
      let list = [...members];
      if (query.role) list = list.filter((m) => m.role === query.role);
      if (query.isActive !== undefined) list = list.filter((m) => m.isActive === query.isActive);
      const chain: any = {
        select: (fields: string) => {
          if (fields === '_id') {
            return Promise.resolve(list.map((m) => ({ _id: m._id })));
          }
          return Promise.resolve(list);
        },
        lean: () => Promise.resolve(list),
        then(resolve: any, reject: any) {
          return Promise.resolve(list).then(resolve, reject);
        },
      };
      return chain;
    },
    async updateOne(filter: any, update: any) {
      const match = members.find((m) => m._id.toString() === String(filter._id));
      if (match && update.$inc && update.$inc.pointsBalance !== undefined) {
        match.pointsBalance = (match.pointsBalance || 0) + update.$inc.pointsBalance;
      }
      return { modifiedCount: 1 };
    },
  };

  const MockVoucher = {
    findById(id: any) {
      const match = vouchers.find((v) => v._id.toString() === String(id));
      const chain: any = {
        session: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          const doc = {
            ...match,
            async save() {
              const idx = vouchers.findIndex((v) => v._id.toString() === String(id));
              if (idx !== -1) vouchers[idx] = { ...this };
              return this;
            },
          };
          return Promise.resolve(doc).then(resolve, reject);
        },
      };
      return chain;
    },
    findOne(query: any) {
      let match = vouchers.find((v) => {
        if (query.code && v.code.toUpperCase() !== String(query.code).toUpperCase()) return false;
        if (query.isActive !== undefined && v.isActive !== query.isActive) return false;
        if (query._id && query._id.$ne && v._id.toString() === String(query._id.$ne)) return false;
        return true;
      });
      const chain: any = {
        session: () => chain,
        then(resolve: any, reject: any) {
          return Promise.resolve(match || null).then(resolve, reject);
        },
      };
      return chain;
    },
    find(query: any = {}) {
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve([...vouchers]),
            }),
          }),
        }),
      };
    },
    countDocuments: vi.fn().mockImplementation(() => Promise.resolve(vouchers.length)),
    async create(data: any) {
      const doc = {
        _id: data._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        usedCount: 0,
        isActive: true,
        validFrom: data.validFrom || new Date(),
        validUntil: data.validUntil || new Date(Date.now() + 86400000),
        minOrderAmount: data.minOrderAmount || 0,
        perMemberLimit: data.perMemberLimit || 1,
        ...data,
      };
      vouchers.push(doc);
      return doc;
    },
  };

  const MockMemberVoucher = {
    findOne(query: any) {
      let match = memberVouchers.find((mv) => {
        if (query._id && mv._id.toString() !== String(query._id)) return false;
        if (query.member && mv.member.toString() !== String(query.member)) return false;
        if (query.voucher && mv.voucher.toString() !== String(query.voucher)) return false;
        if (query.code && mv.code?.toUpperCase() !== String(query.code).toUpperCase()) return false;
        if (query.isUsed !== undefined && mv.isUsed !== query.isUsed) return false;
        if (query.usedInOrder && mv.usedInOrder?.toString() !== String(query.usedInOrder)) return false;
        return true;
      });

      const chain: any = {
        populate: () => chain,
        session: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          const v = vouchers.find((vouch) => vouch._id.toString() === match.voucher.toString());
          const doc = {
            ...match,
            voucher: v || { _id: match.voucher },
            async save() {
              match.isUsed = this.isUsed;
              match.usedAt = this.usedAt;
              match.usedInOrder = this.usedInOrder;
              const idx = memberVouchers.findIndex((item) => item._id.toString() === match._id.toString());
              if (idx !== -1) memberVouchers[idx] = match;
              return this;
            },
          };
          return Promise.resolve(doc).then(resolve, reject);
        },
      };
      return chain;
    },
    async findOneAndUpdate(filter: any, update: any) {
      // Simulates atomic conditional lock:
      const match = memberVouchers.find((mv) => {
        if (filter._id && mv._id.toString() !== String(filter._id)) return false;
        if (filter.isUsed !== undefined && mv.isUsed !== filter.isUsed) return false;
        if (filter.expiresAt?.$gt && new Date(mv.expiresAt).getTime() <= new Date(filter.expiresAt.$gt).getTime()) return false;
        return true;
      });
      if (!match) return null;

      if (update.$set) {
        Object.assign(match, update.$set);
      }
      return match;
    },
    async countDocuments(query: any = {}) {
      let list = [...memberVouchers];
      if (query.member) list = list.filter((mv) => mv.member.toString() === String(query.member));
      if (query.voucher) list = list.filter((mv) => mv.voucher.toString() === String(query.voucher));
      if (query.isUsed !== undefined) list = list.filter((mv) => mv.isUsed === query.isUsed);
      return list.length;
    },
    find(query: any = {}) {
      let list = [...memberVouchers];
      if (query.member) list = list.filter((mv) => mv.member.toString() === String(query.member));
      if (query.isUsed !== undefined) list = list.filter((mv) => mv.isUsed === query.isUsed);
      const chain: any = {
        populate: () => chain,
        sort: () => chain,
        lean: () =>
          Promise.resolve(
            list.map((mv) => {
              const v = vouchers.find((vouch) => vouch._id.toString() === mv.voucher.toString());
              return { ...mv, voucher: v };
            })
          ),
        then(resolve: any, reject: any) {
          return Promise.resolve(
            list.map((mv) => {
              const v = vouchers.find((vouch) => vouch._id.toString() === mv.voucher.toString());
              return { ...mv, voucher: v };
            })
          ).then(resolve, reject);
        },
      };
      return chain;
    },
    async insertMany(docs: any[]) {
      for (const d of docs) {
        memberVouchers.push({
          _id: d._id || new mongoose.Types.ObjectId().toString(),
          createdAt: new Date(),
          isUsed: false,
          ...d,
        });
      }
      return docs;
    },
    async create(data: any) {
      const doc = {
        _id: data._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        isUsed: false,
        ...data,
      };
      memberVouchers.push(doc);
      return doc;
    },
    async updateOne(filter: any, update: any) {
      const match = memberVouchers.find((mv) => mv._id.toString() === String(filter._id));
      if (match && update.$set) {
        Object.assign(match, update.$set);
      }
      return { modifiedCount: 1 };
    },
  };

  const MockPointsTransaction = {
    async create(data: any) {
      const arr = Array.isArray(data) ? data : [data];
      const createdDocs = arr.map((item: any) => ({
        _id: item._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        ...item,
      }));
      pointsTransactions.push(...createdDocs);
      return Array.isArray(data) ? createdDocs : createdDocs[0];
    },
    find(query: any = {}) {
      let list = [...pointsTransactions];
      if (query.member) list = list.filter((pt) => pt.member.toString() === String(query.member));
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              populate: () => ({
                lean: () => Promise.resolve(list),
              }),
            }),
          }),
        }),
      };
    },
    countDocuments(query: any = {}) {
      let list = [...pointsTransactions];
      if (query.member) list = list.filter((pt) => pt.member.toString() === String(query.member));
      return Promise.resolve(list.length);
    },
  };

  const MockOrder = {
    find(query: any = {}) {
      let list = [...orders];
      if (query.member) list = list.filter((o) => o.member.toString() === String(query.member));
      return {
        sort: () => ({
          skip: () => ({
            limit: () => Promise.resolve(list),
          }),
        }),
      };
    },
    async findOne(query: any) {
      return orders.find((o) => {
        if (query._id && o._id.toString() !== String(query._id)) return false;
        if (query.orderNumber && o.orderNumber !== query.orderNumber) return false;
        return true;
      }) || null;
    },
    findById(id: any) {
      const match = orders.find((o) => o._id.toString() === String(id));
      const chain: any = {
        session: () => chain,
        populate: () => {
          if (!match) return Promise.resolve(null);
          const memberObj = members.find((m) => m._id.toString() === match.member.toString());
          return Promise.resolve({
            ...match,
            member: memberObj || { _id: match.member, name: 'Customer' },
            async save() {
              const idx = orders.findIndex((o) => o._id.toString() === String(id));
              if (idx !== -1) orders[idx] = { ...this };
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
              if (idx !== -1) orders[idx] = { ...this };
              return this;
            },
          };
          return Promise.resolve(doc).then(resolve, reject);
        },
      };
      return chain;
    },
    async create(data: any) {
      const arr = Array.isArray(data) ? data : [data];
      const createdDocs = arr.map((d: any) => ({
        _id: d._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...d,
      }));
      orders.push(...createdDocs);
      return Array.isArray(data) ? createdDocs : createdDocs[0];
    },
  };

  return {
    orders,
    products,
    members,
    vouchers,
    memberVouchers,
    pointsTransactions,
    settings,
    MockOrder,
    MockProduct,
    MockMember,
    MockVoucher,
    MockMemberVoucher,
    MockPointsTransaction,
    MockSetting,
    MockReferralRecord: {
      findOne: () => ({ session: () => ({ then: (r: any) => Promise.resolve(null).then(r) }) }),
      findOneAndUpdate: () => ({ populate: () => Promise.resolve(null) }),
      create: () => Promise.resolve({}),
    },
  };
});

// Mock models module
vi.mock('../models', () => ({
  Order: MockOrder,
  Product: MockProduct,
  Member: MockMember,
  Voucher: MockVoucher,
  MemberVoucher: MockMemberVoucher,
  PointsTransaction: MockPointsTransaction,
  Setting: MockSetting,
  ReferralRecord: {
    findOne: () => ({ session: () => ({ then: (r: any) => Promise.resolve(null).then(r) }) }),
    create: () => Promise.resolve({}),
  },
}));

import request from 'supertest';
import app from '../app';
import * as pointsService from '../services/pointsService';
import * as voucherService from '../services/voucherService';

describe('Phase 5 Points & Vouchers System', () => {
  const memberId = new mongoose.Types.ObjectId().toString();
  const cakeId = new mongoose.Types.ObjectId().toString();

  let memberToken: string;
  let adminToken: string;

  beforeEach(() => {
    orders.length = 0;
    products.length = 0;
    members.length = 0;
    vouchers.length = 0;
    memberVouchers.length = 0;
    pointsTransactions.length = 0;

    // Seed test member
    members.push({
      _id: memberId,
      name: 'Bob Tan',
      phone: '+60128888888',
      email: 'bob@example.com',
      role: 'member',
      isActive: true,
      pointsBalance: 500, // RM 5.00 worth at 0.01 ratio
    });

    // Seed test cake
    products.push({
      _id: cakeId,
      name: 'Signature Chocolate Cake',
      slug: 'signature-chocolate-cake',
      price: 100,
      isActive: true,
      variants: [],
    });

    memberToken = jwt.sign(
      { id: memberId, role: 'member' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    adminToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  });

  describe('1. Points Discount Math & Rules', () => {
    it('calculates points discount correctly and respects 50% max order share cap', async () => {
      const rules = await pointsService.getPointsRules();
      // Subtotal RM 100. Member balance 500 points. Requested 500 points.
      // 50% cap = RM 50 cap (which is 5000 points).
      // At 0.01 ratio, 500 points = RM 5.00.
      const res = pointsService.calculatePointsDiscount(100, 500, 500, rules);
      expect(res.pointsRedeemed).toBe(500);
      expect(res.pointsDiscount).toBe(5);

      // If order is small, say RM 8.00:
      // Max 50% cap = RM 4.00 (which is 400 points).
      // If member tries to redeem 500 points, it must cap at 400 points (RM 4.00).
      const cappedRes = pointsService.calculatePointsDiscount(8, 500, 500, rules);
      expect(cappedRes.pointsRedeemed).toBe(400);
      expect(cappedRes.pointsDiscount).toBe(4);
    });

    it('enforces minimum redeem points rule', async () => {
      const rules = await pointsService.getPointsRules();
      // Default min redeem is 100 points
      expect(() => pointsService.calculatePointsDiscount(100, 50, 500, rules))
        .toThrow(/Minimum points to redeem is 100/);
    });

    it('rejects redeeming more points than member current balance', async () => {
      const rules = await pointsService.getPointsRules();
      // Bob only has 500 points
      expect(() => pointsService.calculatePointsDiscount(100, 600, 500, rules))
        .toThrow(/Insufficient points balance/);
    });

    it('never allows negative points balance during adjustment', async () => {
      // Attempting to deduct 600 points when balance is 500
      await expect(
        pointsService.adjustPoints(
          memberId,
          -600,
          'redeem',
          'Test over-redemption'
        )
      ).rejects.toThrow(/Insufficient points balance/);
    });
  });

  describe('2. Voucher Math & Combination Sequence', () => {
    it('applies voucher first, then points on remaining amount', async () => {
      // Create a 20% voucher with min spend 50
      const voucher = await MockVoucher.create({
        code: 'PROMO20',
        name: '20% Off',
        type: 'percentage',
        value: 20,
        minOrderAmount: 50,
        validUntil: new Date(Date.now() + 86400000),
      });

      await MockMemberVoucher.create({
        member: memberId,
        voucher: voucher._id,
        code: 'PROMO20',
        expiresAt: new Date(Date.now() + 86400000),
      });

      // Subtotal RM 100. Delivery flat RM 10.
      // Voucher 20% off RM 100 = RM 20 discount.
      // Remaining for points = RM 100 - RM 20 = RM 80.
      // Member redeems 500 points = RM 5 discount.
      // Final total = (RM 100 - RM 20 - RM 5) + RM 10 delivery = RM 85.
      const previewRes = await request(app)
        .post('/api/v1/orders/preview')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [{ productId: cakeId, quantity: 1 }],
          fulfillmentType: 'delivery',
          voucherCode: 'PROMO20',
          redeemPoints: 500,
        });

      expect(previewRes.status).toBe(200);
      expect(previewRes.body.data.subtotal).toBe(100);
      expect(previewRes.body.data.voucherDiscount).toBe(20);
      expect(previewRes.body.data.pointsDiscount).toBe(5);
      expect(previewRes.body.data.deliveryFee).toBe(10);
      expect(previewRes.body.data.totalAmount).toBe(85);
    });

    it('enforces voucher minimum spend', async () => {
      const voucher = await MockVoucher.create({
        code: 'BIGSPEND',
        name: 'RM 30 Off Above 200',
        type: 'fixed',
        value: 30,
        minOrderAmount: 200,
        validUntil: new Date(Date.now() + 86400000),
      });

      await MockMemberVoucher.create({
        member: memberId,
        voucher: voucher._id,
        code: 'BIGSPEND',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .post('/api/v1/orders/preview')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [{ productId: cakeId, quantity: 1 }], // subtotal 100 < 200
          fulfillmentType: 'pickup',
          voucherCode: 'BIGSPEND',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Minimum order amount/i);
    });

    it('enforces voucher expiry date', async () => {
      const voucher = await MockVoucher.create({
        code: 'EXPIRED10',
        name: 'Expired Voucher',
        type: 'fixed',
        value: 10,
        minOrderAmount: 0,
        validUntil: new Date(Date.now() - 10000), // Expired
      });

      await MockMemberVoucher.create({
        member: memberId,
        voucher: voucher._id,
        code: 'EXPIRED10',
        expiresAt: new Date(Date.now() - 10000),
      });

      const res = await request(app)
        .post('/api/v1/orders/preview')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [{ productId: cakeId, quantity: 1 }],
          fulfillmentType: 'pickup',
          voucherCode: 'EXPIRED10',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/expired/i);
    });
  });

  describe('3. Concurrency Protection (Double-Voucher & Double-Redemption)', () => {
    it('prevents double voucher use under simultaneous concurrent checkout requests', async () => {
      const voucher = await MockVoucher.create({
        code: 'SINGLEUSE',
        name: 'Single Use RM 15',
        type: 'fixed',
        value: 15,
        minOrderAmount: 50,
        validUntil: new Date(Date.now() + 86400000),
      });

      await MockMemberVoucher.create({
        member: memberId,
        voucher: voucher._id,
        code: 'SINGLEUSE',
        expiresAt: new Date(Date.now() + 86400000),
        isUsed: false,
      });

      // Fire 2 concurrent order checkout requests using the same voucher
      const orderPayload = {
        items: [{ productId: cakeId, quantity: 1 }],
        fulfillmentType: 'pickup',
        pickupTime: '11:00 AM - 01:00 PM',
        date: '2026-10-25',
        paymentMethod: 'pay_in_store',
        voucherCode: 'SINGLEUSE',
      };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/orders').set('Authorization', `Bearer ${memberToken}`).send(orderPayload),
        request(app).post('/api/v1/orders').set('Authorization', `Bearer ${memberToken}`).send(orderPayload),
      ]);

      const statuses = [res1.status, res2.status];
      // Exactly one request must succeed (201) and one must be rejected (400)
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);

      const failedRes = res1.status === 400 ? res1 : res2;
      expect(failedRes.body.message).toMatch(/already been used/i);
    });

    it('prevents double points redemption exceeding member balance', async () => {
      // Bob has 500 points. Both requests try to redeem 400 points.
      // Total would be 800 points > 500 points.
      // Exactly one must succeed, or second fails with insufficient balance.
      const orderPayload = {
        items: [{ productId: cakeId, quantity: 1 }],
        fulfillmentType: 'pickup',
        pickupTime: '11:00 AM - 01:00 PM',
        date: '2026-10-25',
        paymentMethod: 'pay_in_store',
        redeemPoints: 400,
      };

      const [res1, res2] = await Promise.all([
        request(app).post('/api/v1/orders').set('Authorization', `Bearer ${memberToken}`).send(orderPayload),
        request(app).post('/api/v1/orders').set('Authorization', `Bearer ${memberToken}`).send(orderPayload),
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);

      const failedRes = res1.status === 400 ? res1 : res2;
      expect(failedRes.body.message).toMatch(/Insufficient points/i);
    });
  });

  describe('4. Order Cancellation, Points Reversal & Voucher Restoration', () => {
    it('restores redeemed points and marks voucher unused upon order cancellation', async () => {
      const voucher = await MockVoucher.create({
        code: 'RESTOREME',
        name: 'Restore Voucher',
        type: 'fixed',
        value: 10,
        minOrderAmount: 50,
        validUntil: new Date(Date.now() + 86400000),
      });

      await MockMemberVoucher.create({
        member: memberId,
        voucher: voucher._id,
        code: 'RESTOREME',
        expiresAt: new Date(Date.now() + 86400000),
        isUsed: false,
      });

      // Place order using 300 points and RESTOREME voucher
      const createRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [{ productId: cakeId, quantity: 1 }],
          fulfillmentType: 'pickup',
          pickupTime: '11:00 AM - 01:00 PM',
          date: '2026-10-25',
          paymentMethod: 'pay_in_store',
          voucherCode: 'RESTOREME',
          redeemPoints: 300,
        });

      expect(createRes.status).toBe(201);
      const orderId = createRes.body.data.order._id;

      // Bob's points balance should have dropped from 500 to 200
      const bob = members.find((m) => m._id.toString() === memberId);
      expect(bob.pointsBalance).toBe(200);

      // Voucher is now used
      const voucherDoc = memberVouchers.find((v) => v.code === 'RESTOREME');
      expect(voucherDoc.isUsed).toBe(true);

      // Member cancels order
      const cancelRes = await request(app)
        .post(`/api/v1/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ reason: 'Customer changed mind' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.order.status).toBe('cancelled');

      // Points balance should be restored to 500
      expect(bob.pointsBalance).toBe(500);

      // Voucher is restored
      expect(voucherDoc.isUsed).toBe(false);
      expect(voucherDoc.usedAt).toBeFalsy();
    });

    it('reverses earned points if order was completed and then cancelled/refunded', async () => {
      // Create simple order
      const createRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [{ productId: cakeId, quantity: 1 }], // RM 100
          fulfillmentType: 'pickup',
          pickupTime: '11:00 AM - 01:00 PM',
          date: '2026-10-25',
          paymentMethod: 'pay_in_store',
        });

      const orderId = createRes.body.data.order._id;
      const bob = members.find((m) => m._id.toString() === memberId);
      expect(bob.pointsBalance).toBe(500);

      // Admin completes order -> credits 100 points
      const completeRes = await request(app)
        .put(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed', paymentStatus: 'paid' });

      expect(completeRes.status).toBe(200);
      expect(bob.pointsBalance).toBe(600); // 500 + 100

      // Admin cancels order -> reverses the 100 credited points
      const cancelRes = await request(app)
        .put(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' });

      expect(cancelRes.status).toBe(200);
      expect(bob.pointsBalance).toBe(500); // Back to 500
    });
  });

  describe('5. Admin Voucher Management & Points Adjustment', () => {
    it('admin can create and issue vouchers to all members', async () => {
      const createRes = await request(app)
        .post('/api/v1/admin/vouchers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'WELCOME10',
          name: 'Welcome 10% Off',
          type: 'percentage',
          value: 10,
          minSpend: 30,
          validDays: 14,
          description: 'Welcome gift for all members',
        });

      expect(createRes.status).toBe(201);
      const voucherId = createRes.body.data.voucher._id;

      // Issue to all members
      const issueRes = await request(app)
        .post(`/api/v1/admin/vouchers/${voucherId}/issue`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ target: 'all' });

      expect(issueRes.status).toBe(200);
      expect(issueRes.body.data.issuedCount).toBeGreaterThanOrEqual(1);

      // Verify member sees voucher in wallet
      const memberVouchersRes = await request(app)
        .get('/api/v1/auth/vouchers')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(memberVouchersRes.status).toBe(200);
      const codes = memberVouchersRes.body.data.vouchers.map((v: any) => v.voucher?.code || v.code);
      expect(codes).toContain('WELCOME10');
    });

    it('admin can manually adjust member points with a documented reason', async () => {
      const adjustRes = await request(app)
        .post('/api/v1/admin/points/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          memberId,
          amount: 250,
          reason: 'Customer goodwill compensation for delivery delay',
        });

      expect(adjustRes.status).toBe(200);
      expect(adjustRes.body.data.member.pointsBalance).toBe(750); // 500 + 250

      // Member points history shows the manual adjustment
      const historyRes = await request(app)
        .get('/api/v1/auth/points/history')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(historyRes.status).toBe(200);
      const tx = historyRes.body.data.transactions.find(
        (t: any) => t.type === 'adjust' && t.amount === 250
      );
      expect(tx).toBeDefined();
      expect(tx.description || tx.reason).toBe('Customer goodwill compensation for delivery delay');
    });
  });
});
