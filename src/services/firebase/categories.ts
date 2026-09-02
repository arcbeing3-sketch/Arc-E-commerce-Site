import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Category } from '../../shared/types';

const CATEGORIES_COLLECTION = 'categories';

export async function getAllCategories(): Promise<Category[]> {
  const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
}

export function subscribeToCategories(onUpdate: (cats: Category[]) => void) {
  return onSnapshot(collection(db, CATEGORIES_COLLECTION), (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
    onUpdate(categories);
  });
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const newDocRef = doc(collection(db, CATEGORIES_COLLECTION));
  const category: Category = {
    ...cat,
    id: newDocRef.id,
    productCount: cat.productCount || 0,
  };
  await setDoc(newDocRef, category);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}
