import React, { useState, useMemo } from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';

interface ProductListingPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onViewProduct: (productId: string) => void;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  initialCategory,
  initialSearch,
  onViewProduct,
}) => {
  const { products, categories, isLoadingProducts } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(50000);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchTag && !matchCat) return false;
        }

        // In Stock only
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        // Price filter
        if (p.price > maxPriceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Default featured
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy, maxPriceFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 pb-6">
        <span className="text-xs font-medium tracking-widest uppercase text-zinc-400">ARC Hardware Studio</span>
        <h1 className="text-3xl font-semibold text-zinc-900 mt-1">Hardware Catalog</h1>
        <p className="text-sm text-zinc-500 mt-1 font-light">
          Showing {filteredProducts.length} precision equipment units crafted directly by ARC.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-50 p-4 rounded-none border border-zinc-200">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
            }`}
          >
            All Products ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search, Stock, & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-zinc-300 rounded-none focus:border-zinc-900 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-zinc-200 rounded-none text-xs font-medium text-zinc-700 select-none hover:bg-zinc-50">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded-none text-zinc-900 focus:ring-zinc-900"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-none px-3 py-2 appearance-none pr-8 cursor-pointer focus:outline-none focus:border-zinc-900"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest Releases</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-200/60 mx-auto flex items-center justify-center text-zinc-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No hardware found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            We couldn't find any products matching your search or filters. Try clearing your filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl hover:bg-black"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
