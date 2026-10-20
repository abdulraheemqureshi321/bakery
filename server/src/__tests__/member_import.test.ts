import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as xlsx from 'xlsx';
import {
  detectColumnMapping,
  parseExcelDate,
  parseSheetFromBuffer,
} from '../utils/excel';
import {
  previewMemberImport,
  executeMemberImport,
  updateProfile,
  adminCreateMember,
  adminUpdateMember,
} from '../services/memberService';
import { Member, Setting } from '../models';
import { normalizePhone } from '../utils/phone';

// Mock DB models for unit & integration testing
vi.mock('../models', () => {
  const members: any[] = [];
  const settings: any[] = [{ key: 'default_country_code', value: '+60' }];

  return {
    Setting: {
      findOne: vi.fn().mockImplementation((query) => {
        return Promise.resolve(settings.find((s) => s.key === query.key) || null);
      }),
    },
    Member: {
      find: vi.fn().mockImplementation((query) => {
        let results = [...members];
        if (query?.phone?.$in) {
          results = results.filter((m) => query.phone.$in.includes(m.phone));
        }
        return {
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(results),
          }),
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  lean: vi.fn().mockResolvedValue(results),
                }),
              }),
            }),
          }),
        };
      }),
      findOne: vi.fn().mockImplementation((query) => {
        const found = members.find((m) => {
          if (query.phone && m.phone !== query.phone) return false;
          if (query.email && m.email !== query.email) return false;
          if (query.referralCode && m.referralCode !== query.referralCode) return false;
          if (query._id?.$ne && m._id === query._id.$ne) return false;
          return true;
        });
        return Promise.resolve(found || null);
      }),
      findById: vi.fn().mockImplementation((id) => {
        const m = members.find((x) => x._id === id || String(x._id) === String(id));
        if (!m) return Promise.resolve(null);
        return Promise.resolve({
          ...m,
          save: vi.fn().mockResolvedValue(m),
        });
      }),
      create: vi.fn().mockImplementation((data) => {
        const doc = {
          _id: 'mem_' + Math.random().toString(36).slice(2, 9),
          ...data,
          save: vi.fn().mockResolvedValue(data),
          toObject: () => ({ ...data }),
        };
        members.push(doc);
        return Promise.resolve(doc);
      }),
      findOneAndUpdate: vi.fn().mockImplementation((filter, update) => {
        const m = members.find((x) => x.phone === filter.phone);
        if (m && update.$set) {
          Object.assign(m, update.$set);
        }
        return Promise.resolve(m || null);
      }),
      countDocuments: vi.fn().mockImplementation(() => Promise.resolve(members.length)),
      _reset: () => {
        members.length = 0;
      },
      _members: members,
    },
    Order: {
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      countDocuments: vi.fn().mockResolvedValue(0),
    },
  };
});

