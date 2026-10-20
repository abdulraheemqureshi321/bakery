import mongoose, { Types, ClientSession } from 'mongoose';
import { Member, ReferralRecord, Setting, IReferralRecord, Voucher } from '../models';
import * as pointsService from './pointsService';
import * as voucherService from './voucherService';
import { generateReferralCode } from '../utils/helpers';
import env from '../config/env';

export interface ReferralRules {
  trigger: 'registration' | 'first_order';
  referrerRewardType: 'points' | 'voucher' | 'both';
  referrerRewardPoints: number;
  referrerRewardVoucherCode?: string;
  refereeRewardType: 'points' | 'voucher' | 'both' | 'none';
  refereeRewardPoints: number;
  refereeRewardVoucherCode?: string;
}

/**
 * Load referral rules from Settings with fallback defaults
 */
export async function getReferralRules(): Promise<ReferralRules> {
  const [
    triggerSetting,
    refTypeSetting,
    refPointsSetting,
    refVoucherSetting,
    refereeTypeSetting,
    refereePointsSetting,
    refereeVoucherSetting,
  ] = await Promise.all([
    Setting.findOne({ key: 'referral_trigger' }),
    Setting.findOne({ key: 'referral_reward_type' }),
    Setting.findOne({ key: 'referral_reward_value' }),
    Setting.findOne({ key: 'referral_reward_voucher_code' }),
    Setting.findOne({ key: 'referral_referee_reward_type' }),
    Setting.findOne({ key: 'referral_referee_reward_value' }),
    Setting.findOne({ key: 'referral_referee_reward_voucher_code' }),
  ]);

  const triggerVal = triggerSetting?.value;
  const trigger: 'registration' | 'first_order' =
    triggerVal === 'registration' || triggerVal === 'on_registration'
      ? 'registration'
      : 'first_order';

  const referrerRewardType: 'points' | 'voucher' | 'both' =
    refTypeSetting?.value === 'voucher'
      ? 'voucher'
      : refTypeSetting?.value === 'both'
      ? 'both'
      : 'points';

  const refereeRewardType: 'points' | 'voucher' | 'both' | 'none' =
    refereeTypeSetting?.value === 'none'
      ? 'none'
      : refereeTypeSetting?.value === 'voucher'
      ? 'voucher'
      : refereeTypeSetting?.value === 'both'
      ? 'both'
      : 'points';

  return {
    trigger,
    referrerRewardType,
    referrerRewardPoints: typeof refPointsSetting?.value === 'number' ? refPointsSetting.value : 50,
    referrerRewardVoucherCode: refVoucherSetting?.value ? String(refVoucherSetting.value).trim() : undefined,
    refereeRewardType,
    refereeRewardPoints: typeof refereePointsSetting?.value === 'number' ? refereePointsSetting.value : 25,
    refereeRewardVoucherCode: refereeVoucherSetting?.value ? String(refereeVoucherSetting.value).trim() : undefined,
  };
}

/**
 * Attribute referral upon registration:
 * - Reject self-referral
 * - Reject duplicate attribution
 * - Invalid code never blocks registration
 */
export async function createReferralAttribution(
  refereeId: string | Types.ObjectId,
  referralCode?: string,
  session?: ClientSession
): Promise<IReferralRecord | null> {
  if (!referralCode || typeof referralCode !== 'string' || !referralCode.trim()) {
    return null;
  }

  const cleanCode = referralCode.trim().toUpperCase();

  // Find referrer
  const referrer = session
    ? await Member.findOne({ referralCode: cleanCode, isActive: true }).session(session)
    : await Member.findOne({ referralCode: cleanCode, isActive: true });

  if (!referrer) {
    // Invalid code silently ignored
    return null;
  }

  // Self-referral guard
  if (referrer._id.toString() === refereeId.toString()) {
    return null;
  }

  const referee = session
    ? await Member.findById(refereeId).session(session)
    : await Member.findById(refereeId);

  if (!referee) {
    return null;
  }

  if (referee.phone === referrer.phone) {
    return null;
  }

  // Duplicate attribution guard: check if referee already has a record
  const existingRecord = session
    ? await ReferralRecord.findOne({ referee: referee._id }).session(session)
    : await ReferralRecord.findOne({ referee: referee._id });

  if (existingRecord) {
    return null;
  }

  if (referee.referredBy && referee.referredBy.toString() !== referrer._id.toString()) {
    return null;
  }

  // Link referredBy on referee if not already set
  if (!referee.referredBy) {
    referee.referredBy = referrer._id;
    if (session) {
      await referee.save({ session });
    } else {
      await referee.save();
    }
  }

  const rules = await getReferralRules();

  // Create ReferralRecord
  const recordData = {
    referrer: referrer._id,
    referee: referee._id,
    rewardStatus: 'pending' as const,
    trigger: rules.trigger,
    rewardType: rules.referrerRewardType,
    rewardValue: rules.referrerRewardPoints,
  };

  let record: IReferralRecord;
  if (session) {
    const created = await ReferralRecord.create([recordData], { session });
    record = created[0];
  } else {
    record = await ReferralRecord.create(recordData);
  }

  // If trigger is on registration, issue rewards immediately!
  if (rules.trigger === 'registration') {
    await grantReferralReward(record._id, undefined, session);
    const updated = session
      ? await ReferralRecord.findById(record._id).session(session)
      : await ReferralRecord.findById(record._id);
    return updated || record;
  }

  return record;
}

