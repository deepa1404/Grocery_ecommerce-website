import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, Check, Sparkles, Flame, Leaf, Grid, List } from 'lucide-react';
import { IProduct, ICategory } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductsPageProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSelectProduct: (prod: IProduct) => void;
  dealOnly?: boolean;
  trendingOnly?: boolean;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectProduct,
  dealOnly = false,
  trendingOnly = false
}) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [sortBy, setSortBy] = useState<string>('popular');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(dealOnly);
  const [onlyTrending, setOnlyTrending] = useState<boolean>(trendingOnly);
  const [onlyOrganic, setOnlyOrganic] = useState<boolean>(false);
  const [searchTermInput, setSearchTermInput] = useState<string>(searchQuery);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setSearchTermInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setOnlyDeals(dealOnly);
  }, [dealOnly]);

  useEffect(() => {
    setOnlyTrending(trendingOnly);
  }, [trendingOnly]);

  // Load categories list
  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  // Fetch filtered products
  useEffect(() => {
    setLoading(true);
    api.getProducts({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: searchTermInput,
      sort: sortBy,
      minPrice,
      maxPrice: maxPrice < 1000 ? maxPrice : undefined,
      inStock: onlyInStock,
      deal: onlyDeals,
      trending: onlyTrending,
      organic: onlyOrganic
    }).then(res => {
      if (res.success) {
        setProducts(res.products);
      }
    }).catch(err => {
      console.error('Failed to load products', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [selectedCategory, searchTermInput, sortBy, minPrice, maxPrice, onlyInStock, onlyDeals, onlyTrending, onlyOrganic]);

  const clearAllFilters = () => {
    onSelectCategory('All');
    setSearchTermInput('');
    setSortBy('popular');
    setMinPrice(0);
    setMaxPrice(1000);
    setOnlyInStock(false);
    setOnlyDeals(false);
    setOnlyTrending(false);
    setOnlyOrganic(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchTermInput !== '' ||
    onlyInStock ||
    onlyDeals ||
    onlyTrending ||
    onlyOrganic ||
    maxPrice < 1000 ||
    minPrice > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs & Active Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-emerald-700">
              {selectedCategory === 'All' ? 'All Groceries' : selectedCategory}
            </span>
            {searchTermInput && (
              <>
                <span>/</span>
                <span className="text-slate-700">"{searchTermInput}"</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {searchTermInput
              ? `Results for "${searchTermInput}"`
              : selectedCategory === 'All'
              ? 'All Grocery Catalog'
              : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{products.length}</strong> fresh products ready for fast dispatch
          </p>
        </div>

        {/* Top Controls: Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* Grid / List Mode */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div
          className={`lg:block ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden lg:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 lg:hidden">
              <h3 className="font-bold text-base text-slate-900">Filter Groceries</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-6">
            {/* Header / Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories filter */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Category</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === 'All' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCategory(c.name)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      selectedCategory.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.itemCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Badges Filter */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Special Offers</h4>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Today's Deals Only
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyTrending}
                  onChange={(e) => setOnlyTrending(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Trending Groceries
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOrganic}
                  onChange={(e) => setOnlyOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Certified Organic
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium">In-Stock Only</span>
              </label>
            </div>

            {/* Price Filter Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price Range</h4>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  ₹{minPrice} - ₹{maxPrice === 1000 ? '1000+' : maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>₹0</span>
                <span>₹500</span>
                <span>₹1000+</span>
              </div>
            </div>

            {isMobileFilterOpen && (
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl mt-4"
              >
                Apply Filters ({products.length} Items)
              </button>
            )}
          </div>
        </div>

        {/* Product Catalog Display Area */}
        <div className="lg:col-span-3">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                  <div className="w-full h-40 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State Illustration */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold text-3xl">
                🥦
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                We couldn't find any grocery items matching your current filters. Try relaxing your search or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 gap-4'
                  : 'flex flex-col gap-3'
              }
            >
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
