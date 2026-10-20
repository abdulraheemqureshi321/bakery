import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as pointsService from '../services/pointsService';

/**
 * Member: Get current points balance and system points rules
 */
export async function getMyPoints(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const data = await pointsService.getMemberPoints(memberId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Member: Get points ledger history
 */
export async function getMyPointsHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await pointsService.getMemberPointsHistory(memberId, page, limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get any member's points ledger history
 */
export async function getAdminMemberPointsHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const memberId = req.params.memberId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await pointsService.getMemberPointsHistory(memberId, page, limit);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Manual points adjustment with reason
 */
export async function adminAdjustPoints(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { memberId, amount, reason } = req.body;
    const adminId = req.member!.id;

    const result = await pointsService.adminAdjustPoints(memberId, amount, reason, adminId);
    res.json({
      success: true,
      message: `Adjusted points by ${amount > 0 ? '+' : ''}${amount} for member`,
      data: {
        ...result,
        member: { pointsBalance: result.newBalance },
      },
    });
  } catch (error) {
    next(error);
  }
}
