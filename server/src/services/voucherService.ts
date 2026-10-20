import mongoose, { Types, ClientSession } from 'mongoose';
import { Voucher, MemberVoucher, IVoucher, IMemberVoucher, Member } from '../models';
import { AppError } from '../utils/AppError';

export interface CreateVoucherDTO {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string | Date;
  validUntil: string | Date;
  totalUsageLimit?: number;
  perMemberLimit?: number;
  isActive?: boolean;
}

export interface IssueVoucherDTO {
  voucherId: string;
  memberIds?: string[];
  allMembers?: boolean;
}

/**
 * Admin: Create a new voucher configuration
 */
export async function createVoucher(data: CreateVoucherDTO): Promise<IVoucher> {
  const cleanCode = data.code.trim().toUpperCase();

  const existing = await Voucher.findOne({ code: cleanCode });
  if (existing) {
    throw new AppError(`Voucher with code "${cleanCode}" already exists`, 409);
  }

  const now = new Date();
  const validFrom = data.validFrom ? new Date(data.validFrom) : now;
  const validUntil = data.validUntil
    ? new Date(data.validUntil)
    : data.validDays
    ? new Date(validFrom.getTime() + data.validDays * 86400000)
    : new Date(validFrom.getTime() + 30 * 86400000);

  if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
    throw new AppError('Invalid validity date range', 400);
  }

  if (validUntil <= validFrom) {
    throw new AppError('validUntil must be after validFrom', 400);
  }

  if (data.type === 'percentage' && (data.value <= 0 || data.value > 100)) {
    throw new AppError('Percentage discount value must be between 1 and 100', 400);
  }

  if (data.type === 'fixed' && data.value <= 0) {
    throw new AppError('Fixed discount value must be greater than 0', 400);
  }

  const minOrderAmount = data.minOrderAmount ?? (data as any).minSpend ?? 0;

  const voucher = await Voucher.create({
    code: cleanCode,
    name: data.name.trim(),
    description: data.description?.trim(),
    type: data.type,
    value: data.value,
    minOrderAmount,
    maxDiscount: data.type === 'percentage' ? data.maxDiscount : undefined,
    validFrom,
    validUntil,
    totalUsageLimit: data.totalUsageLimit,
    perMemberLimit: data.perMemberLimit || 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
    totalUsed: 0,
  });

  return voucher;
}

/**
 * Admin: Update voucher
 */
export async function updateVoucher(
  voucherId: string,
  data: Partial<CreateVoucherDTO>
): Promise<IVoucher> {
  const voucher = await Voucher.findById(voucherId);
  if (!voucher) {
    throw new AppError('Voucher not found', 404);
  }

  if (data.code) {
    const cleanCode = data.code.trim().toUpperCase();
    if (cleanCode !== voucher.code) {
      const existing = await Voucher.findOne({ code: cleanCode, _id: { $ne: voucher._id } });
      if (existing) {
        throw new AppError(`Voucher code "${cleanCode}" already in use`, 409);
      }
      voucher.code = cleanCode;
    }
  }

  if (data.name !== undefined) voucher.name = data.name.trim();
  if (data.description !== undefined) voucher.description = data.description.trim();
  if (data.type !== undefined) voucher.type = data.type;
  if (data.value !== undefined) voucher.value = data.value;
  if (data.minOrderAmount !== undefined) voucher.minOrderAmount = data.minOrderAmount;
  if (data.maxDiscount !== undefined) voucher.maxDiscount = data.maxDiscount;
  if (data.validFrom !== undefined) voucher.validFrom = new Date(data.validFrom);
  if (data.validUntil !== undefined) voucher.validUntil = new Date(data.validUntil);
  if (data.totalUsageLimit !== undefined) voucher.totalUsageLimit = data.totalUsageLimit;
  if (data.perMemberLimit !== undefined) voucher.perMemberLimit = data.perMemberLimit;
  if (data.isActive !== undefined) voucher.isActive = data.isActive;

  await voucher.save();
  return voucher;
}

/**
 * Admin: Get all vouchers
 */
