import React, { useState } from 'react';
import { Category, Product } from '../../shared/types';
import { createCategory, updateCategory, deleteCategory } from '../../services/firebase/categories';
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';

interface AdminCategoriesPageProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({
  categories,
  products,
  onRefresh,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const generatedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        imageUrl: imageUrl.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showToast(`Category "${name}" updated.`, 'success');
      } else {
        await createCategory(payload);
        showToast(`Category "${name}" created.`, 'success');
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const productCount = products.filter((p) => p.category === cat.name).length;
    if (
      window.confirm(
        `Are you sure you want to delete category "${cat.name}"? ${
          productCount > 0
            ? `There are ${productCount} active products currently assigned to this category.`
            : ''
        }`
      )
    ) {
      try {
        await deleteCategory(cat.id);
        showToast(`Category "${cat.name}" deleted.`, 'success');
        onRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete category.', 'error');
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">ARC Hardware Categories</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize catalog navigation and filtering for customer store exploration.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.name);
          return (
            <div
              key={cat.id}
              className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-zinc-100 overflow-hidden">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <FolderTree className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-zinc-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {catProducts.length} Products
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-zinc-900">{cat.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">slug: /{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-zinc-900">
              {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Mechanical Keyboards"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Slug URL Identifier</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. mechanical-keyboards"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category purpose..."
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
