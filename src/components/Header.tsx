import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  ChevronDown,
  Shield,
  LogOut,
  Package,
  Settings,
  Sparkles,
  Menu,
  X,
  Flame,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useLocation } from '../context/LocationContext.tsx';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onSearch: (searchTerm: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

const CATEGORY_LINKS = [
  'Fruits',
  'Vegetables',
  'Dairy Products',
  'Bakery Items',
  'Snacks',
  'Beverages',
  'Household Items',
  'Personal Care',
  'Rice & Grains',
  'Pulses & Lentils',
  'Cooking Essentials',
  'Frozen Foods'
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onSearch,
  onSelectCategory
}) => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout, quickLogin } = useAuth();
  const { itemCount, total, wishlist } = useCart();
  const { location, setIsLocationModalOpen } = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
              ⚡ 10-Min Delivery
            </span>
            <span className="hidden sm:inline">
              Superfast grocery delivery in <strong>{location.area}, {location.city}</strong>!
            </span>
            <span className="sm:hidden">
              Delivery in <strong>{location.deliveryTimeEstimate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:flex items-center gap-1 text-emerald-100">
              <Tag className="w-3 h-3 text-emerald-300" />
              Use coupon <strong className="text-white font-mono bg-emerald-900/50 px-1 rounded">FRESH20</strong> for 20% OFF
            </span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:underline text-emerald-200 hover:text-white transition-colors"
            >
              24x7 Help
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Location */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <span className="text-xl">🥬</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tight text-slate-900">Fresh</span>
                  <span className="text-xl font-black tracking-tight text-emerald-600">Cart</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block -mt-1">
                  Online Groceries
                </span>
              </div>
            </button>

            {/* Delivery Location Selector */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-900">Delivery in {location.deliveryTimeEstimate}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {location.area}, {location.pincode}
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder='Search "Basmati Rice", "Amul Butter", "Farm Apples", "Organic Milk"...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Admin/Customer Portal Toggle Button */}
            {isAdmin ? (
              <button
                onClick={() => onNavigate(currentView === 'admin' ? 'home' : 'admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white ring-2 ring-emerald-500'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {currentView === 'admin' ? 'Customer Store' : 'Admin Panel'}
                </span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  await quickLogin('admin');
                  onNavigate('admin');
                }}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                title="Switch to Admin Dashboard for evaluation"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Demo</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-xl relative transition-colors"
              title="My Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] font-semibold text-emerald-100">My Cart</span>
                <span className="text-xs font-black font-mono">₹{total}</span>
              </div>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:border-emerald-500 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[90px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          {user?.role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
                      >
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>My Orders & Tracking</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('addresses');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
                      >
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>Saved Addresses</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-emerald-700 hover:bg-emerald-50 font-bold text-left"
                        >
                          <Settings className="w-4 h-4 text-emerald-600" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Go
            </button>
          </div>
        </form>
      </div>

      {/* 3. Sub-Category Navigation Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs overflow-x-auto py-2 scrollbar-none gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onSelectCategory('All');
                onNavigate('products');
              }}
              className="px-3 py-1 rounded-lg font-bold text-slate-900 hover:bg-white hover:shadow-2xs transition-colors shrink-0"
            >
              All Items
            </button>

            {CATEGORY_LINKS.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onNavigate('products');
                }}
                className="px-3 py-1 rounded-lg font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-colors shrink-0"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onSelectCategory('All');
                onNavigate('products', { dealOnly: true });
              }}
              className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Today's Deals</span>
            </button>
            <button
              onClick={() => {
                onSelectCategory('All');
                onNavigate('products', { trendingOnly: true });
              }}
              className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shop Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_LINKS.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onNavigate('products');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-800"
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('orders');
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-slate-700 text-left py-1"
            >
              Track My Orders
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-slate-700 text-left py-1"
            >
              About FreshCart
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                setIsMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-slate-700 text-left py-1"
            >
              Customer Care
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
