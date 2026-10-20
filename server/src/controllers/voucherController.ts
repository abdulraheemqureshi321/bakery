import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as voucherService from '../services/voucherService';

/**
 * Member: Get my vouchers (available, used, expired, all)
 */
export async function getMyVouchers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const filter = (req.query.status as any) || 'all';

    const vouchers = await voucherService.getMemberVouchers(memberId, filter);
    res.json({
      success: true,
      data: { vouchers },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Member: Validate voucher against subtotal
 */
export async function validateVoucher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.member!.id;
    const { voucherCode, subtotal } = req.body;

    const result = await voucherService.validateAndCalculateVoucher(
      memberId,
      voucherCode,
      Number(subtotal)
    );

    res.json({
      success: true,
      data: {
        isValid: true,
        discount: result.discount,
        voucher: result.voucher,
        memberVoucherId: result.memberVoucher._id,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get all vouchers
 */
export async function getAllVouchers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;
    const isActive =
      req.query.isActive === 'true'
        ? true
        : req.query.isActive === 'false'
        ? false
        : undefined;

    const result = await voucherService.getAllVouchers({ page, limit, search, isActive });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create voucher
 */
export async function createVoucher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: { voucher },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update voucher
 */
export async function updateVoucher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const voucher = await voucherService.updateVoucher(req.params.id as string, req.body);
    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: { voucher },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Issue voucher to members
 */
export async function issueVoucher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const voucherId = req.params.id || req.body.voucherId;
    const result = await voucherService.issueVoucherToMembers({
      ...req.body,
      voucherId,
    });
    res.json({
      success: true,
      message: `Issued voucher to ${result.issuedCount} member(s)${
        result.alreadyHeldCount > 0 ? ` (${result.alreadyHeldCount} members already had maximum allowed)` : ''
      }`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
