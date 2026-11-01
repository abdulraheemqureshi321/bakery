import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import {
  Sparkles,
  RotateCw,
  ShoppingBag,
  MessageCircle,
  Eye,
  Heart,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  name: string;
  category: 'cakes' | 'cups' | 'party-bags';
  image: string;
  tag: string;
  description: string;
  slug?: string;
  price?: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    name: 'Strawberry Love Cake (Front Studio)',
    category: 'cakes',
    image: '/products/strawberry-love-cake.png',
    tag: 'Signature Celebration',
    description: 'Chantilly cloud cream, soft vanilla sponge, and Cameron ruby strawberries.',
    slug: 'strawberry-love-cake',
    price: 138,
  },
  {
    id: 'gal-2',
    name: 'Strawberry Love Cake (360° Side Profile)',
    category: 'cakes',
    image: '/products/strawberry-love-cake-side.png',
    tag: 'Side Layering',
    description: 'Fresh sliced strawberries embedded in organic vanilla cream layers.',
    slug: 'strawberry-love-cake',
    price: 138,
  },
  {
    id: 'gal-3',
    name: 'Strawberry Love Cake (360° Rosette Swirls)',
    category: 'cakes',
    image: '/products/strawberry-love-cake-back.png',
    tag: 'Hand-Piped Detail',
    description: 'Delicate piping craft finished with strawberry glaze compote.',
    slug: 'strawberry-love-cake',
    price: 138,
  },
  {
    id: 'gal-4',
    name: 'Chocolate Treasure Cake (Belgian Ganache)',
    category: 'cakes',
    image: '/products/chocolate-treasure-cake.png',
    tag: 'Rich Cocoa',
    description: '70% dark Belgian chocolate sponge, silky ganache drip, and treats.',
    slug: 'chocolate-treasure-cake',
    price: 158,
  },
  {
    id: 'gal-5',
    name: 'Chocolate Treasure Cake (Side Shards)',
    category: 'cakes',
    image: '/products/chocolate-treasure-cake-side.png',
    tag: 'Ganache Drip Profile',
    description: 'Glossy chocolate mirror drip cascading down artisanal sponge.',
    slug: 'chocolate-treasure-cake',
    price: 158,
  },
  {
    id: 'gal-6',
    name: 'Chocolate Treasure Cake (Glaze Swirls)',
    category: 'cakes',
    image: '/products/chocolate-treasure-cake-back.png',
    tag: 'Top Glaze Craft',
    description: 'Top-angled view showing chocolate pearls, curls, and gold leaf.',
    slug: 'chocolate-treasure-cake',
    price: 158,
  },
  {
    id: 'gal-7',
    name: 'Strawberry Matcha Cup (Verrine)',
    category: 'cups',
    image: '/products/strawberry-matcha-cup.png',
    tag: 'Ceremonial Matcha',
    description: 'Kyoto Uji matcha sponge paired with fresh strawberry mousse.',
    slug: 'strawberry-matcha-cup',
    price: 24,
  },
  {
    id: 'gal-8',
    name: 'Strawberry Matcha Cup (Side Layers)',
    category: 'cups',
    image: '/products/strawberry-matcha-cup-side.png',
    tag: 'Verrine Layer Craft',
    description: 'Cross-section of matcha chiffon, berry compote, and cloud cream.',
    slug: 'strawberry-matcha-cup',
    price: 24,
  },
  {
    id: 'gal-9',
    name: 'Orange Sunshine Cup (Citrus Verrine)',
    category: 'cups',
    image: '/products/orange-sunshine-cup.png',
    tag: 'Seasonal Cup',
    description: 'Candied citrus, orange curd reduction, and Madagascar vanilla sponge.',
    slug: 'orange-sunshine-cup',
    price: 22,
  },
  {
    id: 'gal-10',
    name: 'Orange Sunshine Cup (Side Profile)',
    category: 'cups',
    image: '/products/orange-sunshine-cup-side.png',
    tag: 'Citrus Layers',
    description: 'Sun-drenched citrus colors layered in clear dessert glassware.',
    slug: 'orange-sunshine-cup',
    price: 22,
  },
];

