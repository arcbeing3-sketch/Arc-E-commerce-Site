import React, { useState } from 'react';
import { StoreSettings } from '../../shared/types';
import { updateStoreSettings } from '../../services/firebase/settings';
import { seedInitialStoreData } from '../../services/firebase/seed';
import { Save, RefreshCw, Sparkles, Building, Phone, Mail, ShieldCheck } from 'lucide-react';

interface AdminSettingsPageProps {
  settings: StoreSettings;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  settings,
  onRefresh,
  showToast,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName || 'ARC Hardware');
  const [tagline, setTagline] = useState(settings.tagline || 'Engineered Precision Equipment');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold || 10000);
  const [defaultShippingFee, setDefaultShippingFee] = useState(settings.defaultShippingFee || 450);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'arcbeing3@gmail.com');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+92 300 0000000');
  const [address, setAddress] = useState(settings.address || 'ARC Hardware Studio, Lahore, Pakistan');

  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings({
        storeName,
        tagline,
        freeShippingThreshold: Number(freeShippingThreshold),
        defaultShippingFee: Number(defaultShippingFee),
        supportEmail,
        supportPhone,
        address,
      });
      showToast('Store settings saved successfully.', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (
      window.confirm(
        'Are you sure you want to re-seed default ARC hardware categories and products into Firestore?'
      )
    ) {
      setReseeding(true);
      try {
        await seedInitialStoreData();
        showToast('ARC catalog re-seeded successfully!', 'success');
        onRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to reseed database.', 'error');
      } finally {
        setReseeding(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs">
        <h2 className="text-xl font-bold text-zinc-900">ARC Store Configuration</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage brand details, delivery fee thresholds, and customer service contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Brand Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Studio Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Economics */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Shipping & COD Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-bold"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Orders above this qualify for free shipping.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={defaultShippingFee}
                onChange={(e) => setDefaultShippingFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-bold"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Applied to orders below the free threshold.</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Owner Contact & Support Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Database Reseed Card */}
      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Catalog Demo Data Re-Seed</span>
        </div>
        <p className="text-xs text-zinc-500">
          Populate Firestore with initial ARC hardware products, categories, and studio settings.
        </p>
        <button
          type="button"
          disabled={reseeding}
          onClick={handleReseed}
          className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-all shadow-2xs"
        >
          {reseeding ? 'Reseeding Catalog...' : 'Reseed ARC Hardware Catalog'}
        </button>
      </div>
    </div>
  );
};