export async function getAllVouchers(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (params.isActive !== undefined) {
    query.isActive = params.isActive;
  }
  if (params.search) {
    const s = params.search.trim();
    query.$or = [{ code: { $regex: s, $options: 'i' } }, { name: { $regex: s, $options: 'i' } }];
  }

  const [vouchers, total] = await Promise.all([
    Voucher.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Voucher.countDocuments(query),
  ]);

  return {
    vouchers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin: Issue voucher to members
 */
export async function issueVoucherToMembers(
  data: IssueVoucherDTO
): Promise<{ issuedCount: number; alreadyHeldCount: number }> {
  const voucher = await Voucher.findById(data.voucherId);
  if (!voucher) {
    throw new AppError('Voucher not found', 404);
  }

  let targetMemberIds: string[] = [];

  if (data.allMembers || (data as any).target === 'all') {
    const activeMembers = await Member.find({ isActive: true }).select('_id');
    targetMemberIds = activeMembers.map((m) => m._id.toString());
  } else if (data.memberIds && data.memberIds.length > 0) {
    targetMemberIds = data.memberIds;
  } else {
    throw new AppError('Please select members or choose all members', 400);
  }

  let issuedCount = 0;
  let alreadyHeldCount = 0;

  for (const mId of targetMemberIds) {
    // Check member's current issued count for this voucher
    const existingCount = await MemberVoucher.countDocuments({
      member: new Types.ObjectId(mId),
      voucher: voucher._id,
      isUsed: false,
    });

    if (existingCount >= voucher.perMemberLimit) {
      alreadyHeldCount++;
      continue;
    }

    await MemberVoucher.create({
      member: new Types.ObjectId(mId),
      voucher: voucher._id,
      isUsed: false,
      issuedAt: new Date(),
      expiresAt: voucher.validUntil,
    });
    issuedCount++;
  }

  return { issuedCount, alreadyHeldCount };
}

/**
 * Member: Get assigned vouchers with status grouping
 */
export async function getMemberVouchers(
  memberId: string,
  filter: 'available' | 'used' | 'expired' | 'all' = 'all'
) {
  const now = new Date();
  const query: any = { member: new Types.ObjectId(memberId) };

  const memberVouchers = await MemberVoucher.find(query)
    .populate('voucher')
    .sort({ createdAt: -1 });

  const categorized = memberVouchers.map((mv) => {
    const v = mv.voucher as any;
    let status: 'available' | 'used' | 'expired' = 'available';

    if (mv.isUsed) {
      status = 'used';
    } else if (mv.expiresAt < now || !v?.isActive || v?.validUntil < now) {
      status = 'expired';
    }

    return {
      _id: mv._id,
      isUsed: mv.isUsed,
      usedAt: mv.usedAt,
      usedInOrder: mv.usedInOrder,
      issuedAt: mv.issuedAt,
      expiresAt: mv.expiresAt,
      status,
      voucher: v,
    };
  });

  if (filter === 'all') {
    return categorized;
  }
  return categorized.filter((item) => item.status === filter);
}

/**
 * Validate and calculate voucher discount for a given subtotal
 */
export async function validateAndCalculateVoucher(
  memberId: string,
  voucherIdentifier: string, // Can be memberVoucherId or voucher code
  subtotal: number
): Promise<{
  memberVoucher: IMemberVoucher;
  voucher: IVoucher;
  discount: number;
}> {
  const now = new Date();

  // Try to find by MemberVoucher ID first
  let memberVoucher = await MemberVoucher.findOne({
    _id: Types.ObjectId.isValid(voucherIdentifier) ? voucherIdentifier : null,
    member: new Types.ObjectId(memberId),
  }).populate('voucher');

  // If not found by ID, try to find by Voucher code
  if (!memberVoucher) {
    const cleanCode = voucherIdentifier.trim().toUpperCase();
    const voucherDoc = await Voucher.findOne({ code: cleanCode, isActive: true });
    if (!voucherDoc) {
      throw new AppError(`Invalid or inactive voucher code "${cleanCode}"`, 400);
    }

    memberVoucher = await MemberVoucher.findOne({
      member: new Types.ObjectId(memberId),
      voucher: voucherDoc._id,
      isUsed: false,
    }).populate('voucher');

    if (!memberVoucher) {
      // If member doesn't have an issued record yet, check if this voucher is globally claimable
      if (voucherDoc.validFrom <= now && voucherDoc.validUntil >= now) {
        // Auto-assign to member on the fly if within limits
        const usedCount = await MemberVoucher.countDocuments({
          member: new Types.ObjectId(memberId),
          voucher: voucherDoc._id,
        });

        if (usedCount < voucherDoc.perMemberLimit) {
          memberVoucher = await MemberVoucher.create({
            member: new Types.ObjectId(memberId),
            voucher: voucherDoc._id,
            isUsed: false,
            issuedAt: now,
            expiresAt: voucherDoc.validUntil,
          });
          memberVoucher.voucher = voucherDoc;
        } else {
          throw new AppError('You have reached the maximum usage limit for this voucher', 400);
        }
      } else {
        throw new AppError('Voucher is expired or not yet valid', 400);
      }
    }
  }

  const voucher = memberVoucher.voucher as unknown as IVoucher;

  if (memberVoucher.isUsed) {
    throw new AppError('This voucher has already been used', 400);
  }

  if (memberVoucher.expiresAt < now || voucher.validUntil < now) {
    throw new AppError('This voucher has expired', 400);
  }

  if (voucher.validFrom > now) {
    throw new AppError('This voucher is not yet active', 400);
  }

  if (!voucher.isActive) {
    throw new AppError('This voucher is currently inactive', 400);
  }

  // Check global usage limit
  if (voucher.totalUsageLimit && voucher.totalUsed >= voucher.totalUsageLimit) {
    throw new AppError('This voucher has reached its maximum total usage limit', 400);
  }

  // Check minimum spend
  if (subtotal < voucher.minOrderAmount) {
    throw new AppError(
      `Minimum order amount for this voucher is RM ${voucher.minOrderAmount.toFixed(2)} (current subtotal: RM ${subtotal.toFixed(2)})`,
      400
    );
  }

  // Calculate discount
  let discount = 0;
  if (voucher.type === 'fixed') {
    discount = Math.min(voucher.value, subtotal);
  } else {
    // Percentage
    discount = (subtotal * voucher.value) / 100;
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  }

  discount = Math.round(discount * 100) / 100;
  return { memberVoucher, voucher, discount };
}

/**
 * Apply voucher inside a MongoDB transaction session with concurrency lock
 */
export async function applyVoucherInTransaction(
  memberVoucherId: string | Types.ObjectId,
  orderId: string | Types.ObjectId,
  session?: ClientSession
): Promise<void> {
  const now = new Date();

  // 1. Atomically lock and mark MemberVoucher as used
  const updatedMv = await MemberVoucher.findOneAndUpdate(
    {
      _id: memberVoucherId,
      isUsed: false,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        isUsed: true,
        usedAt: now,
        usedInOrder: orderId,
      },
    },
    { session, new: true }
  );

  if (!updatedMv) {
    throw new AppError('Voucher has already been used or has expired', 400);
  }

  // 2. Atomically increment totalUsed on Voucher (enforcing totalUsageLimit if configured)
  const voucher = session
    ? await Voucher.findById(updatedMv.voucher).session(session)
    : await Voucher.findById(updatedMv.voucher);
  if (!voucher) {
    throw new AppError('Associated voucher definition not found', 404);
  }

  if (voucher.totalUsageLimit && voucher.totalUsed >= voucher.totalUsageLimit) {
    throw new AppError('Voucher total usage limit reached', 400);
  }

  voucher.totalUsed = (voucher.totalUsed || 0) + 1;
  if (session) {
    await voucher.save({ session });
  } else {
    await voucher.save();
  }
}

/**
 * Restore voucher when order is cancelled
 */
export async function restoreVoucherOnCancellation(
  orderId: string | Types.ObjectId,
  session?: ClientSession
): Promise<void> {
  const memberVoucher = session
    ? await MemberVoucher.findOne({ usedInOrder: orderId }).session(session)
    : await MemberVoucher.findOne({ usedInOrder: orderId });
  if (!memberVoucher) return;

  // Reset member voucher
  memberVoucher.isUsed = false;
  memberVoucher.usedAt = undefined;
  memberVoucher.usedInOrder = undefined;
  if (session) {
    await memberVoucher.save({ session });
  } else {
    await memberVoucher.save();
  }

  // Decrement totalUsed on parent voucher
  const voucher = session
    ? await Voucher.findById(memberVoucher.voucher).session(session)
    : await Voucher.findById(memberVoucher.voucher);
  if (voucher && voucher.totalUsed > 0) {
    voucher.totalUsed -= 1;
    if (session) {
      await voucher.save({ session });
    } else {
      await voucher.save();
    }
  }
}
