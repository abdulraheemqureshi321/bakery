import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as orderService from '../services/orderService';

export async function previewOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, fulfillmentType, voucherId, voucherCode, redeemPoints, pointsToRedeem } = req.body;
    const effectiveVoucher = voucherId || voucherCode;
    const effectivePoints = redeemPoints !== undefined ? redeemPoints : pointsToRedeem;
    const result = await orderService.previewOrder(
      items,
      fulfillmentType,
      req.member?.id,
      effectiveVoucher,
      effectivePoints
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const order = await orderService.createOrder(memberId, req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await orderService.getMemberOrders(memberId, page, limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const orderId = req.params.id as string;
    const order = await orderService.getOrderById(orderId, memberId, false);
    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const orderId = req.params.id as string;
    const reason = req.body?.reason;
    const order = await orderService.cancelMemberOrder(orderId, memberId, reason);
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await orderService.getAllOrders({ status, search, page, limit });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.getOrderById(orderId, undefined, true);
    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.updateOrderStatus(orderId, req.body);
    res.json({
      success: true,
      message: `Order status updated to "${order.status}"`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}
