import React, { useEffect } from 'react';
import { CheckCircle2, Download, Package, ArrowRight, Clock, MapPin, Truck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { IOrder } from '../types/index.ts';
import { downloadOrderInvoice } from '../utils/invoiceGenerator.ts';

interface OrderSuccessPageProps {
  order: IOrder;
  onNavigate: (view: string, param?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl text-center space-y-6">
        {/* Animated Celebration Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        </div>

        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed & Placed!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Your grocery basket has been forwarded to our dark store picking line.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-4 max-w-xl mx-auto text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/70 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
              <p className="text-sm font-black font-mono text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Amount</span>
              <p className="text-base font-black font-mono text-emerald-700">₹{order.total}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 block">Delivery Slot</span>
                <span className="text-slate-500">{order.deliverySlot}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 block">Payment Mode</span>
                <span className="text-slate-500">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-slate-200/70">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-700 block">Delivery Address</span>
              <span className="text-slate-500">
                {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => downloadOrderInvoice(order)}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download PDF Tax Invoice</span>
          </button>

          <button
            onClick={() => onNavigate('track-order', { orderId: order.id })}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Track Delivery Live</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
