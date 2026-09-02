import React, { useState } from 'react';
import { useStore } from '../../shared/context/StoreContext';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { User, Phone, Mail, Package, ShieldCheck, LogOut, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

interface CustomerAccountPageProps {
  onNavigateToOrders: () => void;
  onOpenAuth: () => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onNavigateToOrders,
  onOpenAuth,
}) => {
  const { customerUser, customerProfile, customerLogout, refreshUserProfile, showToast } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(customerProfile?.displayName || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!customerUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Customer Account</h2>
        <p className="text-xs text-zinc-500">Sign in to manage your contact info, addresses, and order history.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'users', customerUser.uid);
      await updateDoc(docRef, {
        displayName: displayName.trim(),
        phone: phone.trim(),
      });
      await refreshUserProfile();
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (e) {
      console.error('Error saving profile:', e);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-zinc-200 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Customer Profile</span>
          <h1 className="text-3xl font-extrabold text-zinc-900 mt-1">My Account</h1>
        </div>
        <button
          onClick={customerLogout}
          className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h3 className="text-base font-bold text-zinc-900">Personal Details</h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setDisplayName(customerProfile?.displayName || '');
                  setPhone(customerProfile?.phone || '');
                  setIsEditing(true);
                }}
                className="text-xs font-semibold text-zinc-900 hover:underline"
              >
                Edit Information
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Name</span>
                  <span className="font-semibold text-zinc-900">{customerProfile?.displayName || 'Customer'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-zinc-900">{customerUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Phone</span>
                  <span className="font-semibold text-zinc-900">{customerProfile?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-100">
                Customer since {formatDate(customerProfile?.createdAt)}
              </div>
            </div>
          )}
        </div>

        {/* Orders Quick Card */}
        <div className="bg-zinc-50 rounded-3xl border border-zinc-200/80 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900">Activity Summary</h3>
            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 text-xs">
              <span className="text-zinc-400">Total Lifetime Orders</span>
              <p className="text-2xl font-black text-zinc-900">{customerProfile?.totalOrders || 0}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 text-xs">
              <span className="text-zinc-400">Total Spent</span>
              <p className="text-xl font-bold text-zinc-900">{formatCurrency(customerProfile?.totalSpent || 0)}</p>
            </div>
          </div>

          <button
            onClick={onNavigateToOrders}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>View Order History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
