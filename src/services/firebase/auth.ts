import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../../shared/types';

// Hardcoded authorized owner emails for ARC store owner
export const OWNER_EMAILS = ['arcbeing3@gmail.com', 'admin@arc.com', 'owner@arc.com'];

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  user: User,
  role: UserRole = 'customer',
  phone?: string,
  forceAdmin: boolean = false,
): Promise<UserProfile> {
  const isOwnerEmail = user.email ? OWNER_EMAILS.includes(user.email.toLowerCase()) : false;
  const determinedRole: UserRole = isOwnerEmail || forceAdmin ? 'admin' : role;

  const profileRef = doc(db, 'users', user.uid);
  const existing = await getDoc(profileRef);

  if (existing.exists()) {
    const existingData = existing.data() as UserProfile;
    // Upgrade to admin if authorized email
    if (isOwnerEmail && existingData.role !== 'admin') {
      await setDoc(profileRef, { role: 'admin' }, { merge: true });
      existingData.role = 'admin';
    }
    return existingData;
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'ARC Customer',
    phone: phone || '',
    role: determinedRole,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    savedAddresses: [],
  };

  await setDoc(profileRef, newProfile);
  return newProfile;
}

let isGoogleSignInPending = false;

export async function signInCustomerWithGoogle(): Promise<{ user: User; profile: UserProfile } | null> {
  if (isGoogleSignInPending) {
    return null;
  }
  isGoogleSignInPending = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const profile = await createOrUpdateUserProfile(cred.user, 'customer');
    return { user: cred.user, profile };
  } catch (error: any) {
    const code = error?.code || '';
    const message = error?.message || '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-blocked' ||
      message.includes('popup-closed-by-user') ||
      message.includes('cancelled-popup-request') ||
      message.includes('Pending promise was never set')
    ) {
      console.warn('Google sign-in was dismissed or closed by the user.');
      return null;
    }
    throw error;
  } finally {
    isGoogleSignInPending = false;
  }
}

export async function signInAdminWithGoogle(): Promise<{ user: User; profile: UserProfile } | null> {
  if (isGoogleSignInPending) {
    return null;
  }
  isGoogleSignInPending = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const profile = await createOrUpdateUserProfile(cred.user, 'admin', undefined, true);
    return { user: cred.user, profile };
  } catch (error: any) {
    const code = error?.code || '';
    const message = error?.message || '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-blocked' ||
      message.includes('popup-closed-by-user') ||
      message.includes('cancelled-popup-request') ||
      message.includes('Pending promise was never set')
    ) {
      console.warn('Google admin sign-in was dismissed or closed by the user.');
      return null;
    }
    throw error;
  } finally {
    isGoogleSignInPending = false;
  }
}

export async function registerCustomer(email: string, pass: string, name: string, phone?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  const profile = await createOrUpdateUserProfile(cred.user, 'customer', phone);
  return { user: cred.user, profile };
}

export async function loginCustomer(email: string, pass: string) {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await createOrUpdateUserProfile(cred.user, 'customer');
  return { user: cred.user, profile };
}

export async function loginAdmin(email: string, pass: string) {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await createOrUpdateUserProfile(cred.user, 'admin', undefined, true);
  return { user: cred.user, profile };
}

export async function logoutUser() {
  await signOut(auth);
}
