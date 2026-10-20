import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Product, Category, PaginatedProducts } from '../types';
import { useSettings } from '../context/SettingsContext';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageCircle,
  X,
  Cake,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getSetting, buildProductWhatsAppUrl } = useSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PaginatedProducts>({
    products: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  // Filters from URL
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const pageNumber = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Fetch categories once
  useEffect(() => {
    api
      .get('/public/categories')
      .then((res) => {
        if (res.data?.success) {
          setCategories(res.data.data.categories);
        }
      })
      .catch((err) => console.warn('Could not fetch categories', err));
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageNumber,
          limit: 12,
          sort: sortBy,
        };
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await api.get('/public/products', { params });
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, pageNumber]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter/sort change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    updateParam('search', '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-rose-500">
          Our Patisserie Collection
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
          Cakes, Pastries & Celebration Favors
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Browse our freshly baked celebratory cakes, custom flavor options, and signature party favors. Tap any creation to explore customization or order directly via WhatsApp.
        </p>
      </div>

      {/* Controls Bar: Category Chips + Search + Sort */}
      <div className="space-y-4">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => updateParam('category', 'all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Creations
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search cakes, flavors, party bags..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-88 rounded-3xl bg-stone-200/70 animate-pulse" />
          ))}
        </div>
      ) : data.products.length === 0 ? (
        <div className="glass-card py-16 px-4 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Cake className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-lg font-bold text-stone-900">
            No cakes found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find any pastries matching your current filter. Try clearing your search query or selecting another category.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.products.map((product) => {
            const mainImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
            const categoryName = typeof product.category === 'object' ? product.category?.name : '';

            return (
              <div
                key={product._id}
                className="glass-card rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <Link
                    to={`/products/${product.slug}`}
                    className="relative block aspect-4/3 overflow-hidden bg-stone-100"
                  >
                    <img
                      src={mainImg}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.supportsCustomization && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-purple-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                        Customizable
                      </span>
                    )}
                    {product.featured && (
                      <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                        Popular
                      </span>
                    )}
                  </Link>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider block">
                      {categoryName}
                    </span>
                    <Link
                      to={`/products/${product.slug}`}
                      className="font-serif-display text-base font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">From</span>
                      <span className="font-serif-display text-base font-bold text-stone-900">
                        {currencySymbol} {product.price.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      to={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Direct WhatsApp enquire shortcut */}
                  <a
                    href={buildProductWhatsAppUrl({
                      productName: product.name,
                      pageUrl: window.location.origin + `/products/${product.slug}`,
                      isCustom: product.supportsCustomization,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors border border-emerald-200/60"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>WhatsApp Enquire</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => updateParam('page', String(data.page - 1))}
            disabled={data.page <= 1}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('page', String(p))}
              className={`w-9 h-9 rounded-xl text-xs font-medium transition-colors ${
                p === data.page
                  ? 'bg-rose-500 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => updateParam('page', String(data.page + 1))}
            disabled={data.page >= data.totalPages}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
