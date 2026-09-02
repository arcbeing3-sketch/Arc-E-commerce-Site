import React, { useState, useMemo } from 'react';
import { Product, Category } from '../../shared/types';
import { formatCurrency, getStockStatusText } from '../../shared/utils/formatters';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AdminProductsPageProps {
  products: Product[];
  categories: Category[];
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleStatus: (productId: string, newStatus: 'published' | 'draft' | 'archived') => Promise<void>;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  products,
  categories,
  onAddNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchSku && !matchTag) return false;
      }

      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  const handleDelete = async (p: Product) => {
    if (window.confirm(`Are you sure you want to permanently delete "${p.name}"? If this product has previous customer orders, consider archiving it instead to preserve order records.`)) {
      setDeletingId(p.id);
      try {
        await onDeleteProduct(p.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, or tags..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          />
        </div>

        {/* Filters and New Product Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Visibility</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={onAddNewProduct}
            className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price (PKR)</th>
                <th className="py-4 px-4">Stock & Level</th>
                <th className="py-4 px-4">Visibility</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockInfo = getStockStatusText(p.stock);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Product details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-900 text-xs hover:underline cursor-pointer" onClick={() => onEditProduct(p)}>
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span className="font-mono">{p.sku}</span>
                              {p.featured && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-zinc-600 font-semibold">{p.category}</td>

                      {/* Price & Discount */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-900">{formatCurrency(p.price)}</div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-zinc-400 line-through">
                            {formatCurrency(p.originalPrice)} (-{p.discount}%)
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${stockInfo.badge}`}>
                          {p.stock} Units ({stockInfo.text})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <select
                          value={p.status}
                          onChange={(e) => onToggleStatus(p.id, e.target.value as any)}
                          className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.status === 'draft'
                              ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(p.id, p.status === 'archived' ? 'published' : 'archived')}
                            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                            title={p.status === 'archived' ? 'Unarchive' : 'Archive'}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
