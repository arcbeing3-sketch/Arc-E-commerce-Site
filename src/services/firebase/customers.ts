import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '../../shared/types';

const USERS_COLLECTION = 'users';

export async function getAllCustomers(): Promise<UserProfile[]> {
  const q = query(collection(db, USERS_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
}

export function subscribeToCustomers(onUpdate: (customers: UserProfile[]) => void) {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile));
    onUpdate(customers);
  });
}

export const subscribeToAllCustomers = subscribeToCustomers;
