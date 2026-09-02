import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../services/firebase/config';
import { UserProfile } from '../types';
import { getUserProfile, loginAdmin, signInAdminWithGoogle, logoutUser, OWNER_EMAILS, createOrUpdateUserProfile } from '../../services/firebase/auth';

interface AdminAuthContextType {
  adminUser: User | null;
  adminProfile: UserProfile | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  loginAsAdmin: (email: string, pass: string) => Promise<void>;
  loginWithGoogleAsAdmin: () => Promise<void>;
  demoOwnerLogin: () => Promise<void>;
  adminLogout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let profile = await getUserProfile(user.uid);
        const isOwner = user.email ? OWNER_EMAILS.includes(user.email.toLowerCase()) : false;

        // If user is owner email or admin role
        if (isOwner || profile?.role === 'admin') {
          if (!profile) {
            profile = await createOrUpdateUserProfile(user, 'admin', undefined, true);
          }
          setAdminUser(user);
          setAdminProfile(profile);
        } else {
          // If logged in as customer, not authorized for admin
          setAdminUser(null);
          setAdminProfile(null);
        }
      } else {
        setAdminUser(null);
        setAdminProfile(null);
      }
      setIsAdminLoading(false);
    });

    return () => unsub();
  }, []);

  const loginAsAdmin = async (email: string, pass: string) => {
    setError(null);
    try {
      const { user, profile } = await loginAdmin(email, pass);
      setAdminUser(user);
      setAdminProfile(profile);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to authenticate as ARC Administrator.');
      throw err;
    }
  };

  const loginWithGoogleAsAdmin = async () => {
    setError(null);
    try {
      const res = await signInAdminWithGoogle();
      if (res) {
        setAdminUser(res.user);
        setAdminProfile(res.profile);
      }
    } catch (err: any) {
      console.error('Admin Google sign-in error:', err);
      setError(err.message || 'Failed to authenticate with Google.');
      throw err;
    }
  };

  // Demo owner bypass / quick login for owner verification
  const demoOwnerLogin = async () => {
    setError(null);
    try {
      // Create or get local owner session
      const ownerProfile: UserProfile = {
        uid: 'arc-owner-uid-01',
        email: 'arcbeing3@gmail.com',
        displayName: 'ARC Store Owner',
        role: 'admin',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
      setAdminProfile(ownerProfile);
      setAdminUser({
        uid: 'arc-owner-uid-01',
        email: 'arcbeing3@gmail.com',
        displayName: 'ARC Store Owner',
      } as unknown as User);
    } catch (err: any) {
      setError(err.message || 'Failed demo owner authentication');
    }
  };

  const adminLogout = async () => {
    try {
      await logoutUser();
      setAdminUser(null);
      setAdminProfile(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const clearError = () => setError(null);

  const isAdminAuthenticated = Boolean(adminUser && (adminProfile?.role === 'admin' || adminUser.email === 'arcbeing3@gmail.com'));

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminProfile,
        isAdminAuthenticated,
        isAdminLoading,
        loginAsAdmin,
        loginWithGoogleAsAdmin,
        demoOwnerLogin,
        adminLogout,
        error,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
