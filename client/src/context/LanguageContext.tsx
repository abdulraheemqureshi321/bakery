import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

export interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export const DICTIONARY: Translations = {
  // Navigation
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.menu': { en: 'Menu', zh: '美味菜单' },
  'nav.partyBags': { en: 'Party Bags', zh: '派对伴手礼' },
  'nav.story': { en: 'Our Story', zh: '品牌故事' },
  'nav.gallery': { en: 'Gallery', zh: '烘焙画廊' },
  'nav.events': { en: 'Events', zh: '烘焙工作坊' },
  'nav.contact': { en: 'Contact', zh: '联系我们' },

  // Header utilities
  'header.points': { en: 'pts', zh: '积分' },
  'header.earnPoints': { en: 'Earn Points', zh: '赚取积分' },
  'header.loginRegister': { en: 'Login / Register', zh: '登录 / 注册' },
  'header.memberCenter': { en: 'Member Center', zh: '会员中心' },
  'header.admin': { en: 'Admin', zh: '管理后台' },
  'header.logout': { en: 'Logout', zh: '退出登录' },

  // Hero Section
  'hero.badge': { en: 'Artisanal Patisserie • Kuchai Lama, Kuala Lumpur', zh: '吉隆坡 Kuchai Lama • 匠心法式甜点工坊' },
  'hero.subtitle': { en: '心聊甜香 • Handcrafted with love', zh: '心聊甜香 • 每一口都是手作心意' },
  'hero.h1_1': { en: 'Sweet Moments,', zh: '甜蜜时刻，' },
  'hero.h1_2': { en: 'Baked With Love.', zh: '用心烘焙。' },
  'hero.desc': {
    en: 'Step into SoulTalk Pastry. From warm cloud-cream dessert cups and handcrafted celebration cakes to elegant party favor boxes, every creation is thoughtfully designed to spark sweet conversations.',
    zh: '欢迎光临心聊甜香 (SoulTalk Pastry)。从轻盈如云的鲜奶油甜点杯、手作庆典蛋糕，到精致派对伴手礼盒，每一份甜点都倾注温度，为美好相聚增添甘甜回忆。'
  },
  'hero.orderNow': { en: 'Order Now', zh: '立即订购' },
  'hero.chatWhatsApp': { en: 'Chat on WhatsApp', zh: 'WhatsApp 咨询' },
  'hero.landmarkTitle': { en: 'Our Boutique Landmark', zh: '甜香工坊地标' },
  'hero.landmarkHours': { en: 'Open Tuesday–Sunday in Kuchai Lama', zh: '周二至周日营业 • 吉隆坡古仔路' },
  'hero.bestsellers': { en: 'Our Bestsellers', zh: '招牌热销推荐' },
  'hero.viewAll': { en: 'View All', zh: '查看全部' },
  'hero.seasonSpecial': { en: 'Season Special', zh: '本季特选' },
  'hero.strawberryMoments': { en: 'Strawberry Moments', zh: '草莓甜美时光' },
  'hero.sweetRecipes': { en: 'Sweet recipes for a brighter day', zh: '点亮一整天的温暖手作甜点' },
  'hero.seeMenu': { en: 'See Menu', zh: '查看菜单' },
  'hero.taglineQuote': { en: 'Coffee, Strawberries, and a kinder day.', zh: '咖啡、草莓，与更温柔的美好日常。' },

  // Menu / Catalog
  'menu.title': { en: 'Our Menu', zh: '美味菜单' },
  'menu.h1': { en: 'Handcrafted Cakes & Desserts', zh: '手作庆典蛋糕与甜品' },
  'menu.desc': {
    en: 'Every creation is prepared fresh with French butter, natural fruit compotes, and reduced Japanese sweetness. Tap any pastry to explore flavor notes or add directly to your bag.',
    zh: '所有甜点均精选法国天然黄油与手工熬制果酱，采用低糖减甜配方。轻触任意甜点即可查看 360° 全景旋转，或直接加入购物袋。'
  },
  'menu.all': { en: 'All Creations', zh: '全部甜点' },
  'menu.searchPlaceholder': { en: 'Search cakes, dessert cups, party bags...', zh: '搜索蛋糕、甜品杯、派对礼盒...' },
  'menu.sort': { en: 'Sort:', zh: '排序：' },
  'menu.sortNewest': { en: 'Newest Additions', zh: '最新上架' },
  'menu.sortPriceAsc': { en: 'Price: Low to High', zh: '价格：由低到高' },
  'menu.sortPriceDesc': { en: 'Price: High to Low', zh: '价格：由高到低' },
  'menu.sortNameAsc': { en: 'Name: A to Z', zh: '名称：A 到 Z' },
  'menu.quickAdd': { en: 'Quick Add', zh: '快速加购' },
  'menu.added': { en: 'Added ♡', zh: '已加购 ♡' },
  'menu.view360': { en: '360° View', zh: '360° 全景' },
  'menu.customizable': { en: 'Customizable', zh: '支持定制' },
  'menu.popular': { en: 'Popular', zh: '热销推荐' },
  'menu.youAreHere': { en: 'you are here ~', zh: '甜香就在这里 ~' },
  'menu.freshDaily': { en: 'Fresh bakes out at 9am', zh: '每日清晨现烤出炉' },

  // Product Detail Showcase
  'product.backToCorner': { en: 'BACK TO THE CORNER', zh: '返回甜香工坊' },
  'product.ourMenu': { en: 'Our Menu', zh: '心聊菜单' },
  'product.bakedMorning': { en: 'BAKED THIS MORNING · POURED WITH LOVE', zh: '今日清晨现烤出炉 · 满溢手作温度' },
  'product.youAreHere': { en: 'you are here', zh: '甜香就在这里' },
  'product.allTreats': { en: 'ALL TREATS', zh: '全部甜点' },
  'product.dragToTurn': { en: '‹ drag to turn it around ›', zh: '‹ 按住拖动 360° 旋转 ›' },
  'product.addToBag': { en: 'ADD TO BAG', zh: '加入购物袋' },
  'product.addedSuccess': { en: 'Added! ♡', zh: '已加入购物袋！♡' },
  'product.flightTitle': { en: 'Signature Pastry Flight', zh: '招牌甜点赏味集' },
  'product.freshToday': { en: 'Fresh Today', zh: '今日新鲜现做' },
  'product.inStock': { en: 'In Stock', zh: '每日现制' },

  // Categories
  'cat.sweets': { en: 'SWEETS', zh: '精致小点' },
  'cat.drinks': { en: 'DRINKS', zh: '特调饮品' },
  'cat.cakes': { en: 'CAKES', zh: '手作蛋糕' },
  'cat.jars': { en: 'JARS', zh: '手工果酱' },

  // Cart Drawer
  'cart.title': { en: 'Your Pastry Bag', zh: '您的甜点购物袋' },
  'cart.emptyTitle': { en: 'Your bag is empty', zh: '购物袋还是空的' },
  'cart.emptySubtitle': { en: 'Explore our artisanal pastries and treats.', zh: '快去探索我们的法式手工甜点吧！' },
  'cart.subtotal': { en: 'Subtotal', zh: '小计金额' },
  'cart.checkout': { en: 'Proceed to Checkout', zh: '前往结算' },
  'cart.continueShopping': { en: 'Continue Browsing', zh: '继续挑选' },

  // Checkout Page
  'checkout.title': { en: 'Checkout', zh: '订单结算' },
  'checkout.step1': { en: '1. Fulfilment', zh: '1. 取餐方式' },
  'checkout.step2': { en: '2. Date & Time', zh: '2. 日期与时段' },
  'checkout.step3': { en: '3. Rewards & Vouchers', zh: '3. 积分与优惠券' },
  'checkout.step4': { en: '4. Payment', zh: '4. 支付确认' },
  'checkout.pickup': { en: 'Store Self-Pickup', zh: '门店自提 (Kuchai Lama)' },
  'checkout.delivery': { en: 'Delivery (Klang Valley)', zh: '雪隆区配送上门' },

  // Common UI
  'common.close': { en: 'Close', zh: '关闭' },
  'common.loading': { en: 'Loading...', zh: '加载中...' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('soultalk_language');
      if (saved === 'zh' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('soultalk_language', lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const entry = DICTIONARY[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
