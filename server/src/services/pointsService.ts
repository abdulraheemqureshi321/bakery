import mongoose, { Types, ClientSession } from 'mongoose';
import { Member, Setting, PointsTransaction, Order } from '../models';
import { IPointsTransaction } from '../models/PointsTransaction';
import { AppError } from '../utils/AppError';

export interface PointsRules {
  earnRatio: number; // Points earned per currency unit (e.g. 1 point per RM 1)
  redeemRatio: number; // Currency value per point redeemed (e.g. 0.01 = 100 pts = RM 1)
  minRedeem: number; // Minimum points required to redeem (e.g. 100 pts)
  maxOrderSharePercent: number; // Maximum % of order payable with points (e.g. 50%)
  creditEvent: 'order_completed' | 'order_paid'; // When points are credited
}

/**
 * Read current points rules from Settings (with documented defaults)
 */
export async function getPointsRules(): Promise<PointsRules> {
  const [earnSetting, redeemSetting, minSetting, shareSetting, eventSetting] = await Promise.all([
    Setting.findOne({ key: 'points_earn_ratio' }),
    Setting.findOne({ key: 'points_redeem_ratio' }),
    Setting.findOne({ key: 'points_min_redeem' }),
    Setting.findOne({ key: 'points_max_order_share_percent' }),
    Setting.findOne({ key: 'points_credit_event' }),
  ]);

  return {
    earnRatio: typeof earnSetting?.value === 'number' ? earnSetting.value : 1,
    redeemRatio: typeof redeemSetting?.value === 'number' ? redeemSetting.value : 0.01,
    minRedeem: typeof minSetting?.value === 'number' ? minSetting.value : 100,
    maxOrderSharePercent: typeof shareSetting?.value === 'number' ? shareSetting.value : 50,
    creditEvent: (eventSetting?.value as any) || 'order_completed',
  };
}

/**
 * Update balance and ledger in one MongoDB transaction; never allows negative balance
 */
export async function adjustPoints(
  memberId: string | Types.ObjectId,
  amount: number,
  type: 'earn' | 'redeem' | 'adjust' | 'refund',
  description: string,
  options: {
    relatedOrder?: string | Types.ObjectId;
    createdBy?: string | Types.ObjectId;
    session?: ClientSession;
  } = {}
): Promise<{ newBalance: number; transaction: IPointsTransaction }> {
  const executeAdjustment = async (session?: ClientSession) => {
    // 1. Fetch member
    const member = session
      ? await Member.findById(memberId).session(session)
      : await Member.findById(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const currentBalance = member.pointsBalance || 0;
    const newBalance = currentBalance + amount;

    // 2. Strict guard: never allow negative points balance
    if (newBalance < 0) {
      throw new AppError(
        `Insufficient points balance. Current balance: ${currentBalance}, requested deduction: ${Math.abs(amount)}`,
        400
      );
    }

    // 3. Update member balance
    member.pointsBalance = newBalance;
    if (session) {
      await member.save({ session });
    } else {
      await member.save();
    }

    // 4. Create ledger entry
    const txData = {
      member: member._id,
      type,
      amount,
      balanceAfter: newBalance,
      description,
      relatedOrder: options.relatedOrder,
      createdBy: options.createdBy,
    };

    let transaction: IPointsTransaction;
    if (session) {
      const created = await PointsTransaction.create([txData], { session });
      transaction = created[0];
    } else {
      transaction = await PointsTransaction.create(txData);
    }

    return { newBalance, transaction };
  };

  // If a session was already provided by caller (part of larger transaction)
  if (options.session) {
    return executeAdjustment(options.session);
  }

  // Otherwise start a new transaction if connected to live MongoDB
  let session: ClientSession | null = null;
  if (mongoose.connection.readyState === 1) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }
  }

  try {
    const result = await executeAdjustment(session || undefined);
    if (session) {
      await session.commitTransaction();
    }
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore rollback error
      }
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

/**
 * Calculate points discount for checkout
 * Rules:
 * 1. Member must have at least minRedeem points
 * 2. Cannot redeem more than member has
 * 3. Cannot redeem more than maxOrderSharePercent of remaining subtotal
 */
