import { Member, IMember, Setting } from '../models';
import { Order } from '../models/Order';
import { normalizePhone, isValidPhone } from '../utils/phone';
import { generateReferralCode } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import {
  parseSheetFromBuffer,
  detectColumnMapping,
  parseExcelDate,
  isValidEmail,
  ColumnMapping,
  ParsedMemberRow,
  ImportPreviewResult,
} from '../utils/excel';

async function getDefaultCountryCode(): Promise<string> {
  const setting = await Setting.findOne({ key: 'default_country_code' });
  return setting?.value || '+60';
}

export function sanitizeMember(member: any) {
  const obj = member.toObject ? member.toObject() : { ...member };
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.otpCode;
  delete obj.otpExpiresAt;
  delete obj.otpAttempts;
  delete obj.otpLastRequestAt;
  return obj;
}

/**
 * Update member profile (self-service)
 */
export async function updateProfile(
  memberId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    birthday?: string;
  }
): Promise<IMember> {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const defaultCountryCode = await getDefaultCountryCode();

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) throw new AppError('Name cannot be empty', 400);
    member.name = trimmed;
  }

  if (data.phone !== undefined) {
    const normalized = normalizePhone(data.phone, defaultCountryCode);
    if (!isValidPhone(normalized)) {
      throw new AppError('Invalid phone number format', 400);
    }

    if (normalized !== member.phone) {
      const existing = await Member.findOne({
        phone: normalized,
        _id: { $ne: member._id },
      });
      if (existing) {
        throw new AppError('Phone number is already registered by another account', 409);
      }
      member.phone = normalized;
    }
  }

  if (data.email !== undefined) {
    const trimmed = data.email.trim().toLowerCase();
    if (trimmed) {
      if (!isValidEmail(trimmed)) {
        throw new AppError('Invalid email address format', 400);
      }
      const existing = await Member.findOne({
        email: trimmed,
        _id: { $ne: member._id },
      });
      if (existing) {
        throw new AppError('Email is already registered by another account', 409);
      }
      member.email = trimmed;
    } else {
      member.email = undefined;
    }
  }

  if (data.birthday !== undefined) {
    if (data.birthday) {
      const { date, error } = parseExcelDate(data.birthday);
      if (error || !date) {
        throw new AppError('Invalid birthday date format', 400);
      }
      member.birthday = date;
    } else {
      member.birthday = undefined;
    }
  }

  await member.save();
  return member;
}

/**
 * Admin: Search and paginate members
 */
export async function getAdminMembers(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, page = 1, limit = 20 } = params;
  const filter: any = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { referralCode: { $regex: s, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordHash -refreshToken -otpCode -otpExpiresAt')
      .lean(),
    Member.countDocuments(filter),
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Admin: Get member details with order history stats
 */
export async function getAdminMemberById(memberId: string): Promise<any> {
  const member = await Member.findById(memberId)
    .select('-passwordHash -refreshToken -otpCode -otpExpiresAt')
    .lean();

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const [orders, orderCount] = await Promise.all([
    Order.find({ member: memberId }).sort({ createdAt: -1 }).limit(10).lean(),
    Order.countDocuments({ member: memberId }),
  ]);

  return {
    ...member,
    orders,
    orderCount,
  };
}

/**
 * Admin: Create member manually
 */
export async function adminCreateMember(data: {
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: 'member' | 'admin';
}) {
  const defaultCountryCode = await getDefaultCountryCode();
  const normalizedPhone = normalizePhone(data.phone, defaultCountryCode);

  if (!isValidPhone(normalizedPhone)) {
    throw new AppError('Invalid phone number format', 400);
  }

  const existingPhone = await Member.findOne({ phone: normalizedPhone });
  if (existingPhone) {
    throw new AppError('Phone number already registered', 409);
  }

  if (data.email) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new AppError('Invalid email format', 400);
    }
    const existingEmail = await Member.findOne({ email: cleanEmail });
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }
  }

  let birthdayDate: Date | undefined;
  if (data.birthday) {
    const parsed = parseExcelDate(data.birthday);
    if (parsed.error || !parsed.date) {
      throw new AppError('Invalid birthday date format', 400);
    }
    birthdayDate = parsed.date;
  }

  let referralCode = generateReferralCode();
  while (await Member.findOne({ referralCode })) {
    referralCode = generateReferralCode();
  }

  const member = await Member.create({
    name: data.name.trim(),
    phone: normalizedPhone,
    email: data.email?.trim().toLowerCase() || undefined,
    birthday: birthdayDate,
    passwordHash: null,
    role: data.role || 'member',
    status: data.status || 'active',
    isActive: data.status !== 'inactive',
    referralCode,
    pointsBalance: 0,
  });

  return sanitizeMember(member);
}

