import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Member, IMember } from '../models';
import { Setting } from '../models';
import env from '../config/env';
import { normalizePhone, isValidPhone } from '../utils/phone';
import { generateReferralCode, generateOTP } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { smsProvider } from './smsProvider';
import * as referralService from './referralService';

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

interface TokenPayload {
  id: string;
  role: string;
}

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

async function getDefaultCountryCode(): Promise<string> {
  const setting = await Setting.findOne({ key: 'default_country_code' });
  return setting?.value || '+60';
}

export async function registerMember(data: {
  name: string;
  phone: string;
  password: string;
  email?: string;
  birthday?: string;
  referralCode?: string;
}): Promise<{ member: IMember; accessToken: string; refreshToken: string }> {
  const defaultCountryCode = await getDefaultCountryCode();
  const normalizedPhone = normalizePhone(data.phone, defaultCountryCode);

  if (!isValidPhone(normalizedPhone)) {
    throw new AppError('Invalid phone number format');
  }

  // Check if phone already exists
  const existing = await Member.findOne({ phone: normalizedPhone });
  if (existing) {
    throw new AppError('Phone number already registered', 409);
  }

  // Check email uniqueness if provided
  if (data.email) {
    const emailExists = await Member.findOne({ email: data.email.toLowerCase() });
    if (emailExists) {
      throw new AppError('Email already registered', 409);
    }
  }

  // Handle referral — store referredBy if valid, don't process reward yet
  let referredBy: string | undefined;
  if (data.referralCode) {
    const referrer = await Member.findOne({
      referralCode: data.referralCode.toUpperCase(),
      isActive: true,
    });
    if (referrer) {
      referredBy = referrer._id.toString();
    }
    // Silently ignore invalid referral codes
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Generate unique referral code
  let referralCode = generateReferralCode();
  while (await Member.findOne({ referralCode })) {
    referralCode = generateReferralCode();
  }

  const member = await Member.create({
    name: data.name,
    phone: normalizedPhone,
    email: data.email?.toLowerCase(),
    birthday: data.birthday ? new Date(data.birthday) : undefined,
    passwordHash,
    referralCode,
    referredBy,
  });

  // Phase 6: Link referral record and trigger registration reward if applicable
  if (data.referralCode) {
    try {
      await referralService.createReferralAttribution(member._id, data.referralCode);
    } catch (e) {
      console.error('Failed to attribute referral:', e);
    }
  }

  const tokenPayload: TokenPayload = { id: member._id.toString(), role: member.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  member.refreshToken = refreshToken;
  await member.save();

  return { member, accessToken, refreshToken };
}

export async function loginWithPhone(data: {
  phone: string;
  password: string;
}): Promise<{ member: IMember; accessToken: string; refreshToken: string }> {
  const defaultCountryCode = await getDefaultCountryCode();
  const normalizedPhone = normalizePhone(data.phone, defaultCountryCode);

  const member = await Member.findOne({ phone: normalizedPhone });
  if (!member) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!member.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  if (!member.passwordHash) {
    throw new AppError('Please use OTP login to claim your account', 401);
  }

  const isMatch = await bcrypt.compare(data.password, member.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokenPayload: TokenPayload = { id: member._id.toString(), role: member.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  member.refreshToken = refreshToken;
  await member.save();

  return { member, accessToken, refreshToken };
}

export async function loginWithEmail(data: {
  email: string;
  password: string;
}): Promise<{ member: IMember; accessToken: string; refreshToken: string }> {
  const member = await Member.findOne({ email: data.email.toLowerCase() });
  if (!member) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!member.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  if (!member.passwordHash) {
    throw new AppError('Please use OTP login to claim your account', 401);
  }

  const isMatch = await bcrypt.compare(data.password, member.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokenPayload: TokenPayload = { id: member._id.toString(), role: member.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  member.refreshToken = refreshToken;
  await member.save();

  return { member, accessToken, refreshToken };
}

export async function requestOTP(phone: string): Promise<void> {
  const defaultCountryCode = await getDefaultCountryCode();
  const normalizedPhone = normalizePhone(phone, defaultCountryCode);

  if (!isValidPhone(normalizedPhone)) {
    throw new AppError('Invalid phone number format');
  }

  const member = await Member.findOne({ phone: normalizedPhone });
  if (!member) {
    throw new AppError('No account found with this phone number', 404);
  }

  if (!member.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  // Rate limit: one OTP per cooldown period
  if (member.otpLastRequestAt) {
    const elapsed = (Date.now() - member.otpLastRequestAt.getTime()) / 1000;
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      throw new AppError(
        `Please wait ${Math.ceil(OTP_COOLDOWN_SECONDS - elapsed)} seconds before requesting a new code`,
        429
      );
    }
  }

  const code = generateOTP();
  member.otpCode = await bcrypt.hash(code, SALT_ROUNDS);
  member.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  member.otpAttempts = 0;
  member.otpLastRequestAt = new Date();
  await member.save();

  await smsProvider.sendOTP(normalizedPhone, code);
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ member: IMember; accessToken: string; refreshToken: string }> {
  const defaultCountryCode = await getDefaultCountryCode();
  const normalizedPhone = normalizePhone(phone, defaultCountryCode);

  const member = await Member.findOne({ phone: normalizedPhone });
  if (!member) {
    throw new AppError('No account found with this phone number', 404);
  }

  if (!member.otpCode || !member.otpExpiresAt) {
    throw new AppError('No OTP requested. Please request a new code.', 400);
  }

  // Check attempt limit
  if (member.otpAttempts >= OTP_MAX_ATTEMPTS) {
    // Invalidate the OTP
    member.otpCode = undefined;
    member.otpExpiresAt = undefined;
    member.otpAttempts = 0;
    await member.save();
    throw new AppError('Too many attempts. Please request a new code.', 429);
  }

  // Check expiry
  if (new Date() > member.otpExpiresAt) {
    member.otpCode = undefined;
    member.otpExpiresAt = undefined;
    member.otpAttempts = 0;
    await member.save();
    throw new AppError('OTP has expired. Please request a new code.', 400);
  }

  // Verify code
  const isMatch = await bcrypt.compare(code, member.otpCode);
  if (!isMatch) {
    member.otpAttempts += 1;
    await member.save();
    throw new AppError(
      `Invalid code. ${OTP_MAX_ATTEMPTS - member.otpAttempts} attempts remaining.`,
      400
    );
  }

  // Clear OTP fields
  member.otpCode = undefined;
  member.otpExpiresAt = undefined;
  member.otpAttempts = 0;

  const tokenPayload: TokenPayload = { id: member._id.toString(), role: member.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  member.refreshToken = refreshToken;
  await member.save();

  return { member, accessToken, refreshToken };
}

export async function setPasswordAfterOTP(
  memberId: string,
  password: string
): Promise<void> {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new AppError('Member not found', 404);
  }

  member.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await member.save();
}

export async function refreshTokens(
  currentRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(currentRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const member = await Member.findById(decoded.id);
  if (!member || member.refreshToken !== currentRefreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (!member.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const tokenPayload: TokenPayload = { id: member._id.toString(), role: member.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  member.refreshToken = refreshToken;
  await member.save();

  return { accessToken, refreshToken };
}

export async function logout(memberId: string): Promise<void> {
  await Member.findByIdAndUpdate(memberId, { $unset: { refreshToken: 1 } });
}

export async function getMemberProfile(memberId: string): Promise<IMember> {
  const member = await Member.findById(memberId).select('-passwordHash -refreshToken -otpCode -otpExpiresAt -otpAttempts -otpLastRequestAt');
  if (!member) {
    throw new AppError('Member not found', 404);
  }
  return member;
}
