import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as referralService from '../services/referralService';
import { Member } from '../models';

/**
 * Member: Get my referral overview, personal link, rules, and referee history
 */
export async function getMyReferrals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const overview = await referralService.getMemberReferralOverview(memberId);
    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Validate a referral code and return referrer display name
 */
export async function validateReferralCode(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCode = req.params.code ? String(req.params.code) : '';
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required',
        data: { isValid: false },
      });
    }

    const referrer = await Member.findOne({ referralCode: code, isActive: true }).select('name referralCode');
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive referral code',
        data: { isValid: false },
      });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        referrerName: referrer.name,
        referralCode: referrer.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get paginated list of all referral relationships
 */
export async function getAdminReferrals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await referralService.getAdminReferrals({ page, limit, search, status });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get referral statistics & leaderboard
 */
export async function getAdminReferralStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await referralService.getAdminReferralStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
