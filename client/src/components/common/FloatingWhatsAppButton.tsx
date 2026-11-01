import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const { buildWhatsAppUrl } = useSettings();

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40">
      <a
        href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to enquire about your pastries.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-[var(--shadow-floating)] transition-all hover:-translate-y-[2px] active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-[var(--color-sage)]"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <MessageCircle className="w-5 h-5 stroke-[2]" />
        </span>
        <span className="hidden sm:inline font-bold text-xs tracking-wide pr-1">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
};
