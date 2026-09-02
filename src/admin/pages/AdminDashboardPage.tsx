import React from 'react';
import { Product, Order, UserProfile } from '../../shared/types';
import { formatCurrency, formatDateShort, getOrderStatusBadge } from '../../shared/utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
} from 'lucide-react';

interface AdminDashboardPageProps {
  products: Product[];
  orders: Order[];
  customers: UserProfile[];
  onNavigateTab: (tab: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => Promise<void>;
  onEditProduct: (product: Product) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  orders,
  customers,
  onNavigateTab,
  onUpdateOrderStatus,
  onEditProduct,
}) => {
  // Metric Calculations
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.total : sum), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Direct single-vendor sales</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900">{totalOrders}</p>
          <div className="text-[11px] text-amber-600 font-semibold">
            <span>{pendingOrders.length} pending fulfillment</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Gear</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900">{totalProducts}</p>
          <div className="text-[11px] text-zinc-500 font-medium">
            <span>{products.filter((p) => p.status === 'published').length} published in store</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900">{totalCustomers}</p>
          <div className="text-[11px] text-zinc-500 font-medium">
            <span>Registered customer accounts</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Alert</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{lowStockProducts.length}</p>
          <div className="text-[11px] text-rose-600 font-semibold">
            <span>Items low / out of stock</span>
          </div>
        </div>
      </div>

      {/* Main Row: Recent Orders & Low Stock Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Customer Orders Table */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Live Stream</span>
              <h2 className="text-base font-bold text-zinc-900">Recent Customer Orders</h2>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
            >
              All Orders ({orders.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No orders received yet. Place an order on the customer store to test live sync!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {recentOrders.map((ord) => {
                    const badge = getOrderStatusBadge(ord.status);
                    return (
                      <tr key={ord.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-zinc-900">#{ord.id}</td>
                        <td className="py-3.5">
                          <p className="font-semibold text-zinc-900">{ord.customerName}</p>
                          <p className="text-[11px] text-zinc-400">{ord.customerPhone}</p>
                        </td>
                        <td className="py-3.5 text-zinc-500">{formatDateShort(ord.createdAt)}</td>
                        <td className="py-3.5 font-bold text-zinc-900">{formatCurrency(ord.total)}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-[11px] font-semibold bg-white border border-zinc-300 rounded-lg px-2 py-1 cursor-pointer focus:ring-1 focus:ring-zinc-900"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Low Stock Alerts & Inventory Health */}
        <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Attention Required</span>
              <h2 className="text-base font-bold text-zinc-900">Low Stock Equipment</h2>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
            >
              Manage <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              All hardware units are healthy and well stocked!
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onEditProduct(p)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">{p.name}</h4>
                      <span className="text-[11px] text-zinc-400 font-mono">{p.sku}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.stock === 0 ? '0 Left' : `${p.stock} Left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Studio Actions */}
          <div className="pt-2 border-t border-zinc-200 space-y-2">
            <button
              onClick={() => onNavigateTab('add-product')}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow"
            >
              + Add New ARC Product
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-2.5 px-4 bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 text-xs font-bold rounded-xl transition-all"
            >
              Bulk Stock Adjustment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
