import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getOptimizedImageUrl } from '../utils/image';
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

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div>
          <span className="font-script text-3xl sm:text-4xl text-[var(--color-secondary-dark)] font-semibold block">
            Orders
          </span>
          <h1 className="text-h2 text-[var(--color-text)]">
            My Pastry Orders
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Track the preparation status of your celebration cakes and bakery pickups.
          </p>
        </div>

        <Link to="/products" className="btn-secondary text-xs !min-h-[40px] self-start sm:self-auto">
          <span>Explore Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[var(--color-blush)] text-[var(--color-error)] text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[var(--color-surface-soft)] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="soultalk-card py-16 px-4 rounded-[var(--radius-large)] text-center space-y-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
            No orders placed yet
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            Your pastry orders and celebration reservations will be displayed here once placed.
          </p>
          <Link to="/products" className="btn-primary text-xs !min-h-[40px] inline-flex mt-2">
            <span>Browse All Cakes</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="soultalk-card p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
                    #{order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{order.fulfillmentType === 'pickup' ? 'Store Pickup' : 'Delivery'}</span>
                  <span>•</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase block leading-none">Total</span>
                  <span className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
                    RM {order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="btn-secondary text-xs !min-h-[38px] !px-4"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
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
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[var(--color-border)]/50">
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
              <span className="font-bold text-[var(--color-text)]">Total</span>
              <span className="font-serif-heading font-semibold text-lg text-[var(--color-text)]">
                RM {selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-primary w-full text-xs !min-h-[40px]"
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
