/**
 * Clean phone number to digits only (strip spaces, +, dashes).
 */
export function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^0-9]/g, '');
}

/**
 * Base helper building wa.me links with encoded text.
 */
export function buildWhatsAppLink(phoneNumber: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * General contact link.
 */
export function buildGeneralContactLink(
  phoneNumber: string,
  storeName: string = 'SoulTalk Pastry'
): string {
  const text = `Hello ${storeName}! I'm visiting your website and would like to make an enquiry.`;
  return buildWhatsAppLink(phoneNumber, text);
}

/**
 * Product / custom cake enquiry link with product name, selected variants and current page URL.
 */
export function buildProductEnquiryLink(
  phoneNumber: string,
  options: {
    productName: string;
    variants?: Record<string, string>;
    pageUrl?: string;
    isCustom?: boolean;
  }
): string {
  const { productName, variants, pageUrl, isCustom } = options;

  let variantDetails = '';
  if (variants && Object.keys(variants).length > 0) {
    const list = Object.entries(variants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    variantDetails = `\n• Selected Options: ${list}`;
  }

  let text = isCustom
    ? `Hello SoulTalk Pastry! I would like to enquire about customizing your "${productName}".`
    : `Hello SoulTalk Pastry! I would like to enquire about ordering "${productName}".`;

  if (variantDetails) {
    text += variantDetails;
  }

  if (pageUrl) {
    text += `\n• Link: ${pageUrl}`;
  }

  text += '\nCould you please let me know availability and lead time? Thank you!';

  return buildWhatsAppLink(phoneNumber, text);
}

/**
 * Dedicated Party Bags enquiry link for celebrations, kids parties, and corporate favor boxes.
 */
export function buildPartyBagsEnquiryLink(
  phoneNumber: string,
  options?: {
    guestCount?: number | string;
    eventDate?: string;
    theme?: string;
  }
): string {
  let text = 'Hello SoulTalk Pastry! I would like to enquire about your Party Bags / Celebration Favors.';

  if (options?.guestCount) {
    text += `\n• Estimated Guests/Bags: ${options.guestCount}`;
  }
  if (options?.eventDate) {
    text += `\n• Target Event Date: ${options.eventDate}`;
  }
  if (options?.theme) {
    text += `\n• Theme / Event Type: ${options.theme}`;
  }

  text += '\nCould you please share your party bag packages and options? Thanks!';

  return buildWhatsAppLink(phoneNumber, text);
}

/**
 * Order enquiry link for status tracking (ready for Phase 3).
 */
export function buildOrderEnquiryLink(
  phoneNumber: string,
  options: {
    orderNumber: string;
    customerName?: string;
  }
): string {
  let text = `Hello SoulTalk Pastry! I would like to check the status of my order #${options.orderNumber}.`;
  if (options.customerName) {
    text += `\n• Name: ${options.customerName}`;
  }
  return buildWhatsAppLink(phoneNumber, text);
}

/**
 * Shareable referral WhatsApp message (ready for Phase 6).
 */
export function buildReferralShareMessage(options: {
  storeName: string;
  referralCode: string;
  inviteUrl: string;
}): string {
  return `Hey! Check out ${options.storeName} for handcrafted cakes and artisanal pastries. Use my referral code *${options.referralCode}* to get rewards on your first order: ${options.inviteUrl}`;
}
