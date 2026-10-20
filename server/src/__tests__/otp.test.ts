import { describe, it, expect, beforeEach, vi } from 'vitest';

const { members, settings, MockMember, MockSetting } = vi.hoisted(() => {
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
    async findById(id: any) {
      const targetId = id?.toString ? id.toString() : String(id);
      const match = members.find((m) => m._id.toString() === targetId);
      if (!match) return null;
      match.select = vi.fn().mockImplementation(() => {
        const sanitized = { ...match };
        delete sanitized.passwordHash;
        delete sanitized.refreshToken;
        delete sanitized.otpCode;
        return sanitized;
      });
      return match;
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

  return { members, settings, MockMember, MockSetting };
});

vi.mock('../models', () => {
  return {
    Member: MockMember,
    Setting: MockSetting,
  };
});

import supertest from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app';
import { generateReferralCode } from '../utils/helpers';

const request = supertest(app);

async function createMemberWithoutPassword(phone: string) {
  return MockMember.create({
    name: 'Imported Member',
    phone,
    passwordHash: null,
    referralCode: generateReferralCode(),
    isActive: true,
  });
}

describe('OTP Endpoints', () => {
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

  describe('POST /api/v1/auth/otp/request', () => {
    it('sends OTP to existing member', async () => {
      await createMemberWithoutPassword('+60123456789');

      const res = await request.post('/api/v1/auth/otp/request').send({
        phone: '0123456789',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Verification code sent');

      const member = members.find((m) => m.phone === '+60123456789');
      expect(member?.otpCode).toBeDefined();
      expect(member?.otpExpiresAt).toBeDefined();
    });

    it('returns 404 for non-existent phone', async () => {
      const res = await request.post('/api/v1/auth/otp/request').send({
        phone: '0199999999',
      });

      expect(res.status).toBe(404);
    });

    it('rate limits OTP requests with cooldown error', async () => {
      await createMemberWithoutPassword('+60123456789');

      // First request should succeed
      await request.post('/api/v1/auth/otp/request').send({ phone: '0123456789' });

      // Immediate second request should be rate limited by cooldown
      const res = await request.post('/api/v1/auth/otp/request').send({
        phone: '0123456789',
      });

      expect(res.status).toBe(429);
      expect(res.body.message).toContain('Please wait');
    });
  });

  describe('POST /api/v1/auth/otp/verify', () => {
    it('verifies correct OTP and returns tokens', async () => {
      const member = await createMemberWithoutPassword('+60123456789');

      const code = '123456';
      member.otpCode = await bcrypt.hash(code, 10);
      member.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      member.otpAttempts = 0;

      const res = await request.post('/api/v1/auth/otp/verify').send({
        phone: '0123456789',
        code: '123456',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.needsPassword).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects wrong OTP and decrements attempts', async () => {
      const member = await createMemberWithoutPassword('+60123456789');

      const code = '123456';
      member.otpCode = await bcrypt.hash(code, 10);
      member.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      member.otpAttempts = 0;

      const res = await request.post('/api/v1/auth/otp/verify').send({
        phone: '0123456789',
        code: '000000',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('attempts remaining');
      expect(member.otpAttempts).toBe(1);
    });

    it('rejects expired OTP', async () => {
      const member = await createMemberWithoutPassword('+60123456789');

      const code = '123456';
      member.otpCode = await bcrypt.hash(code, 10);
      member.otpExpiresAt = new Date(Date.now() - 1000);
      member.otpAttempts = 0;

      const res = await request.post('/api/v1/auth/otp/verify').send({
        phone: '0123456789',
        code: '123456',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('expired');
    });

    it('locks out after max attempts', async () => {
      const member = await createMemberWithoutPassword('+60123456789');

      const code = '123456';
      member.otpCode = await bcrypt.hash(code, 10);
      member.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      member.otpAttempts = 5;

      const res = await request.post('/api/v1/auth/otp/verify').send({
        phone: '0123456789',
        code: '123456',
      });

      expect(res.status).toBe(429);
      expect(res.body.message).toContain('Too many attempts');
    });
  });

  describe('POST /api/v1/auth/set-password', () => {
    it('sets password for member after OTP verification', async () => {
      const member = await createMemberWithoutPassword('+60123456789');

      const code = '123456';
      member.otpCode = await bcrypt.hash(code, 10);
      member.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      member.otpAttempts = 0;

      // Verify OTP
      const verifyRes = await request.post('/api/v1/auth/otp/verify').send({
        phone: '0123456789',
        code: '123456',
      });

      const cookies = verifyRes.headers['set-cookie'];

      // Set password
      const res = await request
        .post('/api/v1/auth/set-password')
        .set('Cookie', cookies)
        .send({ password: 'newpassword123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password set successfully');

      // Now login with password should work
      const loginRes = await request.post('/api/v1/auth/login').send({
        identifier: '0123456789',
        password: 'newpassword123',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });
  });
});
