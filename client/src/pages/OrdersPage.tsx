import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  ShoppingBag,
  Store,
  Truck,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { member } = useAuth();
  const { buildOrderWhatsAppUrl, getSetting } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected order modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.data.orders);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
          My Pastry Orders
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Track the status of your fresh bakes, collection slots, and delivery orders.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
          <p className="text-sm text-stone-500 mt-3">Loading order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">No Orders Yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              You haven't placed any cake or pastry orders yet. Explore our handcrafted artisanal menu!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            <span>Browse Cake Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const whatsappUrl = buildOrderWhatsAppUrl({
              orderNumber: order.orderNumber,
              customerName: member?.name || 'Customer',
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <span className="font-mono text-base font-bold text-stone-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-stone-400 block sm:inline sm:ml-2">
                      • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="inline-flex items-center gap-1 text-xs text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      {order.fulfillmentType === 'pickup' ? (
                        <>
                          <Store className="w-3.5 h-3.5 text-stone-500" />
                          Pickup
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-stone-500" />
                          Delivery
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-stone-700 font-medium line-clamp-1">
                      {order.items.map((i) => `${i.productName} (×${i.quantity})`).join(', ')}
                    </p>
                    <span className="text-[11px] text-stone-400">
                      {itemCount} total item{itemCount !== 1 ? 's' : ''} •{' '}
                      {order.fulfillmentType === 'pickup'
                        ? `Pickup: ${order.pickupTime || 'Standard Hours'}`
                        : `Address: ${order.deliveryAddress}`}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-stone-500 block">Total</span>
                    <span className="font-serif-display text-lg font-bold font-mono text-stone-900">
                      {currencySymbol} {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 font-medium text-stone-700 hover:text-stone-950 p-1"
                  >
                    <Eye className="w-4 h-4 text-stone-500" />
                    <span>View Receipt & Items</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-medium transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
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

            {/* Status & Method */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="text-stone-500 block">Status:</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-stone-500 block">Payment:</span>
                <span className="font-semibold text-stone-800 mt-1 block">
                  {selectedOrder.paymentMethod === 'pay_in_store'
                    ? 'Pay in Store'
                    : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            {/* Fulfillment */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <span className="text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                {selectedOrder.fulfillmentType === 'pickup' ? 'Collection Info' : 'Delivery Info'}
              </span>
              <p className="text-stone-800 font-medium">
                {selectedOrder.fulfillmentType === 'pickup'
                  ? `Pickup Slot: ${selectedOrder.pickupTime || 'Standard Hours'}`
                  : `Address: ${selectedOrder.deliveryAddress}`}
              </p>
              {selectedOrder.deliveryNotes && (
                <p className="text-stone-500 text-[11px]">
                  Driver Note: {selectedOrder.deliveryNotes}
                </p>
              )}
            </div>

            {/* Items */}
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

            {/* Totals */}
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
                  {selectedOrder.deliveryFee === 0
                    ? 'FREE'
                    : `${currencySymbol} ${selectedOrder.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-950 font-bold text-sm pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="font-mono text-rose-600 text-base">
                  {currencySymbol} {selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
