import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';

interface WishlistPageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectProduct?: (prod: any) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist, addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Your Wishlist Awaits</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Sign in to save your favorite grocery items and track price drops.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Sign In to View
          </button>
        </div>
      </div>
    );
  }

  const handleMoveAllToCart = async () => {
    for (const prod of wishlist) {
      await addToCart(prod, 1);
    }
    showToast(`Added all ${wishlist.length} wishlist items to your cart!`, 'success');
    onNavigate('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-slate-500">Items you've saved to buy later or reorder frequently</p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Move All to Cart</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            ❤️
          </div>
          <h3 className="text-base font-bold text-slate-900">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Click the heart icon on any grocery item to save it here for fast reordering.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Discover Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {wishlist.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
