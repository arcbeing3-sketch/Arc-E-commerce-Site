import React, { useState, useMemo } from 'react';
import { Product } from '../../shared/types';
import { updateProductStock } from '../../services/firebase/products';
import { getStockStatusText, formatCurrency } from '../../shared/utils/formatters';
import { Search, Plus, Minus, Boxes, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface AdminInventoryPageProps {
  products: Product[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({
  products,
  onRefresh,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (stockFilter === 'low' && (p.stock > 5 || p.stock === 0)) return false;
      if (stockFilter === 'out' && p.stock > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      return true;
    });
  }, [products, stockFilter, searchQuery]);

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setUpdatingId(product.id);
    try {
      await updateProductStock(product.id, newStock);
      showToast(`Stock for ${product.name} updated to ${newStock}.`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetExactStock = async (product: Product, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    if (isNaN(val) || val < 0) return;

    setUpdatingId(product.id);
    try {
      await updateProductStock(product.id, val);
      showToast(`Stock for ${product.name} set to ${val}.`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Total Catalog Hardware</span>
          <p className="text-2xl font-black text-zinc-900">{products.length} Units</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-amber-600 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Level (1-5 units)
          </span>
          <p className="text-2xl font-black text-amber-600">{lowStockCount} Products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-rose-600 uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (0 units)
          </span>
          <p className="text-2xl font-black text-rose-600">{outOfStockCount} Products</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              stockFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Stock ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              stockFilter === 'low'
                ? 'bg-amber-500 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Hardware Item</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Health Status</th>
                <th className="py-4 px-6 text-right">Instant Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredProducts.map((p) => {
                const stockInfo = getStockStatusText(p.stock);
                const isBusy = updatingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                        />
                        <span className="font-bold text-zinc-900">{p.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-zinc-500">{p.sku}</td>

                    <td className="py-4 px-4 text-zinc-600">{p.category}</td>

                    <td className="py-4 px-4 font-semibold text-zinc-900">{formatCurrency(p.price)}</td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${stockInfo.badge}`}>
                        {stockInfo.text}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={isBusy || p.stock <= 0}
                          onClick={() => handleAdjustStock(p, -1)}
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors disabled:opacity-30"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min={0}
                          defaultValue={p.stock}
                          key={p.stock}
                          onBlur={(e) => handleSetExactStock(p, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSetExactStock(p, (e.target as HTMLInputElement).value);
                            }
                          }}
                          className="w-16 px-2 py-1 text-center font-bold text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />

                        <button
                          disabled={isBusy}
                          onClick={() => handleAdjustStock(p, 1)}
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors"
                          title="Increase Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
