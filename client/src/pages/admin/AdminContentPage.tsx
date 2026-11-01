import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Save, Check, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const { getSetting } = useSettings();

  const [heroHeading, setHeroHeading] = useState('Sweet Moments, Baked With Love.');
  const [heroSubtext, setHeroSubtext] = useState(
    'Warm, handcrafted artisanal pastries and boutique celebration cakes in Kuchai Lama, Kuala Lumpur.'
  );
  const [promoBanner, setPromoBanner] = useState('15% welcome reward points with any Party Bag or celebration cake.');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-primary-dark)]">
          Content Studio
        </span>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
          Storefront Banners & Content
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
          Customize the editorial messages, announcements, and promotional taglines.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Storefront content updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="soultalk-card p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
            Hero Headline
          </label>
          <input
            type="text"
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-serif-heading font-semibold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
            Hero Supporting Description
          </label>
          <textarea
            rows={3}
            value={heroSubtext}
            onChange={(e) => setHeroSubtext(e.target.value)}
            className="w-full p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
            Seasonal Promotion Banner
          </label>
          <input
            type="text"
            value={promoBanner}
            onChange={(e) => setPromoBanner(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary text-xs !min-h-[44px]">
            <Save className="w-4 h-4 stroke-[2]" />
            <span>Save Storefront Content</span>
          </button>
        </div>
      </form>
    </div>
  );
};

