/**
 * Normalize a phone number:
 * 1. Strip spaces, dashes, dots, parentheses
 * 2. If starts with 00, replace with +
 * 3. If no country code prefix (+), prepend the default country code
 * 4. Return the cleaned number
 *
 * @param phone - Raw phone input
 * @param defaultCountryCode - Default country code (e.g. "+60" for Malaysia)
 * @returns Normalized phone string
 */
export function normalizePhone(phone: string, defaultCountryCode: string = '+60'): string {
  // Strip whitespace, dashes, dots, parentheses
  let cleaned = phone.replace(/[\s\-().]/g, '');

  // Replace leading 00 with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If starts with +, it already has a country code
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starts with 0, it's a local number — remove the leading 0 and prepend country code
  if (cleaned.startsWith('0')) {
    return defaultCountryCode + cleaned.slice(1);
  }

  // Otherwise, assume it's missing the country code entirely
  return defaultCountryCode + cleaned;
}

/**
 * Validate that a normalized phone number is reasonable.
 * Must start with + followed by 7-15 digits.
 */
export function isValidPhone(normalizedPhone: string): boolean {
  return /^\+\d{7,15}$/.test(normalizedPhone);
}
