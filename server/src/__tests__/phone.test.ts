import { describe, it, expect } from 'vitest';
import { normalizePhone, isValidPhone } from '../utils/phone';

describe('normalizePhone', () => {
  it('strips spaces, dashes and dots', () => {
    expect(normalizePhone('012-345 6789', '+60')).toBe('+60123456789');
    expect(normalizePhone('012.345.6789', '+60')).toBe('+60123456789');
    expect(normalizePhone('012 345 6789', '+60')).toBe('+60123456789');
  });

  it('strips parentheses', () => {
    expect(normalizePhone('(012) 3456789', '+60')).toBe('+60123456789');
  });

  it('handles leading 00 as international prefix', () => {
    expect(normalizePhone('0060123456789', '+60')).toBe('+60123456789');
  });

  it('keeps existing + country code', () => {
    expect(normalizePhone('+60123456789', '+60')).toBe('+60123456789');
    expect(normalizePhone('+1 234 567 8901', '+60')).toBe('+12345678901');
  });

  it('prepends default country code for local numbers starting with 0', () => {
    expect(normalizePhone('0123456789', '+60')).toBe('+60123456789');
  });

  it('prepends default country code for numbers without 0 or +', () => {
    expect(normalizePhone('123456789', '+60')).toBe('+60123456789');
  });

  it('uses provided default country code', () => {
    expect(normalizePhone('0123456789', '+65')).toBe('+65123456789');
    expect(normalizePhone('0123456789', '+1')).toBe('+1123456789');
  });

  it('defaults to +60 when no country code given', () => {
    expect(normalizePhone('0123456789')).toBe('+60123456789');
  });
});

describe('isValidPhone', () => {
  it('accepts valid normalized phone numbers', () => {
    expect(isValidPhone('+60123456789')).toBe(true);
    expect(isValidPhone('+12345678901')).toBe(true);
    expect(isValidPhone('+8613800138000')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidPhone('0123456789')).toBe(false);    // no +
    expect(isValidPhone('+123')).toBe(false);           // too short
    expect(isValidPhone('+abc12345678')).toBe(false);   // non-digits
    expect(isValidPhone('')).toBe(false);
  });
});
