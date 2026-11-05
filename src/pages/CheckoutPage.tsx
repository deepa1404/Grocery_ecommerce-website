import React, { useState } from 'react';
import { MapPin, Clock, CreditCard, Banknote, ShieldCheck, ArrowRight, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { IUserAddress } from '../types/index.ts';
import { RazorpayModal } from '../components/RazorpayModal.tsx';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: any) => void;
  onOrderSuccess: (order: any) => void;
}

const DELIVERY_SLOTS = [
  { id: 'slot-1', title: 'Express 10-15 Mins Superfast', desc: 'Dispatched immediately from nearest dark store', badge: 'Fastest' },
  { id: 'slot-2', title: 'Today Evening (05:00 PM - 07:00 PM)', desc: 'Ideal for evening cooking & dinner prep' },
  { id: 'slot-3', title: 'Tomorrow Morning (07:00 AM - 09:00 AM)', desc: 'Fresh morning milk, bread & breakfast items' },
  { id: 'slot-4', title: 'Tomorrow Afternoon (01:00 PM - 03:00 PM)', desc: 'Standard daytime delivery slot' },
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { items, subtotal, discount, coupon, deliveryFee, tax, total, clearCart } = useCart();
  const { showToast } = useToast();

  // Selected address state
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [selectedAddress, setSelectedAddress] = useState<IUserAddress | null>(defaultAddr || null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(!defaultAddr);

  // New address form fields
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Delivery slot & payment method
  const [selectedSlot, setSelectedSlot] = useState(DELIVERY_SLOTS[0].title);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');

  // Razorpay popup state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (items.length === 0) {
    onNavigate('cart');
    return null;
  }

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !street || !pincode) {
      showToast('Please fill all required address details', 'error');
      return;
    }

    const newAddr: IUserAddress = {
      id: `addr-${Date.now()}`,
      name,
      mobile,
      street,
      city,
      state,
      pincode,
      type: addressType,
      isDefault: true
    };

    setSelectedAddress(newAddr);
    setIsAddingNewAddress(false);

    // Save to user if authenticated
    if (isAuthenticated) {
      api.addAddress(newAddr).catch(() => {});
    }
    showToast('Delivery address selected', 'success');
  };

  const handlePlaceOrderClick = () => {
    if (!selectedAddress) {
      showToast('Please select or add a delivery address', 'error');
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login');
      showToast('Please sign in or register to complete your order', 'info');
      return;
    }

    if (paymentMethod === 'Razorpay') {
      setIsRazorpayModalOpen(true);
    } else {
      // Cash on Delivery
      processOrderPlacement({
        method: 'Cash on Delivery'
      });
    }
  };

  const processOrderPlacement = async (paymentInfo: {
    method: 'Cash on Delivery' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallets';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }) => {
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        shippingAddress: selectedAddress!,
        items: items.map(i => ({
          productId: i.productId,
          name: i.product?.name || 'Item',
          image: i.product?.image || '',
          unit: i.product?.unit || '1 pc',
          price: i.product?.discountPrice || i.price,
          quantity: i.quantity,
          total: (i.product?.discountPrice || i.price) * i.quantity
        })),
        subtotal,
        discount,
        couponCode: coupon?.code,
        deliveryFee,
        tax,
        total,
        paymentMethod: paymentInfo.method,
        deliverySlot: selectedSlot,
        deliveryDate: new Date().toISOString().slice(0, 10),
        razorpayOrderId: paymentInfo.razorpayOrderId,
        razorpayPaymentId: paymentInfo.razorpayPaymentId
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        await clearCart();
        showToast('Order confirmed! Tracking details generated.', 'success');
        onOrderSuccess(res.order);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500">Fast 2-step checkout with instant order confirmation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Slot Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
                  <p className="text-[11px] text-slate-400">Where should we deliver your fresh groceries?</p>
                </div>
              </div>
              {user?.addresses && user.addresses.length > 0 && !isAddingNewAddress && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Existing Addresses List */}
            {user?.addresses && user.addresses.length > 0 && !isAddingNewAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {addr.type}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800">{addr.name}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{addr.street}</p>
                      <p className="text-xs text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">📱 {addr.mobile}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* New Address Form */
              <form onSubmit={handleAddNewAddressSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Flat / House No / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Sunshine Heights, 12th Main, Indiranagar"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Address Tag</label>
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setAddressType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          addressType === type
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Save & Deliver Here
                  </button>
                  {user?.addresses && user.addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Delivery Slot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Choose Delivery Slot</h3>
                <p className="text-[11px] text-slate-400">Select when you want your groceries delivered</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.title;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.title)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{slot.title}</span>
                          {slot.badge && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              {slot.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{slot.desc}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Payment Method</h3>
                <p className="text-[11px] text-slate-400">Pay securely via Razorpay (UPI/Card/NetBanking) or Cash on Delivery</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'Razorpay'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    Razorpay Test Mode
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Pay Online (Razorpay)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">UPI, Cards, Net Banking & Wallets with instant verification</p>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Pay at Doorstep</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">Cash on Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pay cash or scan QR when delivery executive arrives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Checkout CTA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Order Items ({items.length})
            </h3>

            {/* Compact items list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      {item.quantity}x
                    </span>
                    <span className="truncate text-slate-800 font-medium">
                      {item.product?.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold shrink-0">
                    ₹{(item.product?.discountPrice || item.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill summary */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({coupon?.code})</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-mono font-medium">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span className="font-mono font-medium">₹{tax}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900 uppercase">Grand Total</span>
                <span className="text-2xl font-black text-slate-900 font-mono">₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="button"
              onClick={handlePlaceOrderClick}
              disabled={isPlacingOrder}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <span>
                {isPlacingOrder
                  ? 'Placing Order...'
                  : paymentMethod === 'Razorpay'
                  ? `Pay ₹${total} via Razorpay`
                  : `Confirm Order (Pay ₹${total} on Delivery)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Buyer Protection & Freshness Assurance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={total}
        orderData={{ items, total, address: selectedAddress }}
        onSuccess={(payDetails) => {
          processOrderPlacement({
            method: payDetails.method as any,
            razorpayOrderId: payDetails.razorpayOrderId,
            razorpayPaymentId: payDetails.razorpayPaymentId
          });
        }}
      />
    </div>
  );
};
