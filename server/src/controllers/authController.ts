import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import env from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function sanitizeMember(member: any) {
  const obj = member.toObject ? member.toObject() : { ...member };
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.otpCode;
  delete obj.otpExpiresAt;
  delete obj.otpAttempts;
  delete obj.otpLastRequestAt;
  return obj;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { member, accessToken, refreshToken } = await authService.registerMember(req.body);
    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({
      success: true,
      data: { member: sanitizeMember(member) },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;

    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');

    let result;
    if (isEmail) {
      result = await authService.loginWithEmail({ email: identifier, password });
    } else {
      result = await authService.loginWithPhone({ phone: identifier, password });
    }

    setTokenCookies(res, result.accessToken, result.refreshToken);
    res.json({
      success: true,
      data: { member: sanitizeMember(result.member) },
    });
  } catch (error) {
    next(error);
  }
}

export async function requestOTP(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.requestOTP(req.body.phone);
    res.json({
      success: true,
      message: 'Verification code sent',
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, code } = req.body;
    const { member, accessToken, refreshToken } = await authService.verifyOTP(phone, code);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      success: true,
      data: {
        member: sanitizeMember(member),
        needsPassword: !member.passwordHash,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function setPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.member) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    await authService.setPasswordAfterOTP(req.member.id, req.body.password);
    res.json({
      success: true,
      message: 'Password set successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(token);
    setTokenCookies(res, accessToken, newRefreshToken);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.member) {
      await authService.logout(req.member.id);
    }
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.member) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const member = await authService.getMemberProfile(req.member.id);
    res.json({
      success: true,
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}
