import React from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

interface WishlistPageProps {
  onNavigateToCatalog: () => void;
  onViewProduct: (productId: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigateToCatalog, onViewProduct }) => {
  const { products, wishlist } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-zinc-200 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Personal Collection</span>
          <h1 className="text-3xl font-extrabold text-zinc-900 mt-1">Saved Wishlist ({wishlist.length})</h1>
        </div>
        <button
          onClick={onNavigateToCatalog}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Your wishlist is empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the heart icon on any ARC product to save it for later review.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
