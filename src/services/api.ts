import { IProduct, ICategory, IUser, ICartItem, IOrder, IUserAddress, ICoupon } from '../types/index.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('freshcart_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server');
  }
  return data;
}

export const api = {
  // Auth
  async register(body: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<{ success: boolean; message: string; token: string; user: IUser }>(res);
  },

  async login(body: { emailOrMobile: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<{ success: boolean; message: string; token: string; user: IUser }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; user: IUser }>(res);
  },

  async updateProfile(body: { name?: string; mobile?: string; newPassword?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse<{ success: boolean; message: string; user: IUser }>(res);
  },

  async addAddress(address: Partial<IUserAddress>) {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address)
    });
    return handleResponse<{ success: boolean; message: string; addresses: IUserAddress[] }>(res);
  },

  async setDefaultAddress(id: string) {
    const res = await fetch(`${API_BASE}/auth/addresses/${id}/default`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string; addresses: IUserAddress[] }>(res);
  },

  async deleteAddress(id: string) {
    const res = await fetch(`${API_BASE}/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string; addresses: IUserAddress[] }>(res);
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    deal?: boolean;
    trending?: boolean;
    organic?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`);
    return handleResponse<{ success: boolean; count: number; products: IProduct[] }>(res);
  },

  async getProductById(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse<{
      success: boolean;
      product: IProduct;
      reviews: { id: string; userName: string; rating: number; comment: string; createdAt: string }[];
      related: IProduct[];
    }>(res);
  },

  async addReview(productId: string, rating: number, comment: string, userName?: string) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment, userName })
    });
    return handleResponse<{ success: boolean; message: string; review: unknown }>(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<{ success: boolean; categories: ICategory[] }>(res);
  },

  // Cart
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; items: ICartItem[]; subtotal: number }>(res);
  },

  async addToCart(productId: string, quantity: number = 1) {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return handleResponse<{ success: boolean; message: string; items: ICartItem[]; subtotal: number }>(res);
  },

  async updateCartItem(productId: string, quantity: number) {
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    return handleResponse<{ success: boolean; message: string; items: ICartItem[]; subtotal: number }>(res);
  },

  async removeCartItem(productId: string) {
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string; items: ICartItem[]; subtotal: number }>(res);
  },

  async clearCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string; items: ICartItem[]; subtotal: number }>(res);
  },

  async applyCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/cart/apply-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return handleResponse<{ success: boolean; message: string; coupon: ICoupon; discountAmount: number }>(res);
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; wishlist: IProduct[] }>(res);
  },

  async toggleWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
    return handleResponse<{ success: boolean; message: string; added: boolean; wishlist: IProduct[] }>(res);
  },

  // Orders
  async createOrder(orderPayload: Partial<IOrder>) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload)
    });
    return handleResponse<{ success: boolean; message: string; order: IOrder }>(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; orders: IOrder[] }>(res);
  },

  async getOrderById(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; order: IOrder }>(res);
  },

  async cancelOrder(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse<{ success: boolean; message: string; order: IOrder }>(res);
  },

  // Razorpay Payments
  async createRazorpayOrder(amount: number) {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });
    return handleResponse<{
      success: boolean;
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
      receipt: string;
    }>(res);
  },

  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
    method?: string;
  }) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<{ success: boolean; message: string; paymentId: string; status: string }>(res);
  },

  // Admin APIs
  async getAdminDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; analytics: any }>(res);
  },

  async getAdminOrders() {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; orders: IOrder[] }>(res);
  },

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note })
    });
    return handleResponse<{ success: boolean; message: string; order: IOrder }>(res);
  },

  async getAdminCustomers() {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; customers: any[] }>(res);
  },

  async getAdminReports() {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; salesTimeline: any[]; topProducts: any[]; totalCatalogItems: number }>(res);
  },

  async addAdminProduct(productData: any) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse<{ success: boolean; message: string; product: IProduct }>(res);
  },

  async updateAdminProduct(id: string, productData: any) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse<{ success: boolean; message: string; product: IProduct }>(res);
  },

  async deleteAdminProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async addAdminCategory(catData: any) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(catData)
    });
    return handleResponse<{ success: boolean; message: string; category: ICategory }>(res);
  },

  async resetDatabase() {
    const res = await fetch(`${API_BASE}/seed/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  }
};
