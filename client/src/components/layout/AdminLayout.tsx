import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { member, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calmer neutral version of the same design system
  // Required sidebar tabs:
  // - Dashboard
  // - Content
  // - Products
  // - Orders
  // - Members
  // - Vouchers
  // - Reports
  // - Settings
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Content', path: '/admin/content', icon: FileText },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Vouchers', path: '/admin/vouchers', icon: Ticket },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)] font-sans-body">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar (Calmer neutral version of SoulTalk system) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xs flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with SoulTalk Logo */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[var(--color-border)]">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <img
              src="/brand/soultalk-logo.png"
              alt="SoulTalk Pastry"
              className="h-10 w-10 object-contain rounded-xl"
            />
            <div>
              <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block leading-tight">
                SoulTalk Pastry
              </span>
              <span className="font-script text-xs text-[var(--color-primary-dark)] font-semibold">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2] shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border)] space-y-2">
          <div className="px-3 py-2 text-xs bg-[var(--color-surface-soft)] rounded-xl border border-[var(--color-border)]">
            <span className="block text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
              Signed in as
            </span>
            <span className="font-bold text-[var(--color-text)] truncate block">
              {member?.name || 'Administrator'}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>View Public Storefront</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[var(--color-error)] hover:bg-[var(--color-blush)]/40 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Bar */}
        <div className="h-16 flex items-center justify-between px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[var(--color-text)]"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-6 h-6 stroke-[1.8]" />
          </button>
          <span className="font-serif-heading font-semibold text-sm">Admin Console</span>
          <Link to="/" className="p-2 text-[var(--color-text)]">
            <Home className="w-5 h-5 stroke-[1.8]" />
          </Link>
        </div>

        {/* Content View */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
