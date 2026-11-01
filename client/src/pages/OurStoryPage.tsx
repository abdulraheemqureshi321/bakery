import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { SoulTalkStorefront } from '../components/common/SoulTalkStorefront';
import {
  Sparkles,
  Heart,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const OurStoryPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { buildWhatsAppUrl } = useSettings();

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-9 py-10 sm:py-16 space-y-16 sm:space-y-24">
      
      {/* 1. HERO STORY HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)] stroke-[2]" />
          <span className="text-eyebrow text-[var(--color-secondary-dark)]">
            {language === 'zh' ? '心聊甜香 • 品牌初心' : 'Our Brand Philosophy • SoulTalk Pastry'}
          </span>
        </div>

        <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-[var(--color-secondary-dark)] font-semibold block">
          {language === 'zh' ? '用心倾听，以甜传意' : 'Baked With Soul, Shared With Love'}
        </span>

        <h1 className="text-h1 text-[var(--color-text)]">
          {language === 'zh' ? '吉隆坡 Kuchai Lama 的温暖烘焙工坊' : 'Our Handcrafted Bakery in Kuchai Lama'}
        </h1>

        <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed pt-2">
          {language === 'zh'
            ? 'SoulTalk Pastry（心聊甜香）创立于马来西亚吉隆坡 Kuchai Lama。我们坚信，每一份烘焙不只是一道甜品，更是人与人之间温暖对话的起点。'
            : 'Founded in Kuchai Lama, Kuala Lumpur, SoulTalk Pastry was born from a simple belief: every pastry is more than a dessert—it is an invitation to pause, gather, and share heartfelt conversations.'}
        </p>
      </div>

      {/* 2. THE BOUTIQUE LANDMARK & CHEF'S NOTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left: Illustrated Boutique Storefront */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="soultalk-card p-6 sm:p-8 bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[var(--shadow-card)] w-full flex flex-col items-center">
            <SoulTalkStorefront size="large" showBadge={false} />
            <div className="mt-4 text-center space-y-1">
              <span className="font-script text-xl text-[var(--color-primary-dark)] font-semibold block">
                {language === 'zh' ? '古仔路实体工坊 • 每日现烤出炉' : 'Kuchai Lama Kitchen • Fresh Bakes Daily'}
              </span>
              <p className="text-xs text-[var(--color-text-muted)]">
                {language === 'zh' ? '吉隆坡 Kuchai Entrepreneurs Park 实地烘焙' : 'No. 28, Jalan Kuchai Maju 9, Kuchai Entrepreneurs Park, KL'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: The Handwritten Artisan Letter */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-soft)] text-xs font-bold text-[var(--color-primary-dark)]">
            <Heart className="w-3.5 h-3.5 text-[var(--color-secondary)] fill-current" />
            <span>{language === 'zh' ? '主厨心语' : 'From Our Head Pastry Chef'}</span>
          </div>

          <h2 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
            {language === 'zh' ? '低糖配方，天然本味' : 'Japanese-Inspired Light Sweetness, French Artisanal Craft'}
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            <p>
              {language === 'zh'
                ? '我们发现许多传统庆典蛋糕过于甜腻，掩盖了纯正乳脂与新鲜水果的风味。因此，SoulTalk Pastry 坚持采用日系低糖平衡工艺，将甜度降低 30%–40%，让每一口鲜奶油都如云朵般轻盈无负担。'
                : 'Too often, commercial celebration cakes are weighed down by heavy sugar and artificial flavors. At SoulTalk Pastry, we pioneered our signature low-sugar formula—reducing sweetness by 30% to 40% while letting the silky richness of pure dairy cream and natural fruit compotes shine.'}
            </p>
            <p>
              {language === 'zh'
                ? '从法国诺曼底天然黄油、马达加斯加纯香草荚，到金马仑高原新鲜采摘的红颜草莓，每一味食材都经过严格甄选，只为带给您与挚爱纯净安心的味蕾享受。'
                : 'Every component is thoughtfully chosen: AOP French Normandy butter, slow-infused Tahitian & Madagascar vanilla beans, ceremonial Kyoto Uji matcha, and ruby strawberries hand-picked from Cameron Highlands.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
            <div>
              <span className="font-script text-2xl text-[var(--color-secondary-dark)] font-semibold block">
                {language === 'zh' ? '以心聊话，甜香致远 ~' : 'Crafted with passion, baked for you ~'}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {language === 'zh' ? 'SoulTalk Pastry 烘焙团队敬上' : 'The SoulTalk Pastry Baking Family'}
              </span>
            </div>
            <Link to="/products" className="btn-primary text-xs !min-h-[40px]">
              <span>{t('hero.orderNow', 'Order Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. FOUR CORE INGREDIENT PILLARS */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-eyebrow text-[var(--color-secondary-dark)]">
            {language === 'zh' ? '严选食材' : 'Pure Ingredients'}
          </span>
          <h2 className="text-h2 text-[var(--color-text)]">
            {language === 'zh' ? '我们坚持的四大品质承诺' : 'Our Four Craft Standards'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: language === 'zh' ? '法国诺曼底黄油' : 'French Normandy Butter',
              desc: language === 'zh' ? '纯正天然乳脂，奶香醇厚浓郁，无反式脂肪酸。' : '100% pure AOP dairy butter delivering velvety flakiness without trans fats.',
              icon: Award,
              tag: '100% Pure Butter',
            },
            {
              title: language === 'zh' ? '日系轻盈云奶油' : 'Cloud Fresh Cream',
              desc: language === 'zh' ? '减糖 35% 配方，如空气般融化的轻盈丝滑质感。' : '35% less sweet, light as a summer cloud, leaving a clean gentle finish.',
              icon: ShieldCheck,
              tag: 'Low Sugar Formula',
            },
            {
              title: language === 'zh' ? '高原本采红草莓' : 'Highland Strawberries',
              desc: language === 'zh' ? '金马仑果园每日晨曦采收，酸甜多汁，新鲜直达。' : 'Hand-selected ruby strawberries with natural sweet-tart juiciness.',
              icon: Heart,
              tag: 'Fresh Fruit Daily',
            },
            {
              title: language === 'zh' ? '比利时 70% 纯黑巧' : 'Belgian Dark Chocolate',
              desc: language === 'zh' ? '浓郁可可甘纳许与丝滑淋面，带来层次丰富回味。' : 'Rich Belgian cocoa solids crafted into silky ganache glazes and shards.',
              icon: Sparkles,
              tag: 'Fine Cocoa',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="soultalk-card p-6 rounded-[var(--radius-large)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-primary-dark)] flex items-center justify-center">
                <item.icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-secondary-dark)] block">
                {item.tag}
              </span>
              <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CALL TO ACTION & VISIT US */}
      <div className="soultalk-card p-8 sm:p-12 rounded-[var(--radius-xlarge)] bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[var(--shadow-card)] text-center space-y-6">
        <span className="font-script text-3xl sm:text-4xl text-[var(--color-primary-dark)] font-semibold block">
          {language === 'zh' ? '期待在 Kuchai Lama 与您相见 ~' : 'We Welcome You to Visit Our Kitchen ~'}
        </span>
        <h2 className="text-h2 text-[var(--color-text)] max-w-xl mx-auto">
          {language === 'zh' ? '挑选一份甜点，开启温情对话' : 'Choose Your Pastry & Begin a Sweet Conversation'}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          {language === 'zh'
            ? '欢迎提前在线预订生日庆典蛋糕，或在 WhatsApp 与我们的甜点师讨论定制款式。'
            : 'Reserve your artisanal celebration cake online or chat with our pastry team on WhatsApp for bespoke orders.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/products" className="btn-primary">
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span>{t('hero.orderNow', 'Explore Our Menu')}</span>
          </Link>
          <a
            href={buildWhatsAppUrl('Hello SoulTalk Pastry, I would like to enquire about cake customisation and visiting your bakery.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle className="w-4 h-4 stroke-[2]" />
            <span>{t('hero.chatWhatsApp', 'Chat on WhatsApp')}</span>
          </a>
        </div>
      </div>

    </div>
  );
};