export const GalleryPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { buildWhatsAppUrl } = useSettings();
  const [activeFilter, setActiveFilter] = useState<'all' | 'cakes' | 'cups' | 'party-bags'>('all');

  const filteredItems = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 sm:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)] stroke-[2]" />
          <span className="text-eyebrow text-[var(--color-secondary-dark)]">
            {language === 'zh' ? '烘焙画廊 • 甜点光影' : 'Patisserie Gallery • SoulTalk Artistry'}
          </span>
        </div>

        <span className="font-script text-4xl sm:text-5xl text-[var(--color-secondary-dark)] font-semibold block">
          {language === 'zh' ? '心聊画廊，定格甜蜜' : 'Artisanal Moments in Full View'}
        </span>

        <h1 className="text-h1 text-[var(--color-text)]">
          {language === 'zh' ? '手作庆典蛋糕与甜品光影' : 'Artisanal Cakes & Pastry Showcase'}
        </h1>

        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
          {language === 'zh'
            ? '细品每一道手作弧度与丝滑甘纳许。点击任意作品即可查看 360° 旋转细节或直接预订。'
            : 'Explore the delicate textures, velvety cream swirls, and glossy glazes of our handcrafted patisserie creations. Tap any piece to view in 360° or order directly.'}
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { key: 'all', label: language === 'zh' ? '全部画作' : 'All Pastries' },
          { key: 'cakes', label: language === 'zh' ? '庆典蛋糕 (360° 视角)' : 'Celebration Cakes (360°)' },
          { key: 'cups', label: language === 'zh' ? '法式甜点杯' : 'Dessert Verrines' },
          { key: 'party-bags', label: language === 'zh' ? '伴手礼盒' : 'Party Bags & Favors' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-[var(--color-primary)] text-white shadow-xs -translate-y-0.5'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="soultalk-card group overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:shadow-[var(--shadow-card)] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ceramic Plate Image Frame */}
            <div className="relative aspect-square w-full p-6 flex items-center justify-center bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EF] to-[#FDF3EC] border-b border-[var(--color-border)] overflow-hidden">
              <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#FDF3EC] border-2 border-[#FFFDF9] ring-1 ring-[var(--color-border)] shadow-xs flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                <div className="absolute inset-3 rounded-full border border-dashed border-[var(--color-border)]/70 pointer-events-none" />
                
                {item.slug ? (
                  <Link to={`/products/${item.slug}`} className="block w-4/5 h-4/5 z-10 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_12px_18px_rgba(74,54,47,0.2)] transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                ) : (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-4/5 h-4/5 object-contain filter drop-shadow-[0_12px_18px_rgba(74,54,47,0.2)]"
                  />
                )}
              </div>

              {/* 360 Badge */}
              {item.slug && (
                <Link
                  to={`/products/${item.slug}`}
                  className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-[var(--color-border)] shadow-xs text-xs font-extrabold text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-soft)] transition-all"
                >
                  <RotateCw className="w-3 h-3 stroke-[2] text-[var(--color-secondary-dark)]" />
                  <span>{language === 'zh' ? '360° 旋转' : 'View 360°'}</span>
                </Link>
              )}

              {/* Tag */}
              <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-xs text-[10px] font-extrabold text-[var(--color-text)] border border-[var(--color-border)] shadow-xs">
                {item.tag}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                {item.slug ? (
                  <Link to={`/products/${item.slug}`}>
                    <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
                    {item.name}
                  </h3>
                )}
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                {item.price ? (
                  <span className="font-serif-heading text-base font-semibold text-[var(--color-text)]">
                    RM {item.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[var(--color-secondary-dark)]">
                    {language === 'zh' ? '定制款' : 'Custom'}
                  </span>
                )}

                {item.slug ? (
                  <Link
                    to={`/products/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    <span>{language === 'zh' ? '详情与订购' : 'Inspect & Order'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <a
                    href={buildWhatsAppUrl(`Hello SoulTalk Pastry, I would like to order or enquire about ${item.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--color-secondary-dark)] hover:text-[var(--color-secondary)] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