/**
 * Grant referral rewards to referrer (and optionally referee)
 * - Guarantees exact once execution using atomic conditional update
 */
export async function grantReferralReward(
  recordId: string | Types.ObjectId,
  relatedOrderId?: string | Types.ObjectId,
  session?: ClientSession
): Promise<IReferralRecord | null> {
  const now = new Date();

  // Atomic conditional lock: only transitions if status is currently 'pending'
  const record = await ReferralRecord.findOneAndUpdate(
    { _id: recordId, rewardStatus: 'pending' },
    {
      $set: {
        rewardStatus: 'granted',
        grantedAt: now,
        order: relatedOrderId,
      },
    },
    { new: true, session: session || undefined }
  ).populate('referrer referee');

  if (!record) {
    // Already granted or record not found
    return null;
  }

  const rules = await getReferralRules();
  const rewardDetails: any = {};

  const referrer = record.referrer as any;
  const referee = record.referee as any;

  // 1. Issue Referrer Points
  if (
    (rules.referrerRewardType === 'points' || rules.referrerRewardType === 'both') &&
    rules.referrerRewardPoints > 0 &&
    referrer?._id
  ) {
    try {
      await pointsService.adjustPoints(
        referrer._id,
        rules.referrerRewardPoints,
        'earn',
        `Referral reward for inviting ${referee?.name || 'new member'}`,
        { relatedOrder: relatedOrderId, session }
      );
      rewardDetails.referrerPoints = rules.referrerRewardPoints;
    } catch (e) {
      console.error('Failed to credit referrer points:', e);
    }
  }

  // 2. Issue Referrer Voucher (if configured)
  if (
    (rules.referrerRewardType === 'voucher' || rules.referrerRewardType === 'both') &&
    rules.referrerRewardVoucherCode &&
    referrer?._id
  ) {
    try {
      const voucher = await Voucher.findOne({
        code: rules.referrerRewardVoucherCode.toUpperCase(),
        isActive: true,
      });
      if (voucher) {
        await voucherService.issueVoucherToMembers({
          voucherId: voucher._id.toString(),
          memberIds: [referrer._id.toString()],
        });
        rewardDetails.referrerVoucherCode = voucher.code;
      }
    } catch (e) {
      console.error('Failed to issue referrer voucher:', e);
    }
  }

  // 3. Issue Referee Points (if configured)
  if (
    (rules.refereeRewardType === 'points' || rules.refereeRewardType === 'both') &&
    rules.refereeRewardPoints > 0 &&
    referee?._id
  ) {
    try {
      await pointsService.adjustPoints(
        referee._id,
        rules.refereeRewardPoints,
        'earn',
        `Welcome bonus for joining via ${referrer?.name || 'referral'}`,
        { relatedOrder: relatedOrderId, session }
      );
      rewardDetails.refereePoints = rules.refereeRewardPoints;
    } catch (e) {
      console.error('Failed to credit referee points:', e);
    }
  }

  // 4. Issue Referee Voucher (if configured)
  if (
    (rules.refereeRewardType === 'voucher' || rules.refereeRewardType === 'both') &&
    rules.refereeRewardVoucherCode &&
    referee?._id
  ) {
    try {
      const voucher = await Voucher.findOne({
        code: rules.refereeRewardVoucherCode.toUpperCase(),
        isActive: true,
      });
      if (voucher) {
        await voucherService.issueVoucherToMembers({
          voucherId: voucher._id.toString(),
          memberIds: [referee._id.toString()],
        });
        rewardDetails.refereeVoucherCode = voucher.code;
      }
    } catch (e) {
      console.error('Failed to issue referee voucher:', e);
    }
  }

  // Update reward details
  record.rewardDetails = rewardDetails;
  if (session) {
    await record.save({ session });
  } else {
    await record.save();
  }

  return record;
}

/**
 * Triggered on order completion:
 * If referral trigger is 'first_order', check if this is referee's first completed order
 */
export async function checkAndTriggerOrderReferralReward(
  refereeId: string | Types.ObjectId,
  orderId: string | Types.ObjectId,
  session?: ClientSession
): Promise<void> {
  const record = session
    ? await ReferralRecord.findOne({ referee: refereeId, rewardStatus: 'pending' }).session(session)
    : await ReferralRecord.findOne({ referee: refereeId, rewardStatus: 'pending' });

  if (!record) {
    return;
  }

  const rules = await getReferralRules();
  if (rules.trigger !== 'first_order') {
    return;
  }

  // Grant the reward!
  await grantReferralReward(record._id, orderId, session);
}

