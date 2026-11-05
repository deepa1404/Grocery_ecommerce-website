import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Clock, Flame, ShieldCheck, HeartHandshake, ChevronRight, Star } from 'lucide-react';
import { IProduct, ICategory } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomePageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (prod: IProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectProduct
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [deals, setDeals] = useState<IProduct[]>([]);
  const [trending, setTrending] = useState<IProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<IProduct[]>([]);
  const [dairyProducts, setDairyProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (prodRes.success) {
          const prods = prodRes.products;
          setDeals(prods.filter(p => p.isDeal).slice(0, 4));
          setTrending(prods.filter(p => p.isTrending).slice(0, 4));
          setPopularProducts(prods.filter(p => p.isPopular).slice(0, 8));
          setDairyProducts(prods.filter(p => p.category === 'Dairy Products').slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* 1. Hero Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-2xl p-6 sm:p-12 lg:p-16">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/60 border border-emerald-500/40 rounded-full text-xs font-bold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Superfast Grocery Delivery in 10-15 Minutes</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Farm-Fresh Groceries, <br />
                <span className="text-emerald-300">Delivered in Minutes.</span>
              </h1>

              <p className="text-slate-200 text-sm sm:text-base max-w-lg leading-relaxed">
                Hand-harvested vegetables, orchard crisp fruits, pure dairy, and pantry essentials. Direct from trusted organic farms with 100% freshness guarantee.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onSelectCategory('All');
                    onNavigate('products');
                  }}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Explore 200+ Fresh Items</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectCategory('All');
                    onNavigate('products', { dealOnly: true });
                  }}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-colors"
                >
                  View Deals (Up to 30% OFF)
                </button>
              </div>

              {/* Coupon chip */}
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-200">
                <span>Use coupon</span>
                <span className="px-2 py-0.5 bg-emerald-600/80 rounded font-mono font-bold text-white border border-emerald-400/50">
                  FRESH20
                </span>
                <span>for 20% discount on your cart!</span>
              </div>
            </div>

            {/* Hero Visual Card / Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80"
                  alt="Fresh Fruits"
                  className="w-full h-44 object-cover"
                />
                <div className="bg-slate-900/80 p-2 text-center text-xs font-bold text-emerald-300">
                  Orchard Sweet Fruits
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-300 mt-4">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"
                  alt="Organic Vegetables"
                  className="w-full h-44 object-cover"
                />
                <div className="bg-slate-900/80 p-2 text-center text-xs font-bold text-emerald-300">
                  Crisp Green Veggies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs text-slate-500">Explore all 12 supermarket aisles with farm-fresh quality</p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('All');
              onNavigate('products');
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>See All Aisles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.name);
                onNavigate('products');
              }}
              className="group bg-white rounded-2xl p-3 border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 mb-2.5 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat.itemCount > 0 ? `${cat.itemCount} Items` : 'Fresh Harvest'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Today's Deals & Discounts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Today's Hot Deals</h2>
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Up to 30% Off
                  </span>
                </div>
                <p className="text-xs text-slate-600">Special seasonal discounts, refreshed every 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-white/80 border border-amber-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Ends tonight at 11:59 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Products Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Trending in Your Area</h2>
              <p className="text-xs text-slate-500">Most reordered groceries by neighbors in your zone</p>
            </div>
          </div>
          <button
            onClick={() => {
              onSelectCategory('All');
              onNavigate('products', { trendingOnly: true });
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trending.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 5. Best-Selling Everyday Groceries */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Best-Selling Groceries</h2>
            <p className="text-xs text-slate-500">Everyday staples: dairy, bakery, vegetables, and pantry grains</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {popularProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. Farm-to-Table Trust & Sustainability Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-emerald-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 text-emerald-300 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Direct Farmer Sourcing</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                We eliminate middlemen, paying honest fair prices to local agricultural cooperatives while giving you orchard-picked quality at low prices.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 text-emerald-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Triple Quality Check</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Every apple, tomato, and dairy batch is screened at arrival for temperature, freshness, ripeness, and zero artificial chemical residue.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 text-emerald-300 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Insulated Fast Delivery</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Our delivery fleet uses chilled bags so your milk stays cold, your ice cream stays frozen, and your herbs arrive crisp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Real Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Loved by Over 50,000+ Families</h2>
          <p className="text-xs text-slate-500 mt-1">Here is what our everyday shoppers say about FreshCart service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "FreshCart has completely replaced my weekly vegetable market trip. The Shimla apples and spinach were fresher than what I pick at the store, delivered in just 12 minutes!"
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                SM
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sneha Mukherjee</p>
                <p className="text-[10px] text-slate-400">Indiranagar, Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The Razorpay payment worked smoothly and their invoice download is super clean for my home accounts. Reordering breakfast bread and eggs takes 5 seconds."
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                VK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Vikram Kapoor</p>
                <p className="text-[10px] text-slate-400">Bandra West, Mumbai</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Their unpolished pulses and cold pressed oils are genuine quality. Plus coupon FRESH20 gave me ₹150 off my first cart. Highly recommend to all working parents."
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                AP
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Ananya Pandey</p>
                <p className="text-[10px] text-slate-400">Whitefield, Bengaluru</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
