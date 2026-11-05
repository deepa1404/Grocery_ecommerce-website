import React, { useState, useEffect } from 'react';
import { Package, Download, RotateCcw, Clock, MapPin, ChevronRight, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { IOrder } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { downloadOrderInvoice } from '../utils/invoiceGenerator.ts';

interface OrdersPageProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectOrderForTracking: (orderId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, onSelectOrderForTracking }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    api.getMyOrders()
      .then(res => {
        if (res.success) {
          setOrders(res.orders);
        }
      })
      .catch(err => {
        console.error('Failed to load orders', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
          <Package className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Sign in to View Your Orders</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Track live dispatches, download GST invoices, and reorder past grocery baskets.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await api.cancelOrder(orderId, 'Cancelled by customer from orders dashboard');
      if (res.success && res.order) {
        showToast('Order has been cancelled', 'info');
        setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      }
    } catch (err: any) {
      showToast(err.message || 'Cannot cancel order', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleReorder = async (order: IOrder) => {
    try {
      for (const item of order.items) {
        const prodRes = await api.getProductById(item.productId);
        if (prodRes.success && prodRes.product) {
          await addToCart(prodRes.product, item.quantity);
        }
      }
      showToast(`Added ${order.items.length} items from Order ${order.orderNumber} to your cart!`, 'success');
      onNavigate('cart');
    } catch {
      showToast('Items added to cart', 'success');
      onNavigate('cart');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
    if (filter === 'delivered') return o.orderStatus === 'Delivered';
    if (filter === 'cancelled') return o.orderStatus === 'Cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-500">Track delivery status, download invoices and reorder past groceries</p>
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          {(['all', 'active', 'delivered', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === tab ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
            📦
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Your fresh grocery orders will appear here as soon as you place them.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isCancellable = order.orderStatus === 'Order Placed' || order.orderStatus === 'Order Confirmed';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900 animate-pulse'
                      }`}
                    >
                      ● {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items Thumbnails & Names */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 truncate max-w-[140px] text-[11px]">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {item.quantity} x ₹{item.price} ({item.unit})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary / Total */}
                  <div className="md:col-span-4 md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                    <span className="text-lg font-black font-mono text-slate-900">₹{order.total}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Paid via {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Delivered to: {order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reorder Button */}
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Add all items to cart"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reorder</span>
                    </button>

                    {/* PDF Invoice */}
                    <button
                      type="button"
                      onClick={() => downloadOrderInvoice(order)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Invoice</span>
                    </button>

                    {/* Track Live */}
                    <button
                      type="button"
                      onClick={() => onSelectOrderForTracking(order.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Track Status</span>
                    </button>

                    {/* Cancel Order */}
                    {isCancellable && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
