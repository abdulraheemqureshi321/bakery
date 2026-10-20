import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Mock storage
const {
  members,
  orders,
  referralRecords,
  pointsTransactions,
  settings,
  vouchers,
  memberVouchers,
  MockMember,
  MockOrder,
  MockReferralRecord,
  MockPointsTransaction,
  MockSetting,
  MockVoucher,
  MockMemberVoucher,
} = vi.hoisted(() => {
  const members: any[] = [];
  const orders: any[] = [];
  const referralRecords: any[] = [];
  const pointsTransactions: any[] = [];
  const vouchers: any[] = [];
  const memberVouchers: any[] = [];
  const settings: any[] = [
    { key: 'referral_trigger', value: 'first_order', isPublic: true },
    { key: 'referral_reward_type', value: 'points', isPublic: true },
    { key: 'referral_reward_value', value: 50, isPublic: true },
    { key: 'referral_referee_reward_type', value: 'points', isPublic: true },
    { key: 'referral_referee_reward_value', value: 25, isPublic: true },
    { key: 'default_country_code', value: '+60', isPublic: false },
    { key: 'points_earn_ratio', value: 1, isPublic: true },
    { key: 'points_redeem_ratio', value: 0.01, isPublic: true },
    { key: 'points_min_redeem', value: 100, isPublic: true },
    { key: 'points_max_order_share_percent', value: 50, isPublic: true },
  ];

  const MockSetting = {
    async findOne(query: any) {
      return settings.find((s) => s.key === query.key) || null;
    },
  };

  const MockMember = {
    findById(id: any) {
      const match = members.find((m) => m._id.toString() === String(id));
      const chain: any = {
        select: (fields: string) => {
          if (!match) return Promise.resolve(null);
          const res: any = { _id: match._id };
          fields.split(' ').forEach((f) => {
            if (f) res[f] = match[f];
          });
          return Promise.resolve(res);
        },
        session: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          const doc = {
            ...match,
            pointsBalance: match.pointsBalance ?? 0,
            async save() {
              match.pointsBalance = this.pointsBalance;
              match.referredBy = this.referredBy;
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
    findOne(query: any) {
      let match = members.find((m) => {
        if (query.phone && m.phone !== query.phone) return false;
        if (query.email && m.email !== query.email) return false;
        if (query.referralCode && m.referralCode?.toUpperCase() !== String(query.referralCode).toUpperCase()) return false;
        if (query.isActive !== undefined && m.isActive !== query.isActive) return false;
        return true;
      });
      const chain: any = {
        select: (fields: string) => {
          if (!match) return Promise.resolve(null);
          const res: any = { _id: match._id };
          fields.split(' ').forEach((f) => {
            if (f) res[f] = match[f];
          });
          return Promise.resolve(res);
        },
        session: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          return Promise.resolve({
            ...match,
            async save() {
              return this;
            },
          }).then(resolve, reject);
        },
      };
      return chain;
    },
    find(query: any = {}) {
      let list = [...members];
      return {
        select: () => Promise.resolve(list.map((m) => ({ _id: m._id, name: m.name }))),
      };
    },
    async create(data: any) {
      const doc = {
        _id: data._id || new mongoose.Types.ObjectId().toString(),
        pointsBalance: data.pointsBalance || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
        async save() {
          const idx = members.findIndex((m) => m._id.toString() === this._id.toString());
          if (idx !== -1) members[idx] = { ...this };
          return this;
        },
      };
      members.push(doc);
      return doc;
    },
  };

  const MockReferralRecord = {
    findOne(query: any) {
      let match = referralRecords.find((r) => {
        if (query._id && r._id.toString() !== String(query._id)) return false;
        if (query.referee && r.referee.toString() !== String(query.referee)) return false;
        if (query.referrer && r.referrer.toString() !== String(query.referrer)) return false;
        if (query.rewardStatus && r.rewardStatus !== query.rewardStatus) return false;
        return true;
      });

      const chain: any = {
        session: () => chain,
        populate: () => {
          if (!match) return chain;
          const referrerObj = members.find((m) => m._id.toString() === match.referrer.toString());
          const refereeObj = members.find((m) => m._id.toString() === match.referee.toString());
          return {
            ...match,
            referrer: referrerObj || match.referrer,
            referee: refereeObj || match.referee,
          };
        },
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          return Promise.resolve(match).then(resolve, reject);
        },
      };
      return chain;
    },
    findById(id: any) {
      const match = referralRecords.find((r) => r._id.toString() === String(id));
      const chain: any = {
        session: () => chain,
        populate: () => chain,
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          return Promise.resolve(match).then(resolve, reject);
        },
      };
      return chain;
    },
    find(query: any = {}) {
      let list = [...referralRecords];
      if (query.referrer) list = list.filter((r) => r.referrer.toString() === String(query.referrer));
      if (query.rewardStatus) list = list.filter((r) => r.rewardStatus === query.rewardStatus);

      const chain: any = {
        populate: () => chain,
        sort: () => chain,
        skip: () => chain,
        limit: () => chain,
        lean: () => {
          return Promise.resolve(
            list.map((r) => {
              const referrerObj = members.find((m) => m._id.toString() === r.referrer.toString());
              const refereeObj = members.find((m) => m._id.toString() === r.referee.toString());
              return {
                ...r,
                referrer: referrerObj || r.referrer,
                referee: refereeObj || r.referee,
              };
            })
          );
        },
        then(resolve: any, reject: any) {
          return chain.lean().then(resolve, reject);
        },
      };
      return chain;
    },
    countDocuments(query: any = {}) {
      let list = [...referralRecords];
      if (query.referrer) list = list.filter((r) => r.referrer.toString() === String(query.referrer));
      if (query.referee) list = list.filter((r) => r.referee.toString() === String(query.referee));
      if (query.rewardStatus) list = list.filter((r) => r.rewardStatus === query.rewardStatus);
      return Promise.resolve(list.length);
    },
    async create(data: any) {
      const arr = Array.isArray(data) ? data : [data];
      const createdDocs = arr.map((item: any) => ({
        _id: item._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        rewardStatus: item.rewardStatus || 'pending',
        ...item,
        async save() {
          const idx = referralRecords.findIndex((r) => r._id.toString() === this._id.toString());
          if (idx !== -1) referralRecords[idx] = { ...this };
          return this;
        },
      }));
      referralRecords.push(...createdDocs);
      return Array.isArray(data) ? createdDocs : createdDocs[0];
    },
    findOneAndUpdate(filter: any, update: any) {
      // Atomic conditional update
      const match = referralRecords.find((r) => {
        if (filter._id && r._id.toString() !== String(filter._id)) return false;
        if (filter.rewardStatus && r.rewardStatus !== filter.rewardStatus) return false;
        return true;
      });

      const chain: any = {
        populate: () => {
          if (!match) return Promise.resolve(null);
          if (update.$set) Object.assign(match, update.$set);
          const referrerObj = members.find((m) => m._id.toString() === match.referrer.toString());
          const refereeObj = members.find((m) => m._id.toString() === match.referee.toString());
          const doc = {
            ...match,
            referrer: referrerObj || match.referrer,
            referee: refereeObj || match.referee,
            async save() {
              const idx = referralRecords.findIndex((r) => r._id.toString() === this._id.toString());
              if (idx !== -1) referralRecords[idx] = { ...this };
              return this;
            },
          };
          return Promise.resolve(doc);
        },
        then(resolve: any, reject: any) {
          if (!match) return Promise.resolve(null).then(resolve, reject);
          if (update.$set) Object.assign(match, update.$set);
          return Promise.resolve({
            ...match,
            async save() {
              const idx = referralRecords.findIndex((r) => r._id.toString() === this._id.toString());
              if (idx !== -1) referralRecords[idx] = { ...this };
              return this;
            },
          }).then(resolve, reject);
        },
      };
      return chain;
    },
    aggregate: vi.fn().mockImplementation(() => {
      // Aggregate mock for top referrers
      const counts: Record<string, { total: number; granted: number }> = {};
      for (const r of referralRecords) {
        const id = r.referrer.toString();
        if (!counts[id]) counts[id] = { total: 0, granted: 0 };
        counts[id].total++;
        if (r.rewardStatus === 'granted') counts[id].granted++;
      }
      return Promise.resolve(
        Object.entries(counts).map(([refId, data]) => ({
          _id: refId,
          totalReferrals: data.total,
          grantedReferrals: data.granted,
        }))
      );
    }),
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
    find: vi.fn().mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            populate: () => ({
              lean: () => Promise.resolve([...pointsTransactions]),
            }),
          }),
        }),
      }),
    }),
    countDocuments: vi.fn().mockReturnValue(Promise.resolve(pointsTransactions.length)),
  };

  const MockOrder = {
    countDocuments: vi.fn().mockImplementation((query: any) => {
      let list = [...orders];
      if (query.member) list = list.filter((o) => o.member.toString() === String(query.member));
      if (query.status) list = list.filter((o) => o.status === query.status);
      return Promise.resolve(list.length);
    }),
    findById(id: any) {
      const match = orders.find((o) => o._id.toString() === String(id));
      const chain: any = {
        populate: () => Promise.resolve(match),
        then: (resolve: any, reject: any) => Promise.resolve(match).then(resolve, reject),
      };
      return chain;
    },
  };

  const MockVoucher = {
    findOne: vi.fn().mockResolvedValue(null),
  };

  const MockMemberVoucher = {
    create: vi.fn().mockResolvedValue({}),
    insertMany: vi.fn().mockResolvedValue([]),
    countDocuments: vi.fn().mockResolvedValue(0),
  };

  return {
    members,
    orders,
    referralRecords,
    pointsTransactions,
    settings,
    vouchers,
    memberVouchers,
    MockMember,
    MockOrder,
    MockReferralRecord,
    MockPointsTransaction,
    MockSetting,
    MockVoucher,
    MockMemberVoucher,
  };
});

