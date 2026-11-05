import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, CheckCircle, Shield, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // in INR
  orderData: any;
  onSuccess: (paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; method: string }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  amount,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Rahul Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Razorpay Test Order on server
      const orderRes = await api.createRazorpayOrder(amount);
      if (!orderRes.success) {
        throw new Error('Failed to initialize payment gateway');
      }

      // Simulate payment network roundtrip delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const mockPaymentId = `pay_test_${Date.now()}`;
      const mockSignature = `sig_${Date.now()}_test_verified`;

      let paymentMethodName = 'UPI';
      if (activeTab === 'card') paymentMethodName = 'Credit/Debit Card';
      if (activeTab === 'netbanking') paymentMethodName = `Net Banking (${selectedBank})`;
      if (activeTab === 'wallet') paymentMethodName = `Wallet (${selectedWallet})`;

      // 2. Server-side payment signature verification
      const verifyRes = await api.verifyRazorpayPayment({
        razorpay_order_id: orderRes.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        amount: amount,
        method: paymentMethodName
      });

      if (!verifyRes.success) {
        throw new Error('Payment signature verification failed');
      }

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }

      showToast('Payment successful! Verifying order...', 'success');

      onSuccess({
        razorpayOrderId: orderRes.orderId,
        razorpayPaymentId: mockPaymentId,
        method: paymentMethodName
      });
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Payment processing failed. Please retry.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base">Razorpay</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">FreshCart Online Grocery Shopping</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Payable Amount</span>
              <span className="text-lg font-black text-emerald-400 font-mono">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Mode Notification Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This is simulated Razorpay Test Mode. No real money will be charged.</span>
        </div>

        {/* Payment Methods Layout */}
        <div className="flex divide-x divide-slate-100 min-h-[340px]">
          {/* Method Selector Tabs */}
          <div className="w-40 bg-slate-50 p-2 space-y-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === 'upi' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === 'card' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === 'netbanking' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Net Banking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === 'wallet' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Wallets</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            {activeTab === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pay using UPI ID / App</h4>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Zero Fee</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiId(`testuser@${app.toLowerCase().replace(/\s/g, '')}`)}
                      className="p-2 border border-slate-200 rounded-xl text-center hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors"
                    >
                      <p className="text-xs font-bold text-slate-800">{app}</p>
                      <span className="text-[10px] text-slate-400">Fast Pay</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Pre-filled with test VPA. Any ID works in test mode.</p>
                </div>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Card Information</h4>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'netbanking' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Bank</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-2.5 text-xs text-left rounded-xl border transition-colors ${
                        selectedBank === b ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose Wallet</h4>
                <div className="space-y-2">
                  {['Paytm Wallet', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`w-full p-2.5 text-xs text-left rounded-xl border flex items-center justify-between transition-colors ${
                        selectedWallet === w ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{w}</span>
                      {selectedWallet === w && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Pay CTA */}
            <div className="pt-4 mt-auto border-t border-slate-100">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Pay ₹{amount.toLocaleString('en-IN')} Securely</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>256-bit SSL encrypted • Razorpay Test Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
