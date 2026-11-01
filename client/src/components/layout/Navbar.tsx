import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShoppingBag,
  User,
  Heart,
  Sparkles,
  Menu,
  X,
  MessageCircle,
  Shield,
  LogOut,
  Calendar,
  Gift,
  Home,
  Grid,
  Globe,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { member, isAuthenticated, isAdmin, logout } = useAuth();
  const { getSetting, buildWhatsAppUrl } = useSettings();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favouriteCount] = useState(3); // Interactive favourites count indicator
  const [isBagBouncing, setIsBagBouncing] = useState(false);
  const prevCountRef = React.useRef(totalItemCount);

  // Trigger bounce animation when item count increases
  React.useEffect(() => {
    if (totalItemCount > prevCountRef.current) {
      setIsBagBouncing(true);
      const timer = setTimeout(() => setIsBagBouncing(false), 700);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalItemCount;
  }, [totalItemCount]);

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');

  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.menu', 'Menu'), path: '/products' },
    { label: t('nav.story', 'Our Story'), path: '/story' },
    { label: t('nav.gallery', 'Gallery'), path: '/gallery' },
    { label: t('nav.events', 'Events'), path: '/events' },
    { label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop & Mobile Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-xs transition-all">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-9 h-[62px] sm:h-[78px] flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo on Left */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-xl p-0.5 sm:p-1">
            <img
              src="/brand/soultalk-logo.png"
              alt="SoulTalk Pastry Logo"
              className="h-9 w-9 sm:h-12 sm:w-12 object-contain rounded-xl transition-transform group-hover:scale-105"
              onError={(e) => {
                // Graceful fallback if image is still loading
                (e.target as HTMLImageElement).src = '/products/strawberry-love-cake.png';
              }}
            />
            <div className="flex flex-col">
              <span className="font-serif-heading font-semibold text-base sm:text-xl text-[var(--color-text)] tracking-tight leading-none group-hover:text-[var(--color-primary)] transition-colors">
                SoulTalk <span className="hidden xs:inline">Pastry</span>
              </span>
              <span className="font-script text-[11px] sm:text-sm text-[var(--color-secondary-dark)] font-medium leading-tight mt-0.5">
                心聊甜香 • Kuchai Lama
              </span>
            </div>
          </Link>

          {/* Centered Desktop Navigation inside a softly rounded container */}
          <nav
            className="hidden lg:flex items-center gap-1 bg-[var(--color-surface-soft)] p-1.5 rounded-full border border-[var(--color-border)] shadow-inner"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active = isActiveLink(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-200 transform active:scale-[0.98] ${
                    active
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-extrabold -translate-y-[1px]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 hover:-translate-y-[2px]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right-Side Utility Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Language Switch Option (Segmented EN / 中文) */}
            <div className="inline-flex items-center p-0.5 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs font-extrabold scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('zh')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'zh'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs font-extrabold scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                title="切换为中文 (Switch to Chinese)"
              >
                中文
              </button>
            </div>

            {/* Points Chip */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-gold)] transition-colors hover:-translate-y-[2px]"
              title="SoulTalk Member Rewards Points"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-warning)]" />
              <span>{isAuthenticated ? `${member?.pointsBalance ?? 0} ${t('header.points', 'pts')}` : t('header.earnPoints', 'Earn Points')}</span>
            </Link>

            {/* Favourites Icon (Desktop & Tablet) */}
            <Link
              to="/products"
              className="hidden md:inline-flex relative p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] hover:bg-[var(--color-surface-soft)] transition-all hover:-translate-y-[2px] active:scale-[0.98]"
              aria-label="Favourites"
              title="Saved Pastries"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {favouriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-blush)] text-[var(--color-secondary-dark)] text-[10px] font-extrabold flex items-center justify-center border border-[var(--color-surface)]">
                  {favouriteCount}
                </span>
              )}
            </Link>

            {/* Bag Icon with Count & Jiggle Animation */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 sm:p-2.5 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-text)] hover:bg-[var(--color-sage)] hover:text-[var(--color-primary-dark)] border border-[var(--color-border)] transition-all hover:-translate-y-[2px] active:scale-[0.98] cursor-pointer ${
                isBagBouncing ? 'animate-cart-jiggle ring-2 ring-[var(--color-primary)]' : ''
              }`}
              aria-label={`Shopping bag with ${totalItemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 rounded-full bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center shadow-xs animate-pop-in">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Login / Profile Button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all hover:-translate-y-[2px]"
                >
                  <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span className="max-w-[90px] truncate">{member?.name?.split(' ')[0] || 'Member'}</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] transition-colors"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-soft)] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 btn-primary text-xs !min-h-[38px] !px-4"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] transition-colors"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActiveLink(link.path)
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
              <a
                href={buildWhatsAppUrl('Hello SoulTalk Pastry, I have an enquiry.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              {isAuthenticated ? (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]"
                  >
                    <User className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Member Center ({member?.pointsBalance ?? 0} pts)</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-[var(--color-error)]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center text-xs !min-h-[42px]"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar: Home, Menu, Bag, Member */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-lg px-6 py-2.5 flex items-center justify-between pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]"
        aria-label="Mobile Navigation"
      >
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            location.pathname === '/' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span>{t('nav.home', 'Home')}</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            location.pathname.startsWith('/products') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
          }`}
        >
          <Grid className="w-5 h-5 stroke-[1.8]" />
          <span>{t('nav.menu', 'Menu')}</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-extrabold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span>{language === 'zh' ? '购物袋' : 'Bag'}</span>
        </button>

        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            location.pathname === '/account' || location.pathname === '/login'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span>{language === 'zh' ? '会员' : 'Member'}</span>
        </Link>
      </nav>
    </>
  );
};