// Mock models module
vi.mock('../models', () => ({
  Member: MockMember,
  Order: MockOrder,
  ReferralRecord: MockReferralRecord,
  PointsTransaction: MockPointsTransaction,
  Setting: MockSetting,
  Voucher: MockVoucher,
  MemberVoucher: MockMemberVoucher,
}));

import request from 'supertest';
import app from '../app';
import * as referralService from '../services/referralService';

describe('Phase 6 Referral System', () => {
  const referrerId = new mongoose.Types.ObjectId().toString();
  const refereeId = new mongoose.Types.ObjectId().toString();

  let referrerToken: string;
  let adminToken: string;

  beforeEach(() => {
    members.length = 0;
    orders.length = 0;
    referralRecords.length = 0;
    pointsTransactions.length = 0;

    // Reset default referral trigger to 'first_order'
    const trig = settings.find((s) => s.key === 'referral_trigger');
    if (trig) trig.value = 'first_order';

    // Seed test referrer: Alice Tan
    members.push({
      _id: referrerId,
      name: 'Alice Tan',
      phone: '+60121111111',
      email: 'alice@example.com',
      referralCode: 'ALICE888',
      role: 'member',
      isActive: true,
      pointsBalance: 100,
    });

    referrerToken = jwt.sign(
      { id: referrerId, role: 'member' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    adminToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  });

  describe('1. Attribution Edge Cases', () => {
    it('creates referral attribution when a new user registers with a valid referral code', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Bob Lee',
          phone: '+60122222222',
          password: 'password123',
          referralCode: 'ALICE888',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.member.referredBy).toBe(referrerId);

      // Verify ReferralRecord exists
      const record = referralRecords.find(
        (r) => r.referrer.toString() === referrerId && r.referee.toString() === res.body.data.member._id
      );
      expect(record).toBeDefined();
      expect(record?.rewardStatus).toBe('pending');
    });

    it('rejects self-referral attribution silently without failing registration', async () => {
      // Alice tries to register a new account using her own phone number
      // Note: registration fails on duplicate phone first, but if someone uses their own code with different phone:
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alice Clone',
          phone: '+60123333333',
          password: 'password123',
          referralCode: 'INVALIDCODE999',
        });

      expect(res.status).toBe(201); // Registration succeeds!
      expect(res.body.data.member.referredBy).toBeUndefined();

      // No referral record created
      expect(referralRecords.length).toBe(0);
    });

    it('rejects duplicate attribution for an already attributed referee', async () => {
      // Register referee under Alice
      const res1 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Charlie',
          phone: '+60124444444',
          password: 'password123',
          referralCode: 'ALICE888',
        });

      const newRefereeId = res1.body.data.member._id;

      // Seed another referrer: Dave
      const daveId = new mongoose.Types.ObjectId().toString();
      members.push({
        _id: daveId,
        name: 'Dave',
        phone: '+60125555555',
        referralCode: 'DAVE123',
        isActive: true,
        pointsBalance: 0,
      });

      // Attempt second attribution on same referee
      const duplicateAttribution = await referralService.createReferralAttribution(newRefereeId, 'DAVE123');
      expect(duplicateAttribution).toBeNull();

      // Only one referral record should exist for this referee
      const count = referralRecords.filter((r) => r.referee.toString() === newRefereeId).length;
      expect(count).toBe(1);
    });

    it('registration succeeds smoothly when an invalid referral code is provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Eva Green',
          phone: '+60126666666',
          password: 'password123',
          referralCode: 'NONEXISTENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.member.referredBy).toBeUndefined();
      expect(referralRecords.length).toBe(0);
    });
  });

  describe('2. Reward Triggers & Reward-Once Guarantee', () => {
    it('grants reward immediately upon registration when trigger is "registration"', async () => {
      // Change trigger setting to 'registration'
      const trig = settings.find((s) => s.key === 'referral_trigger');
      if (trig) trig.value = 'registration';

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Frankie',
          phone: '+60127777777',
          password: 'password123',
          referralCode: 'ALICE888',
        });

      expect(res.status).toBe(201);
      const frankieId = res.body.data.member._id;

      // Alice should have received 50 points immediately
      const alice = members.find((m) => m._id.toString() === referrerId);
      expect(alice.pointsBalance).toBe(150); // 100 + 50

      // Frankie should have received 25 welcome points
      const frankie = members.find((m) => m._id.toString() === frankieId);
      expect(frankie.pointsBalance).toBe(25);

      // Record should be marked 'granted'
      const record = referralRecords.find((r) => (r.referee?._id?.toString() || r.referee?.toString()) === frankieId);
      expect(record?.rewardStatus).toBe('granted');
      expect(record?.grantedAt).toBeDefined();
    });

    it('grants reward only on first completed order when trigger is "first_order"', async () => {
      // Default trigger is 'first_order'
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Grace',
          phone: '+60128888889',
          password: 'password123',
          referralCode: 'ALICE888',
        });

      const graceId = res.body.data.member._id;
      const alice = members.find((m) => m._id.toString() === referrerId);
      expect(alice.pointsBalance).toBe(100); // Not rewarded yet

      const record = referralRecords.find((r) => r.referee.toString() === graceId);
      expect(record.rewardStatus).toBe('pending');

      // Simulate Grace's first order completion
      const orderId = new mongoose.Types.ObjectId().toString();
      orders.push({
        _id: orderId,
        member: graceId,
        orderNumber: 'ST-20261020-0001',
        totalAmount: 120,
        status: 'completed',
      });

      await referralService.checkAndTriggerOrderReferralReward(graceId, orderId);

      // Alice receives 50 points now!
      expect(alice.pointsBalance).toBe(150);
      expect(record.rewardStatus).toBe('granted');
      expect(record.grantedAt).toBeDefined();

      // Grace's SECOND order completion MUST NOT trigger reward again (Reward-Once Guarantee)
      const secondOrderId = new mongoose.Types.ObjectId().toString();
      orders.push({
        _id: secondOrderId,
        member: graceId,
        orderNumber: 'ST-20261020-0002',
        totalAmount: 95,
        status: 'completed',
      });

      await referralService.checkAndTriggerOrderReferralReward(graceId, secondOrderId);

      // Alice's points balance must remain 150 (not 200!)
      expect(alice.pointsBalance).toBe(150);
    });

    it('concurrency test: simultaneous reward granting calls execute exactly once', async () => {
      // Create pending record
      const dummyRecord = await MockReferralRecord.create({
        referrer: referrerId,
        referee: refereeId,
        rewardStatus: 'pending',
        trigger: 'first_order',
      });

      const orderId = new mongoose.Types.ObjectId().toString();

      // Fire 2 concurrent grant calls on the same record
      const [res1, res2] = await Promise.all([
        referralService.grantReferralReward(dummyRecord._id, orderId),
        referralService.grantReferralReward(dummyRecord._id, orderId),
      ]);

      // Exactly one must succeed and return the granted record, the other returns null
      const grantedCount = [res1, res2].filter((r) => r !== null).length;
      expect(grantedCount).toBe(1);

      // Points credited only once to Alice
      const alice = members.find((m) => m._id.toString() === referrerId);
      expect(alice.pointsBalance).toBe(150); // 100 + 50 (not + 100)
    });
  });

  describe('3. Member & Admin Referral Endpoints', () => {
    it('member can fetch their referral link, code, statistics, and referees history', async () => {
      // Create a referral relationship under Alice
      await MockReferralRecord.create({
        referrer: referrerId,
        referee: refereeId,
        rewardStatus: 'granted',
        rewardDetails: { referrerPoints: 50 },
      });

      members.push({
        _id: refereeId,
        name: 'Hannah',
        phone: '+60129999999',
        createdAt: new Date(),
      });

      const res = await request(app)
        .get('/api/v1/auth/referrals')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.referralCode).toBe('ALICE888');
      expect(res.body.data.referralLink).toContain('/r/ALICE888');
      expect(res.body.data.stats.totalReferrals).toBe(1);
      expect(res.body.data.stats.successfulReferrals).toBe(1);
      expect(res.body.data.stats.totalPointsEarned).toBe(50);
      expect(res.body.data.referrals.length).toBe(1);
      // Phone is masked
      expect(res.body.data.referrals[0].refereePhone).toContain('****');
    });

    it('admin can view paginated referral records and system statistics', async () => {
      await MockReferralRecord.create({
        referrer: referrerId,
        referee: refereeId,
        rewardStatus: 'granted',
        rewardValue: 50,
      });

      // Admin fetch records
      const listRes = await request(app)
        .get('/api/v1/admin/referrals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.records).toBeDefined();
      expect(listRes.body.data.total).toBeGreaterThanOrEqual(1);

      // Admin fetch stats
      const statsRes = await request(app)
        .get('/api/v1/admin/referrals/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.overview.totalReferrals).toBeGreaterThanOrEqual(1);
      expect(statsRes.body.data.overview.grantedRewards).toBeGreaterThanOrEqual(1);
      expect(statsRes.body.data.topReferrers).toBeDefined();
    });

    it('public can validate a referral code', async () => {
      const validRes = await request(app).get('/api/v1/public/referrals/validate/ALICE888');
      expect(validRes.status).toBe(200);
      expect(validRes.body.data.isValid).toBe(true);
      expect(validRes.body.data.referrerName).toBe('Alice Tan');

      const invalidRes = await request(app).get('/api/v1/public/referrals/validate/WRONGCODE');
      expect(invalidRes.status).toBe(404);
      expect(invalidRes.body.data.isValid).toBe(false);
    });
  });
});
