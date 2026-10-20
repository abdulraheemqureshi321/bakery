import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Order } from '../../types';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Store,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Phone,
  Mail,
  User,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await api.get('/admin/orders', { params });
      if (res.data?.success) {
        setOrders(res.data.data.orders);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    paymentStatus?: 'pending' | 'paid'
  ) => {
    try {
      setUpdatingId(orderId);
      const payload: any = { status: newStatus };
      if (paymentStatus) {
        payload.paymentStatus = paymentStatus;
      }

      const res = await api.put(`/admin/orders/${orderId}/status`, payload);
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...payload } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...payload } : null));
        }
        setSuccess(`Order marked as ${newStatus}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const getCustomerInfo = (order: Order) => {
    if (typeof order.member === 'object' && order.member !== null) {
      return {
        name: order.member.name || 'Member',
        phone: order.member.phone || '—',
        email: order.member.email || '—',
      };
    }
    return { name: 'Customer', phone: '—', email: '—' };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-display text-white">
            Order Management
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Track customer orders, fulfillment timeslots, and delivery addresses
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 text-sm font-medium border border-stone-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-stone-400" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:border-rose-500/50"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
            <p className="text-sm text-stone-400 mt-3">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium text-stone-300">No orders found</p>
            <p className="text-xs text-stone-500 mt-1">
              {statusFilter !== 'all'
                ? `No orders matching status "${statusFilter}".`
                : 'Orders placed by members will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/60 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {orders.map((order) => {
                  const customer = getCustomerInfo(order);

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-stone-900/30 transition-colors"
                    >
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-stone-100 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {new Date(order.createdAt).toLocaleDateString()} •{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-200 block">
                          {customer.name}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {customer.phone}
                        </span>
                      </td>

                      {/* Fulfillment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {order.fulfillmentType === 'pickup' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Store className="w-3 h-3 text-amber-400" />
                              Pickup: {order.pickupTime || 'Standard'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              <Truck className="w-3 h-3 text-blue-400" />
                              Delivery
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-stone-100">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-stone-300 block">
                          {order.paymentMethod === 'pay_in_store'
                            ? 'In Store'
                            : 'Cash on Deliv.'}
                        </span>
                        <span className={`text-[10px] uppercase font-bold ${
                          order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            title="View Full Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === 'pending' && (
                            <button
                              type="button"
                              disabled={updatingId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                            >
                              Confirm
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              type="button"
                              disabled={updatingId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'completed', 'paid')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-display">
                  Order Management
                </h3>
                <span className="font-mono text-xs text-rose-400 font-semibold">
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            {(() => {
              const cust = getCustomerInfo(selectedOrder);
              return (
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                    Customer Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>{cust.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Fulfillment & Address */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs text-stone-300">
              <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                {selectedOrder.fulfillmentType === 'pickup' ? 'Self Pickup' : 'Delivery Address'}
              </span>
              <p>
                {selectedOrder.fulfillmentType === 'pickup'
                  ? `Pickup Slot: ${selectedOrder.pickupTime || 'Standard Hours'}`
                  : `Address: ${selectedOrder.deliveryAddress}`}
              </p>
              {selectedOrder.deliveryNotes && (
                <p className="text-stone-500">
                  Driver Instructions: {selectedOrder.deliveryNotes}
                </p>
              )}
              {selectedOrder.notes && (
                <p className="text-rose-400">
                  Order Note: {selectedOrder.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Items ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <div className="divide-y divide-stone-800 border border-stone-800 rounded-2xl overflow-hidden bg-stone-950">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-200">{item.productName}</div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-[11px] text-stone-500">
                          {Object.entries(item.selectedVariants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </div>
                      )}
                      {item.customizationNotes && (
                        <div className="text-[11px] text-rose-400 italic">
                          "{item.customizationNotes}"
                        </div>
                      )}
                      <div className="text-stone-500 mt-0.5">
                        Qty: {item.quantity} × ${(item.productPrice + item.variantPriceModifier).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-stone-100">
                      ${item.lineTotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Change Status
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id || selectedOrder.status === 'pending'}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'pending')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium disabled:opacity-40"
                >
                  Mark Pending
                </button>
                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id || selectedOrder.status === 'confirmed'}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-medium disabled:opacity-40"
                >
                  Mark Confirmed
                </button>
                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id || selectedOrder.status === 'completed'}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'completed', 'paid')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium disabled:opacity-40"
                >
                  Mark Completed & Paid
                </button>
                <button
                  type="button"
                  disabled={updatingId === selectedOrder._id || selectedOrder.status === 'cancelled'}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium disabled:opacity-40"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold transition-colors"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
