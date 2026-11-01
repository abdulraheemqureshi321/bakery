import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';
import { Product } from '../types';
import { SoulTalkStorefront } from '../components/common/SoulTalkStorefront';
import { EventCalendar } from '../components/events/EventCalendar';
import {
  MessageCircle,
  Sparkles,
  ArrowRight,
  Heart,
  ShoppingBag,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Gift,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Cake,
  Palette,
  ShieldCheck,
  Send,
  RotateCw,
} from 'lucide-react';

import { getProductDisplayImage } from '../utils/image';

interface BestSellerItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string;
  tag: string;
  categorySlug: string;
}

const BESTSELLERS: BestSellerItem[] = [
  {
    id: 'prod-strawberry-tart',
    name: 'Artisan Strawberry Tart',
    slug: 'strawberry-tart',
    price: 36,
    description: 'Crisp almond sable shell with Tahitian vanilla custard and strawberries.',
    image: '/products/strawberry-tart.png',
    tag: 'Handcrafted Tart',
    categorySlug: 'petit-pastries',
  },
  {
    id: 'prod-strawberry-cake',
    name: 'Strawberry Cake',
    slug: 'strawberry-love-cake',
    price: 138,
    description: 'Fluffy Japanese vanilla chiffon sponge layered with strawberry compote and whipped cream clouds.',
    image: '/products/strawberry-cake.png',
    tag: 'Bestseller',
    categorySlug: 'celebration-cakes',
  },
  {
    id: 'prod-berry-soda',
    name: 'Berry Soda',
    slug: 'berry-soda',
    price: 18,
    description: 'Sparkling water over crushed strawberries and a squeeze of lime, with plenty of ice and a cloud of cream.',
    image: '/products/berry-soda.png',
    tag: 'Signature Drink',
    categorySlug: 'petit-pastries',
  },
  {
    id: 'prod-homemade-jam',
    name: 'Homemade Jam',
    slug: 'homemade-jam',
    price: 28,
    description: 'Slow-cooked in small batches with a little lemon zest. Lovely on warm scones, toast, or straight from the spoon.',
    image: '/products/homemade-jam.png',
    tag: 'Artisan Jar',
    categorySlug: 'petit-pastries',
  },
  {
    id: 'prod-strawberry-latte',
    name: 'Strawberry Latte',
    slug: 'strawberry-latte',
    price: 16,
    description: 'Espresso poured over house-made strawberry cream and chilled oat milk, dusted with cocoa.',
    image: '/products/strawberry-latte.png',
    tag: 'Café Favourite',
    categorySlug: 'petit-pastries',
  },
  {
    id: 'prod-strawberry-matcha',
    name: 'Strawberry Matcha Cup',
    slug: 'strawberry-matcha-cup',
    price: 24,
    description: 'Matcha sponge layered with strawberry cream and fresh berries.',
    image: '/products/strawberry-matcha-cup.png',
    tag: 'Ceremonial',
    categorySlug: 'petit-pastries',
  },
];

