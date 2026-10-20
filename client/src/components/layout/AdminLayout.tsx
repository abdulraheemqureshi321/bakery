import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Share2,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { member, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, ready: true },
    { name: 'Products', path: '/admin/products', icon: Package, ready: true },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree, ready: true },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings, ready: true },
    { name: 'Members & Import', path: '/admin/members', icon: Users, ready: true },
    { name: 'Vouchers', path: '/admin/vouchers', icon: Ticket, ready: true },
    { name: 'Referral Records', path: '/admin/referrals', icon: Share2, ready: true },
  ];

  return (
    <div className="min-h-screen flex bg-stone-900 text-stone-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 border-r border-stone-800 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif-display font-bold text-sm tracking-wide text-stone-100">
                SoulTalk
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-rose-400 font-semibold">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (!item.ready) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-500 text-xs cursor-not-allowed opacity-60"
                  title="Coming in later phases"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <div className="px-3 py-2 text-xs text-stone-400 bg-stone-900 rounded-lg">
            <span className="block text-stone-500 text-[10px] uppercase font-semibold">Signed in as</span>
            <span className="font-medium text-stone-200 truncate block">{member?.name || 'Administrator'}</span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Storefront View</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <div className="h-16 flex items-center justify-between px-4 bg-stone-950 border-b border-stone-800 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-stone-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif-display font-semibold text-sm">Admin Console</span>
          <Link to="/" className="p-2 text-stone-400 hover:text-white">
            <Home className="w-5 h-5" />
          </Link>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
