import React from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Sparkles, Shield, Cpu, Zap, Star } from 'lucide-react';
import { formatCurrency } from '../../shared/utils/formatters';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onViewProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onViewProduct }) => {
  const { products, categories, isLoadingProducts, settings } = useStore();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const regularProducts = products.slice(0, 8);
  const heroProduct = products.find((p) => p.id === 'arc-sonic-pro') || products[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        {/* Background Subtle Gradient & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ARC 2026 Direct Flagship Release</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Engineered for absolute focus & purity.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Minimalist hardware crafted from aircraft aluminum, unibody titanium, and studio-grade acoustics. Direct from our single design lab to your workspace.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>Explore Full Hardware Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {heroProduct && (
                <button
                  onClick={() => onViewProduct(heroProduct.id)}
                  className="px-5 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  View {heroProduct.name.split(' ')[1] || 'Sonic Pro'}
                </button>
              )}
            </div>

            {/* Micro value tags */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-xs text-zinc-400">
              <div>
                <span className="block text-white font-bold text-sm">100%</span>
                <span>Single-Vendor Genuine</span>
              </div>
              <div>
                <span className="block text-white font-bold text-sm">COD</span>
                <span>Cash on Delivery Available</span>
              </div>
              <div>
                <span className="block text-white font-bold text-sm">1-Year</span>
                <span>Direct Studio Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Hero Product Card */}
          {heroProduct && (
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => onViewProduct(heroProduct.id)}
                className="group relative w-full max-w-sm bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl hover:border-zinc-700 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800/60 mb-4">
                  <img
                    src={heroProduct.imageUrl}
                    alt={heroProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white">
                    Featured
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{heroProduct.category}</span>
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {heroProduct.rating || 5.0}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-zinc-300 transition-colors line-clamp-1">
                    {heroProduct.name}
                  </h3>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-extrabold text-white">
                      {formatCurrency(heroProduct.price)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Series Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">ARC Hardware Series</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">Shop by Category</h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
          >
            All Hardware <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', `category:${cat.name}`)}
              className="group relative rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-72"
            >
              <div className="absolute inset-0 bg-zinc-900/10 group-hover:bg-zinc-900/20 transition-colors z-10" />
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="relative z-20 mt-auto p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                <h3 className="text-base font-bold leading-tight">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{cat.description}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 group-hover:text-white mt-2 transition-colors">
                  Explore Series <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hardware Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Curated & Assembled</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">Featured Equipment</h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
          >
            View All ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Single-Vendor Quality Manifesto Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-100 border border-zinc-200/80 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-3 lg:col-span-2">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">The ARC Guarantee</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              Why buy directly from the ARC Single-Vendor Studio?
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-2xl">
              Unlike crowded multi-vendor marketplaces filled with counterfeit listings, third-party sellers, and inconsistent quality, every single piece in the ARC catalog is designed, inventoried, inspected, and shipped directly by us.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white shadow-xs border border-zinc-200">
              <Cpu className="w-5 h-5 text-zinc-900 shrink-0" />
              <span className="text-xs font-bold text-zinc-800">Precision CNC & Anodized Metallurgy</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white shadow-xs border border-zinc-200">
              <Shield className="w-5 h-5 text-zinc-900 shrink-0" />
              <span className="text-xs font-bold text-zinc-800">Direct 1-Year Zero-Hassle Replacement</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white shadow-xs border border-zinc-200">
              <Zap className="w-5 h-5 text-zinc-900 shrink-0" />
              <span className="text-xs font-bold text-zinc-800">Live Inventory & Rapid Nationwide COD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">All Available Gear</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">Complete Studio Catalog</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularProducts.map((product) => (
            <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} />
          ))}
        </div>
      </section>
    </div>
  );
};
