import React, { useState, useEffect } from 'react';
import { StoreProvider } from './shared/context/StoreContext';
import { AdminAuthProvider } from './shared/context/AdminAuthContext';
import { CustomerLayout } from './customer/layouts/CustomerLayout';
import { AdminLayout } from './admin/layouts/AdminLayout';

export default function App() {
  // Check if current route is admin (via path, hash, or search)
  const [interfaceMode, setInterfaceMode] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin') || search.includes('admin')) {
        return 'admin';
      }
    }
    return 'customer';
  });

  // Listen to navigation changes (hash or path)
  useEffect(() => {
    const handleNavigationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin') || search.includes('admin')) {
        setInterfaceMode('admin');
      } else {
        setInterfaceMode('customer');
      }
    };

    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('popstate', handleNavigationChange);

    // Keyboard shortcut for owner convenience: Ctrl+Shift+A (or Alt+A) to toggle admin URL
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        if (window.location.hash.includes('admin')) {
          window.location.hash = '';
        } else {
          window.location.hash = 'admin';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <StoreProvider>
      <AdminAuthProvider>
        <div className="relative min-h-screen">
          {/* Main Interface Router: Admin is totally separate from Customer Store */}
          {interfaceMode === 'admin' ? <AdminLayout /> : <CustomerLayout />}
        </div>
      </AdminAuthProvider>
    </StoreProvider>
  );
}
