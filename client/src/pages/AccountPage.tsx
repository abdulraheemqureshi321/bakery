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
  Percent,
  TrendingUp,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { member, updateProfile, logout, isAdmin } = useAuth();
  const { buildOrderWhatsAppUrl, getSetting } = useSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'rewards'>('profile');
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

  // Phase 5 & 6: Points, Vouchers & Referrals state
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pointsRules, setPointsRules] = useState<PointsRules | null>(null);
  const [memberVouchers, setMemberVouchers] = useState<MemberVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'available' | 'used' | 'expired'>('available');
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<MemberReferralOverview | null>(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // Synchronize form when member updates
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

  // Fetch orders when tab is opened or initially
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.data.orders);
        }
      } catch {
        // silent fallback
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch points & vouchers whenever rewards tab is active
  useEffect(() => {
    if (activeTab !== 'rewards') return;

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

        if (pRes.data?.success) {
          setPointsRules(pRes.data.data.pointsRules);
        }
        if (hRes.data?.success) {
          setPointsHistory(hRes.data.data.transactions);
        }
        if (vRes.data?.success) {
          setMemberVouchers(vRes.data.data.vouchers);
        }
        if (rRes.data?.success) {
          setReferralData(rRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load rewards data', err);
      } finally {
        setLoadingPoints(false);
        setLoadingVouchers(false);
        setLoadingReferrals(false);
      }
    };

    fetchRewardsData();
  }, [activeTab]);

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
      `Hey! I'm inviting you to SoulTalk Pastry — handcrafted artisanal cakes & French pastries! 🍰✨\n\nUse my personal referral link to unlock welcome treats:\n${referralLink}`
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
      setSaveError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Member Center Card Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-linear-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                {member.name}
              </h1>
              {/* Member Status Indicator */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  member.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : member.status === 'suspended'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {member.status || 'Active'} Member
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Member since {new Date(member.createdAt).toLocaleDateString()} • ID: {member.referralCode}
            </p>
          </div>
        </div>

        {/* Quick Points & Signout */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-rose-600">
                Points Balance
              </span>
              <span className="font-serif-display text-lg font-bold text-rose-950">
                {member.pointsBalance ?? 0} <span className="text-xs font-sans text-rose-700">pts</span>
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'orders'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'rewards'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Points & Rewards</span>
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Your member profile has been updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-display text-xl font-bold text-stone-900">
                Personal Information
              </h2>
              <p className="text-xs text-stone-500">
                Keep your details updated for birthday treats and delivery notifications.
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setSaveError('');
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <User className="w-5 h-5 text-stone-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400">Full Name</span>
                  <span className="font-medium text-stone-900">{member.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <Phone className="w-5 h-5 text-stone-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400">Mobile Phone</span>
                  <span className="font-medium text-stone-900">{member.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <Mail className="w-5 h-5 text-stone-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400">Email Address</span>
                  <span className="font-medium text-stone-900">{member.email || 'Not set'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <Calendar className="w-5 h-5 text-stone-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-stone-400">Birthday</span>
                  <span className="font-medium text-stone-900">
                    {member.birthday ? new Date(member.birthday).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="e.g. John Tan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="e.g. +60123456789 or 0123456789"
                  />
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    Phone stays normalized & unique.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    placeholder="e.g. member@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {isAdmin && (
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">You have Administrator privileges</span>
              <Link
                to="/admin/members"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Go to Admin Member Console
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-xl font-bold text-stone-900">
              Past Cake & Pastry Orders
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <span>Order More Cakes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
              <p className="text-xs text-stone-500 mt-2">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-10 text-center rounded-3xl border border-stone-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">No Past Orders Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You haven't ordered yet. Enjoy fresh artisanal bakes made with love!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                <span>Browse Menu</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const whatsappUrl = buildOrderWhatsAppUrl({
                  orderNumber: order.orderNumber,
                  customerName: member.name,
                });

                return (
                  <div
                    key={order._id}
                    className="glass-card p-5 rounded-3xl border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                      <div>
                        <span className="font-mono text-sm font-bold text-stone-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-stone-400 ml-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-[11px] font-semibold text-stone-500 uppercase px-2 py-0.5 rounded-md bg-stone-100">
                          {order.fulfillmentType}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-medium text-stone-800 line-clamp-1">
                          {order.items.map((i) => `${i.productName} (×${i.quantity})`).join(', ')}
                        </p>
                        <span className="text-stone-400 text-[11px]">
                          {order.fulfillmentType === 'pickup'
                            ? `Collection Slot: ${order.pickupTime || 'Standard'}`
                            : `Delivery to: ${order.deliveryAddress}`}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-base font-bold text-stone-900">
                          {currencySymbol} {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-stone-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-stone-950"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>View Order Details</span>
                      </button>

                      {/* WhatsApp Enquiry Per Order */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-medium transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                        <span>Order Enquiry (WhatsApp)</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REWARDS, POINTS, VOUCHERS, REFERRALS */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Points Section */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-stone-900">
                    SoulTalk Reward Points
                  </h3>
                  <p className="text-xs text-stone-500">
                    Earn points automatically on orders and redeem cash discounts at checkout.
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right bg-rose-50/60 p-4 rounded-2xl sm:bg-transparent sm:p-0 border border-rose-100 sm:border-0">
                <span className="font-serif-display text-3xl font-bold text-rose-600 block">
                  {member.pointsBalance ?? 0}
                </span>
                <span className="text-xs text-stone-600 font-medium">
                  Worth approx. <strong className="text-rose-700">{currencySymbol} {(((member.pointsBalance ?? 0) * (pointsRules?.redeemRatio || 0.01))).toFixed(2)}</strong> discount
                </span>
              </div>
            </div>

            {/* Points Rules Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Earn Rate</span>
                <span className="font-semibold text-xs text-stone-800">1 Pt / {currencySymbol} 1.00</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Redemption Value</span>
                <span className="font-semibold text-xs text-stone-800">100 Pts = {currencySymbol} 1.00</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Minimum to Redeem</span>
                <span className="font-semibold text-xs text-stone-800">{pointsRules?.minRedeem || 100} Points</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="block text-[10px] uppercase font-bold text-stone-400">Order Cap</span>
                <span className="font-semibold text-xs text-stone-800">Max {pointsRules?.maxOrderSharePercent || 50}% of Subtotal</span>
              </div>
            </div>

            {/* Points Transaction Ledger */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-rose-500" />
                  <span>Points Transaction History</span>
                </h4>
                <span className="text-[11px] text-stone-400">
                  {pointsHistory.length} record{pointsHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingPoints ? (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full" />
                  <p className="text-xs text-stone-400 mt-2">Loading ledger history...</p>
                </div>
              ) : pointsHistory.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-500 text-xs">
                  No points activity yet. Complete an order to earn your first reward points!
                </div>
              ) : (
                <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-xs">
                  {pointsHistory.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx._id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                tx.type === 'earn'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : tx.type === 'redeem'
                                  ? 'bg-rose-50 text-rose-700'
                                  : tx.type === 'refund'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {tx.type}
                            </span>
                            <span className="text-stone-400 text-[10px]">
                              {new Date(tx.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="font-medium text-stone-800 text-xs truncate">
                            {tx.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono text-sm font-bold block ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${tx.amount}` : tx.amount}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Bal: {tx.balanceAfter} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vouchers Section */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-stone-900">
                    My Vouchers & Coupons
                  </h3>
                  <p className="text-xs text-stone-500">
                    Available discounts issued to your account. Select one at checkout to save!
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs">
                {(['available', 'used', 'expired', 'all'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setVoucherFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                      voucherFilter === filter
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Vouchers Grid */}
            {loadingVouchers ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                <p className="text-xs text-stone-400 mt-2">Loading vouchers...</p>
              </div>
            ) : (() => {
              const filteredVouchers = memberVouchers.filter((mv) => {
                if (voucherFilter === 'all') return true;
                return mv.status === voucherFilter;
              });

              if (filteredVouchers.length === 0) {
                return (
                  <div className="p-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-500 text-xs space-y-2">
                    <p className="font-medium text-stone-700">No {voucherFilter !== 'all' ? voucherFilter : ''} vouchers found</p>
                    <p className="text-stone-400 text-[11px]">
                      Special promotional vouchers will appear here when issued by the bakery.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredVouchers.map((mv) => {
                    const voucher = mv.voucher;
                    if (!voucher) return null;
                    const isAvailable = mv.status === 'available';

                    return (
                      <div
                        key={mv._id}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                          isAvailable
                            ? 'bg-gradient-to-br from-white to-purple-50/40 border-purple-200/80 shadow-xs hover:border-purple-300'
                            : 'bg-stone-50/80 border-stone-200 opacity-70'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-serif-display text-lg font-bold text-stone-900 block">
                                {voucher.type === 'percentage'
                                  ? `${voucher.value}% OFF`
                                  : `${currencySymbol} ${voucher.value.toFixed(2)} OFF`}
                              </span>
                              <span className="text-xs font-semibold text-purple-900 block">
                                {voucher.name}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : mv.status === 'used'
                                  ? 'bg-stone-200 text-stone-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {mv.status}
                            </span>
                          </div>

                          {voucher.description && (
                            <p className="text-[11px] text-stone-500 line-clamp-2">
                              {voucher.description}
                            </p>
                          )}

                          <div className="space-y-1 text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                            {voucher.minOrderAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Min Spend:</span>
                                <span className="font-semibold text-stone-700 font-mono">
                                  {currencySymbol} {voucher.minOrderAmount.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Expires:</span>
                              <span className="font-medium text-stone-700">
                                {new Date(mv.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Code and Action Bar */}
                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                          <div className="px-2.5 py-1 rounded-lg bg-stone-100 font-mono text-xs font-bold text-stone-800 tracking-wider">
                            {voucher.code}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyVoucher(voucher.code)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors inline-flex items-center gap-1"
                            >
                              {copiedVoucher === voucher.code ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 text-[11px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy</span>
                                </>
                              )}
                            </button>

                            {isAvailable && (
                              <Link
                                to="/products"
                                className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                              >
                                Shop
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Referral Section (Phase 6) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/50">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-stone-900 flex items-center gap-2">
                    <span>Invite Friends & Earn Rewards</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Phase 6 Live
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Share your personalized referral link with friends. Both of you earn bonus rewards!
                  </p>
                </div>
              </div>

              {/* Quick WhatsApp Share */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
            </div>

            {/* Referral Link & Code Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                  Your Referral Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-rose-600 tracking-wider">
                    {member.referralCode}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(member.referralCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                  Your Personal Referral Link
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-stone-700 truncate select-all">
                    {referralLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                <span className="text-[11px] text-stone-500 font-medium block">Total Invited</span>
                <span className="font-serif-display text-2xl font-bold text-stone-900 mt-0.5 block">
                  {referralData?.stats.totalReferrals ?? 0}
                </span>
                <span className="text-[10px] text-stone-400">Friends registered</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                <span className="text-[11px] text-emerald-700 font-medium block">Rewards Granted</span>
                <span className="font-serif-display text-2xl font-bold text-emerald-600 mt-0.5 block">
                  {referralData?.stats.successfulReferrals ?? 0}
                </span>
                <span className="text-[10px] text-stone-400">Completed triggers</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                <span className="text-[11px] text-amber-700 font-medium block">Pending</span>
                <span className="font-serif-display text-2xl font-bold text-amber-600 mt-0.5 block">
                  {referralData?.stats.pendingReferrals ?? 0}
                </span>
                <span className="text-[10px] text-stone-400">Awaiting 1st order</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                <span className="text-[11px] text-rose-700 font-medium block">Points Earned</span>
                <span className="font-serif-display text-2xl font-bold text-rose-600 mt-0.5 block">
                  {referralData?.stats.totalPointsEarned ?? 0}
                </span>
                <span className="text-[10px] text-stone-400">Total bonus points</span>
              </div>
            </div>

            {/* Referral Trigger Info */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>How Referral Rewards Work:</strong>{' '}
                {referralData?.rules.trigger === 'registration' ? (
                  <span>
                    When your friend registers using your link, you instantly receive{' '}
                    <strong>+{referralData.rules.referrerRewardPoints} points</strong> and they receive{' '}
                    <strong>+{referralData.rules.refereeRewardPoints} points</strong>!
                  </span>
                ) : (
                  <span>
                    When your friend registers using your link and completes their{' '}
                    <strong>first bakery order</strong>, you receive{' '}
                    <strong>+{referralData?.rules.referrerRewardPoints || 50} bonus points</strong> in your ledger!
                  </span>
                )}
              </div>
            </div>

            {/* Successful Referrals History */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-stone-900 flex items-center justify-between">
                <span>Invited Friends History</span>
                <span className="text-xs text-stone-400 font-normal">
                  {referralData?.referrals.length || 0} friend(s)
                </span>
              </h4>

              {loadingReferrals ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  <div className="inline-block animate-spin w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full mb-1" />
                  <p>Loading referral activity...</p>
                </div>
              ) : !referralData?.referrals || referralData.referrals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-2">
                  <Users className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs font-medium text-stone-600">No friends registered yet</p>
                  <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                    Copy your invite link or tap "Share via WhatsApp" above to share the sweet love with family and friends!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referralData.referrals.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between text-xs transition-colors hover:border-rose-200"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-stone-900 flex items-center gap-2">
                          <span>{item.refereeName}</span>
                          <span className="font-mono text-[11px] text-stone-400 font-normal">
                            ({item.refereePhone})
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 block">
                          Joined {new Date(item.joinedAt).toLocaleDateString()}
                          {item.order && ` • Order #${item.order.orderNumber}`}
                        </span>
                      </div>

                      <div className="text-right">
                        {item.rewardStatus === 'granted' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Reward Granted</span>
                            </span>
                            {item.rewardDetails?.referrerPoints && (
                              <span className="block font-mono font-bold text-rose-600 text-xs">
                                +{item.rewardDetails.referrerPoints} pts
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending 1st Order</span>
                            </span>
                            <span className="block text-[10px] text-stone-400">
                              Awaiting completion
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-stone-900">
                  Order Details
                </h3>
                <span className="font-mono text-xs text-rose-600 font-semibold">
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block">Status:</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-stone-500 block">Payment:</span>
                <span className="font-semibold text-stone-800 mt-1 block">
                  {selectedOrder.paymentMethod === 'pay_in_store' ? 'Pay in Store' : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Items ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{item.productName}</div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-[10px] text-stone-500">
                          {Object.entries(item.selectedVariants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </div>
                      )}
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Qty: {item.quantity} × {currencySymbol}{' '}
                        {(item.productPrice + item.variantPriceModifier).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-stone-900">
                      {currencySymbol} {item.lineTotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">
                  {currencySymbol} {selectedOrder.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-mono font-semibold">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : `${currencySymbol} ${selectedOrder.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {selectedOrder.voucherDiscount ? (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>Voucher Discount {selectedOrder.voucherCode ? `(${selectedOrder.voucherCode})` : ''}</span>
                  <span className="font-mono font-bold">- {currencySymbol} {selectedOrder.voucherDiscount.toFixed(2)}</span>
                </div>
              ) : null}
              {selectedOrder.pointsDiscount ? (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Points Discount ({selectedOrder.pointsRedeemed} pts)</span>
                  <span className="font-mono font-bold">- {currencySymbol} {selectedOrder.pointsDiscount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-stone-950 font-bold text-sm pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="font-mono text-rose-600 text-base">
                  {currencySymbol} {selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={buildOrderWhatsAppUrl({
                  orderNumber: selectedOrder.orderNumber,
                  customerName: member.name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              {selectedOrder.status === 'pending' && (
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to cancel this order? Any redeemed points and vouchers will be restored.')) {
                      try {
                        const res = await api.post(`/orders/${selectedOrder._id}/cancel`, {
                          reason: 'Cancelled by member from account center',
                        });
                        if (res.data?.success) {
                          setSelectedOrder(res.data.data.order);
                          const r = await api.get('/orders/my-orders');
                          if (r.data?.success) setOrders(r.data.data.orders);
                        }
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to cancel order');
                      }
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                >
                  Cancel Order
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
