import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Product } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import {
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ShoppingCart,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getSetting, buildProductWhatsAppUrl } = useSettings();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedVariants, customNotes);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/public/products/${slug}`);
        if (res.data?.success && res.data?.data?.product) {
          const prod: Product = res.data.data.product;
          setProduct(prod);

          // Initialize default variants with first option of each variant
          const initialVariants: Record<string, string> = {};
          if (prod.variants && prod.variants.length > 0) {
            prod.variants.forEach((v) => {
              if (v.options && v.options.length > 0) {
                initialVariants[v.name] = v.options[0];
              }
            });
          }
          setSelectedVariants(initialVariants);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif-display text-2xl font-bold text-stone-900">
          Product Not Found
        </h1>
        <p className="text-sm text-stone-600">
          The requested creation may have been retired or renamed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  // Calculate dynamic price based on base price + selected variant modifiers
  let dynamicPrice = product.price;
  product.variants?.forEach((v) => {
    const selectedOption = selectedVariants[v.name];
    if (selectedOption && v.priceModifiers) {
      const optIndex = v.options.indexOf(selectedOption);
      if (optIndex !== -1 && v.priceModifiers[optIndex]) {
        dynamicPrice += v.priceModifiers[optIndex];
      }
    }
  });

  const categoryName = typeof product.category === 'object' ? product.category?.name : '';
  const categorySlug = typeof product.category === 'object' ? product.category?.slug : '';

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
            publicId: 'default',
          },
        ];

  const currentImageUrl = images[selectedImageIndex]?.url || images[0].url;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-900">
          Catalog
        </Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link to={`/products?category=${categorySlug}`} className="hover:text-stone-900">
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Hero Image */}
          <div className="aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs relative">
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.supportsCustomization && (
              <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wider bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-xs">
                Customizable Creation
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.publicId || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-rose-500 scale-95 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Options */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-500">
              {categoryName}
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-serif-display text-3xl font-bold text-stone-950">
                {currencySymbol} {dynamicPrice.toFixed(2)}
              </span>
              {dynamicPrice !== product.price && (
                <span className="text-xs text-stone-400 line-through">
                  Base: {currencySymbol} {product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed border-t border-b border-stone-100 py-4">
            {product.description}
          </p>

          {/* Option Variant Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-5">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Select {v.name}
                    </span>
                    <span className="text-xs text-rose-600 font-medium">
                      {selectedVariants[v.name]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt, optIndex) => {
                      const isSelected = selectedVariants[v.name] === opt;
                      const priceMod = v.priceModifiers?.[optIndex];
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleVariantSelect(v.name, opt)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs scale-102'
                              : 'bg-white border border-stone-200 text-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          <span>{opt}</span>
                          {priceMod && priceMod > 0 ? (
                            <span className="ml-1 opacity-80">
                              (+{currencySymbol} {priceMod})
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Customization Notes */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Quantity:
              </span>
              <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold font-mono text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {product.supportsCustomization && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Custom Inscription / Plaque Notes (Optional)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Happy 30th Birthday Sarah! (Max 100 chars)"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-rose-400 bg-white"
                />
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                Add to Bag — {currencySymbol} {(dynamicPrice * quantity).toFixed(2)}
              </span>
            </button>

            {/* Customization WhatsApp Enquiry */}
            {product.supportsCustomization && (
              <a
                href={buildProductWhatsAppUrl({
                  productName: product.name,
                  variants: selectedVariants,
                  pageUrl: currentUrl,
                  isCustom: true,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-medium text-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Enquire About Customization on WhatsApp</span>
              </a>
            )}

            {/* General WhatsApp Order Button */}
            <a
              href={buildProductWhatsAppUrl({
                productName: product.name,
                variants: selectedVariants,
                pageUrl: currentUrl,
                isCustom: false,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-50" />
              <span>Ask a Question on WhatsApp</span>
            </a>
          </div>

          {/* Bakery Assurance Badges */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Baked fresh daily with pure butter</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Store pickup or Klang Valley delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Custom message plaque included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
