import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, Category, CartItem, StoreSettings, UserProfile } from '../types';
import { subscribeToProducts } from '../../services/firebase/products';
import { subscribeToCategories } from '../../services/firebase/categories';
import { subscribeToStoreSettings } from '../../services/firebase/settings';
import { ensureStoreInitialized, INITIAL_SETTINGS, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../../services/firebase/seed';
import { auth, db } from '../../services/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, logoutUser } from '../../services/firebase/auth';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[]; // product IDs
  customerUser: User | null;
  customerProfile: UserProfile | null;
  isAuthLoading: boolean;
  isLoadingProducts: boolean;
  toasts: Toast[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshUserProfile: () => Promise<void>;
  customerLogout: () => Promise<void>;
  cartCount: number;
  cartSubtotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'arc_customer_cart_v1';
const WISHLIST_STORAGE_KEY = 'arc_customer_wishlist_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth state
  const [customerUser, setCustomerUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Initial Firestore setup & subscriptions
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    let unsubCategories: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    async function init() {
      await ensureStoreInitialized();

      // Subscribe to published products for customer store
      unsubProducts = subscribeToProducts(
        (allProds) => {
          // Merge live Firestore products with any items in INITIAL_PRODUCTS that aren't yet in Firestore
          const firestoreIds = new Set(allProds.map((p) => p.id));
          const mergedProducts = [...allProds];
          for (const initProd of INITIAL_PRODUCTS) {
            if (!firestoreIds.has(initProd.id)) {
              mergedProducts.push(initProd);
            }
          }

          setProducts(mergedProducts);
          setIsLoadingProducts(false);

          // Dynamically detect any new categories from newly added products
          setCategories((prevCats) => {
            const existingNames = new Set(prevCats.map((c) => c.name.toLowerCase()));
            const newCats: Category[] = [];
            for (const p of mergedProducts) {
              if (p.category && !existingNames.has(p.category.toLowerCase())) {
                existingNames.add(p.category.toLowerCase());
                newCats.push({
                  id: `cat-${p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  name: p.category,
                  slug: p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: `${p.category} hardware products.`,
                  imageUrl: p.imageUrl,
                  productCount: 1,
                });
              }
            }
            return newCats.length > 0 ? [...prevCats, ...newCats] : prevCats;
          });

          // Realtime inventory synchronization: Update cart items if stock changed
          setCart((prevCart) => {
            return prevCart.map((item) => {
              const liveProd = mergedProducts.find((p) => p.id === item.product.id);
              if (liveProd) {
                // If product is archived or unpublished, or stock is 0
                const availableStock = liveProd.status === 'published' ? liveProd.stock : 0;
                const adjustedQty = Math.min(item.quantity, availableStock);
                return {
                  product: liveProd,
                  quantity: adjustedQty,
                };
              }
              return item;
            }).filter((item) => item.quantity > 0 && item.product.status === 'published');
          });
        },
        (err) => {
          console.error('Firestore products subscription error:', err);
          setIsLoadingProducts(false);
        },
        true // onlyPublished
      );

      // Subscribe to categories
      unsubCategories = subscribeToCategories((cats) => {
        if (cats.length > 0) {
          setCategories(cats);
        }
      });

      // Subscribe to settings
      unsubSettings = subscribeToStoreSettings((setts) => {
        if (setts) {
          setSettings(setts);
        }
      });
    }

    init();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubCategories) unsubCategories();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCustomerUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setCustomerProfile(profile);
      } else {
        setCustomerProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubAuth();
  }, []);

  const refreshUserProfile = async () => {
    if (customerUser) {
      const profile = await getUserProfile(customerUser.uid);
      setCustomerProfile(profile);
    }
  };

  const customerLogout = async () => {
    await logoutUser();
    setCustomerUser(null);
    setCustomerProfile(null);
    showToast('Signed out successfully', 'info');
  };

  // Cart operations with stock limit enforcement
  const addToCart = (product: Product, quantity: number = 1): boolean => {
    // Check product live stock
    if (product.stock <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        showToast(
          `Cannot add more than ${product.stock} available units of ${product.name}.`,
          'error'
        );
        return false;
      }

      setCart((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product,
        };
        return updated;
      });
      showToast(`Updated ${product.name} quantity in cart (${newQty})`, 'success');
      return true;
    } else {
      if (quantity > product.stock) {
        showToast(`Only ${product.stock} units available in stock.`, 'error');
        return false;
      }

      setCart((prev) => [...prev, { product, quantity }]);
      showToast(`Added ${product.name} to cart`, 'success');
      return true;
    }
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      showToast(`Removed ${item.product.name} from cart`, 'info');
    }
  };

  const updateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = item.product.stock;
          if (newQty > maxAllowed) {
            showToast(`Maximum ${maxAllowed} units available in inventory.`, 'error');
            return { ...item, quantity: maxAllowed };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        cart,
        wishlist,
        customerUser,
        customerProfile,
        isAuthLoading,
        isLoadingProducts,
        toasts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        showToast,
        removeToast,
        refreshUserProfile,
        customerLogout,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
