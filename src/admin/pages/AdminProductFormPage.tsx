import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../shared/types';
import { createProduct, updateProduct } from '../../services/firebase/products';
import { formatCurrency } from '../../shared/utils/formatters';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AdminProductFormPageProps {
  product?: Product | null;
  categories: Category[];
  onBack: () => void;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({
  product,
  categories,
  onBack,
  onSaved,
  showToast,
}) => {
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('ARC');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Material', value: 'Aerospace Grade Aluminum' },
    { key: 'Connectivity', value: 'USB-C / 2.4GHz Low Latency' },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setBrand(product.brand || 'ARC');
      setCategory(product.category || (categories[0]?.name || 'Audio'));
      setDescription(product.description || '');
      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice || 0);
      setStock(product.stock || 0);
      setImageUrl(product.imageUrl || '');
      setGalleryImages(product.galleryImages || []);
      setTagsInput(product.tags?.join(', ') || '');
      setFeatured(!!product.featured);
      setStatus(product.status || 'published');

      if (product.specifications && Object.keys(product.specifications).length > 0) {
        setSpecs(Object.entries(product.specifications).map(([key, value]) => ({ key, value })));
      }
    } else {
      if (categories.length > 0) {
        setCategory(categories[0].name);
      }
      setSku(`ARC-${Math.floor(1000 + Math.random() * 9000)}`);
      setImageUrl('https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80');
    }
  }, [product, categories]);

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || price <= 0 || !imageUrl.trim()) {
      showToast('Please fill all required fields (Name, Category, Price, Image).', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const specifications: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) {
          specifications[s.key.trim()] = s.value.trim();
        }
      });

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        brand: brand.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice > price ? Number(originalPrice) : undefined,
        discount: discountPercent > 0 ? discountPercent : undefined,
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
        galleryImages: galleryImages,
        specifications,
        tags,
        featured,
        status,
      };

      if (isEditing && product) {
        await updateProduct(product.id, payload);
        showToast('Product updated successfully in ARC catalog.', 'success');
      } else {
        await createProduct(payload);
        showToast('New ARC product created and published!', 'success');
      }

      onSaved();
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back to Products
        </button>

        <h2 className="text-xl font-black text-zinc-900">
          {isEditing ? `Edit: ${product?.name}` : 'Create New ARC Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-5">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ARC Obsidian Precision Mechanical Keyboard"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                SKU / Unit Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ARC-KB-801"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="ARC"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Catalog Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="wireless, mechanical, rgb, titanium"
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Product Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed craft overview, build materials, switch specifications, acoustic tuning, warranty terms..."
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-5">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Selling Price (PKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Original MSRP (PKR) <span className="text-zinc-400 font-normal">(Optional strike-through)</span>
              </label>
              <input
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Available Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-bold"
              />
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
              Calculated Discount: Save {discountPercent}% off MSRP!
            </div>
          )}
        </div>

        {/* Section 3: Media & Images */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-5">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Product Media
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Primary Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
              {imageUrl && (
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold text-zinc-700">Additional Gallery Images</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste extra image URL..."
                className="flex-1 px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-colors"
              >
                Add Image
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-zinc-200">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-base font-bold text-zinc-900">Technical Specifications</h3>
            <button
              type="button"
              onClick={handleAddSpec}
              className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Spec Row
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Spec Key (e.g. Battery Life)"
                  value={spec.key}
                  onChange={(e) => {
                    const next = [...specs];
                    next[index].key = e.target.value;
                    setSpecs(next);
                  }}
                  className="flex-1 px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-semibold"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 50 Hours)"
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...specs];
                    next[index].value = e.target.value;
                    setSpecs(next);
                  }}
                  className="flex-1 px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(index)}
                  className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Visibility & Publishing */}
        <div className="bg-zinc-50 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Catalog Visibility Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-white font-bold"
              >
                <option value="published">Published (Visible in Customer Store)</option>
                <option value="draft">Draft (Private in Admin Only)</option>
                <option value="archived">Archived (Hidden from Catalog)</option>
              </select>
            </div>

            <div className="pt-4 sm:pt-0">
              <label className="flex items-center gap-3 cursor-pointer bg-white p-3.5 rounded-2xl border border-zinc-200 select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-zinc-900 focus:ring-zinc-900 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Feature on Homepage</span>
                  <span className="text-[11px] text-zinc-500">Showcases in top hero catalog on the store front</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Hardware...' : isEditing ? 'Update ARC Product' : 'Publish Product to ARC Store'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