export const HomePage: React.FC = () => {
  const { isAuthenticated, member } = useAuth();
  const { getSetting, buildWhatsAppUrl, buildPartyBagsWhatsAppUrl } = useSettings();
  const { addItem, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();

  // Rotating promotion card state (hero right)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Added-to-cart state indicators
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Favourites state
  const [favourites, setFavourites] = useState<Record<string, boolean>>({
    'prod-strawberry-love': true,
  });

  const heroSlides = [
    {
      badge: 'Season Special',
      title: 'Strawberry Moments',
      description: 'Sweet recipes for a brighter day. Fluffy Japanese sponge layered with fresh cream and ruby strawberries.',
      image: '/products/strawberry-cake.png',
      linkText: 'Explore Menu',
      linkTo: '/products',
      tag: 'Fresh Daily',
    },
    {
      badge: 'Chef Signature',
      title: 'Artisan Strawberry Tart',
      description: 'Crisp buttery almond sable tart shell filled with velvety Tahitian vanilla custard and fresh glazed strawberries.',
      image: '/products/strawberry-tart.png',
      linkText: 'Order Strawberry Tart',
      linkTo: '/products/strawberry-tart',
      tag: 'Tabletop 3D',
    },
    {
      badge: 'Craft Beverage',
      title: 'Sparkling Berry Soda',
      description: 'Sparkling water poured over crushed strawberries, a squeeze of fresh lime, and a cloud of cream.',
      image: '/products/berry-soda.png',
      linkText: 'Order Berry Soda',
      linkTo: '/products/berry-soda',
      tag: 'Chilled Special',
    },
  ];

  // Autoplay hero slider every 5.5 seconds, pause on hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    const getItemName = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '草莓法式挞';
      if (item.slug === 'strawberry-love-cake' || item.slug === 'strawberry-cake') return '草莓鲜奶蛋糕';
      if (item.slug === 'berry-soda') return '草莓特调苏打';
      if (item.slug === 'homemade-jam') return '自制草莓果酱';
      if (item.slug === 'strawberry-latte') return '草莓鲜奶拿铁';
      if (item.slug === 'strawberry-matcha-cup' || item.slug === 'strawberry-matcha') return '草莓宇治抹茶';
    }
    return item.name;
  };

  const getItemTag = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '手作法式挞';
      if (item.slug === 'strawberry-love-cake') return '热销庆典款';
      if (item.slug === 'berry-soda') return '招牌特饮';
      if (item.slug === 'homemade-jam') return '小锅手作果酱';
      if (item.slug === 'strawberry-latte') return '工坊特调';
      if (item.slug === 'strawberry-matcha-cup') return '京都宇治';
    }
    return item.tag;
  };

  return () => clearInterval(timer);
  }, [isHovered, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const toggleFavourite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavourites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (product: BestSellerItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Convert to mock Product structure expected by CartContext
    const cartProduct: Product = {
      _id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description,
      images: [{ url: product.image, publicId: product.id }],
      variants: [],
      supportsCustomization: false,
      featured: true,
      isActive: true,
      category: product.categorySlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(cartProduct, 1);
    setAddedProductId(product.id);

    // Hold success state for 2.2 seconds
    setTimeout(() => {
      setAddedProductId((curr) => (curr === product.id ? null : curr));
    }, 2200);
  };

  const getItemName = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '草莓法式挞';
      if (item.slug === 'strawberry-love-cake' || item.slug === 'strawberry-cake') return '草莓鲜奶蛋糕';
      if (item.slug === 'berry-soda') return '草莓特调苏打';
      if (item.slug === 'homemade-jam') return '自制草莓果酱';
      if (item.slug === 'strawberry-latte') return '草莓鲜奶拿铁';
      if (item.slug === 'strawberry-matcha-cup' || item.slug === 'strawberry-matcha') return '草莓宇治抹茶';
    }
    return item.name;
  };

  const getItemTag = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '手作法式挞';
      if (item.slug === 'strawberry-love-cake') return '热销庆典款';
      if (item.slug === 'berry-soda') return '招牌特饮';
      if (item.slug === 'homemade-jam') return '小锅手作果酱';
      if (item.slug === 'strawberry-latte') return '工坊特调';
      if (item.slug === 'strawberry-matcha-cup') return '京都宇治';
    }
    return item.tag;
  };

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-28 pb-28 lg:pb-16 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-10 lg:pt-14 px-3.5 sm:px-6 lg:px-9 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Script / Editorial Heading, CTAs & Hand-drawn Storefront */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)] stroke-[2]" />
              <span className="text-eyebrow text-[var(--color-text-muted)]">
                {t('hero.badge', 'Artisanal Patisserie • Kuchai Lama, Kuala Lumpur')}
              </span>
            </div>

            <div className="space-y-3">
              <span className="font-script text-3xl sm:text-4xl text-[var(--color-secondary-dark)] font-semibold block">
                {t('hero.subtitle', '心聊甜香 • Handcrafted with love')}
              </span>
              <h1 className="text-h1 text-[var(--color-text)]">
                {t('hero.h1_1', 'Sweet Moments,')}<br />
                <span className="italic font-light text-[var(--color-primary-dark)]">
                  {t('hero.h1_2', 'Baked With Love.')}
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-xl leading-relaxed">
              {t('hero.desc', 'Step into SoulTalk Pastry. From warm cloud-cream dessert cups and handcrafted celebration cakes to elegant party favor boxes, every creation is thoughtfully designed to spark sweet conversations.')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link to="/products" className="btn-primary">
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                <span>{t('hero.orderNow', 'Order Now')}</span>
              </Link>

              <a
                href={buildWhatsAppUrl(
                  language === 'zh'
                    ? '您好心聊甜香！我想预订蛋糕或咨询定制。'
                    : 'Hello SoulTalk Pastry, I would like to order cakes or enquire about customization.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span>{t('hero.chatWhatsApp', 'Chat on WhatsApp')}</span>
              </a>
            </div>

            {/* Lower-left: Original Hand-drawn SoulTalk Storefront Illustration with Continuous Motion */}
            <div className="pt-4 border-t border-[var(--color-border)]/70">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-secondary-dark)]">
                  {t('hero.landmarkTitle', 'Our Boutique Landmark')}
                </span>
                <span className="text-xs text-[var(--color-border)]">•</span>
                <span className="font-script text-sm text-[var(--color-primary-dark)]">
                  {t('hero.landmarkHours', 'Open Tuesday–Sunday in Kuchai Lama')}
                </span>
              </div>

              <div className="p-3 sm:p-5 rounded-[var(--radius-large)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex justify-center">
                <SoulTalkStorefront size="small" showBadge={false} className="lg:hidden" />
                <SoulTalkStorefront size="large" showBadge={false} className="hidden lg:flex" />
              </div>
            </div>
          </div>

          {/* Right Column: Rotating Promotion Card with Real Photography */}
          <div
            className="lg:col-span-5 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="soultalk-card overflow-hidden border-2 border-[var(--color-border)] shadow-[var(--shadow-floating)] p-4 sm:p-6 bg-[var(--color-surface)]">
              
              {/* Slide Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
                <span className="px-3 py-1 rounded-full bg-[var(--color-blush)] text-[var(--color-secondary-dark)] text-xs font-extrabold">
                  {heroSlides[currentSlide].badge}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {heroSlides[currentSlide].tag}
                </span>
              </div>

              {/* Real Product Photography Frame */}
              <div className="relative aspect-square w-full rounded-[var(--radius-medium)] overflow-hidden bg-[var(--color-surface-soft)] border border-[var(--color-border)] group">
                <img
                  key={heroSlides[currentSlide].image}
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Visual badge watermark */}
                <div className="absolute top-3 right-3 bg-[var(--color-surface)]/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[11px] font-extrabold text-[var(--color-primary-dark)] flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[var(--color-gold)]" />
                  <span>SoulTalk Special</span>
                </div>
              </div>

              {/* Slide Content */}
              <div className="mt-5 space-y-2.5">
                <h3 className="font-serif-heading text-xl sm:text-2xl font-semibold text-[var(--color-text)]">
                  {heroSlides[currentSlide].title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={heroSlides[currentSlide].linkTo}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors underline underline-offset-4"
                  >
                    <span>{heroSlides[currentSlide].linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                  </Link>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="w-8 h-8 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="w-8 h-8 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* Slider Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx
                          ? 'w-6 bg-[var(--color-primary)]'
                          : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEASONAL PROMOTION BANNER */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="rounded-[var(--radius-xlarge)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] p-8 sm:p-12 relative overflow-hidden shadow-sm">
          {/* Subtle floral flourish background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[var(--color-blush)]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary-dark)]">
                <Gift className="w-3.5 h-3.5 text-[var(--color-secondary)] stroke-[2]" />
                <span>Autumn Signature Gift</span>
              </div>
              <h2 className="text-h2 text-[var(--color-text)]">
                Boutique Party Bags & Celebration Treats
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-xl leading-relaxed">
                Celebrating a birthday, full month, or company milestone? Enjoy customized ribbon tags, French macarons, and handcrafted butter cookies presented in pastel keepsake gift boxes.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3">
              <Link to="/products?category=party-bags" className="btn-primary text-center">
                <span>View Party Bags</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
              <a
                href={buildPartyBagsWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-center"
              >
                <span>WhatsApp Event Enquiry</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR BESTSELLERS */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-eyebrow text-[var(--color-secondary-dark)]">
              {language === 'zh' ? '工坊招牌亮点' : 'Patisserie Highlights'}
            </span>
            <h2 className="text-h2 text-[var(--color-text)]">
              {language === 'zh' ? '招牌热销推荐' : 'Signature Bestsellers'}
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-primary-dark)] hover:underline"
          >
            <span>{language === 'zh' ? '查看全部菜单' : 'Explore Complete Menu'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>

        {/* Four Column Desktop / Two Column Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {BESTSELLERS.map((item) => {
            const isFav = !!favourites[item.id];
            const isAdded = addedProductId === item.id;

            const getItemName = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '草莓法式挞';
      if (item.slug === 'strawberry-love-cake' || item.slug === 'strawberry-cake') return '草莓鲜奶蛋糕';
      if (item.slug === 'berry-soda') return '草莓特调苏打';
      if (item.slug === 'homemade-jam') return '自制草莓果酱';
      if (item.slug === 'strawberry-latte') return '草莓鲜奶拿铁';
      if (item.slug === 'strawberry-matcha-cup' || item.slug === 'strawberry-matcha') return '草莓宇治抹茶';
    }
    return item.name;
  };

  const getItemTag = (item: BestSellerItem) => {
    if (language === 'zh') {
      if (item.slug === 'strawberry-tart') return '手作法式挞';
      if (item.slug === 'strawberry-love-cake') return '热销庆典款';
      if (item.slug === 'berry-soda') return '招牌特饮';
      if (item.slug === 'homemade-jam') return '小锅手作果酱';
      if (item.slug === 'strawberry-latte') return '工坊特调';
      if (item.slug === 'strawberry-matcha-cup') return '京都宇治';
    }
    return item.tag;
  };

  return (
              <div
                key={item.id}
                className="soultalk-card soultalk-card-hover group flex flex-col overflow-hidden relative"
              >
                {/* Real Pastry Saucer / Plate Frame */}
                <div className="relative aspect-square w-full p-3 sm:p-4 flex items-center justify-center bg-gradient-to-b from-[#FFFDF9] to-[#FDF3EC] border-b border-[var(--color-border)] overflow-hidden">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EF] to-[#FDF3EC] border-2 border-[#FFFDF9] ring-1 ring-[var(--color-border)] shadow-xs flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                    <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-[var(--color-border)]/70 pointer-events-none" />
                    
                    <Link to={`/products/${item.slug}`} className="block w-4/5 h-4/5 z-10 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_16px_rgba(74,54,47,0.18)] transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>
                  </div>

                  {/* 360° Interactive View Prompt Badge */}
                  <Link
                    to={`/products/${item.slug}`}
                    className="absolute bottom-2.5 right-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs border border-[var(--color-border)] shadow-xs text-[10px] font-extrabold text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-soft)] transition-all"
                    title="Open interactive 360° spin view"
                  >
                    <RotateCw className="w-2.5 h-2.5 stroke-[2] text-[var(--color-secondary-dark)]" />
                    <span>360°</span>
                  </Link>

                  {/* Badge */}
                  <span className="absolute top-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[10px] font-extrabold text-[var(--color-text)] border border-[var(--color-border)] shadow-xs">
                    {getItemTag(item)}
                  </span>

                  {/* Favourite Heart */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavourite(item.id, e)}
                    className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[var(--color-text)] hover:text-[var(--color-secondary)] transition-all shadow-xs"
                    aria-label={`Toggle favourite for ${item.name}`}
                  >
                    <Heart
                      className={`w-4 h-4 stroke-[2] ${
                        isFav ? 'fill-[var(--color-secondary)] text-[var(--color-secondary)]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
                  <div>
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-serif-heading text-xs sm:text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                        {getItemName(item)}
                      </h3>
                    </Link>
                    <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border)]">
                    <span className="font-serif-heading font-semibold text-xs sm:text-base text-[var(--color-text)]">
                      RM {item.price.toFixed(2)}
                    </span>

                    {/* Quick Add Button with Animated Feedback */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(item, e)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                        isAdded
                          ? 'bg-[var(--color-sage)] text-[var(--color-primary-dark)] ring-2 ring-[var(--color-blush)] scale-95'
                          : 'bg-[var(--color-surface-soft)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] shadow-xs hover:-translate-y-0.5 active:scale-95'
                      }`}
                      aria-label={`Quick add ${item.name} to bag`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1 animate-pop-in text-[var(--color-primary-dark)]">
                          <Heart className="w-3.5 h-3.5 fill-current text-[var(--color-secondary)]" />
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
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PARTY BAGS SECTION */}
      <section id="party-bags" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="soultalk-card p-8 sm:p-12 border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-eyebrow text-[var(--color-secondary-dark)]">
                Door Gifts & Milestone Packs
              </span>
              <h2 className="text-h2 text-[var(--color-text)]">
                Curated SoulTalk Party Bags
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                Designed for weddings, 100-day baby celebrations, children's birthdays, and boutique corporate gifting. Each favor bag features hand-tied blush or champagne satin ribbons, personalised parchment cards, and French confections.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-center">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    Custom Ribbons
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Blush, sage & gold
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-center">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    French Macarons
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Fresh baked daily
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-center col-span-2 sm:col-span-1">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    Custom Notes
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Handwritten tags
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/products?category=party-bags" className="btn-primary">
                  <span>Browse Party Bag Sets</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>
                <a
                  href={buildPartyBagsWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle className="w-4 h-4 stroke-[2]" />
                  <span>Enquire for Bulk Orders</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-square rounded-[var(--radius-large)] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                <img
                  src="/products/chocolate-treasure-cake.png"
                  alt="SoulTalk Party Bags and Celebration Favor Boxes"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOM CAKES SECTION */}
      <section id="custom-cakes" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="rounded-[var(--radius-xlarge)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="aspect-square rounded-[var(--radius-large)] overflow-hidden border border-[var(--color-border)] shadow-md">
                <img
                  src="/products/strawberry-love-cake.png"
                  alt="Custom Cake Orders at SoulTalk Pastry"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <span className="text-eyebrow text-[var(--color-primary)]">
                Bespoke Patisserie
              </span>
              <h2 className="text-h2 text-[var(--color-text)]">
                Custom Celebration Cakes
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                Whether you need a whimsical Korean floral chiffon cake, an elegant tiered wedding showstopper, or customized cake plaque wording for a milestone celebration, our head pastry chef crafts every detail to order.
              </p>

              <div className="space-y-2.5 text-xs text-[var(--color-text)]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--color-primary)] stroke-[2.5]" />
                  <span>Complimentary chocolate name plaque & luxury gold candle set</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--color-primary)] stroke-[2.5]" />
                  <span>Choose custom sweetness level (50%, 70%, 100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--color-primary)] stroke-[2.5]" />
                  <span>Lead time of 24–48 hours for bespoke orders in Klang Valley</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to design a bespoke custom cake.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle className="w-4 h-4 stroke-[2]" />
                  <span>Chat With Our Cake Designer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR STORY SECTION */}
      <section id="story" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="soultalk-card p-8 sm:p-14 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="font-script text-3xl sm:text-4xl text-[var(--color-secondary-dark)] font-semibold">
              心聊甜香 • The SoulTalk Story
            </span>
            <h2 className="text-h2 text-[var(--color-text)]">
              Born from Paper, Pastry Boxes & Heartfelt Conversations
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              We started SoulTalk Pastry in Kuchai Lama with a quiet belief: that the sweetest moments in life happen when friends pause over a warm slice of cake and share honest conversations from the heart.
            </p>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
              Every sponge is baked fresh with pure butter, unbleached flour, and subtle Japanese sweetness. Packaged in delicate paper boxes reminiscent of handwritten letters, our bakes are meant to be given, savored, and remembered.
            </p>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
              <div>
                <span className="font-serif-heading font-semibold text-lg text-[var(--color-primary-dark)] block">
                  100% Fresh Daily
                </span>
                <span>No Artificial Preservatives</span>
              </div>
              <div className="w-px h-8 bg-[var(--color-border)]" />
              <div>
                <span className="font-serif-heading font-semibold text-lg text-[var(--color-primary-dark)] block">
                  Kuchai Lama Studio
                </span>
                <span>Warm Boutique Atmosphere</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/story" className="btn-secondary text-xs !min-h-[40px]">
                <span>{language === 'zh' ? '阅读完整品牌故事' : 'Explore Full Brand Story'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6B. BAKERY GALLERY SECTION */}
      <section id="gallery" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-eyebrow text-[var(--color-secondary-dark)]">
              {language === 'zh' ? '烘焙画廊' : 'Artisanal Gallery'}
            </span>
            <h2 className="text-h2 text-[var(--color-text)]">
              {language === 'zh' ? '手作庆典蛋糕与甜点剪影' : 'Patisserie Artistry & Celebration Cakes'}
            </h2>
          </div>
          <Link to="/gallery" className="btn-secondary text-xs !min-h-[40px] self-start sm:self-auto">
            <span>{language === 'zh' ? '进入完整画廊' : 'View Full Gallery'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Strawberry Love Cake (Front)', img: '/products/strawberry-love-cake.png', slug: 'strawberry-love-cake' },
            { name: 'Strawberry Love Cake (Side)', img: '/products/strawberry-love-cake-side.png', slug: 'strawberry-love-cake' },
            { name: 'Chocolate Treasure (Ganache)', img: '/products/chocolate-treasure-cake.png', slug: 'chocolate-treasure-cake' },
            { name: 'Chocolate Treasure (Drip Side)', img: '/products/chocolate-treasure-cake-side.png', slug: 'chocolate-treasure-cake' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={`/products/${item.slug}`}
              className="soultalk-card group overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#FDF3EC] border border-[var(--color-border)] shadow-xs flex items-center justify-center p-2 mb-3 transition-transform group-hover:scale-105">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <span className="font-serif-heading text-xs sm:text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                {item.name}
              </span>
              <span className="text-[10px] text-[var(--color-primary-dark)] font-bold mt-1">
                360° Studio Shot →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. EVENTS SECTION (Large Editorial Calendar) */}
      <section id="events" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-eyebrow text-[var(--color-secondary-dark)]">
            Community Gatherings & Tastings
          </span>
          <h2 className="text-h2 text-[var(--color-text)]">
            SoulTalk Pastry Studio Calendar
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Join us for intimate baking workshops, tea pairings, watercolor cake tags, and acoustic evenings at our Kuchai Lama storefront.
          </p>
        </div>

        {/* Editorial Paper Calendar Component */}
        <EventCalendar />
      </section>

      {/* 8. MEMBERSHIP SECTION */}
      <section id="membership" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="rounded-[var(--radius-xlarge)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary-dark)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)] stroke-[2]" />
                <span>SoulTalk Club Privileges</span>
              </div>

              <h2 className="text-h2 text-[var(--color-text)]">
                Earn Points, Unlock Vouchers & Celebrate Your Birthday
              </h2>

              <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-xl">
                Every ringgit spent earns reward points towards future cakes and tasting tickets. Share your personal invite code with friends to receive bonus referral credits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    1 RM = 1 Point
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Seamless checkout redemption
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    Birthday Treat
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Exclusive birthday voucher
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <span className="font-serif-heading font-semibold text-sm text-[var(--color-text)] block">
                    Friend Referral
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    Earn 50 pts per recommendation
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center space-y-3">
              <img
                src="/brand/soultalk-logo.png"
                alt="SoulTalk Pastry Logo"
                className="w-14 h-14 object-contain rounded-2xl"
              />
              <div>
                <span className="font-serif-heading font-semibold text-lg text-[var(--color-text)] block">
                  {isAuthenticated ? `Welcome back, ${member?.name?.split(' ')[0]}` : 'Join SoulTalk Club'}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {isAuthenticated ? `Your balance: ${member?.pointsBalance ?? 0} points` : 'Registration takes less than a minute'}
                </span>
              </div>

              {isAuthenticated ? (
                <Link to="/account" className="btn-primary w-full text-xs">
                  <span>Open Member Center</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </Link>
              ) : (
                <Link to="/register" className="btn-primary w-full text-xs">
                  <span>Create Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9">
        <div className="soultalk-card p-8 sm:p-12 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-eyebrow text-[var(--color-primary)]">Visit Our Store</span>
              <h2 className="text-h2 text-[var(--color-text)]">
                Say Hello in Kuchai Lama
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Whether you’re collecting a pre-ordered cake, picking up morning pastries, or having a quiet cup of tea, our doors are open Tuesday to Sunday.
              </p>

              <div className="space-y-3 text-sm text-[var(--color-text)] pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Kuchai Lama Storefront</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Kuchai Lama, 58200 Kuala Lumpur, Malaysia
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                  <div>
                    <span className="font-bold block">Opening Hours</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Tuesday – Sunday: 9:00 AM – 8:00 PM (Closed Mondays)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                  <div>
                    <span className="font-bold block">Store Telephone</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      +6012-345 6789
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-border)] space-y-4">
              <h4 className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
                Need a quick answer about an order?
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Our team responds fastest via WhatsApp for same-day counter pickups, custom lettering enquiries, and allergen advice.
              </p>
              <a
                href={buildWhatsAppUrl('Hello SoulTalk Pastry, I have an enquiry about today bakes.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center text-xs"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span>Message Store on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
