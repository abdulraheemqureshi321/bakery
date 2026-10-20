import mongoose, { Types, ClientSession } from 'mongoose';
import { Order, IOrder, Product, Setting, Member } from '../models';
import { IOrderItem } from '../models/Order';
import { AppError } from '../utils/AppError';
import { getPaymentProvider } from './payment/PaymentProvider';
import * as pointsService from './pointsService';
import * as voucherService from './voucherService';
import * as referralService from './referralService';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  customizationNotes?: string;
}

export interface CreateOrderDTO {
  items: OrderItemInput[];
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  date?: string;
  paymentMethod: string;
  notes?: string;
  voucherId?: string; // memberVoucherId or voucher code
  voucherCode?: string;
  redeemPoints?: number;
  pointsToRedeem?: number;
}

export interface OrderPreviewResult {
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  voucherDiscount: number;
  pointsDiscount: number;
  pointsRedeemed: number;
  discountAmount: number;
  totalAmount: number;
  estimatedPointsEarned: number;
  voucherCode?: string;
  currency: string;
  currencySymbol: string;
}

/**
 * Generate a clean human-readable order number: ST-YYYYMMDD-XXXX
 */
export async function generateOrderNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let isUnique = false;
  let orderNumber = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    orderNumber = `ST-${dateStr}-${randomSuffix}`;
    const existing = await Order.findOne({ orderNumber });
    if (!existing) {
      isUnique = true;
    }
  }

  return orderNumber;
}

/**
 * Recalculate verified line items and modifiers from active database products
 */
