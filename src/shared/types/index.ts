export type ProductStatus = 'draft' | 'published' | 'archived';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type ReviewStatus = 'approved' | 'pending' | 'rejected';
export type UserRole = 'admin' | 'customer';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  stockStatus: StockStatus;
  imageUrl: string;
  galleryImages: string[];
  specifications: Record<string, string>;
  tags: string[];
  featured: boolean;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sku?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  savedAddresses?: ShippingAddress[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  supportEmail: string;
  supportPhone: string;
  address: string;
  codEnabled: boolean;
}

export interface ProductFilters {
  searchQuery: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  tag?: string;
}
