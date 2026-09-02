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
} from 'firebase/firestore';
import { db } from './config';
import { Review, ReviewStatus } from '../../shared/types';
import { updateProduct } from './products';

const REVIEWS_COLLECTION = 'reviews';

export async function submitReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
  const newDocRef = doc(collection(db, REVIEWS_COLLECTION));
  const now = new Date().toISOString();

  const review: Review = {
    ...reviewData,
    id: newDocRef.id,
    status: 'approved', // Default auto-approved for frictionless UX, admin can moderate
    createdAt: now,
  };

  await setDoc(newDocRef, review);

  // Recalculate product rating
  await recalculateProductRating(review.productId);

  return review;
}

export function subscribeToProductReviews(
  productId: string,
  onUpdate: (reviews: Review[]) => void
) {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('productId', '==', productId),
    where('status', '==', 'approved')
  );

  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
    onUpdate(reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
}

export function subscribeToAllReviews(onUpdate: (reviews: Review[]) => void) {
  return onSnapshot(collection(db, REVIEWS_COLLECTION), (snapshot) => {
    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
    onUpdate(reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus): Promise<void> {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const rev = snap.data() as Review;
    await updateDoc(docRef, { status });
    await recalculateProductRating(rev.productId);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const rev = snap.data() as Review;
    await deleteDoc(docRef);
    await recalculateProductRating(rev.productId);
  }
}

async function recalculateProductRating(productId: string): Promise<void> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const reviews = snap.docs.map((d) => d.data() as Review);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / reviews.length).toFixed(1));

    await updateProduct(productId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error recalculating product rating:', error);
  }
}
