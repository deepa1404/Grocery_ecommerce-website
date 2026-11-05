import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, Heart, ShieldCheck, Truck, RotateCcw, MessageSquare, Send } from 'lucide-react';
import { IProduct, IReview } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ProductDetailModalProps {
  product: IProduct | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, updateQuantity, getItemQuantity, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      api.getProductById(product.id).then(res => {
        if (res.success && res.reviews) {
          setReviews(res.reviews as IReview[]);
        }
      }).catch(() => {});
    }
  }, [product]);

  if (!product) return null;

  const quantity = getItemQuantity(product.id);
  const isWishlisted = isInWishlist(product.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Please enter your review feedback', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.addReview(product.id, newRating, newComment, reviewerName || user?.name || 'Verified Customer');
      if (res.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews(prev => [
          {
            id: `rev-${Date.now()}`,
            productId: product.id,
            userId: user?.id || 'guest',
            userName: reviewerName || user?.name || 'Verified Customer',
            rating: newRating,
            comment: newComment,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        setNewComment('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-white/90 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Image & Badges */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.discountPercentage > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                    {product.discountPercentage}% OFF
                  </span>
                )}
                {product.isOrganic && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-lg">
                    100% Certified Organic
                  </span>
                )}
              </div>
            </div>

            {/* FreshCart Promises */}
            <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-xl px-3 border border-slate-100 text-center text-[11px]">
              <div className="flex flex-col items-center gap-1 text-slate-600">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">10-15 Min Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Quality Checked</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-slate-600">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">No Questions Return</span>
              </div>
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <span className="text-xs font-bold text-slate-500">Brand: {product.brand}</span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{product.name}</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">Pack Size / Unit: {product.unit}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {product.reviewsCount} Customer Reviews
                </span>
                <span className="text-slate-300">•</span>
                <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Currently Out of Stock'}
                </span>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3 my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-3xl font-black text-slate-900 font-mono">₹{product.discountPrice}</span>
                {product.originalPrice > product.discountPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through font-mono">₹{product.originalPrice}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Save ₹{product.originalPrice - product.discountPrice}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              {product.stock === 0 ? (
                <button disabled className="flex-1 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm">
                  Out of Stock
                </button>
              ) : quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => addToCart(product, 1)}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-emerald-700 text-white rounded-xl px-4 py-3 shadow-md">
                  <span className="text-xs font-bold">In Your Cart:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 rounded-lg text-white font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black min-w-6 text-center font-mono">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-emerald-800 hover:bg-emerald-900 rounded-lg text-white font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-500">Real feedback from verified FreshCart buyers</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span className="text-sm font-black text-slate-800">{product.rating} / 5</span>
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Leave a Review
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rating</label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} Stars</span>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <textarea
                rows={2}
                placeholder="How was the freshness, taste, and packaging?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No reviews yet for this product. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
