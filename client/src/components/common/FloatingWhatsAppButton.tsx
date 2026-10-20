import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const { buildWhatsAppUrl } = useSettings();

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50">
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-emerald-300"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        </span>
        <span className="hidden sm:inline font-medium text-xs tracking-wide pr-1">
          Chat With Us
        </span>
      </a>
    </aside>
  );
};
