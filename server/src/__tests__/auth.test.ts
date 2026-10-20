import { describe, it, expect, beforeEach, vi } from 'vitest';

const { members, settings, MockMember, MockSetting, MockReferralRecord } = vi.hoisted(() => {
  const members: any[] = [];
  const settings: any[] = [];

  const createMemberDoc = (data: any) => {
    const doc: any = {
      _id: data._id || 'mock_id_' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      phone: data.phone,
      email: data.email,
      birthday: data.birthday,
      passwordHash: data.passwordHash ?? null,
      role: data.role || 'member',
      isActive: data.isActive ?? true,
      status: data.status || 'active',
      referralCode: data.referralCode,
      referredBy: data.referredBy,
      pointsBalance: data.pointsBalance || 0,
      refreshToken: data.refreshToken,
      otpCode: data.otpCode,
      otpExpiresAt: data.otpExpiresAt,
      otpAttempts: data.otpAttempts ?? 0,
      otpLastRequestAt: data.otpLastRequestAt,
      async save() {
        return this;
      },
      toObject() {
        return { ...this };
      },
    };
    return doc;
  };

  const MockMember = {
    async findOne(query: any) {
      const match = members.find((m) => {
        if (query.phone && m.phone !== query.phone) return false;
        if (query.email && m.email !== query.email) return false;
        if (query.referralCode && m.referralCode !== query.referralCode) return false;
        if (query.isActive !== undefined && m.isActive !== query.isActive) return false;
        return true;
      });
      return match || null;
    },
    findById(id: any) {
      const targetId = id?.toString ? id.toString() : String(id);
      const match = members.find((m) => m._id.toString() === targetId);
      return {
        async select() {
          if (!match) return null;
          const sanitized = { ...match };
          delete sanitized.passwordHash;
          delete sanitized.refreshToken;
          delete sanitized.otpCode;
          return sanitized;
        },
        then(resolve: any, reject: any) {
          return Promise.resolve(match || null).then(resolve, reject);
        },
      };
    },
    async findByIdAndUpdate(id: any, update: any) {
      const match = members.find((m) => m._id.toString() === String(id));
      if (match && update.$unset?.refreshToken) {
        match.refreshToken = undefined;
      }
      return match || null;
    },
    async create(data: any) {
      const doc = createMemberDoc(data);
      members.push(doc);
      return doc;
    },
    async deleteMany() {
      members.length = 0;
      return { deletedCount: 0 };
    },
  };

  const MockSetting = {
    async findOne(query: any) {
      return settings.find((s) => s.key === query.key) || null;
    },
    async create(data: any) {
      settings.push(data);
      return data;
    },
    async find() {
      return {
        sort: () => settings,
      };
    },
    async deleteMany() {
      settings.length = 0;
      return { deletedCount: 0 };
    },
  };

  const MockReferralRecord = {
    findOne: () => Promise.resolve(null),
    create: (data: any) => Promise.resolve(data),
  };

  return { members, settings, MockMember, MockSetting, MockReferralRecord };
});

vi.mock('../models', () => {
  return {
    Member: MockMember,
    Setting: MockSetting,
    ReferralRecord: MockReferralRecord,
  };
});

import supertest from 'supertest';
import app from '../app';
import bcrypt from 'bcrypt';

const request = supertest(app);

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    members.length = 0;
    settings.length = 0;
    await MockSetting.create({
      key: 'default_country_code',
      value: '+60',
      label: 'Default Country Code',
      group: 'localization',
      type: 'string',
      isPublic: false,
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new member successfully', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: 'Test User',
        phone: '0123456789',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.member.name).toBe('Test User');
      expect(res.body.data.member.phone).toBe('+60123456789');
      expect(res.body.data.member.referralCode).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects duplicate phone', async () => {
      await request.post('/api/v1/auth/register').send({
        name: 'User 1',
        phone: '0123456789',
        password: 'password123',
      });

      const res = await request.post('/api/v1/auth/register').send({
        name: 'User 2',
        phone: '0123456789',
        password: 'password456',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already registered');
    });

    it('validates required fields with zod error response', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        name: '',
        phone: '',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('stores referredBy when valid referral code provided', async () => {
      const refId = 'referrer_12345';
      await MockMember.create({
        _id: refId,
        name: 'Referrer',
        phone: '+60199999999',
        passwordHash: await bcrypt.hash('pass123', 10),
        referralCode: 'REF12345',
        isActive: true,
      });

      const res = await request.post('/api/v1/auth/register').send({
        name: 'Referred User',
        phone: '0181111111',
        password: 'password123',
        referralCode: 'REF12345',
      });

      expect(res.status).toBe(201);
      const member = members.find((m) => m.phone === '+60181111111');
      expect(member?.referredBy?.toString()).toBe(refId);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send({
        name: 'Login User',
        phone: '0123456789',
        password: 'password123',
        email: 'login@example.com',
      });
    });

    it('logs in with phone', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        identifier: '0123456789',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.member.name).toBe('Login User');
    });

    it('logs in with email', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        identifier: 'login@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects wrong password', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        identifier: '0123456789',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await request.get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns current member when authenticated', async () => {
      const regRes = await request.post('/api/v1/auth/register').send({
        name: 'Me User',
        phone: '0191234567',
        password: 'password123',
      });

      const cookies = regRes.headers['set-cookie'];

      const res = await request.get('/api/v1/auth/me').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.data.member.name).toBe('Me User');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('clears cookies on logout', async () => {
      const regRes = await request.post('/api/v1/auth/register').send({
        name: 'Logout User',
        phone: '0192345678',
        password: 'password123',
      });

      const cookies = regRes.headers['set-cookie'];

      const res = await request.post('/api/v1/auth/logout').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('issues new tokens with valid refresh token', async () => {
      const regRes = await request.post('/api/v1/auth/register').send({
        name: 'Refresh User',
        phone: '0193456789',
        password: 'password123',
      });

      const cookies = regRes.headers['set-cookie'];

      const res = await request.post('/api/v1/auth/refresh').set('Cookie', cookies);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
