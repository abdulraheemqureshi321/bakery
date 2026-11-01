import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Palette,
  Coffee,
  Music,
  Gift,
  Cake,
  Calendar as CalendarIcon,
  CheckCircle,
} from 'lucide-react';
import { SoulTalkStorefront } from '../common/SoulTalkStorefront';

export interface BakeryEvent {
  id: string;
  day: number;
  month: number; // 0-indexed or 1-12
  year: number;
  title: string;
  time: string;
  category: 'workshop' | 'tasting' | 'member' | 'community';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  location: string;
  seatsRemaining: number;
  price: string;
}

export const sampleEvents: BakeryEvent[] = [
  {
    id: 'evt-1',
    day: 4,
    month: 10,
    year: 2026,
    title: 'Little Bakers Circle',
    time: '10:30 AM – 12:30 PM',
    category: 'workshop',
    icon: Users,
    description: 'A cozy Saturday morning flour-and-sugar workshop for young bakers (ages 6–12) to create mini fruit tartlets.',
    location: 'SoulTalk Pastry Studio, Kuchai Lama',
    seatsRemaining: 4,
    price: 'RM 65 / child',
  },
  {
    id: 'evt-2',
    day: 7,
    month: 10,
    year: 2026,
    title: 'Cake Sketch Club',
    time: '2:30 PM – 4:30 PM',
    category: 'community',
    icon: Palette,
    description: 'Bring your watercolors or sketchbooks to enjoy afternoon tea, matcha cups, and live floral pastry sketching.',
    location: 'Veranda Table, SoulTalk Boutique',
    seatsRemaining: 6,
    price: 'Complimentary with any pastry order',
  },
  {
    id: 'evt-3',
    day: 11,
    month: 10,
    year: 2026,
    title: 'Sweet Cup Day',
    time: '11:00 AM – 6:00 PM',
    category: 'tasting',
    icon: Cake,
    description: 'Special tasting flights featuring Orange Sunshine Cup and Strawberry Matcha Cup with fresh tea pairings.',
    location: 'Kuchai Lama Storefront',
    seatsRemaining: 12,
    price: 'RM 38 / pairing flight',
  },
  {
    id: 'evt-4',
    day: 14,
    month: 10,
    year: 2026,
    title: 'Cake Decorating Masterclass',
    time: '3:00 PM – 5:30 PM',
    category: 'workshop',
    icon: Sparkles,
    description: 'Hands-on piping techniques, edible flower placement, and knife smoothing on our Signature Vanilla Chiffon.',
    location: 'Kitchen Studio',
    seatsRemaining: 3,
    price: 'RM 140 / pax',
  },
  {
    id: 'evt-5',
    day: 18,
    month: 10,
    year: 2026,
    title: 'Tea & Cake Afternoon',
    time: '2:00 PM – 4:00 PM',
    category: 'tasting',
    icon: Coffee,
    description: 'Bespoke loose-leaf Cameron Highlands black tea paired with miniature slices of our seasonal celebration cakes.',
    location: 'Main Salon',
    seatsRemaining: 8,
    price: 'RM 45 / person',
  },
  {
    id: 'evt-6',
    day: 21,
    month: 10,
    year: 2026,
    title: 'Member Preview Evening',
    time: '6:30 PM – 8:30 PM',
    category: 'member',
    icon: Gift,
    description: 'Exclusive first-taste for SoulTalk Club members: uncovering our upcoming holiday Party Bags and winter creations.',
    location: 'Private Tasting Room',
    seatsRemaining: 5,
    price: 'Free for active members (100 pts entry)',
  },
  {
    id: 'evt-7',
    day: 25,
    month: 10,
    year: 2026,
    title: 'Jam Making & Scones',
    time: '10:00 AM – 12:00 PM',
    category: 'workshop',
    icon: Coffee,
    description: 'Slow-simmered strawberry vanilla compote and warm, golden buttermilk scones straight from our ovens.',
    location: 'Artisan Kitchen',
    seatsRemaining: 4,
    price: 'RM 78 / pax',
  },
  {
    id: 'evt-8',
    day: 27,
    month: 10,
    year: 2026,
    title: 'Watercolour Tags & Calligraphy',
    time: '3:00 PM – 5:00 PM',
    category: 'community',
    icon: Palette,
    description: 'Paint personalized keepsake gift tags and ribbon messages to accompany gift pastry boxes and birthday cakes.',
    location: 'Paper & Pastry Bench',
    seatsRemaining: 7,
    price: 'RM 50 (Materials included)',
  },
  {
    id: 'evt-9',
    day: 30,
    month: 10,
    year: 2026,
    title: 'Acoustic Evening & Warm Bakes',
    time: '7:30 PM – 9:30 PM',
    category: 'community',
    icon: Music,
    description: 'Unplugged guitar melodies, warm chocolate molten pastries, and spiced cinnamon lattes under the evening fairy lights.',
    location: 'Store Courtyard',
    seatsRemaining: 15,
    price: 'Free admission with cafe purchase',
  },
];

