import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../../shared/types';
import { updateOrderStatus } from '../../services/firebase/orders';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../../shared/utils/formatters';
import {
  Search,
  ShoppingBag,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  X,
  Printer,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';

interface AdminOrdersPageProps {
  orders: Order[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  orders,
  onRefresh,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'All' && ord.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = ord.id.toLowerCase().includes(q);
        const matchName = ord.customerName.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone.toLowerCase().includes(q);
        const matchCity = ord.shippingAddress.city.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchCity) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleOpenDetail = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusNote('');
  };

  const handleSaveStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, statusNote.trim() || undefined);
      showToast(`Order #${selectedOrder.id} status updated to ${newStatus}.`, 'success');
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        statusHistory: [
          ...(selectedOrder.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: statusNote.trim() },
        ],
      });
      onRefresh();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      showToast(err.message || 'Failed to update order status.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Phone..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Customer & City</th>
                <th className="py-4 px-4">Order Date</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getOrderStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-zinc-900">
                        #{ord.id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-900">{ord.customerName}</div>
                        <div className="text-[11px] text-zinc-400">
                          {ord.customerPhone} &bull; {ord.shippingAddress.city}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-zinc-500">{formatDate(ord.createdAt)}</td>

                      <td className="py-4 px-4">
                        <span className="text-[11px] font-bold uppercase text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                          {ord.paymentMethod === 'cod' ? 'COD' : ord.paymentMethod}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-black text-zinc-900">{formatCurrency(ord.total)}</td>

                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 text-xs font-bold rounded-lg transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  ARC Order Dispatch Slip
                </span>
                <h2 className="text-xl font-mono font-bold text-zinc-900 mt-0.5">#{selectedOrder.id}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-400 uppercase text-[10px]">Customer Recipient</span>
                <p className="font-bold text-zinc-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-zinc-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {selectedOrder.customerPhone}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-zinc-600">{selectedOrder.customerEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-400 uppercase text-[10px]">Shipping Destination</span>
                <p className="font-semibold text-zinc-800 leading-relaxed">
                  {selectedOrder.shippingAddress.street}
                </p>
                <p className="text-zinc-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
                {selectedOrder.shippingAddress.notes && (
                  <p className="text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-[11px] mt-1">
                    Note: {selectedOrder.shippingAddress.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ordered Products ({selectedOrder.items.length})
              </h4>
              <div className="border border-zinc-200 rounded-2xl divide-y divide-zinc-200 overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                      />
                      <div>
                        <h5 className="font-bold text-zinc-900">{item.name}</h5>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          SKU: {item.sku || 'N/A'} &bull; {formatCurrency(item.price)} &times; {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-zinc-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-zinc-50 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>Total Amount ({selectedOrder.paymentMethod.toUpperCase()})</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Change Status Workflow */}
            <form onSubmit={handleSaveStatusChange} className="p-4 bg-zinc-900 text-white rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Update Order Status & Dispatch Log
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Courier Note / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. TCS Tracking #7839218..."
                    className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl shadow transition-all"
                >
                  {isUpdating ? 'Updating...' : 'Save & Broadcast Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
