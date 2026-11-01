import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Sparkles,
  Heart,
  ArrowRight,
  Shield,
  Gift,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { getSetting, buildWhatsAppUrl } = useSettings();

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
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-text)] pt-12 sm:pt-16 pb-28 lg:pb-12 mt-16 sm:mt-20 relative overflow-hidden">
      {/* Decorative floral watermark in background */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-[var(--color-surface-soft)] rounded-full -mr-32 -mb-32 pointer-events-none opacity-40 blur-2xl" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[var(--color-border)]">
          
          {/* Brand Info & Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/brand/soultalk-logo.png"
                alt="SoulTalk Pastry"
                className="h-12 w-12 object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/products/strawberry-love-cake.png';
                }}
              />
              <div>
                <span className="font-serif-heading font-semibold text-xl text-[var(--color-text)] block leading-tight">
                  SoulTalk Pastry
                </span>
                <span className="font-script text-base text-[var(--color-secondary-dark)]">
                  心聊甜香 • Kuchai Lama
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Warm, handcrafted artisanal pastries and bespoke celebration cakes baked fresh daily in Kuchai Lama. Inspired by boutique paper boxes and heartfelt conversations.
            </p>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to enquire about cake orders.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
              Boutique Menu
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
                  Artisanal Cakes & Cups
                </Link>
              </li>
              <li>
                <Link to="/products?category=party-bags" className="hover:text-[var(--color-primary)] transition-colors">
                  Party Bags & Gift Packs
                </Link>
              </li>
              <li>
                <Link to="/#custom-cakes" className="hover:text-[var(--color-primary)] transition-colors">
                  Bespoke Celebration Orders
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[var(--color-primary)] transition-colors">
                  Workshops & Tastings
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[var(--color-primary)] transition-colors">
                  Artisanal Gallery (360°)
                </Link>
              </li>
              <li>
                <Link to="/story" className="hover:text-[var(--color-primary)] transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Hours & Location */}
          <div className="space-y-3">
            <h4 className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
              Kuchai Lama Store
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-1 stroke-[1.8]" />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--color-primary)] shrink-0 stroke-[1.8]" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-1 stroke-[1.8]" />
                <span>{storeHours}</span>
              </li>
            </ul>
          </div>

          {/* Member Rewards */}
          <div className="space-y-3">
            <h4 className="font-serif-heading font-semibold text-base text-[var(--color-text)] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[var(--color-secondary)] stroke-[2]" />
              <span>SoulTalk Club</span>
            </h4>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Earn reward points on every order, enjoy exclusive birthday surprises, and receive member-first event previews.
            </p>
            <div className="p-3.5 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)]">
              <span className="font-script text-base text-[var(--color-primary-dark)] font-semibold block">
                Baked with love, shared from the heart.
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Register today to receive 50 welcome reward points.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-text-muted)] gap-3">
          <p>© {new Date().getFullYear()} SoulTalk Pastry (心聊甜香). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">
              Contact Us
            </Link>
            <span className="text-[var(--color-border)]">•</span>
            <Link to="/admin" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
