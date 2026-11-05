import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Shield,
  ArrowUpRight
} from 'lucide-react';
import { IProduct, ICategory, IOrder, IUser } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { exportOrdersToExcel, exportSalesReportToExcel } from '../utils/excelExport.ts';
import { downloadOrderInvoice } from '../utils/invoiceGenerator.ts';

interface AdminDashboardPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, quickLogin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'payments' | 'reports'>('overview');

  // Analytics data
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & filter in tables
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('All');

  // Modal states for Product Add/Edit
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Fruits',
    brand: '',
    image: '',
    description: '',
    originalPrice: 100,
    discountPrice: 80,
    stock: 50,
    unit: '1 kg',
    isDeal: false,
    isTrending: false,
    isOrganic: false
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  // Selected Order for Details Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IOrder | null>(null);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, catRes, ordRes, custRes, repRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts(),
        api.getCategories(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getAdminReports()
      ]);

      if (dashRes.success) setAnalytics(dashRes.analytics);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
      if (ordRes.success) setOrders(ordRes.orders);
      if (custRes.success) setCustomers(custRes.customers);
      if (repRes.success) setReports(repRes);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Authentication Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The FreshCart Admin Portal requires Administrator credentials. You can sign in using the 1-click Admin demo button below:
          </p>
          <button
            onClick={async () => {
              await quickLogin('admin');
              fetchAllAdminData();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-colors"
          >
            Authenticate as Admin (admin@freshcart.com)
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers for Products ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.name || 'Fruits',
      brand: 'FreshFarm Organics',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: 'Hand-picked fresh grocery.',
      originalPrice: 120,
      discountPrice: 99,
      stock: 45,
      unit: '1 kg',
      isDeal: false,
      isTrending: false,
      isOrganic: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: IProduct) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      image: prod.image,
      description: prod.description,
      originalPrice: prod.originalPrice,
      discountPrice: prod.discountPrice,
      stock: prod.stock,
      unit: prod.unit,
      isDeal: !!prod.isDeal,
      isTrending: !!prod.isTrending,
      isOrganic: !!prod.isOrganic
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.updateAdminProduct(editingProduct.id, productForm);
        if (res.success) {
          showToast(`Updated product: ${res.product.name}`, 'success');
        }
      } else {
        const res = await api.addAdminProduct(productForm);
        if (res.success) {
          showToast(`Created new product: ${res.product.name}`, 'success');
        }
      }
      setIsProductModalOpen(false);
      fetchAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await api.deleteAdminProduct(id);
      if (res.success) {
        showToast('Product deleted', 'info');
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // --- Handlers for Category ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const res = await api.addAdminCategory({
        name: categoryName,
        description: categoryDesc,
        image: categoryImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
      });
      if (res.success) {
        showToast(`Category ${categoryName} created!`, 'success');
        setIsCategoryModalOpen(false);
        setCategoryName('');
        setCategoryDesc('');
        setCategoryImage('');
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // --- Handlers for Order Status Update ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, `Status updated by Admin (${user?.name})`);
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(res.order);
        }
        fetchAllAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleResetCatalog = async () => {
    if (!window.confirm('Reset catalog, test orders, and reviews to pristine defaults?')) return;
    try {
      await api.resetDatabase();
      showToast('Database reset to initial sample grocery state!', 'success');
      fetchAllAdminData();
    } catch {
      showToast('Reset failed', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus === 'All') return true;
    return o.orderStatus === orderFilterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-700 font-bold">Online Grocery Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Store Management Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Re-seed Catalog */}
          <button
            onClick={handleResetCatalog}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="Reset to fresh demo sample data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo DB</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Orders (.xlsx)</span>
          </button>

          {/* Customer Store Switcher */}
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>Visit Customer Shop</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 overflow-x-auto text-xs font-bold gap-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'reports', label: 'Sales Reports & Analytics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 7 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">● Active payments collected</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {analytics?.totalOrders || 0}
              </p>
              <span className="text-[10px] text-slate-500">{analytics?.deliveredOrders || 0} Delivered</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pending Dispatches</span>
              <p className="text-2xl font-black font-mono text-amber-600 mt-1">
                {analytics?.pendingOrders || 0}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">Active in picking line</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Catalog Items</span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {analytics?.totalProducts || 0}
              </p>
              <span className="text-[10px] text-slate-500">Across 12 Categories</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Registered Customers</span>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                {analytics?.totalCustomers || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Verified Shoppers</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Delivered Orders</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {analytics?.deliveredOrders || 0}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">100% On-time</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/40 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800">Low Stock Alert</span>
              <p className="text-2xl font-black font-mono text-amber-900 mt-1">
                {analytics?.lowStockProductsCount || 0}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">Items with &le; 30 units</span>
            </div>
          </div>

          {/* Recent Orders Quick Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View All Orders &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Order #</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Items</th>
                    <th className="pb-3 font-bold">Amount</th>
                    <th className="pb-3 font-bold">Payment</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-3 font-medium text-slate-800">{o.customerName}</td>
                      <td className="py-3 text-slate-500">{o.items.length} items</td>
                      <td className="py-3 font-mono font-bold text-slate-900">₹{o.total}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 font-bold">Product</th>
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold">Unit</th>
                    <th className="p-3.5 font-bold">Original</th>
                    <th className="p-3.5 font-bold">Discount Price</th>
                    <th className="p-3.5 font-bold">Stock</th>
                    <th className="p-3.5 font-bold">Rating</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-2.5">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border" />
                        <div>
                          <p className="font-bold text-slate-900 leading-snug line-clamp-1">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{p.brand}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{p.category}</td>
                      <td className="p-3.5 text-slate-500">{p.unit}</td>
                      <td className="p-3.5 font-mono text-slate-400 line-through">₹{p.originalPrice}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">₹{p.discountPrice}</td>
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${p.stock <= 30 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3.5">★ {p.rating} ({p.reviewsCount})</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">12 Grocery Categories</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{cat.description}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 font-mono">{cat.itemCount} Products</span>
                  <span className="text-[10px] text-slate-400 font-mono">Slug: {cat.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white"
              >
                <option value="All">All Statuses ({orders.length})</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Order Confirmed">Order Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => exportOrdersToExcel(filteredOrders)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel Sheet</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 font-bold">Order Number</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold">Customer</th>
                    <th className="p-3.5 font-bold">Items Qty</th>
                    <th className="p-3.5 font-bold">Total</th>
                    <th className="p-3.5 font-bold">Payment</th>
                    <th className="p-3.5 font-bold">Current Status</th>
                    <th className="p-3.5 font-bold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="p-3.5 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400">{o.customerMobile}</p>
                      </td>
                      <td className="p-3.5 font-mono">{o.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">₹{o.total}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-semibold text-slate-700">{o.paymentMethod}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Order Confirmed">Order Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Registered Customer Accounts ({customers.length})</h3>
            <p className="text-xs text-slate-500">Verified buyers, saved addresses, and lifetime customer value</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 font-bold">Customer Name</th>
                  <th className="p-3.5 font-bold">Email</th>
                  <th className="p-3.5 font-bold">Mobile</th>
                  <th className="p-3.5 font-bold">Addresses</th>
                  <th className="p-3.5 font-bold">Orders Placed</th>
                  <th className="p-3.5 font-bold">Total Spent</th>
                  <th className="p-3.5 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3.5 text-slate-600">{c.email}</td>
                    <td className="p-3.5 font-mono text-slate-600">{c.mobile}</td>
                    <td className="p-3.5">{c.addressesCount} saved</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{c.orderCount}</td>
                    <td className="p-3.5 font-mono font-black text-emerald-700">₹{c.totalSpent}</td>
                    <td className="p-3.5 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & EXCEL */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales Reports & Financial Exports</h3>
              <p className="text-xs text-slate-500">Analyze revenue velocity, order volumes and bestselling items</p>
            </div>
            <button
              onClick={() => exportSalesReportToExcel(reports)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Sales Analysis (.xlsx)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily/Weekly Timeline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Daily Revenue Timeline</h4>
              <div className="space-y-2">
                {reports.salesTimeline?.map((s: any) => (
                  <div key={s.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 font-mono">{s.date}</span>
                      <span className="text-slate-400 ml-2">({s.orders} orders)</span>
                    </div>
                    <span className="font-black font-mono text-emerald-700">₹{s.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Top Selling Groceries</h4>
              <div className="space-y-2">
                {reports.topProducts?.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-700 font-semibold">{p.quantity} units</span>
                      <span className="text-[10px] text-slate-400 block font-mono">₹{p.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="e.g. Fresh Shimla Royal Apples"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    placeholder="e.g. 1 kg, 500 g, 1 Litre"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isDeal}
                    onChange={(e) => setProductForm({ ...productForm, isDeal: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Deal of Day</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isTrending}
                    onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Trending</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isOrganic}
                    onChange={(e) => setProductForm({ ...productForm, isOrganic: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>100% Organic</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Create Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="e.g. Exotic Gourmet"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="Fresh selection of gourmet produce"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
