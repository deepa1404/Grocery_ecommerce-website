import React from 'react';
import { Star, Plus, Minus, Heart, Sparkles, Leaf } from 'lucide-react';
import { IProduct } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: IProduct;
  onSelectProduct?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, updateQuantity, getItemQuantity, toggleWishlist, isInWishlist } = useCart();
  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.discountPercentage > 0 && (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs tracking-tight">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.isOrganic && (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Leaf className="w-2.5 h-2.5 text-emerald-600" />
            Organic
          </span>
        )}
        {product.isDeal && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            Deal
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
          isWishlisted
            ? 'bg-rose-50 text-rose-600'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
        }`}
        title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <div
        onClick={() => onSelectProduct && onSelectProduct(product)}
        className="w-full h-44 sm:h-48 overflow-hidden bg-slate-50 cursor-pointer relative"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute bottom-1.5 left-2 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
            {product.brand}
          </span>
          <h3
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{product.unit}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              <span>{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900 font-mono">
                ₹{product.discountPrice}
              </span>
              {product.originalPrice > product.discountPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add / Stepper CTA */}
          {product.stock === 0 ? (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
              Unavailable
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-700 text-white rounded-xl px-2 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-800 rounded transition-colors text-white font-bold"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-black min-w-4 text-center font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-800 rounded transition-colors text-white font-bold"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
