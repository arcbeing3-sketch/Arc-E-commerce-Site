import React from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency } from '../../shared/utils/formatters';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  onNavigateToCheckout: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateToCheckout,
  onNavigateToCatalog,
  onNavigateToProduct,
}) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartSubtotal, cartCount, settings } = useStore();

  const freeShippingThreshold = settings.freeShippingThreshold || 10000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const shippingFee = isFreeShipping ? 0 : (settings.defaultShippingFee || 450);
  const grandTotal = cartSubtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Your shopping bag is currently empty</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Explore our collection of precision hardware, acoustics, and mechanical peripherals.
        </p>
        <button
          onClick={onNavigateToCatalog}
          className="mt-4 px-6 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <span className="text-xs font-medium tracking-widest uppercase text-zinc-400">ARC Bag Review</span>
          <h1 className="text-3xl font-semibold text-zinc-900 mt-1">Shopping Bag ({cartCount} items)</h1>
        </div>
        <button
          onClick={onNavigateToCatalog}
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="bg-zinc-900 text-white p-4 rounded-none text-xs space-y-2">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                {isFreeShipping ? 'Complimentary Express Delivery Activated!' : `Add ${formatCurrency(shippingRemaining)} more to get Free Delivery`}
              </span>
              <span className="text-zinc-400">
                {Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-none overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-none transition-all duration-300"
                style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-zinc-200 rounded-none divide-y divide-zinc-200 overflow-hidden shadow-2xs">
            {cart.map((item) => {
              const maxStock = item.product.stock;
              return (
                <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      onClick={() => onNavigateToProduct(item.product.id)}
                      className="w-20 h-20 rounded-none object-cover bg-zinc-100 shrink-0 cursor-pointer border border-zinc-200"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        {item.product.category}
                      </span>
                      <h3
                        onClick={() => onNavigateToProduct(item.product.id)}
                        className="text-sm font-medium text-zinc-900 hover:text-zinc-600 cursor-pointer line-clamp-1"
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-xs font-medium text-zinc-700">
                        {formatCurrency(item.product.price)} each
                      </p>
                      <span className="text-[10px] text-emerald-600 font-medium block">
                        Direct 1-Year Warranty Included
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-zinc-300 rounded-none bg-zinc-50 overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 px-2.5 hover:bg-zinc-200 text-zinc-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-medium text-zinc-900">{item.quantity}</span>
                      <button
                        disabled={item.quantity >= maxStock}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 px-2.5 hover:bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for item */}
                    <span className="text-sm font-semibold text-zinc-900 min-w-24 text-right">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 rounded-none hover:bg-rose-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
            <button
              onClick={clearCart}
              className="text-zinc-500 hover:text-rose-600 underline font-medium"
            >
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-zinc-50 border border-zinc-200 rounded-none p-6 space-y-6 shadow-2xs">
          <h2 className="text-lg font-semibold text-zinc-900 border-b border-zinc-200 pb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-zinc-900">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Nationwide Shipping</span>
              <span className="font-medium text-zinc-900">
                {isFreeShipping ? 'FREE' : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-semibold text-zinc-900">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToCheckout}
            className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-medium uppercase tracking-wider rounded-none transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 text-[11px] text-zinc-500 pt-2 border-t border-zinc-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cash on Delivery (COD) accepted nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-zinc-600" />
              <span>Inspected & Dispatched directly by ARC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
