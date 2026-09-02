import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { Product, ProductStatus } from '../../shared/types';

const PRODUCTS_COLLECTION = 'products';

export async function getAllProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getPublishedProducts(): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('status', '==', 'published')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
}

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void,
  onlyPublished: boolean = false
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        const stock = typeof data.stock === 'number' ? data.stock : (Number(data.stock) || 0);
        const price = typeof data.price === 'number' ? data.price : (Number(data.price) || 0);
        const status = data.status || 'published';
        const stockStatus =
          data.stockStatus ||
          (stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock');
        const fallbackImg =
          data.imageUrl ||
          data.image ||
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800';

        const product: Product = {
          id: docSnap.id,
          name: data.name || data.title || 'ARC Hardware Item',
          sku: data.sku || `ARC-${docSnap.id.substring(0, 6).toUpperCase()}`,
          brand: data.brand || 'ARC',
          category: data.category || 'Hardware',
          description: data.description || '',
          price,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          discount: data.discount ? Number(data.discount) : undefined,
          stock,
          stockStatus,
          imageUrl: fallbackImg,
          galleryImages:
            Array.isArray(data.galleryImages) && data.galleryImages.length > 0
              ? data.galleryImages
              : [fallbackImg],
          specifications: data.specifications || {},
          tags: Array.isArray(data.tags) ? data.tags : [],
          featured: Boolean(data.featured),
          status,
          rating: typeof data.rating === 'number' ? data.rating : 5.0,
          reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        return product;
      });

      // Sort newest first
      products.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      if (onlyPublished) {
        // Show anything that is explicitly published or has default active status (not draft or archived)
        const publishedProducts = products.filter(
          (p) => p.status !== 'draft' && p.status !== 'archived'
        );
        onUpdate(publishedProducts);
      } else {
        onUpdate(products);
      }
    },
    (err) => {
      console.error('Error in subscribeToProducts:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAllProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  return subscribeToProducts(onUpdate, onError, false);
}

export const deleteProduct = deleteProductPermanently;

export async function updateProductStatus(
  id: string,
  status: 'published' | 'draft' | 'archived'
): Promise<void> {
  await updateProduct(id, { status });
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  await updateProduct(id, { stock });
}

export async function createProduct(
  productData: Partial<Product> & {
    name: string;
    category: string;
    price: number;
    stock: number;
    imageUrl: string;
  }
): Promise<Product> {
  const newDocRef = doc(collection(db, PRODUCTS_COLLECTION));
  const now = new Date().toISOString();
  
  // Calculate stock status
  const stockStatus = productData.stock <= 0 ? 'out_of_stock' : productData.stock <= 5 ? 'low_stock' : 'in_stock';

  const product: Product = {
    id: newDocRef.id,
    name: productData.name,
    sku: productData.sku || `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
    brand: productData.brand || 'ARC',
    category: productData.category,
    description: productData.description || '',
    price: productData.price,
    originalPrice: productData.originalPrice,
    discount: productData.discount,
    stock: productData.stock,
    stockStatus,
    imageUrl: productData.imageUrl,
    galleryImages: productData.galleryImages || [productData.imageUrl],
    specifications: productData.specifications || {},
    tags: productData.tags || [],
    featured: !!productData.featured,
    status: productData.status || 'published',
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, product);
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const updatedData: Partial<Product> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (typeof updates.stock === 'number') {
    updatedData.stockStatus = updates.stock <= 0 ? 'out_of_stock' : updates.stock <= 5 ? 'low_stock' : 'in_stock';
  }

  await updateDoc(docRef, updatedData);
}

export async function archiveProduct(id: string): Promise<void> {
  await updateProduct(id, { status: 'archived' });
}

export async function publishProduct(id: string): Promise<void> {
  await updateProduct(id, { status: 'published' });
}

export async function deleteProductPermanently(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function decrementProductStock(productId: string, quantity: number): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const currentStock = snap.data().stock || 0;
    const newStock = Math.max(0, currentStock - quantity);
    const stockStatus = newStock <= 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock';
    await updateDoc(docRef, {
      stock: newStock,
      stockStatus,
      updatedAt: new Date().toISOString(),
    });
  }
}