export async function calculateVerifiedItems(
  items: OrderItemInput[]
): Promise<{ verifiedItems: IOrderItem[]; subtotal: number }> {
  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const verifiedItems: IOrderItem[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(
        `Product with ID "${item.productId}" is not available or inactive`,
        400
      );
    }

    if (item.quantity <= 0) {
      throw new AppError('Item quantity must be at least 1', 400);
    }

    let variantPriceModifier = 0;
    if (item.selectedVariants && product.variants && product.variants.length > 0) {
      for (const [varName, selectedOption] of Object.entries(item.selectedVariants)) {
        const variantDef = product.variants.find((v) => v.name === varName);
        if (variantDef) {
          const optIdx = variantDef.options.indexOf(selectedOption);
          if (optIdx !== -1 && variantDef.priceModifiers && variantDef.priceModifiers[optIdx]) {
            variantPriceModifier += Number(variantDef.priceModifiers[optIdx]) || 0;
          }
        }
      }
    }

    const unitPrice = product.price + variantPriceModifier;
    const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
    subtotal += lineTotal;

    verifiedItems.push({
      product: product._id,
      productName: product.name,
      productPrice: product.price,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants,
      variantPriceModifier,
      customizationNotes: item.customizationNotes,
      lineTotal,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  return { verifiedItems, subtotal };
}

/**
 * Calculate delivery fee from Settings rules
 */
export async function calculateDeliveryFee(
  subtotal: number,
  fulfillmentType: 'pickup' | 'delivery'
): Promise<number> {
  if (fulfillmentType === 'pickup') {
    return 0;
  }

  const deliverySetting = await Setting.findOne({ key: 'delivery_fee_rules' });
  const rules = deliverySetting?.value || { flat: 12, freeAbove: 120 };

  const flatFee = typeof rules.flat === 'number' ? rules.flat : 12;
  const freeThreshold = typeof rules.freeAbove === 'number' ? rules.freeAbove : 120;

  if (subtotal >= freeThreshold) {
    return 0;
  }

  return flatFee;
}

/**
 * Preview order totals for frontend cart and checkout with vouchers & points applied
 */
export async function previewOrder(
  items: OrderItemInput[],
  fulfillmentType: 'pickup' | 'delivery',
  memberId?: string,
  voucherId?: string,
  redeemPoints?: number
): Promise<OrderPreviewResult> {
  const { verifiedItems, subtotal } = await calculateVerifiedItems(items);
  const deliveryFee = await calculateDeliveryFee(subtotal, fulfillmentType);

  let voucherDiscount = 0;
  let voucherCode: string | undefined;
  const effectiveVoucher = voucherId;

  // 1. Voucher discount applied FIRST
  if (memberId && effectiveVoucher && effectiveVoucher.trim()) {
    const vResult = await voucherService.validateAndCalculateVoucher(
      memberId,
      effectiveVoucher.trim(),
      subtotal
    );
    voucherDiscount = vResult.discount;
    voucherCode = vResult.voucher.code;
  }

  const remainingAfterVoucher = Math.max(0, subtotal - voucherDiscount);

  // 2. Points discount applied SECOND on the remaining amount
  let pointsDiscount = 0;
  let pointsRedeemed = 0;
  const pointsRules = await pointsService.getPointsRules();

  if (memberId && redeemPoints && redeemPoints > 0) {
    const member = await Member.findById(memberId).select('pointsBalance');
    if (member) {
      const pResult = pointsService.calculatePointsDiscount(
        remainingAfterVoucher,
        redeemPoints,
        member.pointsBalance || 0,
        pointsRules
      );
      pointsDiscount = pResult.pointsDiscount;
      pointsRedeemed = pResult.pointsRedeemed;
    }
  }

  const discountAmount = Math.round((voucherDiscount + pointsDiscount) * 100) / 100;
  const payableSubtotal = Math.max(0, subtotal - discountAmount);
  const totalAmount = Math.round((payableSubtotal + deliveryFee) * 100) / 100;

  // 3. Estimated points to be earned (on remaining paid subtotal)
  const estimatedPointsEarned = Math.floor(payableSubtotal * pointsRules.earnRatio);

  const currencySetting = await Setting.findOne({ key: 'currency' });
  const symbolSetting = await Setting.findOne({ key: 'currency_symbol' });

  return {
    items: verifiedItems,
    subtotal,
    deliveryFee,
    voucherDiscount,
    pointsDiscount,
    pointsRedeemed,
    discountAmount,
    totalAmount,
    estimatedPointsEarned,
    voucherCode,
    currency: currencySetting?.value || 'MYR',
    currencySymbol: symbolSetting?.value || 'RM',
  };
}

/**
 * Create a new order with 100% server-verified pricing and transactional points/voucher updates
 */
export async function createOrder(
  memberId: string,
  data: CreateOrderDTO
): Promise<IOrder> {
  const executeOrderCreation = async (session?: ClientSession) => {
    // 1. Verify Member
    const member = session
      ? await Member.findById(memberId).session(session)
      : await Member.findById(memberId);
    if (!member || !member.isActive) {
      throw new AppError('Member account not found or inactive', 401);
    }

    // 2. Validate Payment Method from Settings
    const enabledPaymentSetting = await Setting.findOne({ key: 'enabled_payment_methods' });
    const enabledMethods: string[] = enabledPaymentSetting?.value || [
      'pay_in_store',
      'cash_on_delivery',
    ];

    if (!enabledMethods.includes(data.paymentMethod)) {
      throw new AppError(
        `Payment method "${data.paymentMethod}" is not enabled. Allowed methods: ${enabledMethods.join(', ')}`,
        400
      );
    }

    // 3. Calculate verified items and subtotal
    const { verifiedItems, subtotal } = await calculateVerifiedItems(data.items);

    // 4. Voucher discount applied FIRST
    let voucherDiscount = 0;
    let voucherCode: string | undefined;
    let memberVoucherId: Types.ObjectId | undefined;

    const effectiveVoucher = data.voucherId || data.voucherCode;
    if (effectiveVoucher && effectiveVoucher.trim()) {
      const vResult = await voucherService.validateAndCalculateVoucher(
        memberId,
        effectiveVoucher.trim(),
        subtotal
      );
      voucherDiscount = vResult.discount;
      voucherCode = vResult.voucher.code;
      memberVoucherId = vResult.memberVoucher._id;
    }

    const remainingAfterVoucher = Math.max(0, subtotal - voucherDiscount);

    // 5. Points discount applied SECOND on remaining amount
    let pointsDiscount = 0;
    let pointsRedeemed = 0;
    const pointsRules = await pointsService.getPointsRules();

    const pointsToUse = data.redeemPoints !== undefined ? data.redeemPoints : data.pointsToRedeem;
    if (pointsToUse && pointsToUse > 0) {
      const pResult = pointsService.calculatePointsDiscount(
        remainingAfterVoucher,
        pointsToUse,
        member.pointsBalance || 0,
        pointsRules
      );
      pointsDiscount = pResult.pointsDiscount;
      pointsRedeemed = pResult.pointsRedeemed;
    }

    // 6. Delivery Fee & Total
    const deliveryFee = await calculateDeliveryFee(subtotal, data.fulfillmentType);
    const discountAmount = Math.round((voucherDiscount + pointsDiscount) * 100) / 100;
    const payableSubtotal = Math.max(0, subtotal - discountAmount);
    const totalAmount = Math.round((payableSubtotal + deliveryFee) * 100) / 100;

    // 7. Projected points to earn
    const pointsEarned = Math.floor(payableSubtotal * pointsRules.earnRatio);

    // 8. Generate readable order number
    const orderNumber = await generateOrderNumber();

    // 9. Process through PaymentProvider
    const paymentProvider = getPaymentProvider(data.paymentMethod);
    const paymentResult = await paymentProvider.processPayment({} as any);

    if (!paymentResult.success) {
      throw new AppError(paymentResult.message || 'Payment processing failed', 400);
    }

    // 10. Notes formatting
    let combinedNotes = data.notes || '';
    if (data.date) {
      combinedNotes = combinedNotes
        ? `[Fulfillment Date: ${data.date}] ${combinedNotes}`
        : `[Fulfillment Date: ${data.date}]`;
    }

    // 11. Create Order Document
    const orderData = {
      member: new mongoose.Types.ObjectId(memberId),
      orderNumber,
      items: verifiedItems,
      subtotal,
      discountAmount,
      voucherDiscount,
      pointsDiscount,
      voucherCode,
      deliveryFee,
      totalAmount,
      pointsEarned,
      pointsRedeemed,
      pointsCredited: false,
      voucherUsed: memberVoucherId,
      fulfillmentType: data.fulfillmentType,
      pickupTime: data.fulfillmentType === 'pickup' ? data.pickupTime : undefined,
      deliveryAddress: data.fulfillmentType === 'delivery' ? data.deliveryAddress : undefined,
      deliveryNotes: data.deliveryNotes,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      notes: combinedNotes,
    };

    let order: IOrder;
    if (session) {
      const created = await Order.create([orderData], { session });
      order = created[0];
    } else {
      order = await Order.create(orderData);
    }

    // 12. If voucher was used, mark it used inside the transaction
    if (memberVoucherId && session) {
      await voucherService.applyVoucherInTransaction(memberVoucherId, order._id, session);
    } else if (memberVoucherId) {
      // If without session (e.g. single node dev fallback)
      await voucherService.applyVoucherInTransaction(
        memberVoucherId,
        order._id,
        null as any
      );
    }

    // 13. If points were redeemed, deduct points and record in ledger inside the transaction
    if (pointsRedeemed > 0) {
      await pointsService.adjustPoints(
        memberId,
        -pointsRedeemed,
        'redeem',
        `Redeemed ${pointsRedeemed} points on Order #${orderNumber}`,
        { relatedOrder: order._id, session }
      );
    }

    return order;
  };

  // Run in MongoDB transaction if connected to live MongoDB
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
    const order = await executeOrderCreation(session || undefined);
    if (session) {
      await session.commitTransaction();
    }
    return order;
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore rollback error
      }
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

/**
 * Member: Get own orders list
 */
export async function getMemberOrders(
  memberId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const query = { member: new mongoose.Types.ObjectId(memberId) };

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get single order by ID (with authorization check)
 */
export async function getOrderById(
  orderId: string,
  memberId?: string,
  isAdmin: boolean = false
): Promise<IOrder> {
  const order = await Order.findById(orderId).populate(
    'member',
    'name phone email'
  );

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!isAdmin && memberId && order.member._id.toString() !== memberId) {
    throw new AppError('You do not have access to this order', 403);
  }

  return order;
}

/**
 * Admin: Get all orders with filtering and search
 */
export async function getAllOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (params.status) {
    query.status = params.status;
  }

  if (params.search) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    query.$or = [{ orderNumber: searchRegex }, { 'items.productName': searchRegex }];
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('member', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Admin: Update order status, automatically crediting or refunding points/vouchers
 */
export async function updateOrderStatus(
  orderId: string,
  updates: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'refunded';
    notes?: string;
  }
): Promise<IOrder> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const oldStatus = order.status;

  if (updates.status) {
    order.status = updates.status;
  }
  if (updates.paymentStatus) {
    order.paymentStatus = updates.paymentStatus;
  }
  if (updates.notes !== undefined) {
    order.notes = updates.notes;
  }

  await order.save();

  // If order is completed: credit points to member and trigger first_order referral reward!
  if (updates.status === 'completed' && oldStatus !== 'completed') {
    await pointsService.creditOrderPoints(orderId);
    try {
      await referralService.checkAndTriggerOrderReferralReward(order.member, order._id);
    } catch (e) {
      console.error('Failed to trigger referral reward on order completion:', e);
    }
  }

  // If order is cancelled: restore voucher & refund points!
  if (updates.status === 'cancelled' && oldStatus !== 'cancelled') {
    await voucherService.restoreVoucherOnCancellation(orderId);
    await pointsService.refundOrderPoints(orderId);
  }

  return order;
}

/**
 * Member: Cancel pending order
 */
export async function cancelMemberOrder(
  orderId: string,
  memberId: string,
  reason?: string
): Promise<IOrder> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.member.toString() !== memberId) {
    throw new AppError('Unauthorized', 403);
  }
  if (order.status !== 'pending') {
    throw new AppError(`Cannot cancel order in ${order.status} status`, 400);
  }
  return updateOrderStatus(orderId, {
    status: 'cancelled',
    notes: reason ? `${order.notes || ''} [Cancelled: ${reason}]`.trim() : order.notes,
  });
}