/**
 * Ensure all members in database have a referral code
 */
export async function ensureAllMembersHaveReferralCodes(): Promise<number> {
  const membersWithoutCode = await Member.find({
    $or: [{ referralCode: { $exists: false } }, { referralCode: null }, { referralCode: '' }],
  });
  let count = 0;
  for (const m of membersWithoutCode) {
    m.referralCode = generateReferralCode();
    await m.save();
    count++;
  }
  return count;
}

/**
 * Member Center Referral Overview
 */
export async function getMemberReferralOverview(memberId: string | Types.ObjectId) {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  if (!member.referralCode) {
    member.referralCode = generateReferralCode();
    await member.save();
  }

  const rules = await getReferralRules();
  const clientBaseUrl = env.CLIENT_URL || 'http://localhost:5173';
  const referralLink = `${clientBaseUrl}/r/${member.referralCode}`;

  const [totalCount, grantedCount, records] = await Promise.all([
    ReferralRecord.countDocuments({ referrer: member._id }),
    ReferralRecord.countDocuments({ referrer: member._id, rewardStatus: 'granted' }),
    ReferralRecord.find({ referrer: member._id })
      .populate('referee', 'name phone createdAt')
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // Total points earned from referrals
  let totalPointsEarned = 0;
  for (const r of records) {
    if (r.rewardStatus === 'granted' && r.rewardDetails?.referrerPoints) {
      totalPointsEarned += r.rewardDetails.referrerPoints;
    }
  }

  // Format referee list with masked phone
  const referrals = records.map((r: any) => {
    const rawPhone = r.referee?.phone || '';
    const maskedPhone =
      rawPhone.length > 7
        ? `${rawPhone.slice(0, 5)}****${rawPhone.slice(-2)}`
        : rawPhone;

    return {
      _id: r._id,
      refereeName: r.referee?.name || 'Valued Member',
      refereePhone: maskedPhone,
      joinedAt: r.referee?.createdAt || r.createdAt,
      rewardStatus: r.rewardStatus,
      trigger: r.trigger,
      grantedAt: r.grantedAt,
      rewardDetails: r.rewardDetails,
      order: r.order
        ? {
            orderNumber: r.order.orderNumber,
            totalAmount: r.order.totalAmount,
          }
        : undefined,
    };
  });

  return {
    referralCode: member.referralCode,
    referralLink,
    rules,
    stats: {
      totalReferrals: totalCount,
      successfulReferrals: grantedCount,
      pendingReferrals: totalCount - grantedCount,
      totalPointsEarned,
    },
    referrals,
  };
}

/**
 * Admin: Paginated referral records with search and status filtering
 */
export async function getAdminReferrals(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const skip = (page - 1) * limit;

  const query: any = {};
  if (params.status && params.status !== 'all') {
    query.rewardStatus = params.status;
  }

  if (params.search) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    // Search member by name, phone or referralCode
    const matchingMembers = await Member.find({
      $or: [{ name: searchRegex }, { phone: searchRegex }, { referralCode: searchRegex }],
    }).select('_id');

    const memberIds = matchingMembers.map((m) => m._id);
    query.$or = [{ referrer: { $in: memberIds } }, { referee: { $in: memberIds } }];
  }

  const [records, total] = await Promise.all([
    ReferralRecord.find(query)
      .populate('referrer', 'name phone referralCode email')
      .populate('referee', 'name phone email createdAt')
      .populate('order', 'orderNumber totalAmount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReferralRecord.countDocuments(query),
  ]);

  return {
    records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin: Referral system statistics and top referrers leaderboard
 */
export async function getAdminReferralStats() {
  const [total, granted, pending] = await Promise.all([
    ReferralRecord.countDocuments({}),
    ReferralRecord.countDocuments({ rewardStatus: 'granted' }),
    ReferralRecord.countDocuments({ rewardStatus: 'pending' }),
  ]);

  // Top referrers leaderboard
  const topReferrersAggregation = await ReferralRecord.aggregate([
    {
      $group: {
        _id: '$referrer',
        totalReferrals: { $sum: 1 },
        grantedReferrals: {
          $sum: { $cond: [{ $eq: ['$rewardStatus', 'granted'] }, 1, 0] },
        },
      },
    },
    { $sort: { totalReferrals: -1 } },
    { $limit: 10 },
  ]);

  const topReferrers = await Promise.all(
    topReferrersAggregation.map(async (item) => {
      const member = await Member.findById(item._id).select('name phone referralCode pointsBalance');
      return {
        memberId: item._id,
        name: member?.name || 'Unknown',
        phone: member?.phone || '',
        referralCode: member?.referralCode || '',
        pointsBalance: member?.pointsBalance || 0,
        totalReferrals: item.totalReferrals,
        grantedReferrals: item.grantedReferrals,
      };
    })
  );

  return {
    overview: {
      totalReferrals: total,
      grantedRewards: granted,
      pendingRewards: pending,
    },
    topReferrers,
  };
}
