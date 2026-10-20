import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { OrderPreviewResult, MemberVoucher, PointsRules } from '../types';
import {
  MapPin,
  Clock,
  Truck,
  Store,
  CreditCard,
  Ticket,
  Coins,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Sparkles,
  Check,
  X,
  Percent,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { member, isAuthenticated, loading: authLoading } = useAuth();
  const { getSetting } = useSettings();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Settings
  const storeAddress = getSetting<string>(
    'store_address',
    '42 Baker Street, Bangsar, 59100 Kuala Lumpur'
  );
  const storeHours = getSetting<string>(
    'store_opening_hours',
    'Tuesday - Sunday: 9:00 AM - 8:00 PM (Closed Mondays)'
  );
  const pickupSlots = getSetting<string[]>('pickup_time_slots', [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
  ]);
  const enabledPaymentMethods = getSetting<string[]>('enabled_payment_methods', [
    'pay_in_store',
    'cash_on_delivery',
  ]);
  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  // Form State
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupTime, setPickupTime] = useState<string>(pickupSlots[0] || '11:00 AM');
  const [fulfillmentDate, setFulfillmentDate] = useState<string>(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    enabledPaymentMethods[0] || 'pay_in_store'
  );
  const [orderNotes, setOrderNotes] = useState('');

  // Server Preview State
  const [preview, setPreview] = useState<OrderPreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Phase 5: Vouchers & Points state
  const [availableVouchers, setAvailableVouchers] = useState<MemberVoucher[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>('');
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string>('');
  const [validatingVoucher, setValidatingVoucher] = useState<boolean>(false);

  const [pointsRules, setPointsRules] = useState<PointsRules | null>(null);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // 1. Auth check: redirect guest to login with return path
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  // Fetch available vouchers and points rules for member
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMemberRewards = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          api.get('/auth/vouchers?filter=available'),
          api.get('/auth/points'),
        ]);

        if (vRes.data?.success) {
          setAvailableVouchers(vRes.data.data.vouchers);
        }
        if (pRes.data?.success) {
          setPointsRules(pRes.data.data.pointsRules);
        }
      } catch {
        // silent fallback
      }
    };

    fetchMemberRewards();
  }, [isAuthenticated]);

  // 2. Fetch server-verified pricing, discounts, and delivery fee preview
  useEffect(() => {
    if (items.length === 0) return;

    const fetchPreview = async () => {
      try {
        setPreviewLoading(true);
        setError('');
        const payload = {
          fulfillmentType,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedVariants: i.selectedVariants,
            customizationNotes: i.customizationNotes,
          })),
          voucherCode: selectedVoucherCode || undefined,
          redeemPoints: usePoints && pointsToRedeem > 0 ? pointsToRedeem : undefined,
        };

        const res = await api.post('/orders/preview', payload);
        if (res.data?.success) {
          setPreview(res.data.data);
          setVoucherError('');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to calculate verified prices';
        setError(msg);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, [items, fulfillmentType, selectedVoucherCode, usePoints, pointsToRedeem]);

  // Adjust default payment method if fulfillment changes
  useEffect(() => {
    if (fulfillmentType === 'delivery') {
      if (enabledPaymentMethods.includes('cash_on_delivery')) {
        setPaymentMethod('cash_on_delivery');
      }
    } else {
      if (enabledPaymentMethods.includes('pay_in_store')) {
        setPaymentMethod('pay_in_store');
      }
    }
  }, [fulfillmentType, enabledPaymentMethods]);

  const handleApplyVoucherCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    setVoucherError('');
    setValidatingVoucher(true);
    try {
      const res = await api.post('/auth/vouchers/validate', {
        voucherCode: voucherInput.trim(),
        subtotal: preview?.subtotal || 0,
      });
      if (res.data?.success) {
        setSelectedVoucherCode(res.data.data.voucher.code);
        setVoucherInput('');
      }
    } catch (err: any) {
      setVoucherError(err.response?.data?.message || 'Invalid voucher code');
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucherCode('');
    setVoucherError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (fulfillmentType === 'pickup' && !pickupTime) {
      setError('Please select a pickup time slot.');
      return;
    }

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please provide a full delivery address.');
      return;
    }

    const payload = {
      fulfillmentType,
      pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      date: fulfillmentDate,
      paymentMethod,
      notes: orderNotes.trim() || undefined,
      voucherCode: selectedVoucherCode || undefined,
      redeemPoints: usePoints && pointsToRedeem > 0 ? pointsToRedeem : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        selectedVariants: i.selectedVariants,
        customizationNotes: i.customizationNotes,
      })),
    };

    try {
      setSubmitting(true);
      const res = await api.post('/orders', payload);
      if (res.data?.success && res.data?.data?.order) {
        const orderId = res.data.data.order._id;
        clearCart();
        navigate(`/orders/confirmation/${orderId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-sm text-stone-500 mt-3">Verifying member session...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif-display text-2xl font-bold text-stone-900">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-stone-600">
          There are no pastries in your cart to checkout. Browse our freshly baked collections!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
        >
          <span>Browse Cake Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Review your items, choose collection or delivery, and confirm your order.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Fulfillment & Options (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Fulfillment Type */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-rose-500" />
                1. How Would You Like to Receive Your Order?
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    fulfillmentType === 'pickup'
                      ? 'border-rose-500 bg-rose-50/40 text-stone-900 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-600'
                  }`}
                >
                  <Store className={`w-6 h-6 mb-2 ${fulfillmentType === 'pickup' ? 'text-rose-500' : 'text-stone-400'}`} />
                  <div className="font-semibold text-sm">Self Pickup</div>
                  <div className="text-xs text-stone-500 mt-0.5">Free collection at bakery</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'border-rose-500 bg-rose-50/40 text-stone-900 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-600'
                  }`}
                >
                  <Truck className={`w-6 h-6 mb-2 ${fulfillmentType === 'delivery' ? 'text-rose-500' : 'text-stone-400'}`} />
                  <div className="font-semibold text-sm">Doorstep Delivery</div>
                  <div className="text-xs text-stone-500 mt-0.5">Klang Valley temperature-controlled</div>
                </button>
              </div>

              {/* Pickup Details */}
              {fulfillmentType === 'pickup' ? (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Collection Location
                      </div>
                      <div className="text-sm font-semibold text-stone-900 mt-0.5">
                        {storeAddress}
                      </div>
                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{storeHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/80">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Collection Date
                      </label>
                      <input
                        type="date"
                        required
                        value={fulfillmentDate}
                        onChange={(e) => setFulfillmentDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Pickup Time Slot
                      </label>
                      <select
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:border-rose-500"
                      >
                        {pickupSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* Delivery Details */
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Delivery Street Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House / Unit No., Building Name, Street Address, Postcode, City"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                          Preferred Delivery Date
                        </label>
                        <input
                          type="date"
                          required
                          value={fulfillmentDate}
                          onChange={(e) => setFulfillmentDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                          Driver Instructions (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Leave with security / Ring doorbell"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 bg-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Discounts: Vouchers & Points Engine */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                2. Vouchers & Reward Points
              </h2>

              {/* VOUCHER APPLICATION */}
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Apply Voucher</span>
                  </span>
                  {selectedVoucherCode && (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {selectedVoucherCode ? (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-stone-900 block">
                          {selectedVoucherCode}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Voucher applied ({currencySymbol} {preview?.voucherDiscount.toFixed(2)} off)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Wallet Vouchers Quick Select */}
                    {availableVouchers.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-stone-500 block">
                          Select from your wallet:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {availableVouchers.map((mv) => {
                            const v = mv.voucher;
                            if (!v) return null;
                            const isSelected = selectedVoucherCode === v.code;
                            return (
                              <button
                                key={mv._id}
                                type="button"
                                onClick={() => setSelectedVoucherCode(v.code)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white text-stone-800 border-purple-200 hover:border-purple-300 hover:bg-purple-50/50'
                                }`}
                              >
                                <span className="font-bold">
                                  {v.type === 'percentage' ? `${v.value}%` : `${currencySymbol}${v.value}`}
                                </span>
                                <span className="font-mono text-[11px] text-stone-500 uppercase">
                                  ({v.code})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Manual Code Input */}
                    <form onSubmit={handleApplyVoucherCode} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter voucher promo code"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={!voucherInput.trim() || validatingVoucher}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        {validatingVoucher ? 'Checking...' : 'Apply'}
                      </button>
                    </form>
                  </div>
                )}

                {voucherError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{voucherError}</span>
                  </p>
                )}
              </div>

              {/* POINTS REDEMPTION */}
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Redeem SoulTalk Points
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUsePoints(checked);
                        if (checked) {
                          const subtotalAfterVoucher = preview
                            ? Math.max(0, preview.subtotal - (preview.voucherDiscount || 0))
                            : 0;
                          const maxDiscount = (subtotalAfterVoucher * (pointsRules?.maxOrderSharePercent || 50)) / 100;
                          const maxPoints = Math.floor(maxDiscount / (pointsRules?.redeemRatio || 0.01));
                          const allowed = Math.min(member?.pointsBalance || 0, maxPoints);
                          setPointsToRedeem(allowed >= (pointsRules?.minRedeem || 100) ? allowed : 0);
                        } else {
                          setPointsToRedeem(0);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-600">
                  <span>Available Balance:</span>
                  <span className="font-bold text-stone-900 font-mono">
                    {member?.pointsBalance || 0} pts (≈ {currencySymbol} {(((member?.pointsBalance || 0) * (pointsRules?.redeemRatio || 0.01))).toFixed(2)})
                  </span>
                </div>

                {usePoints && (
                  <div className="space-y-2 pt-2 border-t border-rose-100/60">
                    {(member?.pointsBalance || 0) < (pointsRules?.minRedeem || 100) ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        You need at least {pointsRules?.minRedeem || 100} points to redeem (Current balance: {member?.pointsBalance || 0} pts).
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={pointsRules?.minRedeem || 100}
                            max={member?.pointsBalance || 0}
                            step={10}
                            value={pointsToRedeem || ''}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value) || 0)}
                            className="w-32 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-rose-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const subtotalAfterVoucher = preview
                                ? Math.max(0, preview.subtotal - (preview.voucherDiscount || 0))
                                : 0;
                              const maxDiscount = (subtotalAfterVoucher * (pointsRules?.maxOrderSharePercent || 50)) / 100;
                              const maxPoints = Math.floor(maxDiscount / (pointsRules?.redeemRatio || 0.01));
                              const allowed = Math.min(member?.pointsBalance || 0, maxPoints);
                              setPointsToRedeem(allowed);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-colors"
                          >
                            Redeem Max
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-500">
                          Reduces total by <strong className="text-rose-600 font-mono">{currencySymbol} {((pointsToRedeem * (pointsRules?.redeemRatio || 0.01))).toFixed(2)}</strong> (Max {pointsRules?.maxOrderSharePercent || 50}% of remaining order).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                2. Select Payment Method
              </h2>

              <div className="space-y-2.5">
                {enabledPaymentMethods.map((methodCode) => {
                  const isStore = methodCode === 'pay_in_store';
                  const title = isStore
                    ? 'Pay in Store on Collection'
                    : 'Cash on Delivery (COD)';
                  const subtitle = isStore
                    ? 'Pay via Cash, Credit Card, or DuitNow QR upon picking up your cake'
                    : 'Pay directly to the courier upon delivery';

                  return (
                    <label
                      key={methodCode}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === methodCode
                          ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={methodCode}
                        checked={paymentMethod === methodCode}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-4 h-4 text-rose-500 focus:ring-rose-500 border-stone-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-stone-900">{title}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{subtitle}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Special Order Instructions */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
              <label className="block text-sm font-bold text-stone-900">
                Special Order Notes or Dietary Requirements (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Allergy notes, candle requirements, or special packaging requests..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-serif-display text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            {/* Items List */}
            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    {item.product.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-900 truncate">
                      {item.product.name}
                    </div>
                    {Object.keys(item.selectedVariants).length > 0 && (
                      <div className="text-[10px] text-stone-500 truncate">
                        {Object.entries(item.selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </div>
                    )}
                    <div className="text-[11px] text-stone-500">
                      Qty: {item.quantity} × {currencySymbol} {item.unitPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="font-mono text-xs font-semibold text-stone-900">
                    {currencySymbol} {(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-stone-900">
                  {currencySymbol} {preview ? preview.subtotal.toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>
                  Delivery Fee ({fulfillmentType === 'pickup' ? 'Self Pickup' : 'Courier'})
                </span>
                <span className="font-mono font-semibold">
                  {preview && preview.deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span>{currencySymbol} {preview ? preview.deliveryFee.toFixed(2) : '0.00'}</span>
                  )}
                </span>
              </div>

              {/* Voucher Discount */}
              {preview && preview.voucherDiscount > 0 ? (
                <div className="flex justify-between text-purple-700 font-semibold bg-purple-50/70 p-2 rounded-xl">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Voucher ({preview.voucherCode})</span>
                  </span>
                  <span className="font-mono">
                    - {currencySymbol} {preview.voucherDiscount.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-stone-600">
                  <span>Voucher Discount</span>
                  <span className="font-mono text-stone-400">—</span>
                </div>
              )}

              {/* Points Discount */}
              {preview && preview.pointsDiscount > 0 && (
                <div className="flex justify-between text-rose-700 font-semibold bg-rose-50/70 p-2 rounded-xl">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Points Redeemed ({preview.pointsRedeemed} pts)</span>
                  </span>
                  <span className="font-mono">
                    - {currencySymbol} {preview.pointsDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline text-stone-950">
                <span className="text-base font-bold">Total Amount</span>
                <span className="font-serif-display text-2xl font-bold font-mono text-rose-600">
                  {currencySymbol} {preview ? preview.totalAmount.toFixed(2) : '0.00'}
                </span>
              </div>

              {preview && preview.estimatedPointsEarned > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-purple-700 bg-purple-50 p-2 rounded-xl mt-2">
                  <Coins className="w-3.5 h-3.5" />
                  <span>
                    You will earn ~<strong>{preview.estimatedPointsEarned} points</strong> on this order!
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || previewLoading}
              className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Place Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified bakery order • WhatsApp confirmation ready</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
