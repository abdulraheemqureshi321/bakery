import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  member?: {
    id: string;
    role: string;
  };
}

/**
 * Verify JWT access token from httpOnly cookie.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: string;
      role: string;
    };
    req.member = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

/**
 * Require admin role.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.member || req.member.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }
  next();
}

/**
 * Optional auth — sets req.member if token present, but doesn't fail.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: string;
        role: string;
      };
      req.member = { id: decoded.id, role: decoded.role };
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}
