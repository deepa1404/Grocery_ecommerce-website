import React, { useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

interface FooterProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('Subscribed to FreshCart weekly offers and recipes!', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      {/* 4 Feature Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-800/80 rounded-3xl border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">10-Min Delivery</h4>
              <p className="text-[11px] text-slate-400">Guaranteed lightning fast doorstep dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Farm Fresh</h4>
              <p className="text-[11px] text-slate-400">Directly sourced daily from organic farms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Questions Return</h4>
              <p className="text-[11px] text-slate-400">Doorstep return or instant replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Payments</h4>
              <p className="text-[11px] text-slate-400">Razorpay 256-bit SSL & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800 text-xs">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
              <span className="text-xl">🥬</span>
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">Fresh</span>
              <span className="text-xl font-black text-emerald-400 tracking-tight">Cart</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            India's favorite online grocery store providing organic farm-fresh vegetables, seasonal fruits, dairy, bakery, and daily supermarket essentials directly to your doorstep in minutes.
          </p>

          <div className="space-y-1.5 text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>1800-FRESH-CART (Toll Free 24x7)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>support@freshcart.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Indiranagar Tech Corridor, Bengaluru - 560038</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Categories</h4>
          <ul className="space-y-2 text-slate-400">
            {['Fruits', 'Vegetables', 'Dairy Products', 'Bakery Items', 'Rice & Grains', 'Cooking Essentials'].map((c) => (
              <li key={c}>
                <button
                  onClick={() => {
                    onSelectCategory(c);
                    onNavigate('products');
                  }}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition-colors">
                My Orders & Tracking
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('cart')} className="hover:text-emerald-400 transition-colors">
                Shopping Cart
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('wishlist')} className="hover:text-emerald-400 transition-colors">
                My Wishlist
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                About FreshCart
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                Help & FAQs
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Updated</h4>
          <p className="text-slate-400 text-xs">
            Subscribe for exclusive weekend discounts, fresh arrival alerts, and seasonal recipes.
          </p>
          <form onSubmit={handleNewsletter} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © 2026 FreshCart Online Grocery Shopping Platform. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Payment Partners:</span>
          {['Razorpay Test', 'UPI', 'Visa', 'MasterCard', 'RuPay', 'NetBanking', 'COD'].map((method) => (
            <span
              key={method}
              className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};