describe('Phase 4: Member Import & Management Tests', () => {
  beforeEach(() => {
    (Member as any)._reset();
    vi.clearAllMocks();
  });

  describe('1. Column Mapping Detection', () => {
    it('should detect standard header variations case-insensitively', () => {
      const headers = ['Full Name', 'Mobile Phone', 'Date of Birth', 'Email Address'];
      const mapping = detectColumnMapping(headers);

      expect(mapping.name).toBe('Full Name');
      expect(mapping.phone).toBe('Mobile Phone');
      expect(mapping.birthday).toBe('Date of Birth');
      expect(mapping.email).toBe('Email Address');
    });

    it('should handle Malay and alternate aliases', () => {
      const headers = ['Nama', 'No Tel', 'Tarikh Lahir', 'Emel'];
      const mapping = detectColumnMapping(headers);

      expect(mapping.name).toBe('Nama');
      expect(mapping.phone).toBe('No Tel');
      expect(mapping.birthday).toBe('Tarikh Lahir');
      expect(mapping.email).toBe('Emel');
    });
  });

  describe('2. Date Parsing', () => {
    it('should parse Excel numeric serial dates', () => {
      // 44197 is 2021-01-01
      const res = parseExcelDate(44197);
      expect(res.error).toBeUndefined();
      expect(res.date).toBeInstanceOf(Date);
      expect(res.date?.getUTCFullYear()).toBe(2021);
      expect(res.date?.getUTCMonth()).toBe(0); // Jan
      expect(res.date?.getUTCDate()).toBe(1);
    });

    it('should parse ISO YYYY-MM-DD and YYYY/MM/DD', () => {
      const res = parseExcelDate('1990-05-15');
      expect(res.error).toBeUndefined();
      expect(res.date?.getUTCFullYear()).toBe(1990);
      expect(res.date?.getUTCMonth()).toBe(4); // May
      expect(res.date?.getUTCDate()).toBe(15);
    });

    it('should parse UK / International DD/MM/YYYY and DD-MM-YYYY', () => {
      const res = parseExcelDate('24/11/1993');
      expect(res.error).toBeUndefined();
      expect(res.date?.getUTCFullYear()).toBe(1993);
      expect(res.date?.getUTCMonth()).toBe(10); // Nov
      expect(res.date?.getUTCDate()).toBe(24);

      const res2 = parseExcelDate('02-08-1985');
      expect(res2.error).toBeUndefined();
      expect(res2.date?.getUTCFullYear()).toBe(1985);
      expect(res2.date?.getUTCDate()).toBe(2);
    });

    it('should return error for unparseable dates', () => {
      const res = parseExcelDate('not-a-date');
      expect(res.error).toBeDefined();
    });
  });

  describe('3. Preview Member Import & Validation', () => {
    it('should flag missing names, invalid phones, invalid emails, and in-file duplicates', async () => {
      const rows = [
        { 'Full Name': 'John Tan', 'Mobile Phone': '+60123456789', 'Date of Birth': '1990-05-15', 'Email': 'john@example.com' },
        { 'Full Name': '', 'Mobile Phone': '0198765432', 'Date of Birth': '1992-01-01', 'Email': 'noname@example.com' }, // missing name
        { 'Full Name': 'Bruce Wayne', 'Mobile Phone': 'bad-phone', 'Date of Birth': '1980-02-19', 'Email': 'bruce@wayne.com' }, // bad phone
        { 'Full Name': 'Clark Kent', 'Mobile Phone': '0162223344', 'Date of Birth': '1982-06-18', 'Email': 'bad-email' }, // bad email
        { 'Full Name': 'Duplicate John', 'Mobile Phone': '0123456789', 'Date of Birth': '1995-01-01', 'Email': 'dup@example.com' }, // duplicate in file
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const preview = await previewMemberImport(buffer);

      expect(preview.totalRows).toBe(5);
      expect(preview.validCount).toBe(1); // Only John Tan is clean and non-duplicate
      expect(preview.errorCount).toBe(4); // 4 rows with errors

      // Inspect row errors
      const row2 = preview.rows.find((r) => r.rowNumber === 3);
      expect(row2?.errors).toContain('Name is required');

      const row3 = preview.rows.find((r) => r.rowNumber === 4);
      expect(row3?.errors.some((e) => e.includes('Invalid phone number format'))).toBe(true);

      const row4 = preview.rows.find((r) => r.rowNumber === 5);
      expect(row4?.errors.some((e) => e.includes('Invalid email format'))).toBe(true);

      const row5 = preview.rows.find((r) => r.rowNumber === 6);
      expect(row5?.errors).toContain('Duplicate phone number in spreadsheet');
    });
  });

  describe('4. Execute Bulk Import with Duplicate Strategies', () => {
    it('should import new members with referralCode and passwordHash: null', async () => {
      const rows = [
        { 'Full Name': 'John Tan', 'Mobile Phone': '+60123456789', 'Email': 'john@example.com' },
        { 'Full Name': 'Siti Nurhaliza', 'Mobile Phone': '0198765432', 'Email': 'siti@example.com' },
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const res = await executeMemberImport(buffer, undefined, 'skip');

      expect(res.summary.imported).toBe(2);
      expect(res.summary.failed).toBe(0);

      const created = (Member as any)._members;
      expect(created.length).toBe(2);
      expect(created[0].passwordHash).toBeNull();
      expect(created[0].referralCode).toBeDefined();
      expect(created[0].phone).toBe('+60123456789');
      expect(created[1].phone).toBe('+60198765432');
    });

    it('should respect onDuplicate: "skip" when phone already exists in DB', async () => {
      // Pre-seed an existing member
      (Member as any)._members.push({
        _id: 'existing_1',
        name: 'Existing Alice',
        phone: '+60121111111',
        email: 'alice@example.com',
        referralCode: 'ALICE1',
        passwordHash: 'hashed_pw',
      });

      const rows = [
        { 'Full Name': 'Existing Alice Renamed', 'Mobile Phone': '+60121111111', 'Email': 'alice.new@example.com' },
        { 'Full Name': 'New Bob', 'Mobile Phone': '+60177777777', 'Email': 'bob@example.com' },
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const res = await executeMemberImport(buffer, undefined, 'skip');

      expect(res.summary.imported).toBe(1); // Bob
      expect(res.summary.skipped).toBe(1); // Alice skipped
      expect(res.summary.updated).toBe(0);

      // Verify Alice was not modified
      const alice = (Member as any)._members.find((m: any) => m.phone === '+60121111111');
      expect(alice.name).toBe('Existing Alice');
    });

    it('should respect onDuplicate: "update" when phone already exists in DB', async () => {
      // Pre-seed an existing member
      (Member as any)._members.push({
        _id: 'existing_1',
        name: 'Existing Alice',
        phone: '+60121111111',
        email: 'alice@example.com',
        referralCode: 'ALICE1',
        passwordHash: 'hashed_pw',
      });

      const rows = [
        { 'Full Name': 'Existing Alice Renamed', 'Mobile Phone': '+60121111111', 'Email': 'alice.new@example.com' },
        { 'Full Name': 'New Bob', 'Mobile Phone': '+60177777777', 'Email': 'bob@example.com' },
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const res = await executeMemberImport(buffer, undefined, 'update');

      expect(res.summary.imported).toBe(1); // Bob
      expect(res.summary.updated).toBe(1); // Alice updated
      expect(res.summary.skipped).toBe(0);

      // Verify Alice was updated
      const alice = (Member as any)._members.find((m: any) => m.phone === '+60121111111');
      expect(alice.name).toBe('Existing Alice Renamed');
      expect(alice.email).toBe('alice.new@example.com');
    });

    it('should record failed rows with reasons for downloadable CSV report', async () => {
      const rows = [
        { 'Full Name': '', 'Mobile Phone': '0123456789' }, // row 2: missing name
        { 'Full Name': 'Invalid Phone Man', 'Mobile Phone': 'xyz' }, // row 3: bad phone
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(rows);
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const res = await executeMemberImport(buffer);

      expect(res.summary.failed).toBe(2);
      expect(res.failedRows.length).toBe(2);
      expect(res.failedRows[0].rowNumber).toBe(2);
      expect(res.failedRows[0].reason).toContain('Name is required');
      expect(res.failedRows[1].rowNumber).toBe(3);
      expect(res.failedRows[1].reason).toContain('Invalid phone number format');
    });
  });

  describe('5. Member Profile Self-Update', () => {
    it('should immediately update member profile with normalized phone and uniqueness check', async () => {
      const member = {
        _id: 'mem_1',
        name: 'Charlie Brown',
        phone: '+60129999999',
        email: 'charlie@example.com',
        save: vi.fn().mockResolvedValue(true),
      };
      (Member as any)._members.push(member);

      const updated = await updateProfile('mem_1', {
        name: 'Charlie Updated',
        phone: '0128888888',
        email: 'charlie.new@example.com',
        birthday: '1995-10-20',
      });

      expect(updated.name).toBe('Charlie Updated');
      expect(updated.phone).toBe('+60128888888');
      expect(updated.email).toBe('charlie.new@example.com');
      expect(updated.birthday).toBeInstanceOf(Date);
    });

    it('should reject phone update if already used by another member', async () => {
      (Member as any)._members.push(
        { _id: 'mem_1', phone: '+60121111111', save: vi.fn() },
        { _id: 'mem_2', phone: '+60122222222', save: vi.fn() }
      );

      await expect(
        updateProfile('mem_1', { phone: '+60122222222' })
      ).rejects.toThrow('already registered');
    });
  });

  describe('6. Admin Manual Member Management', () => {
    it('should allow admin to manually add a member', async () => {
      const created = await adminCreateMember({
        name: 'Diana Prince',
        phone: '0139998877',
        email: 'diana@themyscira.com',
        birthday: '1984-01-01',
      });

      expect(created.name).toBe('Diana Prince');
      expect(created.phone).toBe('+60139998877');
      expect(created.referralCode).toBeDefined();
    });

    it('should allow admin to update member status to suspended/inactive', async () => {
      const mem = {
        _id: 'mem_diana',
        name: 'Diana Prince',
        phone: '+60139998877',
        status: 'active',
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };
      (Member as any)._members.push(mem);

      const updated = await adminUpdateMember('mem_diana', {
        status: 'suspended',
      });

      expect(updated.status).toBe('suspended');
    });
  });
});
