import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppLink,
  buildGeneralContactLink,
  buildProductEnquiryLink,
  buildPartyBagsEnquiryLink,
  buildOrderEnquiryLink,
  buildReferralWhatsAppMessage,
} from '../utils/helpers';

describe('WhatsApp Link Helpers', () => {
  const testPhone = '+60 12-345 6789';
  const cleanPhone = '60123456789';

  it('builds basic wa.me link with encoded text and clean phone number', () => {
    const link = buildWhatsAppLink(testPhone, 'Hello World!');
    expect(link).toBe(`https://wa.me/${cleanPhone}?text=Hello%20World!`);
  });

  it('builds general contact link with store name', () => {
    const link = buildGeneralContactLink(testPhone, 'SoulTalk Pastry');
    expect(link).toContain(`https://wa.me/${cleanPhone}`);
    expect(decodeURIComponent(link)).toContain("Hello SoulTalk Pastry! I'm visiting your website");
  });

  it('builds product enquiry link with product name, variants, and page URL', () => {
    const link = buildProductEnquiryLink(testPhone, {
      productName: 'Signature Velvet Cake',
      variants: { Size: '8-inch', Flavor: 'Classic Cocoa' },
      pageUrl: 'http://localhost:5173/products/signature-velvet-cake',
      isCustom: false,
    });

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Signature Velvet Cake');
    expect(decoded).toContain('Size: 8-inch, Flavor: Classic Cocoa');
    expect(decoded).toContain('http://localhost:5173/products/signature-velvet-cake');
  });

  it('builds custom cake enquiry link with customization messaging', () => {
    const link = buildProductEnquiryLink(testPhone, {
      productName: 'Bespoke Celebration Cake',
      isCustom: true,
    });

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('customizing your "Bespoke Celebration Cake"');
  });

  it('builds dedicated Party Bags enquiry link with guests, date, and theme', () => {
    const link = buildPartyBagsEnquiryLink(testPhone, {
      guestCount: 30,
      eventDate: '2026-11-15',
      theme: 'Pastel Floral',
    });

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Party Bags / Celebration Favors');
    expect(decoded).toContain('Estimated Guests/Bags: 30');
    expect(decoded).toContain('Target Event Date: 2026-11-15');
    expect(decoded).toContain('Theme / Preferences: Pastel Floral');
  });

  it('builds order enquiry link for status tracking', () => {
    const link = buildOrderEnquiryLink(testPhone, {
      orderNumber: 'ST-2026-1001',
      customerName: 'Alice Tan',
    });

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('order #ST-2026-1001');
    expect(decoded).toContain('Alice Tan');
  });

  it('builds shareable referral message for WhatsApp', () => {
    const message = buildReferralWhatsAppMessage({
      storeName: 'SoulTalk Pastry',
      referralCode: 'REF12345',
      inviteUrl: 'http://localhost:5173/register?ref=REF12345',
    });

    expect(message).toContain('*REF12345*');
    expect(message).toContain('http://localhost:5173/register?ref=REF12345');
  });
});
