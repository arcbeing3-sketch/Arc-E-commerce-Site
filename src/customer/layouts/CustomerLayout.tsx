import React, { useState } from 'react';
import { CustomerNavbar } from '../components/CustomerNavbar';
import { CustomerFooter } from '../components/CustomerFooter';
import { CartDrawer } from '../components/CartDrawer';
import { CustomerAuthModal } from '../components/CustomerAuthModal';
import { ToastContainer } from '../components/ToastContainer';
import { HomePage } from '../pages/HomePage';
import { ProductListingPage } from '../pages/ProductListingPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CustomerAccountPage } from '../pages/CustomerAccountPage';

export const CustomerLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [filterParam, setFilterParam] = useState<{ category?: string; search?: string }>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const handleNavigate = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (param?.startsWith('category:')) {
      setFilterParam({ category: param.replace('category:', '') });
    } else if (param?.startsWith('search:')) {
      setFilterParam({ search: param.replace('search:', '') });
    } else {
      setFilterParam({});
    }

    setCurrentPage(page);
  };

  const handleViewProduct = (productId: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Customer Header */}
      <CustomerNavbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onViewProduct={handleViewProduct} />
        )}

        {currentPage === 'products' && (
          <ProductListingPage
            initialCategory={filterParam.category}
            initialSearch={filterParam.search}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'product-detail' && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setCurrentPage('products')}
            onNavigateToCheckout={() => setCurrentPage('checkout')}
            onNavigateToCategory={(cat) => handleNavigate('products', `category:${cat}`)}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            onNavigateToCheckout={() => setCurrentPage('checkout')}
            onNavigateToCatalog={() => setCurrentPage('products')}
            onNavigateToProduct={handleViewProduct}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => setCurrentPage('cart')}
            onNavigateToOrders={() => setCurrentPage('orders')}
            onNavigateToCatalog={() => setCurrentPage('products')}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            onNavigateToCatalog={() => setCurrentPage('products')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            onNavigateToCatalog={() => setCurrentPage('products')}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'account' && (
          <CustomerAccountPage
            onNavigateToOrders={() => setCurrentPage('orders')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Customer Footer */}
      <CustomerFooter onNavigate={handleNavigate} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onNavigateToCheckout={() => {
          setIsCartDrawerOpen(false);
          setCurrentPage('checkout');
        }}
        onNavigateToCart={() => {
          setIsCartDrawerOpen(false);
          setCurrentPage('cart');
        }}
        onNavigateToProduct={(pid) => handleViewProduct(pid)}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};
