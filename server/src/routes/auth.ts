import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as memberController from '../controllers/memberController';
import * as pointsController from '../controllers/pointsController';
import * as voucherController from '../controllers/voucherController';
import * as referralController from '../controllers/referralController';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  setPasswordSchema,
  updateProfileSchema,
  validateVoucherSchema,
} from '../validators/schemas';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/otp/request', otpLimiter, validate(requestOtpSchema), authController.requestOTP);
router.post('/otp/verify', authLimiter, validate(verifyOtpSchema), authController.verifyOTP);
router.post('/set-password', authenticate, validate(setPasswordSchema), authController.setPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.get('/profile', authenticate, memberController.getMyProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), memberController.updateMyProfile);

// Member Points (Phase 5)
router.get('/points', authenticate, pointsController.getMyPoints);
router.get('/points/history', authenticate, pointsController.getMyPointsHistory);

// Member Vouchers (Phase 5)
router.get('/vouchers', authenticate, voucherController.getMyVouchers);
router.post('/vouchers/validate', authenticate, validate(validateVoucherSchema), voucherController.validateVoucher);

// Member Referrals (Phase 6)
router.get('/referrals', authenticate, referralController.getMyReferrals);

export default router;


