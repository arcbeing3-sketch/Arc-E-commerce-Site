import React, { useState } from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { createOrder } from '../../services/firebase/orders';
import { formatCurrency } from '../../shared/utils/formatters';
import { PaymentMethod, Order } from '../../shared/types';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Building,
  CreditCard,
  Banknote,
  Package,
} from 'lucide-react';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onNavigateToOrders: () => void;
  onNavigateToCatalog: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onNavigateToOrders,
  onNavigateToCatalog,
}) => {
  const { cart, cartSubtotal, clearCart, customerUser, customerProfile, settings, showToast } = useStore();

  const [fullName, setFullName] = useState(customerProfile?.displayName || customerUser?.displayName || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const freeShippingThreshold = settings.freeShippingThreshold || 10000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : (settings.defaultShippingFee || 450);
  const grandTotal = cartSubtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your shopping bag is empty.', 'error');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      showToast('Please fill in all required shipping fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        sku: item.product.sku,
      }));

      const newOrder = await createOrder({
        customerId: customerUser?.uid || undefined,
        customerName: fullName.trim(),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          street: street.trim(),
          city: city.trim(),
          province: province.trim(),
          postalCode: postalCode.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        items: orderItems,
        subtotal: cartSubtotal,
        shippingFee: shippingFee,
        discountTotal: 0,
        total: grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
      });

      // Clear shopping bag
      clearCart();
      setCompletedOrder(newOrder);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast(`Order #${newOrder.id} placed successfully!`, 'success');
    } catch (err: any) {
      console.error('Failed to place order:', err);
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully completed
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3 bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Order Confirmed &bull; Single-Vendor Direct
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Thank you for your ARC order!
          </h1>

          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            Your hardware order has been registered in the ARC system under tracking ID{' '}
            <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
              {completedOrder.id}
            </span>
            . Our studio will inspect, pack, and dispatch your items.
          </p>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-left space-y-3 my-6 max-w-lg mx-auto text-xs">
            <div className="flex justify-between text-zinc-600 pb-2 border-b border-zinc-200">
              <span>Customer:</span>
              <span className="font-bold text-zinc-900">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-zinc-600 pb-2 border-b border-zinc-200">
              <span>Phone / Contact:</span>
              <span className="font-bold text-zinc-900">{completedOrder.customerPhone}</span>
            </div>
            <div className="flex justify-between text-zinc-600 pb-2 border-b border-zinc-200">
              <span>Delivery Address:</span>
              <span className="font-bold text-zinc-900 text-right">
                {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 pb-2 border-b border-zinc-200">
              <span>Payment Mode:</span>
              <span className="font-bold text-zinc-900 uppercase">
                {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : completedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-zinc-900 pt-1">
              <span>Amount Payable on Delivery:</span>
              <span>{formatCurrency(completedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onNavigateToOrders}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Track Orders Status</span>
            </button>

            <button
              onClick={onNavigateToCatalog}
              className="w-full sm:w-auto px-6 py-3 bg-white text-zinc-800 hover:bg-zinc-100 border border-zinc-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">Your bag is empty</h2>
        <button
          onClick={onNavigateToCatalog}
          className="px-6 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl"
        >
          Browse ARC Hardware
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBackToCart}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Bag
      </button>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact & Shipping */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Step 1 of 2</span>
                <h2 className="text-lg font-bold text-zinc-900">Shipping & Delivery Information</h2>
              </div>
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asad Farooq"
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone Number (for Courier & COD verification) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0300 1234567"
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address (for order updates & receipts)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Complete Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / Apartment #, Street #, Sector / Area"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore"
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Province / Region
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Order Notes / Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special delivery instructions or gate code..."
                className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Step 2 of 2</span>
              <h2 className="text-lg font-bold text-zinc-900">Payment Option</h2>
            </div>

            <div className="space-y-3">
              {/* COD Option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pay securely in cash directly to the courier rider upon receiving and inspecting your package.
                  </p>
                </div>
              </label>

              {/* Online Card Option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-700" />
                      Credit / Debit Card
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">Visa &bull; Mastercard &bull; PayPak</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Encrypted payment gateway with instant confirmation.
                  </p>
                </div>
              </label>

              {/* Bank Wire Option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="mt-1 text-zinc-900 focus:ring-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-zinc-700" />
                      Direct Bank Transfer (IBFT)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Transfer directly to ARC official account with your order reference.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Sticky Order Summary & Submit Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-50 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-200 pb-3">
              Order Review ({cart.length} unique items)
            </h3>

            {/* Item list preview */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-900 truncate">{item.product.name}</h4>
                    <span className="text-zinc-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-zinc-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-200 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Delivery</span>
                <span className="font-bold text-zinc-900">
                  {isFreeShipping ? 'FREE' : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-zinc-900 pt-3 border-t border-zinc-200">
                <span>Total Amount Due</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : `Confirm Order (${formatCurrency(grandTotal)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-2 pt-2 text-[11px] text-zinc-500 border-t border-zinc-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ARC Direct Single-Vendor Fulfillment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-500" />
                <span>Trackable courier parcel with SMS notification</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
