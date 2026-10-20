import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Product, Category } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  Star,
  Paintbrush,
  Filter,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, active, inactive

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status toggle in-flight
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products?limit=100'),
        api.get('/admin/categories?all=true'),
      ]);

      if (prodRes.data?.success) {
        setProducts(prodRes.data.data.products);
      }
      if (catRes.data?.success) {
        setCategories(catRes.data.data.categories);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (product: Product) => {
    try {
      setTogglingId(product._id);
      const updatedStatus = !product.isActive;
      const res = await api.put(`/admin/products/${product._id}`, {
        isActive: updatedStatus,
      });

      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isActive: updatedStatus } : p))
        );
        setSuccess(`Product "${product.name}" marked as ${updatedStatus ? 'Active' : 'Inactive'}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/products/${deleteTarget._id}`);
      if (res.data?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setSuccess(`Product "${deleteTarget.name}" deleted successfully.`);
        setDeleteTarget(null);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    // Search
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    // Category
    const categoryId = typeof p.category === 'object' && p.category !== null ? p.category._id : p.category;
    const matchesCategory =
      selectedCategory === 'all' || categoryId === selectedCategory;

    // Status
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && p.isActive) ||
      (selectedStatus === 'inactive' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (p: Product) => {
    if (typeof p.category === 'object' && p.category !== null) {
      return p.category.name;
    }
    const cat = categories.find((c) => c._id === p.category);
    return cat ? cat.name : 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-display text-white">
            Product Management
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage bakery catalog, pricing, variants, and Cloudinary imagery
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-all shadow-lg shadow-rose-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <Package className="w-4 h-4 text-rose-400" />
            Total Products
          </div>
          <div className="text-2xl font-bold text-white mt-2">{products.length}</div>
        </div>
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Active Products
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {products.filter((p) => p.isActive).length}
          </div>
        </div>
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Featured
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {products.filter((p) => p.featured).length}
          </div>
        </div>
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-purple-400" />
            Customizable
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {products.filter((p) => p.supportsCustomization).length}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:border-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:outline-none focus:border-rose-500/50"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm focus:outline-none focus:border-rose-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
            <p className="text-sm text-stone-400 mt-3">Loading product catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium text-stone-300">No products found</p>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search criteria or add a new product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-900/60 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((product) => {
                  const mainImage = product.images?.[0]?.url;
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-stone-900/30 transition-colors"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-stone-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-stone-200 block truncate">
                              {product.name}
                            </span>
                            <span className="text-xs text-stone-500 font-mono">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300">
                          <Tag className="w-3 h-3 text-rose-400" />
                          {getCategoryName(product)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-100 font-mono text-sm">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.variants?.length > 0 && (
                          <span className="block text-[11px] text-stone-500">
                            {product.variants.length} variant group
                            {product.variants.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {product.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <Star className="w-3 h-3 text-amber-400" />
                              Featured
                            </span>
                          )}
                          {product.supportsCustomization && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              <Paintbrush className="w-3 h-3 text-purple-400" />
                              Customizable
                            </span>
                          )}
                          {!product.featured && !product.supportsCustomization && (
                            <span className="text-stone-600 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          disabled={togglingId === product._id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-750'
                          }`}
                        >
                          {product.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Product</h3>
            </div>
            <p className="text-sm text-stone-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">
                "{deleteTarget.name}"
              </span>
              ? This action will remove the product and clean up all associated
              Cloudinary images.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-stone-300 hover:bg-stone-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
