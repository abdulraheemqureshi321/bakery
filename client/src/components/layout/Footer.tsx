import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MessageCircle, MapPin, Phone, Clock, Cake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { getSetting, buildWhatsAppUrl } = useSettings();

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');
  const storeAddress = getSetting<string>('store_address', '123 Baker Street, KL, Malaysia');
  const storePhone = getSetting<string>('store_phone', '+60123456789');
  const storeHours = getSetting<string>('store_opening_hours', '9:00 AM - 8:00 PM');

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-rose-400 to-rose-300 flex items-center justify-center text-white">
                <Cake className="w-5 h-5" />
              </div>
              <span className="font-serif-display font-bold text-xl text-white tracking-tight">
                {storeName}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-4">
              Handcrafted cakes, artisan pastries, and celebratory creations made fresh daily with love and the finest ingredients.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Direct WhatsApp Concierge
            </a>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-200 mb-4">
              Store & Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{storeHours}</span>
              </li>
            </ul>
          </div>

          {/* Member Privileges */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-200 mb-4">
              Member Privileges
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed mb-3">
              Earn reward points on every ringgit spent, unlock birthday surprises, and share your unique referral code with friends.
            </p>
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl">
              ✨ Sign up today to start accumulating rewards and exclusive bakery perks.
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Freshly baked with perfection • SoulTalk Pastry
          </p>
        </div>
      </div>
    </footer>
  );
};
