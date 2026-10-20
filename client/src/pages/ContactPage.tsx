import React from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  MessageCircle,
  MapPin,
  Phone,
  Clock,
  Truck,
  Sparkles,
  Cake,
  Calendar,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { getSetting, buildWhatsAppUrl } = useSettings();

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');
  const storeAddress = getSetting<string>(
    'store_address',
    '123 Baker Street, Bangsar, 59100 Kuala Lumpur, Malaysia'
  );
  const storePhone = getSetting<string>('store_phone', '+60123456789');
  const storeHours = getSetting<string>(
    'store_opening_hours',
    'Tuesday - Sunday: 9:00 AM - 8:00 PM (Closed Mondays)'
  );
  const deliveryAreas = getSetting<string[]>('delivery_areas', [
    'Kuala Lumpur',
    'Petaling Jaya',
    'Subang Jaya',
    'Bangsar',
  ]);
  const pickupSlots = getSetting<string[]>('pickup_time_slots', [
    '10:00 AM',
    '12:00 PM',
    '2:00 PM',
    '4:00 PM',
    '6:00 PM',
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>We'd Love to Hear From You</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-900">
          Visit Us or Reach Out on WhatsApp
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Have a question regarding custom cakes, event party bags, or order pickup times? Our bakery concierge is always ready to assist you.
        </p>

        {/* Primary One-Tap WhatsApp Action */}
        <div className="pt-2">
          <a
            href={buildWhatsAppUrl(
              `Hello ${storeName}! I would like to get in touch regarding an order or enquiry.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-lg shadow-emerald-200 transition-all hover:scale-102"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span>One-Tap WhatsApp Concierge</span>
          </a>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Address Card */}
        <div className="glass-card p-6 rounded-3xl border border-stone-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-stone-900">
            Bakery & Pickup Studio
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">{storeAddress}</p>
        </div>

        {/* Hours Card */}
        <div className="glass-card p-6 rounded-3xl border border-stone-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-stone-900">
            Studio Opening Hours
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">{storeHours}</p>
        </div>

        {/* Phone / Call */}
        <div className="glass-card p-6 rounded-3xl border border-stone-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-stone-900">
            Direct Telephone
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">{storePhone}</p>
          <a
            href={`tel:${storePhone}`}
            className="inline-block text-xs font-semibold text-rose-600 hover:text-rose-700 pt-1"
          >
            Call Us Now →
          </a>
        </div>
      </div>

      {/* Fulfillment Details: Delivery Areas & Pickup Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Zones */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                Fresh Delivery Coverage
              </h3>
              <p className="text-xs text-stone-500">Hand-delivered in temperature-controlled boxes</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            We currently deliver to the following major districts. For outside coverage zones, please enquiry on WhatsApp for a custom courier arrangement.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {deliveryAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Pickup Slots */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                Self-Collection Slots
              </h3>
              <p className="text-xs text-stone-500">Scheduled collections ensure maximum freshness</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Please pick up your baked creations during designated slots. Custom orders require at least 24 hours advance notice.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {pickupSlots.map((slot) => (
              <span
                key={slot}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200/60"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