export const EventCalendar: React.FC = () => {
  // Month state (October 2026)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-based: 9 = October
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(14); // Default to Oct 14 masterclass

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Find event for selected date
  const selectedEvent = sampleEvents.find((e) => e.day === selectedDay) || sampleEvents[3];

  // Calendar cells generation (42 cells: 6 rows of 7 days Monday - Sunday)
  // For October 2026: Oct 1 is Thursday
  // Mon Tue Wed Thu Fri Sat Sun
  // 28  29  30   1   2   3   4
  const daysInMonth = 31;
  const startDayOffset = 3; // Thursday (Mon=0, Tue=1, Wed=2, Thu=3)
  
  const calendarCells = [];
  // Prev month padding
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({
      day: 28 + i,
      isCurrentMonth: false,
      isWeekend: false,
    });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (startDayOffset + d - 1) % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Sat, Sun
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isWeekend,
    });
  }
  // Next month padding to reach 42 cells
  let nextDay = 1;
  while (calendarCells.length < 42) {
    const nextCellDayOfWeek: number = calendarCells.length % 7;
    calendarCells.push({
      day: nextDay++,
      isCurrentMonth: false,
      isWeekend: nextCellDayOfWeek === 5 || nextCellDayOfWeek === 6,
    });
  }

  const upcomingEvents = sampleEvents.slice(0, 3);

  return (
    <div className="w-full space-y-12">
      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Large Monthly Paper Calendar (lg: 7 cols) */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-large)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--color-border)]">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-script text-3xl sm:text-4xl text-[var(--color-text)] font-semibold">
                  {monthNames[currentMonthIndex]}
                </span>
                <span className="font-serif-heading text-xl text-[var(--color-secondary-dark)] font-medium">
                  {currentYear}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Paper calendar of seasonal workshops, tastings & pastry circles
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-[var(--color-secondary)]">Sat</span>
            <span className="text-[var(--color-secondary)]">Sun</span>
          </div>

          {/* 42 Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              const eventForDay = cell.isCurrentMonth
                ? sampleEvents.find((e) => e.day === cell.day)
                : null;
              const isSelected = cell.isCurrentMonth && cell.day === selectedDay;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!cell.isCurrentMonth}
                  onClick={() => cell.isCurrentMonth && setSelectedDay(cell.day)}
                  className={`min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl text-left flex flex-col justify-between transition-all duration-150 border ${
                    !cell.isCurrentMonth
                      ? 'opacity-30 border-transparent bg-transparent cursor-default'
                      : isSelected
                      ? 'bg-[var(--color-blush)]/60 border-[var(--color-secondary)] shadow-xs scale-[1.02]'
                      : cell.isWeekend
                      ? 'bg-[var(--color-surface-soft)] border-[var(--color-border)] hover:border-[var(--color-secondary)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)]/70 hover:border-[var(--color-primary)]'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected
                        ? 'text-[var(--color-secondary-dark)] font-extrabold'
                        : cell.isWeekend
                        ? 'text-[var(--color-secondary)]'
                        : 'text-[var(--color-text)]'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {eventForDay && (
                    <div className="w-full mt-1">
                      <div className="flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] px-1 py-0.5 rounded text-[9px] font-bold truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                        <span className="truncate hidden sm:inline">{eventForDay.title}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Weekend Tint & Legend */}
          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between text-xs text-[var(--color-text-muted)] gap-3">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[var(--color-surface-soft)] border border-[var(--color-border)]" />
                <span>Weekend Boutique Hours</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[var(--color-blush)]/60 border border-[var(--color-secondary)]" />
                <span>Selected Date</span>
              </span>
            </div>
            <span className="font-script text-sm text-[var(--color-primary-dark)]">
              Reserve tickets in advance • Limited studio seats
            </span>
          </div>
        </div>

        {/* Right Side: “On the day” event information and illustrated SoulTalk storefront (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-large)] p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <span className="text-eyebrow text-[var(--color-primary)]">On The Day</span>
                <h3 className="font-serif-heading text-xl font-semibold text-[var(--color-text)]">
                  {monthNames[currentMonthIndex]} {selectedDay}, {currentYear}
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{selectedEvent ? 'Special Event' : 'Open Tasting'}</span>
              </div>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--color-blush)] text-[var(--color-secondary-dark)] flex items-center justify-center shrink-0">
                    <selectedEvent.icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                      {selectedEvent.title}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {selectedEvent.category.toUpperCase()} • {selectedEvent.price}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text)] leading-relaxed bg-[var(--color-surface-soft)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  {selectedEvent.description}
                </p>

                <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{selectedEvent.seatsRemaining} seats remaining for this session</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/60123456789?text=Hi%20SoulTalk%20Pastry!%20I%20would%20like%20to%20reserve%20a%20spot%20for%20the%20${encodeURIComponent(
                    selectedEvent.title
                  )}%20on%20${monthNames[currentMonthIndex]}%20${selectedDay}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center text-xs"
                >
                  Reserve Your Seat via WhatsApp
                </a>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No workshop scheduled for this date. Our boutique bakery is open for counter takeaway, coffee, and cake pickups.
                </p>
                <div className="text-xs text-[var(--color-primary-dark)] font-bold">
                  Boutique Open: 9:00 AM – 8:00 PM
                </div>
              </div>
            )}
          </div>

          {/* Illustrated SoulTalk Storefront landmark */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-large)] p-5 shadow-xs flex flex-col items-center">
            <span className="text-eyebrow text-[var(--color-secondary-dark)] mb-2">
              Our Kuchai Lama Gathering Space
            </span>
            <SoulTalkStorefront size="calendar" showBadge={false} />
          </div>
        </div>
      </div>

      {/* “Coming up next” Event Strip (3 clickable cards) */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-eyebrow text-[var(--color-secondary-dark)]">Reserve Early</span>
            <h3 className="font-serif-heading text-2xl font-semibold text-[var(--color-text)]">
              Coming Up Next
            </h3>
          </div>
          <span className="font-script text-lg text-[var(--color-primary-dark)]">
            Heartcrafted gatherings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingEvents.map((evt) => {
            const Icon = evt.icon;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedDay(evt.day)}
                className="soultalk-card soultalk-card-hover p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[10px] font-extrabold uppercase text-[var(--color-primary-dark)]">
                      Oct {evt.day}
                    </span>
                    <Icon className="w-4 h-4 text-[var(--color-secondary)] group-hover:scale-110 transition-transform" />
                  </div>

                  <h4 className="font-serif-heading text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text)]">{evt.price}</span>
                  <span className="text-[var(--color-primary)] font-extrabold group-hover:underline">
                    View Day →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
