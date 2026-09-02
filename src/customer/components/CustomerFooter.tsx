import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency } from '../../shared/utils/formatters';

interface CustomerFooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useStore();

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-800">
      {/* Guarantees Bar */}
      <div className="border-b border-zinc-800/80 py-10 bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-white shrink-0">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Free Express Delivery</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Complimentary nationwide shipping on all orders over {formatCurrency(settings.freeShippingThreshold || 10000)}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-white shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Direct Manufacturer Warranty</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  1-Year direct ARC warranty & hassle-free replacement on all hardware.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-white shrink-0">
                <RotateCcw className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Cash on Delivery (COD)</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Inspect upon arrival. Safe and trusted cash-on-delivery across Pakistan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-800 text-white shrink-0">
                <Headphones className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Dedicated Studio Support</h4>
                <p className="mt-1 text-zinc-400 leading-relaxed">
                  Direct support from our engineering and hardware team 6 days a week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-zinc-950 rounded-lg flex items-center justify-center font-black text-sm">
                A
              </div>
              <span className="text-lg font-black tracking-widest text-white">ARC</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              ARC is a single-vendor hardware engineering brand. We design, craft, and distribute ultra-minimalist acoustics, mechanical keyboards, and workspace objects directly to enthusiasts.
            </p>
            <div className="pt-2 text-zinc-500 text-[11px] space-y-1">
              <p>Studio: {settings.address || 'Gulberg III, Lahore, Pakistan'}</p>
              <p>Inquiries: {settings.supportEmail || 'support@arc-store.com'}</p>
              <p>Hotline: {settings.supportPhone || '+92 300 1234567'}</p>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Hardware Series</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('products', `category:${cat.name}`)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-white transition-colors">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">
                  My Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  Customer Profile
                </button>
              </li>
              <li>
                <span className="text-zinc-500 cursor-not-allowed">Warranty Policy</span>
              </li>
              <li>
                <span className="text-zinc-500 cursor-not-allowed">Shipping & Returns</span>
              </li>
            </ul>
          </div>

          {/* Single-Vendor Note */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Authenticity</h4>
            <p className="text-zinc-400 text-xs leading-relaxed mb-3">
              Every unit purchased on this store is assembled, inspected, and shipped directly from the ARC studio.
            </p>
            <div className="inline-block p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
              <span className="text-emerald-400 font-semibold">&bull; Official Direct Store</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>&copy; {new Date().getFullYear()} ARC Hardware Inc. All rights reserved. Single-Vendor Store.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Hardware Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
