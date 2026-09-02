import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../shared/context/AdminAuthContext';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { AdminProductFormPage } from '../pages/AdminProductFormPage';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { AdminOrdersPage } from '../pages/AdminOrdersPage';
import { AdminInventoryPage } from '../pages/AdminInventoryPage';
import { AdminCustomersPage } from '../pages/AdminCustomersPage';
import { AdminReviewsPage } from '../pages/AdminReviewsPage';
import { AdminSettingsPage } from '../pages/AdminSettingsPage';
import { ToastContainer } from '../../customer/components/ToastContainer';
import { Product, Category, Order, UserProfile, StoreSettings } from '../../shared/types';
import { subscribeToAllProducts, deleteProduct, updateProductStatus } from '../../services/firebase/products';
import { subscribeToCategories } from '../../services/firebase/categories';
import { subscribeToAllOrders, updateOrderStatus } from '../../services/firebase/orders';
import { subscribeToAllCustomers } from '../../services/firebase/customers';
import { getStoreSettings } from '../../services/firebase/settings';
import { useStore } from '../../shared/context/StoreContext';

export const AdminLayout: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { showToast } = useStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'ARC Hardware',
    tagline: 'Engineered Precision Equipment',
    currency: 'PKR',
    freeShippingThreshold: 10000,
    defaultShippingFee: 450,
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscriptions when admin is authenticated
  useEffect(() => {
    if (!isAdmin) return;

    const unsubProd = subscribeToAllProducts((prods) => setProducts(prods));
    const unsubCat = subscribeToCategories((cats) => setCategories(cats));
    const unsubOrd = subscribeToAllOrders((ords) => setOrders(ords));
    const unsubCust = subscribeToAllCustomers((custs) => setCustomers(custs));

    getStoreSettings().then((s) => setSettings(s));

    return () => {
      unsubProd();
      unsubCat();
      unsubOrd();
      unsubCust();
    };
  }, [isAdmin]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const s = await getStoreSettings();
      setSettings(s);
      showToast('Store data refreshed.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setActiveTab('edit-product');
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      showToast('Product deleted from ARC catalog.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const handleToggleProductStatus = async (
    productId: string,
    newStatus: 'published' | 'draft' | 'archived'
  ) => {
    try {
      await updateProductStatus(productId, newStatus);
      showToast(`Product visibility set to ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update visibility.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order #${orderId} status changed to ${status}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  // If checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Verifying ARC Owner Credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated as Admin, show login page
  if (!isAdmin) {
    return (
      <>
        <AdminLoginPage />
        <ToastContainer />
      </>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Store Overview & Analytics', subtitle: 'Real-time performance and incoming orders.' };
      case 'products':
        return { title: 'Product Catalog Management', subtitle: 'Manage listings, pricing, and live statuses.' };
      case 'add-product':
        return { title: 'Create New ARC Equipment', subtitle: 'Publish precision hardware directly to the catalog.' };
      case 'edit-product':
        return { title: 'Edit Product Details', subtitle: 'Update technical specifications, stock, and media.' };
      case 'categories':
        return { title: 'Hardware Categories', subtitle: 'Organize catalog collections and taxonomy.' };
      case 'orders':
        return { title: 'Customer Orders Fulfillment', subtitle: 'Process, dispatch, and track courier orders.' };
      case 'inventory':
        return { title: 'Live Inventory Matrix', subtitle: 'Monitor stock levels and execute instant stock adjustments.' };
      case 'customers':
        return { title: 'Customer Accounts Directory', subtitle: 'Registered customer profiles and lifetime order values.' };
      case 'reviews':
        return { title: 'Customer Feedback & Moderation', subtitle: 'Approve, reject, or manage buyer ratings.' };
      case 'settings':
        return { title: 'Studio Settings & Economics', subtitle: 'Brand profile, shipping rules, and contact channels.' };
      default:
        return { title: 'ARC Control Panel', subtitle: 'Single-Vendor Management System' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen bg-zinc-100 flex font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'add-product') {
            setEditingProduct(null);
          }
          setActiveTab(tab);
        }}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onAddProduct={
            activeTab !== 'add-product' && activeTab !== 'edit-product'
              ? () => {
                  setEditingProduct(null);
                  setActiveTab('add-product');
                }
              : undefined
          }
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <AdminDashboardPage
              products={products}
              orders={orders}
              customers={customers}
              onNavigateTab={(t) => {
                if (t === 'add-product') setEditingProduct(null);
                setActiveTab(t);
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsPage
              products={products}
              categories={categories}
              onAddNewProduct={() => {
                setEditingProduct(null);
                setActiveTab('add-product');
              }}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleStatus={handleToggleProductStatus}
            />
          )}

          {(activeTab === 'add-product' || activeTab === 'edit-product') && (
            <AdminProductFormPage
              product={editingProduct}
              categories={categories}
              onBack={() => setActiveTab('products')}
              onSaved={() => setActiveTab('products')}
              showToast={showToast}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesPage
              categories={categories}
              products={products}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersPage
              orders={orders}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventoryPage
              products={products}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          )}

          {activeTab === 'customers' && <AdminCustomersPage customers={customers} />}

          {activeTab === 'reviews' && <AdminReviewsPage showToast={showToast} />}

          {activeTab === 'settings' && (
            <AdminSettingsPage
              settings={settings}
              onRefresh={handleRefresh}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
