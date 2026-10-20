import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Category } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderTree,
  X,
  Save,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories?all=true');
      if (res.data?.success) {
        setCategories(res.data.data.categories);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
        setSuccess('Category updated successfully');
      } else {
        await api.post('/admin/categories', formData);
        setSuccess('Category created successfully');
      }
      setModalOpen(false);
      await fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      setSuccess(`Deleted category "${name}"`);
      await fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-100 flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-rose-400" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Organize bakery items into storefront collections and set display priority.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl bg-stone-950/80 border border-stone-800/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-stone-500 text-xs">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">No categories created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900/60 uppercase tracking-wider text-[10px] text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-stone-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-400">
                      #{cat.sortOrder}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-100">{cat.name}</td>
                    <td className="py-3 px-4 font-mono text-stone-400">{cat.slug}</td>
                    <td className="py-3 px-4 text-stone-400 max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          cat.isActive
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                            : 'bg-stone-900 text-stone-500 border-stone-800'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/60 text-rose-400 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display font-bold text-lg text-stone-100">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Birthday Cakes"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-300 mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated if left empty"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short summary of this category"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded-md accent-rose-500"
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
