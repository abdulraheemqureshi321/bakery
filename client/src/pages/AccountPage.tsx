import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../api/client';
import { Order, PointsTransaction, MemberVoucher, PointsRules, MemberReferralOverview } from '../types';
import {
  User,
  Users,
  Phone,
  Mail,
  Calendar,
  Award,
  Ticket,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Edit2,
  Check,
  Copy,
  AlertCircle,
  Eye,
  X,
  ShoppingBag,
  ArrowRight,
  Shield,
  LogOut,
  Save,
  Sparkles,
  Coins,
  Gift,
  Heart,
  LayoutDashboard,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { member, updateProfile, logout, isAdmin } = useAuth();
  const { buildOrderWhatsAppUrl, getSetting } = useSettings();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'rewards' | 'profile'>('dashboard');
  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: member?.name || '',
    phone: member?.phone || '',
    email: member?.email || '',
    birthday: member?.birthday ? new Date(member.birthday).toISOString().split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Referral copy state
  const [copied, setCopied] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Rewards & Referrals state
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsRules, setPointsRules] = useState<PointsRules | null>(null);
  const [memberVouchers, setMemberVouchers] = useState<MemberVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'available' | 'used' | 'expired'>('available');
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<MemberReferralOverview | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        phone: member.phone || '',
        email: member.email || '',
        birthday: member.birthday ? new Date(member.birthday).toISOString().split('T')[0] : '',
      });
    }
  }, [member]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.data.orders);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch rewards
  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setLoadingPoints(true);
        setLoadingVouchers(true);
        setLoadingReferrals(true);

        const [pRes, hRes, vRes, rRes] = await Promise.all([
          api.get('/auth/points'),
          api.get('/auth/points/history?limit=30'),
          api.get('/auth/vouchers?filter=all'),
          api.get('/auth/referrals'),
        ]);

        if (pRes.data?.success) setPointsRules(pRes.data.data.pointsRules);
        if (hRes.data?.success) setPointsHistory(hRes.data.data.transactions);
        if (vRes.data?.success) setMemberVouchers(vRes.data.data.vouchers);
        if (rRes.data?.success) setReferralData(rRes.data.data);
      } catch (err) {
        // Fallback
      } finally {
        setLoadingPoints(false);
        setLoadingVouchers(false);
        setLoadingReferrals(false);
      }
    };

    fetchRewardsData();
  }, []);

  if (!member) return null;

  const referralLink = referralData?.referralLink || `${window.location.origin}/r/${member.referralCode}`;

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I'm sharing SoulTalk Pastry with you. Handcrafted artisanal cakes and pastries in Kuchai Lama. Use my invite code ${member.referralCode} to claim welcome perks: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyVoucher = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedVoucher(code);
      setTimeout(() => setCopiedVoucher(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthday: formData.birthday || undefined,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-sage)] text-[var(--color-primary-dark)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)] text-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-blush)] text-[var(--color-error)]">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-surface-soft)] text-[var(--color-warning)] border border-[var(--color-border)]">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  // Birthday status
  const hasBirthday = !!member.birthday;
  const birthMonth = hasBirthday ? new Date(member.birthday!).toLocaleString('default', { month: 'long' }) : null;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 space-y-8">
      
      {/* Header with SoulTalk Logo Artwork */}
      <div className="soultalk-card p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="/brand/soultalk-logo.png"
            alt="SoulTalk Pastry Logo"
            className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-2xl shrink-0 shadow-xs"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-script text-2xl text-[var(--color-secondary-dark)] font-semibold block leading-tight">
                心聊甜香 • Member Center
              </span>
            </div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
              Welcome back, {member.name}!
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Member ID: {member.referralCode} • Joined {new Date(member.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Points Card & Logout */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-[var(--color-surface-soft)] border border-[var(--color-border)] px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/40 text-[var(--color-warning)] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Points Balance
              </span>
              <span className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                {member.pointsBalance ?? 0} <span className="text-xs text-[var(--color-primary-dark)]">pts</span>
              </span>
            </div>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="p-2.5 rounded-xl text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs (visible on mobile < 950px) */}
      <div className="lg:hidden flex border-b border-[var(--color-border)] overflow-x-auto scrollbar-none gap-2 pb-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'rewards', label: 'Rewards & Vouchers', icon: Ticket },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Layout: Sidebar (3 cols) + Content Area (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 soultalk-card p-4 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
          <div className="p-2 mb-2 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-secondary-dark)] block">
              Member Navigation
            </span>
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: `My Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'rewards', label: 'Points & Vouchers', icon: Ticket },
            { id: 'profile', label: 'Account Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  active
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Summary 3-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Points Card */}
                <div className="soultalk-card p-5 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Available Points
                    </span>
                    <Coins className="w-4 h-4 text-[var(--color-warning)]" />
                  </div>
                  <div className="font-serif-heading text-2xl font-semibold text-[var(--color-text)]">
                    {member.pointsBalance ?? 0} <span className="text-xs font-normal text-[var(--color-primary-dark)]">pts</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Worth RM {((member.pointsBalance ?? 0) * 0.01).toFixed(2)} off future orders
                  </p>
                </div>

                {/* Vouchers Card */}
                <div className="soultalk-card p-5 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Active Vouchers
                    </span>
                    <Ticket className="w-4 h-4 text-[var(--color-secondary)]" />
                  </div>
                  <div className="font-serif-heading text-2xl font-semibold text-[var(--color-text)]">
                    {memberVouchers.filter((v) => v.status === 'available').length} <span className="text-xs font-normal text-[var(--color-text-muted)]">available</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline block"
                  >
                    View voucher codes →
                  </button>
                </div>

                {/* Birthday Reward Card */}
                <div className="soultalk-card p-5 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Birthday Treat
                    </span>
                    <Gift className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="font-serif-heading text-sm font-semibold text-[var(--color-text)] truncate">
                    {hasBirthday ? `Month: ${birthMonth}` : 'Not Set Yet'}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {hasBirthday ? 'Exclusive birthday surprise unlocked annually' : 'Add birthday in profile to claim gift'}
                  </p>
                </div>
              </div>

              {/* Referral Invite Card */}
              <div className="soultalk-card p-6 bg-[var(--color-surface-soft)] border border-[var(--color-border)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-eyebrow text-[var(--color-primary)]">Invite Friends</span>
                    <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                      Share Your SoulTalk Invite Code
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Give friends welcome points and earn 50 reward points when they place their first order.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReferral}
                      className="btn-secondary !min-h-[38px] !px-3.5 text-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="btn-primary !min-h-[38px] !px-3.5 text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 stroke-[2]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--color-text)] truncate">{referralLink}</span>
                  <span className="px-2 py-0.5 rounded bg-[var(--color-sage)] text-[var(--color-primary-dark)] font-bold text-[10px]">
                    {member.referralCode}
                  </span>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[var(--color-primary-dark)] hover:underline"
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                {loadingOrders ? (
                  <p className="text-xs text-[var(--color-text-muted)]">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-[var(--color-text-muted)]">You haven't placed any bakery orders yet.</p>
                    <Link to="/products" className="btn-primary text-xs !min-h-[38px] inline-flex">
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-3.5 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-between cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[var(--color-text)]">
                              #{order.orderNumber}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                          </span>
                        </div>
                        <span className="font-serif-heading font-semibold text-xs text-[var(--color-text)]">
                          RM {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                    All Order History
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Review your past cake orders, pickup slots, and receipts.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5] text-[var(--color-text-muted)] mx-auto" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">No past orders</p>
                  <Link to="/products" className="btn-primary text-xs !min-h-[40px] inline-flex">
                    Explore Pastries
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--color-text)]">
                            #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.fulfillmentType === 'pickup' ? 'Store Pickup' : 'Delivery'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)]">
                          RM {order.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-[var(--color-primary-dark)]">
                          View Receipt →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REWARDS & VOUCHERS */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Vouchers List */}
              <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                    My Member Vouchers
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {memberVouchers.length} vouchers
                  </span>
                </div>

                {memberVouchers.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                    No active vouchers right now. Vouchers will appear here when earned from promotions or referrals.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {memberVouchers.map((v) => (
                      <div
                        key={v._id}
                        className="p-4 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-blush)] text-[var(--color-secondary-dark)] text-[10px] font-extrabold uppercase">
                            {v.status}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--color-primary-dark)]">
                            {v.voucher?.code || 'VOUCHER'}
                          </span>
                        </div>
                        <h4 className="font-serif-heading font-semibold text-sm text-[var(--color-text)]">
                          {v.voucher?.name || 'Special Discount'}
                        </h4>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          Valid until {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'End of month'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Points History */}
              <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
                <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)] pb-3 border-b border-[var(--color-border)]">
                  Points Activity History
                </h3>

                {pointsHistory.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                    No points transactions recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {pointsHistory.map((t) => (
                      <div
                        key={t._id}
                        className="p-3 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[var(--color-text)] block">
                            {t.description || t.type}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`font-serif-heading font-semibold text-xs ${
                            t.amount >= 0 ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-error)]'
                          }`}
                        >
                          {t.amount >= 0 ? `+${t.amount}` : t.amount} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="soultalk-card p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                    Profile Details
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Keep your contact and birthday details up to date.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3.5 rounded-xl bg-[var(--color-blush)] text-[var(--color-error)] text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                    Birthday (for birthday reward voucher)
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs !min-h-[44px]"
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Selected Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-large)] border border-[var(--color-border)] max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Order Details</span>
                <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {selectedOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-[var(--color-border)]/50">
                  <div>
                    <span className="font-bold text-[var(--color-text)]">
                      {(typeof i.product === 'object' && i.product !== null ? (i.product as any).name : i.productName) || 'Pastry'}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] block">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-semibold text-[var(--color-text)]">RM {i.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-baseline text-sm">
              <span className="font-bold text-[var(--color-text)]">Total Paid</span>
              <span className="font-serif-heading font-semibold text-lg text-[var(--color-text)]">
                RM {selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary w-full text-xs !min-h-[40px]"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
