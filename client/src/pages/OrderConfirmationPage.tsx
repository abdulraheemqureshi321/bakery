import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Order } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  Store,
  Truck,
  ArrowRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { member } = useAuth();
  const { buildOrderWhatsAppUrl, getSetting } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success && res.data?.data?.order) {
          setOrder(res.data.data.order);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order confirmation');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-sm text-stone-500 mt-3">Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Order Not Found</h2>
        <p className="text-sm text-stone-600">{error || 'Unable to retrieve order details.'}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const customerName =
    typeof order.member === 'object' && order.member !== null
      ? order.member.name
      : member?.name || 'Customer';

  const whatsappUrl = buildOrderWhatsAppUrl({
    orderNumber: order.orderNumber,
    customerName,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          We have received your pastry order. Our bakers are reviewing the details and fresh ingredients.
        </p>
      </div>

      {/* Order Badge Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Order Reference
            </span>
            <div className="font-mono text-2xl font-bold text-rose-600 mt-0.5">
              {order.orderNumber}
            </div>
            <span className="text-xs text-stone-400">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Status: {order.status.toUpperCase()}
            </span>
            <span className="text-xs text-stone-500 mt-1">
              Payment: {order.paymentMethod === 'pay_in_store' ? 'Pay in Store' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* WhatsApp Immediate Action Banner */}
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Confirm & Chat via WhatsApp</span>
          </div>
          <p className="text-xs text-emerald-850 leading-relaxed">
            Need custom writing, special packaging, or faster pickup confirmation? Connect directly with our concierge team using your order reference.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat about Order #{order.orderNumber} on WhatsApp</span>
          </a>
        </div>

        {/* Fulfillment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              {order.fulfillmentType === 'pickup' ? (
                <>
                  <Store className="w-4 h-4 text-rose-500" />
                  <span>Self Pickup Details</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-rose-500" />
                  <span>Doorstep Delivery Details</span>
                </>
              )}
            </div>
            {order.fulfillmentType === 'pickup' ? (
              <p className="text-stone-600 leading-relaxed">
                Collection Slot: <strong className="text-stone-800">{order.pickupTime || 'Standard Hours'}</strong>
              </p>
            ) : (
              <p className="text-stone-600 leading-relaxed">
                Address: <strong className="text-stone-800">{order.deliveryAddress}</strong>
                {order.deliveryNotes && (
                  <span className="block text-[11px] text-stone-500 mt-1">
                    Note: {order.deliveryNotes}
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <div className="font-semibold text-stone-900">Total Charged</div>
            <div className="font-serif-display text-xl font-bold font-mono text-stone-950">
              {currencySymbol} {order.totalAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-stone-500">
              Subtotal: {currencySymbol} {order.subtotal.toFixed(2)} • Delivery Fee:{' '}
              {order.deliveryFee === 0 ? 'FREE' : `${currencySymbol} ${order.deliveryFee.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* Itemized List */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </div>
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-stone-900">{item.productName}</div>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-[11px] text-stone-500">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </div>
                  )}
                  {item.customizationNotes && (
                    <div className="text-[11px] text-rose-600 italic">
                      Note: "{item.customizationNotes}"
                    </div>
                  )}
                  <div className="text-stone-400 mt-0.5">
                    Qty: {item.quantity} × {currencySymbol} {(item.productPrice + item.variantPriceModifier).toFixed(2)}
                  </div>
                </div>
                <div className="font-mono font-semibold text-stone-900">
                  {currencySymbol} {item.lineTotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100">
          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>View All My Orders</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition-colors"
          >
            <span>Continue Pastry Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