/**
 * Admin: Update member details & status
 */
export async function adminUpdateMember(
  memberId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    birthday?: string;
    status?: 'active' | 'inactive' | 'suspended';
    role?: 'member' | 'admin';
    pointsBalance?: number;
  }
) {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const defaultCountryCode = await getDefaultCountryCode();

  if (data.name !== undefined) {
    member.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    const normalized = normalizePhone(data.phone, defaultCountryCode);
    if (!isValidPhone(normalized)) {
      throw new AppError('Invalid phone number format', 400);
    }
    if (normalized !== member.phone) {
      const existing = await Member.findOne({
        phone: normalized,
        _id: { $ne: member._id },
      });
      if (existing) {
        throw new AppError('Phone number already registered by another account', 409);
      }
      member.phone = normalized;
    }
  }

  if (data.email !== undefined) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (cleanEmail) {
      if (!isValidEmail(cleanEmail)) {
        throw new AppError('Invalid email format', 400);
      }
      const existing = await Member.findOne({
        email: cleanEmail,
        _id: { $ne: member._id },
      });
      if (existing) {
        throw new AppError('Email already registered by another account', 409);
      }
      member.email = cleanEmail;
    } else {
      member.email = undefined;
    }
  }

  if (data.birthday !== undefined) {
    if (data.birthday) {
      const parsed = parseExcelDate(data.birthday);
      if (parsed.error || !parsed.date) {
        throw new AppError('Invalid birthday date format', 400);
      }
      member.birthday = parsed.date;
    } else {
      member.birthday = undefined;
    }
  }

  if (data.status !== undefined) {
    member.status = data.status;
    member.isActive = data.status === 'active';
  }

  if (data.role !== undefined) {
    member.role = data.role;
  }

  if (data.pointsBalance !== undefined) {
    member.pointsBalance = Math.max(0, data.pointsBalance);
  }

  await member.save();
  return sanitizeMember(member);
}

/**
 * Preview Member Bulk Import
 */
export async function previewMemberImport(
  buffer: Buffer,
  mappingOverride?: Partial<ColumnMapping>
): Promise<ImportPreviewResult> {
  const { headers, rows: rawRows } = parseSheetFromBuffer(buffer);
  const detectedMapping = detectColumnMapping(headers);

  const mapping: ColumnMapping = {
    name: mappingOverride?.name || detectedMapping.name || '',
    phone: mappingOverride?.phone || detectedMapping.phone || '',
    email: mappingOverride?.email || detectedMapping.email || '',
    birthday: mappingOverride?.birthday || detectedMapping.birthday || '',
  };

  const defaultCountryCode = await getDefaultCountryCode();

  const parsedRows: ParsedMemberRow[] = [];
  const seenPhones = new Set<string>();

  // Extract phone list to query existing DB members in single batch
  const candidatePhones: string[] = [];
  rawRows.forEach((row) => {
    const rawPhone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
    if (rawPhone) {
      const normalized = normalizePhone(rawPhone, defaultCountryCode);
      if (isValidPhone(normalized)) {
        candidatePhones.push(normalized);
      }
    }
  });

  const existingMembers = await Member.find({ phone: { $in: candidatePhones } })
    .select('_id phone name')
    .lean();
  const existingMap = new Map(existingMembers.map((m) => [m.phone, m]));

  let validCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // Row 1 is header
    const errors: string[] = [];

    const rawName = mapping.name ? String(row[mapping.name] || '').trim() : '';
    const rawPhone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
    const rawEmail = mapping.email ? String(row[mapping.email] || '').trim() : '';
    const rawBirthday = mapping.birthday ? row[mapping.birthday] : undefined;

    // Validate Name
    if (!rawName) {
      errors.push('Name is required');
    }

    // Validate Phone
    let normalizedPhone = '';
    let isDuplicateInFile = false;
    let isDuplicateInDb = false;
    let existingMemberId: string | undefined;

    if (!rawPhone) {
      errors.push('Phone number is required');
    } else {
      normalizedPhone = normalizePhone(rawPhone, defaultCountryCode);
      if (!isValidPhone(normalizedPhone)) {
        errors.push(`Invalid phone number format: "${rawPhone}"`);
      } else {
        if (seenPhones.has(normalizedPhone)) {
          isDuplicateInFile = true;
          errors.push('Duplicate phone number in spreadsheet');
        } else {
          seenPhones.add(normalizedPhone);
        }

        if (existingMap.has(normalizedPhone)) {
          isDuplicateInDb = true;
          existingMemberId = existingMap.get(normalizedPhone)?._id.toString();
        }
      }
    }

    // Validate Email
    let cleanEmail: string | undefined;
    if (rawEmail) {
      if (!isValidEmail(rawEmail)) {
        errors.push(`Invalid email format: "${rawEmail}"`);
      } else {
        cleanEmail = rawEmail.toLowerCase();
      }
    }

    // Validate Birthday
    let parsedBirthday: Date | undefined;
    if (rawBirthday !== undefined && rawBirthday !== null && rawBirthday !== '') {
      const dateRes = parseExcelDate(rawBirthday);
      if (dateRes.error) {
        errors.push(dateRes.error);
      } else {
        parsedBirthday = dateRes.date;
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      errorCount++;
    } else if (isDuplicateInDb || isDuplicateInFile) {
      duplicateCount++;
    } else {
      validCount++;
    }

    parsedRows.push({
      rowNumber,
      raw: row,
      name: rawName,
      phone: rawPhone,
      normalizedPhone,
      email: cleanEmail,
      birthday: parsedBirthday,
      isValid,
      isDuplicateInFile,
      isDuplicateInDb,
      existingMemberId,
      errors,
    });
  });

  return {
    headers,
    suggestedMapping: mapping,
    totalRows: rawRows.length,
    validCount,
    duplicateCount,
    errorCount,
    rows: parsedRows,
  };
}

