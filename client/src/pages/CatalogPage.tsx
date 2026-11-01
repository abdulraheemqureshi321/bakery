import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Product, Category, PaginatedProducts } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl, getProductDisplayImage } from '../utils/image';
import { SoulTalkStorefront } from '../components/common/SoulTalkStorefront';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageCircle,
  X,
  Cake,
  Heart,
  ShoppingBag,
  Check,
  Sparkles,
  MapPin,
  RotateCw,
} from 'lucide-react';

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'prod-strawberry-tart',
    name: 'Artisan Strawberry Tart',
    slug: 'strawberry-tart',
    price: 36,
    description: 'Crisp buttery almond sable tart shell filled with velvety Tahitian vanilla custard and fresh glazed strawberries.',
    images: [{ url: '/products/strawberry-tart.png', publicId: 'strawberry-tart' }],
    variants: [
      { name: 'Size', options: ['Little tart', 'Two tarts', 'Family tart'], priceModifiers: [0, 5, 15] },
    ],
    supportsCustomization: true,
    featured: true,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-strawberry-cake',
    name: 'Strawberry Cake',
    slug: 'strawberry-love-cake',
    price: 138,
    description: 'Fluffy Japanese vanilla chiffon sponge layered with strawberry compote and whipped cream clouds.',
    images: [{ url: '/products/strawberry-cake.png', publicId: 'strawberry-cake' }],
    variants: [
      { name: 'Portion', options: ['Single slice', 'Whole 6-inch'], priceModifiers: [0, 130] },
      { name: 'Sweetness', options: ['Regular (100%)', 'Less Sweet (70%)'], priceModifiers: [0, 0] },
    ],
    supportsCustomization: true,
    featured: true,
    isActive: true,
    category: 'celebration-cakes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-berry-soda',
    name: 'Berry Soda',
    slug: 'berry-soda',
    price: 18,
    description: 'Sparkling water over crushed strawberries and a squeeze of lime, with plenty of ice and a cloud of cream.',
    images: [{ url: '/products/berry-soda.png', publicId: 'berry-soda' }],
    variants: [
      { name: 'Size', options: ['Small', 'Regular', 'Large'], priceModifiers: [0, 2, 4] },
    ],
    supportsCustomization: false,
    featured: true,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-homemade-jam',
    name: 'Homemade Jam',
    slug: 'homemade-jam',
    price: 28,
    description: 'Slow-cooked in small batches with a little lemon zest. Lovely on warm scones, toast, or straight from the spoon.',
    images: [{ url: '/products/homemade-jam.png', publicId: 'homemade-jam' }],
    variants: [
      { name: 'Pack', options: ['One jar', 'Two jars', 'Gift box'], priceModifiers: [0, 25, 45] },
    ],
    supportsCustomization: false,
    featured: true,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-strawberry-latte',
    name: 'Strawberry Latte',
    slug: 'strawberry-latte',
    price: 16,
    description: 'Espresso poured over house-made strawberry cream and chilled oat milk, dusted with cocoa.',
    images: [{ url: '/products/strawberry-latte.png', publicId: 'strawberry-latte' }],
    variants: [
      { name: 'Size', options: ['Regular', 'Large'], priceModifiers: [0, 3] },
    ],
    supportsCustomization: false,
    featured: true,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-strawberry-matcha',
    name: 'Strawberry Matcha Cup',
    slug: 'strawberry-matcha-cup',
    price: 24,
    description: 'Stone-ground Kyoto Uji matcha hand-whisked and layered over organic strawberry coulis and creamy foam.',
    images: [{ url: '/products/strawberry-matcha-cup.png', publicId: 'strawberry-matcha' }],
    variants: [],
    supportsCustomization: false,
    featured: true,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-chocolate-treasure',
    name: 'Chocolate Treasure Cake',
    slug: 'chocolate-treasure-cake',
    price: 158,
    description: 'Chocolate sponge, glossy ganache and a treasure of treats.',
    images: [{ url: '/products/chocolate-treasure-cake.png', publicId: 'chocolate-treasure' }],
    variants: [
      { name: 'Size', options: ['6-inch (4-6 pax)', '8-inch (8-10 pax)'], priceModifiers: [0, 45] },
    ],
    supportsCustomization: true,
    featured: true,
    isActive: true,
    category: 'celebration-cakes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'prod-orange-sunshine',
    name: 'Orange Sunshine Cup',
    slug: 'orange-sunshine-cup',
    price: 22,
    description: 'Vanilla sponge, cloud cream and a bright orange finish.',
    images: [{ url: '/products/orange-sunshine-cup.png', publicId: 'orange-sunshine' }],
    variants: [],
    supportsCustomization: false,
    featured: false,
    isActive: true,
    category: 'petit-pastries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getSetting, buildProductWhatsAppUrl } = useSettings();
  const { addItem } = useCart();
  const { language, t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PaginatedProducts>({
    products: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Interaction feedback states
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Record<string, boolean>>({
    'prod-strawberry-love': true,
  });

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

  // Fetch products
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
        if (res.data?.success && res.data.data.products && res.data.data.products.length > 0) {
          setData(res.data.data);
        } else {
          // If database has no matching items or API is empty, filter from curated fallback products
          let filtered = [...FALLBACK_PRODUCTS];
          if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(
              (p) =>
                (typeof p.category === 'object' && p.category?.slug === selectedCategory) ||
                (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(selectedCategory)))
            );
          }
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            );
          }
          setData({
            products: filtered,
            total: filtered.length,
            page: 1,
            limit: 12,
            totalPages: 1,
          });
        }
      } catch (err) {
        console.warn('Using curated patisserie products', err);
        setData({
          products: FALLBACK_PRODUCTS,
          total: FALLBACK_PRODUCTS.length,
          page: 1,
          limit: 12,
          totalPages: 1,
        });
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

  const toggleFavourite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavourites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, 1);
    setAddedProductId(product._id);

    setTimeout(() => {
      setAddedProductId((curr) => (curr === product._id ? null : curr));
    }, 2200);
  };

  const getCategoryDisplayName = (cat: Category) => {
    if (language === 'zh') {
      if (cat.slug === 'celebration-cakes') return '庆典蛋糕';
      if (cat.slug === 'custom-creations') return '定制蛋糕';
      if (cat.slug === 'party-bags') return '派对伴手礼';
      if (cat.slug === 'petit-pastries') return '法式小点';
      if (cat.slug === 'artisanal-breads') return '手作面包';
    }
    return cat.name;
  };

  const getProductDisplayName = (p: Product) => {
    if (language === 'zh') {
      if (p.slug === 'strawberry-tart') return '草莓法式挞';
      if (p.slug === 'strawberry-love-cake' || p.slug === 'strawberry-cake') return '草莓鲜奶蛋糕';
      if (p.slug === 'berry-soda') return '草莓特调苏打';
      if (p.slug === 'homemade-jam') return '自制草莓果酱';
      if (p.slug === 'strawberry-latte') return '草莓鲜奶拿铁';
      if (p.slug === 'strawberry-matcha-cup' || p.slug === 'strawberry-matcha') return '草莓宇治抹茶';
      if (p.slug === 'orange-sunshine-cup') return '甜橙微光甜品杯';
      if (p.slug === 'chocolate-treasure-cake') return '比利时巧克力宝盒蛋糕';
      if (p.slug === 'strawberry-sundae') return '草莓圣代冰淇淋';
      if (p.slug === 'strawberry-macarons') return '草莓法式马卡龙';
    }
    return p.name;
  };

  return (
    <div className="max-w-[1240px] mx-auto px-3.5 sm:px-6 lg:px-9 py-6 sm:py-10 space-y-8 sm:space-y-10 pb-28 lg:pb-12">
      
      {/* Header & Script Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
        <div className="space-y-2">
          <span className="font-script text-4xl sm:text-5xl text-[var(--color-secondary-dark)] font-semibold block">
            {t('menu.title', 'Our Menu')}
          </span>
          <h1 className="text-h1 text-[var(--color-text)]">
            {t('menu.h1', 'Handcrafted Cakes & Desserts')}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xl leading-relaxed">
            {t('menu.desc', 'Every creation is prepared fresh with French butter, natural fruit compotes, and reduced Japanese sweetness. Tap any pastry to explore flavor notes or add directly to your bag.')}
          </p>
        </div>

        {/* Desktop-only: Small original SoulTalk storefront landmark with handwritten "you are here" annotation */}
        <div className="hidden lg:flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-medium)] p-3.5 shadow-xs">
          <div className="w-24 shrink-0">
            <SoulTalkStorefront size="small" showBadge={false} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-[var(--color-primary-dark)] text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Kuchai Lama</span>
            </div>
            <span className="font-script text-base text-[var(--color-secondary-dark)] font-semibold block leading-tight">
              {t('menu.youAreHere', 'you are here ~')}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {t('menu.freshDaily', 'Fresh bakes out at 9am')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search & Sort */}
      <div className="space-y-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-primary)] text-white shadow-xs -translate-y-0.5'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
            }`}
          >
            {t('menu.all', 'All Creations')}
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.slug
                  ? 'bg-[var(--color-primary)] text-white shadow-xs -translate-y-0.5'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
              }`}
            >
              {getCategoryDisplayName(cat)}
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('menu.searchPlaceholder', 'Search cakes, dessert cups, party bags...')}
              className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-3 stroke-[2]" />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('menu.sort', 'Sort:')}</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3.5 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
            >
              <option value="newest">{t('menu.sortNewest', 'Newest Additions')}</option>
              <option value="price_asc">{t('menu.sortPriceAsc', 'Price: Low to High')}</option>
              <option value="price_desc">{t('menu.sortPriceDesc', 'Price: High to Low')}</option>
              <option value="name_asc">{t('menu.sortNameAsc', 'Name: A to Z')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid: Refined 4 columns desktop / 3 tablet / 2 mobile */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-64 rounded-[var(--radius-medium)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] animate-pulse"
            />
          ))}
        </div>
      ) : data.products.length === 0 ? (
        <div className="soultalk-card py-12 px-4 rounded-[var(--radius-large)] text-center space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-blush)] text-[var(--color-secondary-dark)] flex items-center justify-center mx-auto">
            <Cake className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
            No pastries found
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            We couldn't find any items matching your selection. Try clearing your search or switching categories.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            }}
            className="btn-secondary text-xs !min-h-[34px] mt-2 px-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {data.products.map((product) => {
            const rawImg = product.images?.[0]?.url;
            const mainImg = getProductDisplayImage(product.slug || rawImg);
            const categoryName = typeof product.category === 'object' ? product.category?.name : '';
            const isFav = !!favourites[product._id];
            const isAdded = addedProductId === product._id;

            const getCategoryDisplayName = (cat: Category) => {
    if (language === 'zh') {
      if (cat.slug === 'celebration-cakes') return '庆典蛋糕';
      if (cat.slug === 'custom-creations') return '定制蛋糕';
      if (cat.slug === 'party-bags') return '派对伴手礼';
      if (cat.slug === 'petit-pastries') return '法式小点';
      if (cat.slug === 'artisanal-breads') return '手作面包';
    }
    return cat.name;
  };

  const getProductDisplayName = (p: Product) => {
    if (language === 'zh') {
      if (p.slug === 'strawberry-tart') return '草莓法式挞';
      if (p.slug === 'strawberry-love-cake' || p.slug === 'strawberry-cake') return '草莓鲜奶蛋糕';
      if (p.slug === 'berry-soda') return '草莓特调苏打';
      if (p.slug === 'homemade-jam') return '自制草莓果酱';
      if (p.slug === 'strawberry-latte') return '草莓鲜奶拿铁';
      if (p.slug === 'strawberry-matcha-cup' || p.slug === 'strawberry-matcha') return '草莓宇治抹茶';
      if (p.slug === 'orange-sunshine-cup') return '甜橙微光甜品杯';
      if (p.slug === 'chocolate-treasure-cake') return '比利时巧克力宝盒蛋糕';
      if (p.slug === 'strawberry-sundae') return '草莓圣代冰淇淋';
      if (p.slug === 'strawberry-macarons') return '草莓法式马卡龙';
    }
    return p.name;
  };

  return (
              <div
                key={product._id}
                className="soultalk-card soultalk-card-hover group flex flex-col justify-between overflow-hidden relative rounded-[var(--radius-medium)]"
              >
                <div>
                  {/* Real Product Saucer / Plate Display */}
                  <div className="relative aspect-square w-full p-2.5 sm:p-3 flex items-center justify-center bg-gradient-to-b from-[#FFFDF9] to-[#FDF3EC] border-b border-[var(--color-border)]/60 overflow-hidden">
                    {/* Decorative Ceramic Saucer Plate */}
                    <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EF] to-[#FDF3EC] border border-white ring-1 ring-[var(--color-border)]/80 shadow-2xs flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                      {/* Inner Scalloped Saucer Ring */}
                      <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed border-[var(--color-border)]/60 pointer-events-none" />
                      
                      <Link to={`/products/${product.slug}`} className="block w-4/5 h-4/5 z-10 flex items-center justify-center">
                        <img
                          src={mainImg}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain filter drop-shadow-[0_8px_12px_rgba(74,54,47,0.16)] transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/strawberry-tart.png';
                          }}
                        />
                      </Link>
                    </div>

                    {/* 360° Interactive View Prompt Badge */}
                    <Link
                      to={`/products/${product.slug}`}
                      className="absolute bottom-2 right-2 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs border border-[var(--color-border)] shadow-2xs text-[9px] font-extrabold text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-soft)] transition-all"
                      title="Open interactive 360° spin view"
                    >
                      <RotateCw className="w-2.5 h-2.5 stroke-[2] text-[var(--color-secondary-dark)]" />
                      <span>{t('menu.view360', '360° View')}</span>
                    </Link>

                    {/* Badge */}
                    {product.supportsCustomization ? (
                      <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[9px] font-extrabold text-[var(--color-primary-dark)] border border-[var(--color-border)] shadow-2xs">
                        {t('menu.customizable', 'Custom')}
                      </span>
                    ) : product.featured ? (
                      <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[9px] font-extrabold text-[var(--color-secondary-dark)] border border-[var(--color-border)] shadow-2xs">
                        {t('menu.popular', 'Popular')}
                      </span>
                    ) : null}

                    {/* Favourite Action */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavourite(product._id, e)}
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[var(--color-text)] hover:text-[var(--color-secondary)] transition-all shadow-2xs"
                      aria-label={`Save ${product.name} to favourites`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 stroke-[2] ${
                          isFav ? 'fill-[var(--color-secondary)] text-[var(--color-secondary)]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 space-y-1">
                    {categoryName && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-secondary-dark)] block">
                        {categoryName}
                      </span>
                    )}

                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-serif-heading text-xs sm:text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {getProductDisplayName(product)}
                      </h3>
                    </Link>

                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 leading-snug">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Actions: Price + Quick Add */}
                <div className="p-3 pt-0">
                  <div className="flex items-center justify-between border-t border-[var(--color-border)]/60 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block leading-none">
                        RM
                      </span>
                      <span className="font-serif-heading font-semibold text-xs sm:text-sm text-[var(--color-text)]">
                        {product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
                        isAdded
                          ? 'bg-[var(--color-sage)] text-[var(--color-primary-dark)] ring-1.5 ring-[var(--color-blush)] scale-95'
                          : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-2xs hover:-translate-y-0.5 active:scale-95'
                      }`}
                      aria-label={`Quick add ${product.name} to bag`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1 animate-pop-in text-[var(--color-primary-dark)]">
                          <Heart className="w-3 h-3 fill-current text-[var(--color-secondary)]" />
                          <span>Added ♡</span>
                        </span>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Quick Add</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* WhatsApp Consultation Link */}
                  <a
                    href={buildProductWhatsAppUrl({
                      productName: product.name,
                      pageUrl: window.location.origin + `/products/${product.slug}`,
                      isCustom: product.supportsCustomization,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full bg-[var(--color-surface-soft)] hover:bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-[11px] font-bold transition-colors border border-[var(--color-border)]"
                  >
                    <MessageCircle className="w-3 h-3 stroke-[2]" />
                    <span>WhatsApp Enquire</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => updateParam('page', String(data.page - 1))}
            disabled={data.page <= 1}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('page', String(p))}
              className={`w-9 h-9 rounded-full text-xs font-bold transition-colors ${
                p === data.page
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => updateParam('page', String(data.page + 1))}
            disabled={data.page >= data.totalPages}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
