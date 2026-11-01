import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { Pastry3DViewer } from '../components/common/Pastry3DViewer';
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
} from 'lucide-react';

interface CarouselItem {
  id: string;
  name: string;
  name_zh: string;
  slug: string;
  category: string;
  category_zh: string;
  price: number;
  description: string;
  description_zh: string;
  flavorTags: string[];
  flavorTags_zh: string[];
  variants: {
    name: string;
    options: string[];
    options_zh: string[];
    priceModifiers?: number[];
  }[];
  thumb: string;
}

// The 8 treats matching the exact video carousel from the Dilum Sanjaya design (Bilingual)
const BOUTIQUE_TREATS: CarouselItem[] = [
  {
    id: 'latte',
    name: 'Strawberry Latte',
    name_zh: '草莓鲜奶拿铁',
    slug: 'strawberry-latte',
    category: 'DRINKS',
    category_zh: '特调饮品',
    price: 4.5,
    description: 'Espresso poured over house-made strawberry cream and chilled oat milk, dusted with cocoa.',
    description_zh: '香浓意式浓缩咖啡注入手作草莓鲜奶油与冰燕麦奶，表层撒上纯黑可可粉。',
    flavorTags: ['FROTHY MILK', 'STRAWBERRY PUREE', 'COCOA DUST'],
    flavorTags_zh: ['绵密奶沫', '手捣草莓果泥', '浓郁可可粉'],
    variants: [
      { name: 'Size', options: ['Regular', 'Large'], options_zh: ['标准杯', '大杯'], priceModifiers: [0, 0.8] },
      { name: 'Milk', options: ['Oat Milk', 'Fresh Dairy'], options_zh: ['燕麦奶', '天然鲜牛奶'], priceModifiers: [0, 0] },
    ],
    thumb: '/images/carousel/latte.png',
  },
  {
    id: 'cake',
    name: 'Strawberry Cake',
    name_zh: '草莓鲜奶蛋糕',
    slug: 'strawberry-love-cake',
    category: 'CAKES',
    category_zh: '手作蛋糕',
    price: 5.2,
    description: 'Fluffy Japanese vanilla chiffon sponge layered with strawberry compote and whipped cream clouds.',
    description_zh: '松软日式香草戚风海绵蛋糕，层层抹上新鲜熬制草莓果酱与轻盈云朵鲜奶油。',
    flavorTags: ['VANILLA CHIFFON', 'STRAWBERRY COMPOTE', 'WHIPPED CREAM'],
    flavorTags_zh: ['日式香草戚风', '手熬草莓果酱', '轻盈鲜奶油'],
    variants: [
      { name: 'Portion', options: ['Single slice', 'Whole 6-inch'], options_zh: ['单人切件', '6寸整颗蛋糕'], priceModifiers: [0, 130] },
      { name: 'Sweetness', options: ['Regular (100%)', 'Less Sweet (70%)'], options_zh: ['标准甜 (100%)', '减糖减甜 (70%)'], priceModifiers: [0, 0] },
    ],
    thumb: '/images/carousel/cake.png',
  },
  {
    id: 'soda',
    name: 'Berry Soda',
    name_zh: '草莓特调苏打',
    slug: 'berry-soda',
    category: 'DRINKS',
    category_zh: '特调饮品',
    price: 4.8,
    description: 'Sparkling water over crushed strawberries and a squeeze of lime, with plenty of ice and a cloud of cream.',
    description_zh: '清爽气泡水注入手捣鲜草莓肉，挤入少许青柠汁，搭配满杯清凉冰块与细腻奶盖。',
    flavorTags: ['SPARKLING', 'LIME', 'LOTS OF ICE'],
    flavorTags_zh: ['清凉气泡', '青柠果香', '爽口满冰'],
    variants: [
      { name: 'Size', options: ['Small', 'Regular', 'Large'], options_zh: ['小杯', '标准杯', '大杯'], priceModifiers: [0, 0.5, 1.0] },
      { name: 'Ice Level', options: ['Plenty of Ice', 'Less Ice'], options_zh: ['正常冰', '少冰'], priceModifiers: [0, 0] },
    ],
    thumb: '/images/carousel/soda.png',
  },
  {
    id: 'jam',
    name: 'Homemade Jam',
    name_zh: '自制草莓果酱',
    slug: 'homemade-jam',
    category: 'JARS',
    category_zh: '手工果酱',
    price: 6.9,
    description: 'Slow-cooked in small batches with a little lemon zest. Lovely on warm scones, toast, or straight from the spoon.',
    description_zh: '铜锅慢火手作小批次熬煮，拌入天然柠檬皮屑。涂抹在刚出炉的司康、吐司或直接舀取品尝，甘甜清香。',
    flavorTags: ['SMALL BATCH', 'LEMON ZEST', '250 G JAR'],
    flavorTags_zh: ['手作小锅熬制', '新鲜柠檬皮', '250克分享装'],
    variants: [
      { name: 'Pack', options: ['One jar', 'Two jars', 'Gift box'], options_zh: ['单瓶装', '两瓶分享装', '精美礼盒装'], priceModifiers: [0, 6.0, 12.0] },
    ],
    thumb: '/images/carousel/jam.png',
  },
  {
    id: 'matcha',
    name: 'Strawberry Matcha',
    name_zh: '草莓宇治抹茶',
    slug: 'strawberry-matcha-cup',
    category: 'DRINKS',
    category_zh: '特调饮品',
    price: 5.4,
    description: 'Stone-ground Kyoto Uji matcha hand-whisked and layered over organic strawberry coulis and creamy foam.',
    description_zh: '日本京都宇治石臼研磨抹茶手工现刷，分层注入天然草莓果茸与绵密奶沫。',
    flavorTags: ['CEREMONIAL MATCHA', 'STRAWBERRY COULIS', 'HAND-WHISKED'],
    flavorTags_zh: ['日本宇治抹茶', '手作草莓果泥', '现点手刷奶沫'],
    variants: [
      { name: 'Matcha Origin', options: ['Kyoto Uji', 'Shizuoka Blend'], options_zh: ['京都宇治', '静冈特调'], priceModifiers: [0, 1.0] },
      { name: 'Sweetness', options: ['Standard', 'Less Sweet'], options_zh: ['标准甜度', '微甜少糖'], priceModifiers: [0, 0] },
    ],
    thumb: '/images/carousel/matcha.png',
  },
  {
    id: 'tart',
    name: 'Strawberry Tart',
    name_zh: '草莓法式挞',
    slug: 'strawberry-tart',
    category: 'SWEETS',
    category_zh: '精致小点',
    price: 5.8,
    description: 'Buttery shortcrust filled with vanilla custard and a crown of glazed strawberries, with a sprig of mint.',
    description_zh: '经典法式天然黄油酥脆挞壳，填入细腻马达加斯加香草卡仕达酱与晶莹多汁草莓，佐以新鲜薄荷叶。',
    flavorTags: ['BUTTER SHORTCRUST', 'VANILLA CUSTARD', 'GLAZED BERRIES'],
    flavorTags_zh: ['天然黄油挞皮', '香草卡仕达', '晶莹多汁草莓'],
    variants: [
      { name: 'Size', options: ['Little tart', 'Two tarts', 'Family tart'], options_zh: ['单人法式挞', '双人分享挞', '家庭聚会大挞'], priceModifiers: [0, 5.0, 15.0] },
    ],
    thumb: '/images/carousel/tart.png',
  },
  {
    id: 'sundae',
    name: 'Strawberry Sundae',
    name_zh: '草莓圣代冰淇淋',
    slug: 'strawberry-sundae',
    category: 'SWEETS',
    category_zh: '精致小点',
    price: 4.9,
    description: 'Madagascan vanilla bean soft serve swirled with strawberry sauce, biscuit crumble, and fresh berries.',
    description_zh: '马达加斯加香草豆冰淇淋淋入手作草莓果酱、手工酥饼碎与多汁红草莓。',
    flavorTags: ['MADAGASCAN VANILLA', 'BERRY CRUMBLE', 'SOFT SERVE'],
    flavorTags_zh: ['香草豆冰淇淋', '手作酥饼碎', '鲜甜浆果'],
    variants: [
      { name: 'Size', options: ['Single cup', 'Double scoop'], options_zh: ['标准单杯', '加量双球'], priceModifiers: [0, 2.0] },
    ],
    thumb: '/images/carousel/sundae.png',
  },
  {
    id: 'macaron',
    name: 'Strawberry Macarons',
    name_zh: '草莓法式马卡龙',
    slug: 'strawberry-macarons',
    category: 'SWEETS',
    category_zh: '精致小点',
    price: 6.2,
    description: 'Crisp Parisian almond shells filled with strawberry white chocolate ganache and strawberry jam heart.',
    description_zh: '法式经典酥脆杏仁小圆饼，填入草莓白巧克力甘纳许与酸甜草莓果酱夹心。',
    flavorTags: ['ALMOND SHELLS', 'WHITE GANACHE', 'PARISIAN RECIPE'],
    flavorTags_zh: ['法式杏仁壳', '白巧甘纳许', '巴黎经典配方'],
    variants: [
      { name: 'Box Size', options: ['Box of 4', 'Box of 8'], options_zh: ['4颗尝鲜盒', '8颗尊享礼盒'], priceModifiers: [0, 5.5] },
    ],
    thumb: '/images/carousel/macaron.png',
  },
];

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t, language } = useLanguage();

  const isZh = language === 'zh';

  // Find active treat matching route slug, fallback to Strawberry Tart (the featured item)
  const currentSlug = slug || 'strawberry-tart';
  const matchedTreat =
    BOUTIQUE_TREATS.find((t) => t.slug === currentSlug) ||
    BOUTIQUE_TREATS.find((t) => t.id === 'tart') ||
    BOUTIQUE_TREATS[5];

  const [activeItem, setActiveItem] = useState<CarouselItem>(matchedTreat);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Synchronize when route slug changes
  useEffect(() => {
    const treat = BOUTIQUE_TREATS.find((t) => t.slug === slug);
    if (treat) {
      setActiveItem(treat);
      const initial: Record<string, string> = {};
      treat.variants.forEach((v) => {
        initial[v.name] = v.options[0];
      });
      setSelectedVariants(initial);
      setQuantity(1);
    }
  }, [slug]);

  const handleSelectTreat = (treat: CarouselItem) => {
    setActiveItem(treat);
    navigate(`/products/${treat.slug}`);
  };

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  };

  let unitPrice = activeItem.price;
  activeItem.variants.forEach((v) => {
    const selected = selectedVariants[v.name];
    if (selected && v.priceModifiers) {
      const idx = v.options.indexOf(selected);
      if (idx !== -1 && v.priceModifiers[idx]) {
        unitPrice += v.priceModifiers[idx];
      }
    }
  });

  const cartProduct: Product = {
    _id: `prod-${activeItem.slug}`,
    name: isZh ? activeItem.name_zh : activeItem.name,
    slug: activeItem.slug,
    price: unitPrice,
    description: isZh ? activeItem.description_zh : activeItem.description,
    images: [{ url: activeItem.thumb, publicId: activeItem.id }],
    variants: activeItem.variants,
    category: activeItem.category.toLowerCase(),
    supportsCustomization: true,
    featured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleAddToCart = () => {
    addItem(cartProduct, quantity, selectedVariants, customNotes);
    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
    }, 2000);
  };

  const displayName = isZh ? activeItem.name_zh : activeItem.name;
  const displayCategory = isZh ? activeItem.category_zh : activeItem.category;
  const displayDescription = isZh ? activeItem.description_zh : activeItem.description;
  const displayTags = isZh ? activeItem.flavorTags_zh : activeItem.flavorTags;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#4A362F] selection:bg-[#F5CDD2] selection:text-[#5B3D33] py-3 sm:py-6 px-3 sm:px-6 lg:px-10 pb-28 lg:pb-8">
      
      {/* Top Outer Back Bar */}
      <div className="max-w-[1320px] mx-auto mb-2 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8A796F] hover:text-[#4A362F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
          <span>{t('product.backToCorner', 'BACK TO THE CORNER')}</span>
        </Link>

        <span className="font-script text-sm sm:text-base text-[#A84852]">
          {isZh ? '心聊甜香 · 吉隆坡古仔路' : 'SoulTalk Pastry · Kuchai Lama'}
        </span>
      </div>

      {/* Mobile-Only Header Header Bar (< lg) */}
      <div className="lg:hidden max-w-[1320px] mx-auto mb-3 flex items-center justify-between">
        <div>
          <h1 className="font-script text-3xl sm:text-4xl text-[#3C2E28] tracking-tight leading-none">
            {t('product.ourMenu', 'Our Menu')}
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E8B80] mt-0.5">
            {t('product.bakedMorning', 'BAKED THIS MORNING · POURED WITH LOVE')}
          </p>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-[#EADBCC] text-xs font-script text-[#D44A52] select-none">
          <span>{t('product.youAreHere', 'you are here')}</span>
        </div>
      </div>

      {/* Main Grid: Left Storefront Panel + Right Showcase Card */}
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: Boutique Storefront & Whimsical Menu Annotations   */}
        {/* ============================================================== */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-between pt-2 space-y-4">
          
          <div className="space-y-1">
            <h1 className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#3C2E28] tracking-tight leading-none">
              {t('product.ourMenu', 'Our Menu')}
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#9E8B80]">
              {t('product.bakedMorning', 'BAKED THIS MORNING · POURED WITH LOVE')}
            </p>
          </div>

          {/* Whimsical "you are here" note and building illustration */}
          <div className="relative flex flex-col items-center pt-2">
            
            {/* Red script "you are here" with curved arrow pointing to cafe */}
            <div className="self-end mr-6 sm:mr-10 flex flex-col items-center select-none pointer-events-none">
              <span className="font-script text-sm text-[#D44A52] tracking-wide rotate-[-4deg]">
                {t('product.youAreHere', 'you are here')}
              </span>
              <svg
                width="22"
                height="24"
                viewBox="0 0 24 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#D44A52] -mt-0.5"
              >
                <path
                  d="M10 2C15 6 18 12 14 20M14 20L9 16M14 20L19 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Watercolor Corner Café Building */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] drop-shadow-sm select-none">
              <img
                src="/images/corner/cafe_building_transparent.png"
                alt="SoulTalk Strawberry Corner Boutique Cafe"
                className="w-full h-auto object-contain filter drop-shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: The Dilum Sanjaya Showcase Card (Exact Match)     */}
        {/* ============================================================== */}
        <div className="w-full lg:col-span-8 bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-[#F7EFE4] border border-[#EADBCC] rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(150,110,80,0.06)] space-y-5 sm:space-y-6">
          
          {/* Upper Section: 3D Turntable Left + Product Details Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
            
            {/* Inner Left: 3D Turntable on Plate with "drag to turn it around" */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <Pastry3DViewer slug={activeItem.slug} fallbackImage={activeItem.thumb} />
            </div>

            {/* Inner Right: Typography, Price, Description, Pills & Actions */}
            <div className="md:col-span-6 space-y-3 sm:space-y-3.5">
              
              {/* Top breadcrumb & Category */}
              <div className="space-y-1">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#9E8B80] hover:text-[#4A362F] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{t('product.allTreats', 'ALL TREATS')}</span>
                </Link>

                <div className="text-[11px] font-bold tracking-widest text-[#9A877C] uppercase">
                  {displayCategory}
                </div>
              </div>

              {/* Title in Deep Terracotta / Strawberry Red Serif */}
              <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#9E353B] font-medium tracking-tight">
                {displayName}
              </h2>

              {/* Price */}
              <div className="font-serif text-2xl sm:text-[26px] font-medium text-[#3C2F29]">
                $ {unitPrice.toFixed(2)}
              </div>

              {/* Editorial Description */}
              <p className="text-xs sm:text-[13px] text-[#75645A] leading-relaxed">
                {displayDescription}
              </p>

              {/* Flavor Pill Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {displayTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/70 border border-[#DFD3C6] text-[#7E6E64]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Variant / Size Options */}
              {activeItem.variants.map((v) => (
                <div key={v.name} className="space-y-1 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {v.options.map((opt, optIndex) => {
                      const isSelected = selectedVariants[v.name] === opt;
                      const optLabel = isZh && v.options_zh ? v.options_zh[optIndex] : opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleVariantSelect(v.name, opt)}
                          className={`px-3 sm:px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FCECEF] border border-[#E28D98] text-[#9E353B] font-bold shadow-2xs'
                              : 'bg-white/60 border border-[#DFD3C6] text-[#7E6E64] hover:bg-white'
                          }`}
                        >
                          {optLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Stepper & Add to Bag Row */}
              <div className="flex items-center gap-2.5 sm:gap-3 pt-2 w-full">
                {/* Rounded Stepper Capsule */}
                <div className="inline-flex shrink-0 items-center h-10 px-2.5 rounded-full border border-[#DFD3C6] bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 flex items-center justify-center text-[#7E6E64] hover:text-[#4A362F] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold font-mono text-[#3C2F29]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#7E6E64] hover:text-[#4A362F] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Coral Red Add to Bag Pill Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`h-10 px-5 sm:px-6 rounded-full bg-[#DF5056] hover:bg-[#D43D44] text-white text-xs font-bold uppercase tracking-wider shadow-[0_8px_20px_rgba(223,80,86,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 flex-1 max-w-[220px] ${
                    isAddedSuccess ? 'ring-2 ring-[#F5CDD2]' : ''
                  }`}
                >
                  {isAddedSuccess ? (
                    <span className="flex items-center gap-1.5 animate-pop-in">
                      <Heart className="w-3.5 h-3.5 fill-current text-white" />
                      <span>{t('product.addedSuccess', 'Added! ♡')}</span>
                    </span>
                  ) : (
                    <>
                      <span>{t('product.addToBag', 'ADD TO BAG')}</span>
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lower Section: Horizontal 8-Item Carousel matching screenshot */}
          <div className="border-t border-[#EEDBCA]/60 pt-4">
            <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 px-1 scrollbar-none snap-x snap-mandatory">
              {BOUTIQUE_TREATS.map((treat) => {
                const isActive = activeItem.slug === treat.slug;
                const treatName = isZh ? treat.name_zh : treat.name;
                return (
                  <button
                    key={treat.id}
                    type="button"
                    onClick={() => handleSelectTreat(treat)}
                    className={`group relative shrink-0 snap-start w-12 h-14 sm:w-13 sm:h-15 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-2 border-[#A33438] bg-white shadow-xs scale-105'
                        : 'border border-[#EADBCC]/70 bg-[#FAF5EE]/90 hover:bg-white hover:border-[#DFD3C6]'
                    }`}
                    title={treatName}
                  >
                    <img
                      src={treat.thumb}
                      alt={treatName}
                      className="w-8 h-10 sm:w-9 sm:h-12 object-contain pointer-events-none filter drop-shadow-2xs"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
