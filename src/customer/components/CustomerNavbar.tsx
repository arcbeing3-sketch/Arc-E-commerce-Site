import React, { useState } from 'react';
import { ShoppingBag, Search, User, X, ChevronDown, Package, LogOut } from 'lucide-react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency } from '../../shared/utils/formatters';

interface CustomerNavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
  onOpenCart: () => void;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', symbol: 'Rs.' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'AED' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺', currency: 'EUR', symbol: '€' },
];

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenAuth,
  onOpenCart,
}) => {
  const { cartCount, customerUser, customerProfile, settings, customerLogout } = useStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate('products', `search:${searchInput.trim()}`);
    } else {
      onNavigate('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top announcement micro-bar */}
      <div className="bg-zinc-950 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span>
            ARC Official &bull; Direct Engineering &bull; Free Nationwide Delivery Over {formatCurrency(settings.freeShippingThreshold || 10000)}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Left: Clean ARC Logo (Sharp, NO Store Tag) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left shrink-0 focus:outline-none"
            aria-label="ARC Home"
          >
            <div className="w-8 h-8 bg-zinc-900 text-white rounded-none flex items-center justify-center font-semibold tracking-tighter text-base group-hover:bg-black transition-colors shadow-xs">
              A
            </div>
            <span className="text-xl font-semibold tracking-widest text-zinc-900 group-hover:text-zinc-700 transition-colors">
              ARC
            </span>
          </button>

          {/* Middle: Prominent Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto px-2 sm:px-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search ARC hardware, acoustics, keyboards..."
                  className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white border border-zinc-300 focus:border-zinc-900 rounded-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-700 focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Language/Country with Flag, Sign In Button, Add to Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Country / Language Selector with Flag Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCountryDropdownOpen(!countryDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-zinc-100/70 hover:bg-zinc-100 border border-zinc-200 rounded-none transition-colors"
                aria-label="Select Country and Currency"
              >
                <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
                  {selectedCountry.flag}
                </span>
                <span className="text-xs font-mono font-medium tracking-tight">
                  {selectedCountry.code}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
              </button>

              {countryDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-zinc-200 rounded-none shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-zinc-100 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    Country & Currency
                  </div>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors ${
                        selectedCountry.code === country.code ? 'bg-zinc-50 font-semibold text-zinc-950' : 'text-zinc-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {country.currency}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In Button (or Account menu if logged in) */}
            <div className="relative">
              {customerUser ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setCountryDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 rounded-none transition-colors"
                  >
                    <div className="w-4 h-4 bg-zinc-900 text-white rounded-none text-[9px] flex items-center justify-center font-bold">
                      {customerProfile?.displayName?.charAt(0) || customerUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] truncate">
                      {customerProfile?.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-none shadow-xl border border-zinc-200 py-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-zinc-100">
                        <p className="font-semibold text-zinc-900 truncate">
                          {customerProfile?.displayName || 'ARC Member'}
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
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-none shadow-xs transition-all shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-none shadow-xs transition-all shrink-0"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-zinc-950 text-[10px] font-bold px-1.5 py-0.2 min-w-[18px] rounded-none text-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