export function calculatePointsDiscount(
  subtotalAfterVoucher: number,
  requestedPoints: number,
  memberBalance: number,
  rules: PointsRules
): { pointsRedeemed: number; pointsDiscount: number } {
  if (requestedPoints <= 0 || subtotalAfterVoucher <= 0) {
    return { pointsRedeemed: 0, pointsDiscount: 0 };
  }

  // Check minimum requirement
  if (memberBalance < rules.minRedeem) {
    throw new AppError(`Minimum points to redeem is ${rules.minRedeem}`, 400);
  }

  if (requestedPoints < rules.minRedeem) {
    throw new AppError(`Minimum points to redeem is ${rules.minRedeem}`, 400);
  }

  if (requestedPoints > memberBalance) {
    throw new AppError('Insufficient points balance', 400);
  }

  // Maximum discount allowed by order share limit (e.g. 50% of subtotal)
  const maxDiscountAllowed = (subtotalAfterVoucher * rules.maxOrderSharePercent) / 100;
  const maxPointsAllowed = Math.floor(maxDiscountAllowed / rules.redeemRatio);

  const usablePoints = Math.min(requestedPoints, maxPointsAllowed);

  // If order share limit caps points below minRedeem, return 0 or throw
  if (usablePoints < rules.minRedeem) {
    throw new AppError(`Order amount is too small to redeem minimum ${rules.minRedeem} points with ${rules.maxOrderSharePercent}% cap`, 400);
  }

  const pointsDiscount = Math.round(usablePoints * rules.redeemRatio * 100) / 100;
  return { pointsRedeemed: usablePoints, pointsDiscount };
}

/**
 * Credit points when order is completed
 */
export async function creditOrderPoints(
  orderId: string,
  session?: ClientSession
): Promise<void> {
  const order = session
    ? await Order.findById(orderId).session(session)
    : await Order.findById(orderId);
  if (!order) return;

  if (order.pointsCredited || order.pointsEarned <= 0) {
    return;
  }

  await adjustPoints(
    order.member,
    order.pointsEarned,
    'earn',
    `Points earned from Order #${order.orderNumber}`,
    { relatedOrder: order._id, session }
  );

  order.pointsCredited = true;
  if (session) {
    await order.save({ session });
  } else {
    await order.save();
  }
}

/**
 * Refund / reverse points when order is cancelled
 * 1. Refunds redeemed points back to member
 * 2. Reverses earned points if they were already credited
 */
export async function refundOrderPoints(
  orderId: string,
  session?: ClientSession
): Promise<void> {
  const order = session
    ? await Order.findById(orderId).session(session)
    : await Order.findById(orderId);
  if (!order) return;

  // 1. Refund redeemed points
  if (order.pointsRedeemed > 0) {
    await adjustPoints(
      order.member,
      order.pointsRedeemed,
      'refund',
      `Refund ${order.pointsRedeemed} redeemed points from cancelled Order #${order.orderNumber}`,
      { relatedOrder: order._id, session }
    );
  }

  // 2. Reverse earned points if already credited
  if (order.pointsCredited && order.pointsEarned > 0) {
    await adjustPoints(
      order.member,
      -order.pointsEarned,
      'adjust',
      `Reverse ${order.pointsEarned} earned points from cancelled Order #${order.orderNumber}`,
      { relatedOrder: order._id, session }
    );
    order.pointsCredited = false;
    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }
  }
}

/**
 * Get member's points balance and rules
 */
export async function getMemberPoints(memberId: string) {
  const member = await Member.findById(memberId).select('pointsBalance name phone');
  if (!member) {
    throw new AppError('Member not found', 404);
  }

  const rules = await getPointsRules();
  return {
    pointsBalance: member.pointsBalance || 0,
    rules,
  };
}

/**
 * Member Points Ledger / Transaction History
 */
export async function getMemberPointsHistory(
  memberId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const query = { member: new Types.ObjectId(memberId) };

  const [transactions, total] = await Promise.all([
    PointsTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedOrder', 'orderNumber totalAmount')
      .lean(),
    PointsTransaction.countDocuments(query),
  ]);

  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin manual points adjustment with a reason
 */
export async function adminAdjustPoints(
  memberId: string,
  amount: number,
  reason: string,
  adminId: string
) {
  if (!amount || amount === 0) {
    throw new AppError('Adjustment amount cannot be zero', 400);
  }

  if (!reason || reason.trim().length === 0) {
    throw new AppError('Adjustment reason is required', 400);
  }

  return adjustPoints(memberId, amount, 'adjust', reason.trim(), {
    createdBy: adminId,
  });
}
