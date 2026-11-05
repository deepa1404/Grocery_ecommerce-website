import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface CartPageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectProduct?: (prod: any) => void;
}

const AVAILABLE_COUPONS = [
  { code: 'FRESH20', desc: '20% OFF up to ₹150 (Min ₹499)' },
  { code: 'FIRST50', desc: 'Flat ₹50 OFF (Min ₹299)' },
  { code: 'SUPER100', desc: 'Flat ₹100 OFF (Min ₹999)' },
];

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onSelectProduct }) => {
  const {
    items,
    itemCount,
    subtotal,
    coupon,
    discount,
    deliveryFee,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { showToast } = useToast();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (code: string) => {
    if (!code) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    setIsApplyingCoupon(true);
    await applyCoupon(code);
    setIsApplyingCoupon(false);
    setCouponCodeInput('');
  };

  const amountNeededForFreeDelivery = Math.max(0, 499 - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/90 shadow-sm max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 font-bold text-4xl shadow-xs">
            🛒
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 mb-6">
            Looks like you haven't added anything to your cart yet. Explore fresh fruits, vegetables, and daily staples!
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Fresh Groceries</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500">Review your grocery items before heading to checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free delivery progress bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>
              {amountNeededForFreeDelivery === 0
                ? '🎉 Hurray! You have unlocked FREE Delivery!'
                : `Add ₹${amountNeededForFreeDelivery} more to get FREE Delivery!`}
            </span>
          </div>
          <span className="font-mono text-emerald-700">{freeDeliveryPercent}%</span>
        </div>
        <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${freeDeliveryPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs divide-y divide-slate-100">
          {items.map((item) => {
            const prod = item.product;
            if (!prod) return null;
            const itemTotal = prod.discountPrice * item.quantity;

            return (
              <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                {/* Thumbnail */}
                <div
                  onClick={() => onSelectProduct && onSelectProduct(prod)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 cursor-pointer"
                >
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    {prod.brand}
                  </span>
                  <h3
                    onClick={() => onSelectProduct && onSelectProduct(prod)}
                    className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{prod.unit}</p>

                  <div className="flex items-center gap-2 mt-1 sm:hidden">
                    <span className="text-xs font-black font-mono">₹{prod.discountPrice}</span>
                    {prod.originalPrice > prod.discountPrice && (
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        ₹{prod.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unit Price (Desktop) */}
                <div className="hidden sm:block text-right pr-4">
                  <span className="text-xs text-slate-400 block text-[10px] uppercase font-bold">Price</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">₹{prod.discountPrice}</span>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(prod.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 rounded-lg text-slate-700 font-bold shadow-2xs transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black font-mono min-w-5 text-center text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(prod.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 rounded-lg text-slate-700 font-bold shadow-2xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[70px]">
                  <span className="text-sm sm:text-base font-black text-slate-900 font-mono block">
                    ₹{itemTotal}
                  </span>
                  <button
                    onClick={() => removeFromCart(prod.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors mt-0.5 inline-flex items-center gap-0.5"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Section */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              Apply Coupon Code
            </h3>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-900 font-mono">{coupon.code}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">{coupon.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. FRESH20)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCodeInput)}
                    disabled={isApplyingCoupon}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                {/* Clickable available coupons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Offers:
                  </span>
                  {AVAILABLE_COUPONS.map((c) => (
                    <div
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="p-2 rounded-xl border border-dashed border-emerald-300 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="text-[11px] font-bold font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{c.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 hover:underline">Apply</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Bill Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Savings ({coupon?.code})</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-mono font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Govt Taxes & FSSAI (5% GST)</span>
                <span className="font-mono font-medium">₹{tax}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">To Pay</span>
                <span className="text-2xl font-black text-slate-900 font-mono">₹{total}</span>
              </div>
              {discount > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  You saved ₹{discount}
                </span>
              )}
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full mt-3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Checkout • 100% Genuine Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
