import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Category, ProductVariant, ProductImage } from '../../types';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface VariantFormItem {
  name: string;
  optionsStr: string; // Comma separated: "6 inch, 8 inch, 10 inch"
  priceModifiersStr: string; // Comma separated: "0, 20, 45"
}

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<VariantFormItem[]>([]);
  const [supportsCustomization, setSupportsCustomization] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Load Categories & Product (if edit)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const catRes = await api.get('/admin/categories?all=true');
        if (catRes.data?.success) {
          setCategories(catRes.data.data.categories);
          if (!categoryId && catRes.data.data.categories.length > 0) {
            setCategoryId(catRes.data.data.categories[0]._id);
          }
        }

        if (isEditMode && id) {
          const prodRes = await api.get(`/admin/products/${id}`);
          if (prodRes.data?.success && prodRes.data?.data?.product) {
            const p = prodRes.data.data.product;
            setName(p.name || '');
            setSlug(p.slug || '');
            setPrice(String(p.price || 0));
            setCategoryId(typeof p.category === 'object' ? p.category._id : p.category);
            setDescription(p.description || '');
            setImages(p.images || []);
            setSupportsCustomization(Boolean(p.supportsCustomization));
            setFeatured(Boolean(p.featured));
            setIsActive(p.isActive !== undefined ? p.isActive : true);

            // Format variants for editing
            if (p.variants && p.variants.length > 0) {
              setVariants(
                p.variants.map((v: ProductVariant) => ({
                  name: v.name,
                  optionsStr: v.options.join(', '),
                  priceModifiersStr: v.priceModifiers ? v.priceModifiers.join(', ') : '',
                }))
              );
            }
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  // Auto-slug generator from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode && (!slug || slug === slugify(name))) {
      setSlug(slugify(val));
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Cloudinary image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be under 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        setImages((prev) => [
          ...prev,
          { url: res.data.data.url, publicId: res.data.data.publicId },
        ]);
        setSuccess('Image uploaded to Cloudinary successfully.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image to Cloudinary');
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Variant helpers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', optionsStr: '', priceModifiersStr: '' },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof VariantFormItem,
    val: string
  ) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid non-negative price.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    // Format variants into clean objects
    const cleanedVariants: ProductVariant[] = [];
    for (const v of variants) {
      if (!v.name.trim()) continue;
      const options = v.optionsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (options.length === 0) continue;

      let priceModifiers: number[] | undefined = undefined;
      if (v.priceModifiersStr.trim()) {
        const rawMods = v.priceModifiersStr.split(',').map((s) => parseFloat(s.trim()));
        if (rawMods.some((n) => isNaN(n))) {
          setError(
            `Price modifiers for variant "${v.name}" must be valid numbers separated by commas.`
          );
          return;
        }
        priceModifiers = rawMods;
      }

      cleanedVariants.push({
        name: v.name.trim(),
        options,
        priceModifiers,
      });
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      price: numPrice,
      category: categoryId,
      description: description.trim(),
      images,
      variants: cleanedVariants,
      supportsCustomization,
      featured,
      isActive,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.put(`/admin/products/${id}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-sm text-stone-400 mt-3">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-serif-display text-white">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEditMode
                ? 'Update pricing, images, and customization settings'
                : 'Configure new pastry, pricing, options, and Cloudinary media'}
            </p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-rose-400" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Signature Rose Lychee Cake"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="signature-rose-lychee-cake"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-mono text-sm focus:outline-none focus:border-rose-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Base Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 font-mono text-sm focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-rose-500/50"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Flavor notes, sponge layers, dietary notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        {/* Media / Images */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-400" />
              Product Imagery (Cloudinary)
            </h2>
            <span className="text-xs text-stone-500">
              {images.length} image{images.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-rose-500/40 text-stone-300 text-sm font-medium transition-colors">
              <Upload className="w-4 h-4 text-rose-400" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
            <p className="text-xs text-stone-500">
              JPG, PNG, or WebP up to 5MB. Stored securely in Cloudinary.
            </p>
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-stone-800 bg-stone-900 aspect-square"
                >
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-600/90 text-white shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-stone-300 hover:text-rose-400 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 text-[10px] font-mono text-stone-400 truncate">
                    {img.publicId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Option Variants */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Option Variants
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add selectable options like Size, Flavor, or Packaging with optional price modifiers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Add Variant</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-850 text-center text-xs text-stone-500">
              No variant groups configured. Customers will purchase the base product.
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-stone-900/70 border border-stone-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                      Variant Group #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-stone-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Variant Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cake Size"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-rose-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Options (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="6 inch, 8 inch, 10 inch"
                        value={v.optionsStr}
                        onChange={(e) =>
                          handleUpdateVariant(idx, 'optionsStr', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-rose-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">
                        Price Modifiers (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="0, 20, 45"
                        value={v.priceModifiersStr}
                        onChange={(e) =>
                          handleUpdateVariant(idx, 'priceModifiersStr', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus:border-rose-500/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flags & Toggles */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-stone-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            Display & Experience Flags
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customization */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={supportsCustomization}
                onChange={(e) => setSupportsCustomization(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-stone-950 border-stone-700"
              />
              <div>
                <span className="text-sm font-medium text-stone-200 block">
                  Supports Customization
                </span>
                <span className="text-xs text-stone-500 block mt-0.5">
                  Adds "Enquire About Customization" WhatsApp CTA to detail page.
                </span>
              </div>
            </label>

            {/* Featured */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-stone-950 border-stone-700"
              />
              <div>
                <span className="text-sm font-medium text-stone-200 block">
                  Featured Product
                </span>
                <span className="text-xs text-stone-500 block mt-0.5">
                  Highlighted on storefront Home page hero and popular cakes.
                </span>
              </div>
            </label>

            {/* Active */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-stone-950 border-stone-700"
              />
              <div>
                <span className="text-sm font-medium text-stone-200 block">
                  Active (Visible)
                </span>
                <span className="text-xs text-stone-500 block mt-0.5">
                  Whether customers can view this product in catalog.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl text-stone-300 hover:bg-stone-900 text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-all shadow-lg shadow-rose-950/40 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
