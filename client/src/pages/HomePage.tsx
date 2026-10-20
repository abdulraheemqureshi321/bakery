import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../api/client';
import { Product, Category } from '../types';
import {
  MessageCircle,
  Gift,
  Sparkles,
  ChevronRight,
  Award,
  Cake,
  ArrowRight,
  Package,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, member } = useAuth();
  const { getSetting, buildWhatsAppUrl, buildPartyBagsWhatsAppUrl } = useSettings();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const storeName = getSetting<string>('store_name', 'SoulTalk Pastry');
  const currencySymbol = getSetting<string>('currency_symbol', 'RM');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/public/products/featured'),
          api.get('/public/categories'),
        ]);

        if (prodRes.data?.success) {
          setFeaturedProducts(prodRes.data.data.products);
        }
        if (catRes.data?.success) {
          setCategories(catRes.data.data.categories);
        }
      } catch (err) {
        console.warn('Failed to load home page catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-rose-50/70 via-stone-50 to-stone-50 pt-10 sm:pt-16 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/90 text-rose-800 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Artisanal Bakery & Membership Rewards</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-tight">
            Handcrafted with Passion, Baked for Celebration.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to {storeName}. Indulge in bespoke artisanal cakes, delicate pastries, and everyday sweet moments crafted with premium French butter and Belgian chocolate.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-md shadow-rose-200 transition-all hover:scale-[1.02]"
            >
              <Cake className="w-4 h-4" />
              <span>Browse All Cakes & Pastries</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <a
              href={buildWhatsAppUrl('Hello SoulTalk Pastry! I would like to make an enquiry about ordering cakes.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-200 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Direct WhatsApp Order</span>
            </a>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-sm shadow-xs"
              >
                <Award className="w-4 h-4 text-rose-500" />
                <span>My Rewards ({member?.pointsBalance ?? 0} pts)</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-sm shadow-xs"
              >
                <span>Join Member Club</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories Fast-Browse */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-rose-500">
                Explore Categories
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                Freshly Baked Daily
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="glass-card p-4 rounded-2xl text-center hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <Cake className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Cakes & Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-rose-500">
              Chef's Selection
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
              Popular & Signature Creations
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
          >
            <span>Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
              return (
                <div
                  key={product._id}
                  className="glass-card rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col"
                >
                  <Link to={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src={mainImage}
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
                        Featured
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] font-medium text-rose-500 uppercase tracking-wider">
                        {typeof product.category === 'object' ? product.category?.name : ''}
                      </div>
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-serif-display text-lg font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1 block mt-0.5"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Price</span>
                        <span className="font-serif-display text-lg font-bold text-stone-900">
                          {currencySymbol} {product.price.toFixed(2)}
                        </span>
                      </div>
                      <Link
                        to={`/products/${product.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                      >
                        <span>View Cake</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Dedicated Party Bags & Celebration Favors Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/60 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 text-xs font-semibold">
              <Package className="w-3.5 h-3.5" />
              <span>Event & Celebration Packages</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Party Bags & Custom Celebration Favors
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              Planning a birthday bash, full-month celebration, or corporate gathering? Our bespoke Party Bags feature handcrafted mini macarons, brownie bites, and personalized ribbon tags.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={buildPartyBagsWhatsAppUrl({
                  guestCount: 20,
                  theme: 'Birthday Celebration',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-200 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire Party Bags via WhatsApp</span>
              </a>
              <Link
                to="/products?category=party-bags"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-sm font-medium hover:bg-stone-50"
              >
                <span>View Party Bag Options</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Member Privileges Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-500">
              Loyalty & Referral Rewards
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900">
              Earn Points With Every Celebration
            </h3>
            <p className="text-sm text-stone-600 max-w-xl">
              Register for free today. Collect points automatically, redeem discounts at checkout, and invite friends to earn mutual bonus points.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-xs transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Open Member Center</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-xs transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Register as a Member</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
