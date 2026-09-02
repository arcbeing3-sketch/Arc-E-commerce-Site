import React from 'react';
import { Product } from '../../shared/types';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency, getStockStatusText } from '../../shared/utils/formatters';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onViewProduct?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const stockInfo = getStockStatusText(product.stock);

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{product.discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-zinc-600 hover:bg-white hover:text-rose-600'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Stock Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${stockInfo.badge}`}>
            {stockInfo.text}
          </span>
        </div>

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 mb-1">
          <span className="font-medium truncate">{product.category}</span>
          <div className="flex items-center gap-1 text-amber-500 shrink-0 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            <span className="text-zinc-400">({product.reviewCount || 0})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onViewProduct?.(product.id)}
          className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 hover:text-zinc-600 cursor-pointer mb-2"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Spacer */}
        <div className="mt-auto pt-2">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-zinc-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-zinc-900 hover:bg-black text-white shadow-sm hover:shadow active:scale-[0.98]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
