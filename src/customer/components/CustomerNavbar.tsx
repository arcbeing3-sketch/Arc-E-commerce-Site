import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, Package, ShieldCheck, ChevronDown } from 'lucide-react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency } from '../../shared/utils/formatters';

interface CustomerNavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
  onOpenCart: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenAuth,
  onOpenCart,
}) => {
  const { cartCount, wishlist, customerUser, customerProfile, categories, settings, customerLogout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate('products', `search:${searchInput.trim()}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
      {/* Top micro announcement bar */}
      <div className="bg-zinc-950 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ARC Official Store &bull; Direct Single-Vendor Engineering &bull; Free Shipping Over {formatCurrency(settings.freeShippingThreshold || 10000)}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black tracking-tighter text-base group-hover:bg-black transition-colors shadow-sm">
                A
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-widest text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  ARC
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest font-semibold text-zinc-400 ml-1.5">
                  Store
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentPage === 'home'
                  ? 'text-zinc-950 font-bold border-b-2 border-zinc-900 pb-0.5'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentPage === 'products'
                  ? 'text-zinc-950 font-bold border-b-2 border-zinc-900 pb-0.5'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Catalog
            </button>

            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', `category:${cat.name}`)}
                className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </nav>

          {/* Right: Actions (Search, Wishlist, Bag, Account) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Bar Toggle */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search ARC catalog..."
                    className="w-44 sm:w-60 px-3 py-1.5 text-xs bg-zinc-100 border border-zinc-300 rounded-full focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 -ml-7"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
                  aria-label="Search catalog"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors ${
                currentPage === 'wishlist' ? 'text-zinc-900 bg-zinc-100' : ''
              }`}
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-zinc-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Account Button */}
            <div className="relative">
              {customerUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">
                      {customerProfile?.displayName?.charAt(0) || customerUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[90px] truncate">
                      {customerProfile?.displayName || 'My Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-zinc-100">
                        <p className="font-semibold text-zinc-900 truncate">
                          {customerProfile?.displayName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{customerUser.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('account');
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        My Profile & Addresses
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 font-medium"
                      >
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        Order History & Tracking
                      </button>

                      <div className="border-t border-zinc-100 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          customerLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Store Overview
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              All ARC Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigate('products', `category:${cat.name}`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-1">
            <button
              onClick={() => {
                onNavigate('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-zinc-400" />
              Track Orders
            </button>
            <button
              onClick={() => {
                onNavigate('wishlist');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-zinc-400" />
              Saved Wishlist ({wishlist.length})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
