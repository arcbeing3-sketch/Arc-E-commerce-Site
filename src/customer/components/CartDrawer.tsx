import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency } from '../../shared/utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCheckout: () => void;
  onNavigateToCart: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToCheckout,
  onNavigateToCart,
  onNavigateToProduct,
}) => {
  const { cart, removeFromCart, updateCartQuantity, cartSubtotal, cartCount, settings } = useStore();

  if (!isOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 10000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-900">Your ARC Bag ({cartCount})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="bg-zinc-900 text-white px-5 py-3 text-xs">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-300" />
                  {isFreeShipping ? (
                    <span className="text-emerald-400 font-semibold">Free Express Shipping Unlocked!</span>
                  ) : (
                    <span>Add {formatCurrency(shippingRemaining)} for Free Shipping</span>
                  )}
                </span>
                <span className="text-zinc-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-700 mb-1">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mb-6">
                    Explore precision-crafted minimalist hardware from ARC.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const maxStock = item.product.stock;
                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-white transition-colors"
                    >
                      {/* Product Thumbnail */}
                      <div
                        onClick={() => {
                          onClose();
                          onNavigateToProduct(item.product.id);
                        }}
                        className="w-20 h-20 rounded-lg bg-zinc-100 overflow-hidden shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              onClick={() => {
                                onClose();
                                onNavigateToProduct(item.product.id);
                              }}
                              className="text-xs font-semibold text-zinc-900 truncate hover:text-zinc-600 cursor-pointer"
                            >
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-zinc-400 hover:text-rose-600 p-0.5 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                            {item.product.category}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-100">
                          <span className="text-xs font-bold text-zinc-900">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 px-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-zinc-900 select-none">
                              {item.quantity}
                            </span>
                            <button
                              disabled={item.quantity >= maxStock}
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 px-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title={item.quantity >= maxStock ? `Only ${maxStock} in stock` : 'Add more'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-zinc-100 bg-zinc-50/70 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-800">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span className="font-semibold text-zinc-800">
                      {isFreeShipping ? 'FREE' : formatCurrency(settings.defaultShippingFee || 450)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>Estimated Total</span>
                    <span>
                      {formatCurrency(
                        cartSubtotal + (isFreeShipping ? 0 : (settings.defaultShippingFee || 450))
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToCheckout();
                    }}
                    className="w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Checkout ({formatCurrency(cartSubtotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToCart();
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    View Bag Details
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Authentic Single-Vendor Hardware Guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
