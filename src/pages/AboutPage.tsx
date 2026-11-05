import React from 'react';
import { Award, Leaf, Truck, ShieldCheck, HeartHandshake, Users, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Our Journey & Freshness Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Bringing the Farm Directly to Your Kitchen Table.
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Founded with a clear mission: to provide families with the cleanest, pesticide-checked, and most flavorful vegetables, fruits, and daily staples delivered in under 15 minutes.
        </p>
      </div>

      {/* Visual Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-emerald-950 text-white rounded-3xl shadow-xl">
        <div className="text-center">
          <p className="text-3xl font-black font-mono text-emerald-400">10-15</p>
          <p className="text-xs text-slate-300 mt-1">Mins Fast Delivery</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black font-mono text-emerald-400">500+</p>
          <p className="text-xs text-slate-300 mt-1">Partner Farming Co-ops</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black font-mono text-emerald-400">100%</p>
          <p className="text-xs text-slate-300 mt-1">Chemical-Free Checked</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black font-mono text-emerald-400">50K+</p>
          <p className="text-xs text-slate-300 mt-1">Happy Regular Shoppers</p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Direct From Soil</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By harvesting at dawn and transporting in temperature-monitored vans, your produce retains maximum vitamins, natural crunch, and aroma.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Electric Micro-Darkstores</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our neighborhood darkstores operate within a 2.5 km radius of your home, powered 100% by zero-emission electric delivery scooters.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Fair Farmer Remuneration</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We bypass middlemen so that our hard-working cultivators receive up to 40% higher returns per quintal than traditional wholesale mandis.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl p-8 text-center text-white space-y-4">
        <h2 className="text-2xl font-black">Experience the FreshCart Difference Today</h2>
        <p className="text-xs text-emerald-100 max-w-md mx-auto">
          Taste what real vegetables, natural cold-pressed oils, and non-waxed orchard apples taste like.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          Explore Grocery Catalog
        </button>
      </div>
    </div>
  );
};
