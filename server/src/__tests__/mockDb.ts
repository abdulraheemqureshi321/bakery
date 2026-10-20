import { vi } from 'vitest';
import mongoose from 'mongoose';

export interface MockMemberDoc {
  _id: any;
  name: string;
  phone: string;
  email?: string;
  birthday?: Date;
  passwordHash: string | null;
  role: 'member' | 'admin';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  referralCode: string;
  referredBy?: any;
  pointsBalance: number;
  refreshToken?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  otpLastRequestAt?: Date;
  save: () => Promise<MockMemberDoc>;
  toObject: () => any;
}

export function createMockDb() {
  const members: MockMemberDoc[] = [];
  const settings: any[] = [];

  const createMemberDoc = (data: any): MockMemberDoc => {
    const doc: MockMemberDoc = {
      _id: data._id || new mongoose.Types.ObjectId(),
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
      return {
        ...match,
        select: vi.fn().mockImplementation(() => {
          const sanitized = { ...match };
          delete (sanitized as any).passwordHash;
          delete (sanitized as any).refreshToken;
          delete (sanitized as any).otpCode;
          return sanitized;
        }),
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

  return { members, settings, MockMember, MockSetting, createMemberDoc };
}
