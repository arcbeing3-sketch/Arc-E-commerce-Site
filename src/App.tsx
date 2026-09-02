import React, { useState, useEffect } from 'react';
import { StoreProvider } from './shared/context/StoreContext';
import { AdminAuthProvider } from './shared/context/AdminAuthContext';
import { CustomerLayout } from './customer/layouts/CustomerLayout';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { ShieldCheck, Store, ExternalLink } from 'lucide-react';

export default function App() {
  // Check if initial hash or path is admin
  const [interfaceMode, setInterfaceMode] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        return 'admin';
      }
    }
    return 'customer';
  });

  // Listen to hash changes if user uses browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setInterfaceMode('admin');
      } else {
        setInterfaceMode('customer');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchMode = (mode: 'customer' | 'admin') => {
    setInterfaceMode(mode);
    if (mode === 'admin') {
      window.location.hash = 'admin';
    } else {
      window.location.hash = '';
    }
  };

  return (
    <StoreProvider>
      <AdminAuthProvider>
        <div className="relative min-h-screen">
          {/* Main Interface Router: Strictly separated Customer vs Admin */}
          {interfaceMode === 'admin' ? <AdminLayout /> : <CustomerLayout />}

          {/* Floating Interface Switcher Pill for reviewer / owner testing */}
          <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-950/90 text-white rounded-full p-1.5 shadow-2xl border border-zinc-800 backdrop-blur-md text-xs font-semibold select-none">
            <button
              onClick={() => switchMode('customer')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                interfaceMode === 'customer'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <button
              onClick={() => switchMode('admin')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                interfaceMode === 'admin'
                  ? 'bg-zinc-800 text-white shadow-xs font-bold ring-1 ring-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ARC Admin Panel</span>
            </button>
          </div>
        </div>
      </AdminAuthProvider>
    </StoreProvider>
  );
}
