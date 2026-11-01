import React from 'react';
import { Link } from 'react-router-dom';
import { EventCalendar } from '../components/events/EventCalendar';
import { Sparkles, Calendar, Heart, ArrowLeft, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const EventsPage: React.FC = () => {
  const { buildWhatsAppUrl } = useSettings();

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary-dark)] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
          <span>Workshops, Tastings & Community Gatherings</span>
        </div>
        <span className="font-script text-3xl sm:text-4xl text-[var(--color-secondary-dark)] font-semibold block">
          心聊甜香 • Boutique Studio
        </span>
        <h1 className="text-h1 text-[var(--color-text)]">
          Events & Workshops Calendar
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          From hands-on children's baking circles to adult watercolor cake-tag afternoons and intimate tea tastings. Select any day on our paper calendar to view session details or reserve seats via WhatsApp.
        </p>
      </div>

      {/* Editorial Calendar Component */}
      <EventCalendar />

      {/* Private Event Hosting Callout */}
      <div className="soultalk-card p-8 bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-eyebrow text-[var(--color-primary)]">Private Bookings</span>
          <h3 className="font-serif-heading text-xl font-semibold text-[var(--color-text)]">
            Host Your Private Party or Workshop at SoulTalk
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-lg">
            Our Kuchai Lama studio is available for private birthday parties, bridal showers, and corporate team baking sessions with custom dessert tables.
          </p>
        </div>

        <a
          href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to enquire about hosting a private event at your studio.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0 text-xs"
        >
          <MessageCircle className="w-4 h-4 stroke-[2]" />
          <span>Enquire for Private Event</span>
        </a>
      </div>
    </div>
  );
};

