import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { Order, OrderStatus } from '../../shared/types';
import { decrementProductStock } from './products';

const ORDERS_COLLECTION = 'orders';

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<Order> {
  const newDocRef = doc(collection(db, ORDERS_COLLECTION));
  const now = new Date().toISOString();

  // Generate readable Order ID (e.g. ARC-89421)
  const readableNumber = Math.floor(10000 + Math.random() * 90000);
  const customOrderId = `ARC-${readableNumber}`;

  const order: Order = {
    ...orderData,
    id: customOrderId,
    statusHistory: [
      {
        status: orderData.status || 'pending',
        timestamp: now,
        note: 'Order placed by customer via ARC Customer Store',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // Save to Firestore (use customOrderId as doc ID)
  await setDoc(doc(db, ORDERS_COLLECTION, customOrderId), order);

  // Decrement product stock for each item in order
  for (const item of order.items) {
    try {
      await decrementProductStock(item.productId, item.quantity);
    } catch (e) {
      console.error(`Failed to decrement stock for product ${item.productId}:`, e);
    }
  }

  // Update customer total orders & spend if customer is authenticated
  if (order.customerId) {
    try {
      const userRef = doc(db, 'users', order.customerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          totalOrders: increment(1),
          totalSpent: increment(order.total),
        });
      }
    } catch (e) {
      console.error('Failed to update customer stats:', e);
    }
  }

  return order;
}

export function subscribeToAllOrders(onUpdate: (orders: Order[]) => void, onError?: (err: Error) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
      onUpdate(orders);
    },
    (err) => {
      console.error('Error subscribing to all orders:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToCustomerOrders(
  customerId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
      onUpdate(orders);
    },
    (err) => {
      console.error('Error subscribing to customer orders:', err);
      if (onError) onError(err);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const existingOrder = snap.data() as Order;
    const now = new Date().toISOString();
    const historyItem = {
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${newStatus} by ARC Administrator`,
    };

    await updateDoc(docRef, {
      status: newStatus,
      statusHistory: [...(existingOrder.statusHistory || []), historyItem],
      updatedAt: now,
    });
  }
}
