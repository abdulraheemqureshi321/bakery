import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { MessageCircle, User, LogOut, Shield, Menu, X, Cake, ShoppingBag, ClipboardList } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { member, isAuthenticated, isAdmin, logout } = useAuth();
  const { getSetting, buildWhatsAppUrl } = useSettings();
  const { totalItemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');
  const brandLogo = getSetting<string>('brand_logo', '');

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-stone-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {brandLogo ? (
            <img src={brandLogo} alt={storeName} className="h-9 w-auto object-contain rounded-md" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-rose-400 to-rose-300 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Cake className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-serif-display font-bold text-lg sm:text-xl text-stone-900 tracking-tight leading-tight">
              {storeName}
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-800">
              Artisanal Bakery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Cakes & Catalog
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Contact
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* WhatsApp Direct Enquiry */}
          <a
            href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to enquire about your pastries.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-50" />
            <span>WhatsApp Enquiry</span>
          </a>

          {/* Auth State Links */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg border border-purple-200 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/account"
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950 bg-stone-100/80 px-3 py-1.5 rounded-lg"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span>{member?.name || 'Account'}</span>
                {member?.pointsBalance !== undefined && (
                  <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {member.pointsBalance} pts
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-stone-700 hover:text-stone-950 px-3 py-1.5"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                Join / Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Mobile Cart Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute 1 top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalItemCount}
              </span>
            )}
          </button>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-emerald-500 text-white" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-white/95 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            Cakes & Catalog
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
          >
            Contact & Location
          </Link>
          <a
            href={buildWhatsAppUrl('Hello! I would like to make an enquiry.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-emerald-700 bg-emerald-50 rounded-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us Directly
          </a>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <div className="px-3 py-1 flex items-center justify-between text-sm text-stone-500">
                <span>Signed in as <strong className="text-stone-800">{member?.name}</strong></span>
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                  {member?.pointsBalance ?? 0} pts
                </span>
              </div>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
              >
                <ClipboardList className="w-5 h-5 text-stone-500" />
                My Orders
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-base font-medium text-stone-800 rounded-lg hover:bg-stone-50"
              >
                <User className="w-5 h-5 text-stone-500" />
                My Profile & Rewards
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-purple-700 bg-purple-50 rounded-lg"
                >
                  <Shield className="w-5 h-5" />
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-stone-800 font-medium rounded-xl border border-stone-200 hover:bg-stone-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-white bg-rose-500 hover:bg-rose-600 font-medium rounded-xl shadow-xs"
              >
                Join Member Program
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