export interface FailedImportRow {
  rowNumber: number;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  reason: string;
}

/**
 * Execute Member Bulk Import
 */
export async function executeMemberImport(
  buffer: Buffer,
  mappingOverride?: Partial<ColumnMapping>,
  onDuplicate: 'skip' | 'update' = 'skip'
): Promise<{
  summary: {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  failedRows: FailedImportRow[];
}> {
  const preview = await previewMemberImport(buffer, mappingOverride);

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const failedRows: FailedImportRow[] = [];

  for (const row of preview.rows) {
    if (!row.isValid) {
      failed++;
      failedRows.push({
        rowNumber: row.rowNumber,
        name: row.name || '',
        phone: row.phone || '',
        email: row.email,
        birthday: row.birthday ? row.birthday.toISOString().split('T')[0] : '',
        reason: row.errors.join('; '),
      });
      continue;
    }

    // If duplicate in file
    if (row.isDuplicateInFile) {
      failed++;
      failedRows.push({
        rowNumber: row.rowNumber,
        name: row.name || '',
        phone: row.phone || '',
        email: row.email,
        birthday: row.birthday ? row.birthday.toISOString().split('T')[0] : '',
        reason: 'Duplicate phone number within file',
      });
      continue;
    }

    // If duplicate in DB
    if (row.isDuplicateInDb && row.normalizedPhone) {
      if (onDuplicate === 'skip') {
        skipped++;
        continue;
      } else {
        // onDuplicate === 'update'
        try {
          const updateFields: any = {
            name: row.name,
          };
          if (row.email) updateFields.email = row.email;
          if (row.birthday) updateFields.birthday = row.birthday;

          await Member.findOneAndUpdate(
            { phone: row.normalizedPhone },
            { $set: updateFields }
          );
          updated++;
        } catch (err: any) {
          failed++;
          failedRows.push({
            rowNumber: row.rowNumber,
            name: row.name || '',
            phone: row.phone || '',
            email: row.email,
            birthday: row.birthday ? row.birthday.toISOString().split('T')[0] : '',
            reason: err.message || 'Failed to update existing member',
          });
        }
        continue;
      }
    }

    // New member creation
    try {
      let referralCode = generateReferralCode();
      while (await Member.findOne({ referralCode })) {
        referralCode = generateReferralCode();
      }

      await Member.create({
        name: row.name,
        phone: row.normalizedPhone,
        email: row.email || undefined,
        birthday: row.birthday,
        passwordHash: null, // Claims via OTP & sets password
        role: 'member',
        status: 'active',
        isActive: true,
        referralCode,
        pointsBalance: 0,
      });

      imported++;
    } catch (err: any) {
      failed++;
      failedRows.push({
        rowNumber: row.rowNumber,
        name: row.name || '',
        phone: row.phone || '',
        email: row.email,
        birthday: row.birthday ? row.birthday.toISOString().split('T')[0] : '',
        reason: err.message || 'Database error during insertion',
      });
    }
  }

  return {
    summary: {
      total: preview.totalRows,
      imported,
      updated,
      skipped,
      failed,
    },
    failedRows,
  };
}
