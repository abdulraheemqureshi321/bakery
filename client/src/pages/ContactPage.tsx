import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { SoulTalkStorefront } from '../components/common/SoulTalkStorefront';
import {
  MessageCircle,
  MapPin,
  Phone,
  Clock,
  Truck,
  Sparkles,
  Cake,
  Calendar,
  Send,
  Heart,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { getSetting, buildWhatsAppUrl } = useSettings();

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');
  const storeAddress = getSetting<string>(
    'store_address',
    'Kuchai Lama, 58200 Kuala Lumpur, Malaysia'
  );
  const storePhone = getSetting<string>('store_phone', '+6012-345 6789');
  const storeHours = getSetting<string>(
    'store_opening_hours',
    'Tuesday - Sunday: 9:00 AM - 8:00 PM (Closed Mondays)'
  );

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-script text-3xl sm:text-4xl text-[var(--color-secondary-dark)] font-semibold block">
          心聊甜香 • Get In Touch
        </span>
        <h1 className="text-h1 text-[var(--color-text)]">
          Visit Us in Kuchai Lama
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Whether you are looking for custom cake tasting, party favor bulk orders, or same-day bakery counter pickups, our team is always here to chat.
        </p>

        {/* Primary WhatsApp Action */}
        <div className="pt-2">
          <a
            href={buildWhatsAppUrl(
              `Hello ${storeName}! I would like to get in touch regarding an order or bakery enquiry.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs !min-h-[46px]"
          >
            <MessageCircle className="w-4 h-4 stroke-[2]" />
            <span>Chat on WhatsApp Concierge</span>
          </a>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Address Card */}
        <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-sage)] text-[var(--color-primary-dark)] flex items-center justify-center">
            <MapPin className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
            Bakery & Pickup Studio
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{storeAddress}</p>
        </div>

        {/* Hours Card */}
        <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-secondary-dark)] flex items-center justify-center">
            <Clock className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
            Studio Opening Hours
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{storeHours}</p>
        </div>

        {/* Phone Card */}
        <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-blush)] text-[var(--color-secondary-dark)] flex items-center justify-center">
            <Phone className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
            Direct Telephone
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{storePhone}</p>
        </div>
      </div>

      {/* Illustrated Storefront Landmark */}
      <div className="soultalk-card p-8 bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex flex-col items-center text-center space-y-4">
        <div>
          <span className="text-eyebrow text-[var(--color-primary)]">Boutique Landmark</span>
          <h3 className="font-serif-heading text-xl font-semibold text-[var(--color-text)]">
            Our Kuchai Lama Gathering Space
          </h3>
        </div>
        <SoulTalkStorefront size="large" showBadge={true} />
      </div>
    </div>
  );
};
