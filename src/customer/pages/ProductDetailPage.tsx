import React, { useState, useEffect } from 'react';
import { Product, Review } from '../../shared/types';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency, getStockStatusText, formatDateShort } from '../../shared/utils/formatters';
import { subscribeToProductReviews } from '../../services/firebase/reviews';
import { ReviewSubmissionModal } from '../components/ReviewSubmissionModal';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onNavigateToCheckout: () => void;
  onNavigateToCategory: (category: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onNavigateToCheckout,
  onNavigateToCategory,
}) => {
  const { products, addToCart, isInWishlist, toggleWishlist, showToast, settings } = useStore();

  const product = products.find((p) => p.id === productId);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
      setQuantity(1);
    }
  }, [product]);

  // Subscribe to realtime reviews for this product
  useEffect(() => {
    if (!productId) return;
    const unsub = subscribeToProductReviews(productId, (revs) => {
      setReviews(revs);
    });
    return () => unsub();
  }, [productId]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Product not found or currently unavailable</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const stockInfo = getStockStatusText(product.stock);
  const isOutOfStock = product.stock <= 0;
  const gallery = [product.imageUrl, ...(product.galleryImages || [])].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      onNavigateToCheckout();
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToCategory(product.category)}
            className="hover:underline text-zinc-600"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl bg-zinc-100 overflow-hidden border border-zinc-200/80 shadow-xs">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discount && product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                Save {product.discount}%
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg border backdrop-blur-md ${stockInfo.badge}`}>
                {stockInfo.text}
              </span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {gallery.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border-2 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-zinc-900 shadow-md scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Brand */}
          <div className="space-y-2 border-b border-zinc-200 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                {product.brand || 'ARC'} &bull; SKU: {product.sku || 'ARC-000'}
              </span>
              <button
                onClick={handleShare}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Bar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300 fill-zinc-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-800">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              <span className="text-xs text-zinc-400">({reviews.length || product.reviewCount || 0} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-zinc-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Direct ARC Studio Pricing &bull; All Taxes Included &bull; Cash on Delivery Available
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>

          {/* Quantity & Actions Box */}
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">Quantity</span>
              <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-bold text-zinc-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isOutOfStock
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-900 hover:bg-black text-white hover:shadow-md active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all ${
                  isOutOfStock
                    ? 'border-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white active:scale-98'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Buy Now (COD)</span>
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Guarantees Checklist */}
          <div className="space-y-2.5 pt-2 text-xs text-zinc-600 border-t border-zinc-200">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fast 2-4 business day nationwide dispatch</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Official 1-Year ARC Direct Replacement Warranty</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
              <span>7-Day Return / Inspection Window for COD Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="border-t border-zinc-200 pt-10 space-y-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Technical Specifications</span>
            <h3 className="text-xl font-bold text-zinc-900 mt-1">Engineering Data</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="bg-white p-4 flex justify-between gap-4 text-xs">
                <span className="font-semibold text-zinc-500">{key}</span>
                <span className="font-bold text-zinc-900 text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="border-t border-zinc-200 pt-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Verified Buyer Feedback</span>
            <h3 className="text-xl font-bold text-zinc-900 mt-1">Customer Reviews ({reviews.length})</h3>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2">
            <p className="text-sm font-semibold text-zinc-700">No reviews yet for {product.name}</p>
            <p className="text-xs text-zinc-500">Be the first verified customer to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-zinc-200 bg-white space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400">{formatDateShort(rev.createdAt)}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{rev.title}</h4>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
                  <span className="font-semibold text-zinc-800">{rev.userName}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      &bull; Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        onSuccess={() => {}}
      />
    </div>
  );
};
