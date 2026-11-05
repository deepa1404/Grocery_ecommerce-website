import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  Download,
  ArrowLeft,
  Phone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { IOrder } from '../types/index.ts';
import { api } from '../services/api.ts';
import { downloadOrderInvoice } from '../utils/invoiceGenerator.ts';

interface OrderTrackingPageProps {
  orderId: string;
  onNavigate: (view: string, param?: any) => void;
}

const STEPS = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered'
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api.getOrderById(orderId)
      .then(res => {
        if (res.success) setOrder(res.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time tracking telemetry...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Please check the order ID or return to your orders list.</p>
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('orders')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <button
          onClick={() => downloadOrderInvoice(order)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Download Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-8">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Delivery Tracking
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">{order.orderNumber}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isCancelled ? 'Order Cancelled' : `Status: ${order.orderStatus}`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Slot: <strong className="text-slate-700">{order.deliverySlot}</strong>
            </p>
          </div>

          {/* Delivery Partner simulated card */}
          {!isCancelled && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ⚡
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Assigned Darkstore Driver</p>
                <p className="text-xs font-bold text-slate-900">Suresh Kumar (Express Fleet)</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>Call Partner: +91 98450 XXXXX</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6-Step Visual Progress Stepper */}
        {!isCancelled ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {STEPS.map((step, index) => {
                const isPassed = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;

                return (
                  <div key={step} className="flex flex-col items-center text-center relative">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all mb-2 ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-emerald-700 font-extrabold'
                          : isPassed
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(10, ((currentStepIndex + 1) / STEPS.length) * 100))}%`
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">This order was cancelled</p>
              <p className="text-[11px] text-rose-600">
                Any pre-paid amounts have been scheduled for an automated refund back to your source account.
              </p>
            </div>
          </div>
        )}

        {/* History Log Timeline */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Dispatch Milestones
          </h3>
          <div className="space-y-3">
            {order.statusHistory?.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{h.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{h.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Items Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shipping Destination</h4>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <p className="font-bold text-slate-800">{order.customerName}</p>
              <p className="text-slate-600">{order.shippingAddress?.street}</p>
              <p className="text-slate-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-slate-500 font-mono">📱 {order.customerMobile}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Package Contents ({order.items.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                  <span className="text-slate-700 font-medium truncate pr-2">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">₹{it.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
