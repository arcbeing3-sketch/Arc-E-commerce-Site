import React, { useState, useEffect } from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { Order } from '../../shared/types';
import { subscribeToCustomerOrders } from '../../services/firebase/orders';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../../shared/utils/formatters';
import { Package, Search, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight } from 'lucide-react';

interface OrdersPageProps {
  onNavigateToCatalog: () => void;
  onOpenAuth: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigateToCatalog, onOpenAuth }) => {
  const { customerUser, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (customerUser?.uid) {
      const unsub = subscribeToCustomerOrders(
        customerUser.uid,
        (ords) => {
          setOrders(ords);
          setLoading(false);
        },
        () => setLoading(false)
      );
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, [customerUser]);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;

    setSearchLoading(true);
    setSearchedOrder(null);
    try {
      const trimmed = searchOrderId.trim().toUpperCase();
      const docRef = doc(db, 'orders', trimmed);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setSearchedOrder({ id: snap.id, ...snap.data() } as Order);
      } else {
        showToast(`Order with ID "${trimmed}" not found.`, 'error');
      }
    } catch (err) {
      console.error('Error looking up order:', err);
      showToast('Error looking up order.', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">ARC Customer Portal</span>
          <h1 className="text-3xl font-extrabold text-zinc-900 mt-1">Order Tracking & History</h1>
        </div>

        {/* Quick Order Lookup by ID */}
        <form onSubmit={handleLookupOrder} className="flex items-center gap-2">
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. ARC-12345)"
            className="px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none w-56 bg-white"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow disabled:opacity-50"
          >
            {searchLoading ? 'Looking...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Searched Order Card Result */}
      {searchedOrder && (
        <div className="p-6 bg-zinc-900 text-white rounded-3xl space-y-4 shadow-xl border border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                Order Tracking Result
              </span>
              <h2 className="text-xl font-mono font-bold mt-0.5">#{searchedOrder.id}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">{formatDate(searchedOrder.createdAt)}</span>
              <span className="text-sm font-bold text-white uppercase">{searchedOrder.status}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="py-2">
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider">
              {statusSteps.map((step, idx) => {
                const isPassed = statusSteps.indexOf(searchedOrder.status) >= idx;
                const isCurrent = searchedOrder.status === step;
                return (
                  <div key={step} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-emerald-400' : 'bg-zinc-800'
                      } ${isCurrent ? 'ring-2 ring-white' : ''}`}
                    />
                    <span className={isPassed ? 'text-white' : 'text-zinc-500'}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div>
              <span className="text-zinc-400 block font-medium">Recipient:</span>
              <p className="font-semibold text-white">
                {searchedOrder.customerName} ({searchedOrder.customerPhone})
              </p>
              <p>
                {searchedOrder.shippingAddress.street}, {searchedOrder.shippingAddress.city}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-zinc-400 block font-medium">Payment & Amount:</span>
              <p className="font-semibold text-white uppercase">
                {searchedOrder.paymentMethod} &bull; {formatCurrency(searchedOrder.total)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authenticated Customer Orders List */}
      {customerUser ? (
        loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200/80 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No orders placed yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Any orders you place with your customer account will appear here with live tracking.
            </p>
            <button
              onClick={onNavigateToCatalog}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl"
            >
              Shop ARC Hardware
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getOrderStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono font-bold text-xs">
                        ARC
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-zinc-900 text-sm">#{order.id}</h3>
                        <span className="text-[11px] text-zinc-400">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <h4 className="font-semibold text-zinc-900 truncate">{item.name}</h4>
                          <span className="text-zinc-500">
                            {formatCurrency(item.price)} &times; {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Timeline History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="pt-3 border-t border-zinc-100 text-xs space-y-1.5">
                      <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                        Recent Update
                      </span>
                      <div className="flex items-center gap-2 text-zinc-700">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>
                          {order.statusHistory[order.statusHistory.length - 1].note || `Status: ${order.status}`}
                        </span>
                        <span className="text-zinc-400 text-[11px]">
                          ({formatDate(order.statusHistory[order.statusHistory.length - 1].timestamp)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-8 text-center space-y-3">
          <h3 className="text-base font-bold text-zinc-900">Sign in to view your complete order history</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Log in with your customer email or Google account to automatically synchronize all your past and current ARC orders.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow"
          >
            Sign In to Customer Account
          </button>
        </div>
      )}
    </div>
  );
};
