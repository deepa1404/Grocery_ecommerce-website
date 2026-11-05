import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, initialCoupons, ICategory, IProduct } from './seedData.ts';

export interface IUserAddress {
  id: string;
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  addresses: IUserAddress[];
  createdAt: string;
}

export interface ICartItem {
  productId: string;
  product?: IProduct;
  quantity: number;
  price: number;
}

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  shippingAddress: IUserAddress;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallets' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: 'Order Placed' | 'Order Confirmed' | 'Processing' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliverySlot: string;
  deliveryDate: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentRecord {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: string;
  createdAt: string;
}

export interface ICoupon {
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount: number;
  description: string;
}

export interface IReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface IDatabaseSchema {
  users: IUser[];
  categories: ICategory[];
  products: IProduct[];
  cart: { [userId: string]: ICartItem[] };
  wishlist: { [userId: string]: string[] };
  orders: IOrder[];
  payments: IPaymentRecord[];
  coupons: ICoupon[];
  reviews: IReview[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'freshcart_db.json');

class DatabaseStore {
  private data: IDatabaseSchema;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): IDatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir', err);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify minimal integrity
        if (parsed.products && parsed.users) {
          return parsed;
        }
      } catch (err) {
        console.warn('Could not parse db.json, generating default data...', err);
      }
    }

    return this.generateDefaultData();
  }

  public generateDefaultData(): IDatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@123', salt);
    const customerHash = bcrypt.hashSync('Customer@123', salt);

    const defaultUsers: IUser[] = [
      {
        id: 'usr-admin-1',
        name: 'FreshCart Admin',
        email: 'admin@freshcart.com',
        mobile: '9876543210',
        passwordHash: adminHash,
        role: 'admin',
        addresses: [
          {
            id: 'addr-admin-1',
            name: 'FreshCart HQ',
            mobile: '9876543210',
            street: 'Plot 42, Green Avenue, Tech Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560100',
            type: 'Work',
            isDefault: true
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-cust-1',
        name: 'Rahul Sharma',
        email: 'customer@freshcart.com',
        mobile: '9876501234',
        passwordHash: customerHash,
        role: 'customer',
        addresses: [
          {
            id: 'addr-cust-1',
            name: 'Rahul Sharma',
            mobile: '9876501234',
            street: 'Flat 402, Sunshine Heights, 12th Main, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
            type: 'Home',
            isDefault: true
          },
          {
            id: 'addr-cust-2',
            name: 'Rahul Office',
            mobile: '9876501234',
            street: 'EcoSpace Tech Park, Outer Ring Road, Bellandur',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560103',
            type: 'Work',
            isDefault: false
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    // Seed sample initial orders for realism
    const defaultOrders: IOrder[] = [
      {
        id: 'ord-101',
        orderNumber: 'FC-20261104-7821',
        userId: 'usr-cust-1',
        customerName: 'Rahul Sharma',
        customerEmail: 'customer@freshcart.com',
        customerMobile: '9876501234',
        shippingAddress: defaultUsers[1].addresses[0],
        items: [
          {
            productId: 'prod-f1',
            name: 'Fresh Shimla Royal Apples',
            image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
            unit: '1 kg',
            price: 149,
            quantity: 2,
            total: 298
          },
          {
            productId: 'prod-d1',
            name: 'Amul Taaza Homogenised Toned Milk',
            image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
            unit: '1 Litre Tetra Pack',
            price: 72,
            quantity: 2,
            total: 144
          },
          {
            productId: 'prod-b1',
            name: '100% Whole Wheat Brown Bread',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
            unit: '400 g',
            price: 45,
            quantity: 1,
            total: 45
          }
        ],
        subtotal: 487,
        discount: 50,
        couponCode: 'FIRST50',
        deliveryFee: 0,
        tax: 24,
        total: 461,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        razorpayOrderId: 'order_rp_test_992182',
        razorpayPaymentId: 'pay_test_88192837',
        orderStatus: 'Delivered',
        deliverySlot: '07:00 AM - 09:00 AM',
        deliveryDate: '2026-11-04',
        statusHistory: [
          { status: 'Order Placed', timestamp: '2026-11-04T07:15:00.000Z', note: 'Order placed via UPI' },
          { status: 'Order Confirmed', timestamp: '2026-11-04T07:17:00.000Z', note: 'Payment verified and confirmed' },
          { status: 'Processing', timestamp: '2026-11-04T07:25:00.000Z', note: 'Picking fresh items from inventory' },
          { status: 'Packed', timestamp: '2026-11-04T07:45:00.000Z', note: 'Carefully packed in eco bags' },
          { status: 'Out for Delivery', timestamp: '2026-11-04T08:10:00.000Z', note: 'Delivery executive Suresh assigned' },
          { status: 'Delivered', timestamp: '2026-11-04T08:35:00.000Z', note: 'Handed over at doorstep' }
        ],
        createdAt: '2026-11-04T07:15:00.000Z',
        updatedAt: '2026-11-04T08:35:00.000Z'
      },
      {
        id: 'ord-102',
        orderNumber: 'FC-20261105-9014',
        userId: 'usr-cust-1',
        customerName: 'Rahul Sharma',
        customerEmail: 'customer@freshcart.com',
        customerMobile: '9876501234',
        shippingAddress: defaultUsers[1].addresses[0],
        items: [
          {
            productId: 'prod-v1',
            name: 'Farm Fresh Hybrid Tomatoes',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
            unit: '1 kg',
            price: 32,
            quantity: 2,
            total: 64
          },
          {
            productId: 'prod-rg1',
            name: 'Daawat Rozana Gold Basmati Rice',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
            unit: '5 kg bag',
            price: 335,
            quantity: 1,
            total: 335
          },
          {
            productId: 'prod-ce1',
            name: 'Fortune Sunlite Refined Sunflower Oil',
            image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
            unit: '1 Litre pouch',
            price: 145,
            quantity: 1,
            total: 145
          }
        ],
        subtotal: 544,
        discount: 108,
        couponCode: 'FRESH20',
        deliveryFee: 0,
        tax: 22,
        total: 458,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        razorpayOrderId: 'order_rp_test_481029',
        razorpayPaymentId: 'pay_test_77491023',
        orderStatus: 'Out for Delivery',
        deliverySlot: '11:00 AM - 01:00 PM',
        deliveryDate: '2026-11-05',
        statusHistory: [
          { status: 'Order Placed', timestamp: '2026-11-05T03:10:00.000Z', note: 'Order placed with test card' },
          { status: 'Order Confirmed', timestamp: '2026-11-05T03:12:00.000Z', note: 'Verified by system' },
          { status: 'Processing', timestamp: '2026-11-05T03:30:00.000Z', note: 'Sorted in Indiranagar Darkstore' },
          { status: 'Packed', timestamp: '2026-11-05T04:00:00.000Z', note: 'Packed with insulation' },
          { status: 'Out for Delivery', timestamp: '2026-11-05T04:30:00.000Z', note: 'Delivery agent Vikram on the way' }
        ],
        createdAt: '2026-11-05T03:10:00.000Z',
        updatedAt: '2026-11-05T04:30:00.000Z'
      }
    ];

    const defaultPayments: IPaymentRecord[] = [
      {
        id: 'pay-rec-1',
        orderId: 'ord-101',
        razorpayOrderId: 'order_rp_test_992182',
        razorpayPaymentId: 'pay_test_88192837',
        amount: 461,
        currency: 'INR',
        status: 'captured',
        method: 'UPI (GPay)',
        createdAt: '2026-11-04T07:15:00.000Z'
      },
      {
        id: 'pay-rec-2',
        orderId: 'ord-102',
        razorpayOrderId: 'order_rp_test_481029',
        razorpayPaymentId: 'pay_test_77491023',
        amount: 458,
        currency: 'INR',
        status: 'captured',
        method: 'Credit Card (Visa)',
        createdAt: '2026-11-05T03:10:00.000Z'
      }
    ];

    const defaultReviews: IReview[] = [
      {
        id: 'rev-1',
        productId: 'prod-f1',
        userId: 'usr-cust-1',
        userName: 'Rahul Sharma',
        rating: 5,
        comment: 'Extremely fresh and crisp apples! Tastes like real orchard apples, no wax coating. Delivered within 20 mins!',
        createdAt: '2026-11-04T10:00:00.000Z'
      },
      {
        id: 'rev-2',
        productId: 'prod-d1',
        userId: 'usr-cust-1',
        userName: 'Priya Mehta',
        rating: 5,
        comment: 'Daily essential for our kids. Great packaging and cool temperature maintained during transit.',
        createdAt: '2026-11-03T14:30:00.000Z'
      },
      {
        id: 'rev-3',
        productId: 'prod-rg1',
        userId: 'usr-cust-1',
        userName: 'Amitabh Joshi',
        rating: 5,
        comment: 'The fragrance of this Basmati is outstanding. Perfect for Sunday family biryani.',
        createdAt: '2026-11-02T19:10:00.000Z'
      }
    ];

    const schema: IDatabaseSchema = {
      users: defaultUsers,
      categories: initialCategories,
      products: initialProducts,
      cart: {
        'usr-cust-1': [
          {
            productId: 'prod-f3',
            quantity: 1,
            price: 699
          },
          {
            productId: 'prod-d2',
            quantity: 2,
            price: 105
          }
        ]
      },
      wishlist: {
        'usr-cust-1': ['prod-f7', 'prod-ce2', 'prod-bv2']
      },
      orders: defaultOrders,
      payments: defaultPayments,
      coupons: initialCoupons,
      reviews: defaultReviews
    };

    this.data = schema;
    this.save();
    return schema;
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json', err);
    }
  }

  // --- Users collection ---
  public findUserByEmail(email: string): IUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByMobile(mobile: string): IUser | undefined {
    return this.data.users.find(u => u.mobile === mobile);
  }

  public findUserById(id: string): IUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: Omit<IUser, 'id' | 'createdAt'>): IUser {
    const newUser: IUser = {
      ...userData,
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<IUser>): IUser | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  public getAllUsers(): IUser[] {
    return this.data.users;
  }

  // --- Products collection ---
  public getAllProducts(query?: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    deal?: boolean;
    trending?: boolean;
    organic?: boolean;
  }): IProduct[] {
    let result = [...this.data.products];

    if (query?.category && query.category !== 'All') {
      const catLower = query.category.toLowerCase();
      result = result.filter(p => p.category.toLowerCase() === catLower);
    }

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s)
      );
    }

    if (query?.minPrice !== undefined) {
      result = result.filter(p => p.discountPrice >= (query.minPrice || 0));
    }

    if (query?.maxPrice !== undefined && query.maxPrice > 0) {
      result = result.filter(p => p.discountPrice <= (query.maxPrice || 999999));
    }

    if (query?.inStock) {
      result = result.filter(p => p.stock > 0);
    }

    if (query?.deal) {
      result = result.filter(p => p.isDeal);
    }

    if (query?.trending) {
      result = result.filter(p => p.isTrending);
    }

    if (query?.organic) {
      result = result.filter(p => p.isOrganic);
    }

    if (query?.sort) {
      switch (query.sort) {
        case 'price-low':
          result.sort((a, b) => a.discountPrice - b.discountPrice);
          break;
        case 'price-high':
          result.sort((a, b) => b.discountPrice - a.discountPrice);
          break;
        case 'discount':
          result.sort((a, b) => b.discountPercentage - a.discountPercentage);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
        default:
          result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
          break;
      }
    }

    return result;
  }

  public getProductById(id: string): IProduct | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(data: Omit<IProduct, 'id'>): IProduct {
    const id = `prod-${Date.now()}`;
    const newProduct: IProduct = { ...data, id };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<IProduct>): IProduct | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  public updateProductStock(id: string, quantityDeduction: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;
    product.stock = Math.max(0, product.stock - quantityDeduction);
    this.save();
    return true;
  }

  // --- Categories collection ---
  public getAllCategories(): ICategory[] {
    return this.data.categories.map(c => {
      const count = this.data.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
      return { ...c, itemCount: count };
    });
  }

  public getCategoryById(id: string): ICategory | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public createCategory(data: Omit<ICategory, 'id'>): ICategory {
    const id = `cat-${Date.now()}`;
    const newCat: ICategory = { ...data, id };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<ICategory>): ICategory | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Cart collection ---
  public getCart(userId: string): { items: ICartItem[]; subtotal: number } {
    const items = this.data.cart[userId] || [];
    const populated = items.map(item => {
      const product = this.getProductById(item.productId);
      return {
        ...item,
        product,
        price: product ? product.discountPrice : item.price
      };
    }).filter(item => item.product !== undefined);

    const subtotal = populated.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items: populated, subtotal };
  }

  public addToCart(userId: string, productId: string, quantity: number = 1): ICartItem[] {
    if (!this.data.cart[userId]) {
      this.data.cart[userId] = [];
    }
    const product = this.getProductById(productId);
    if (!product) return this.data.cart[userId];

    const existingIdx = this.data.cart[userId].findIndex(item => item.productId === productId);
    if (existingIdx > -1) {
      this.data.cart[userId][existingIdx].quantity += quantity;
      if (this.data.cart[userId][existingIdx].quantity <= 0) {
        this.data.cart[userId].splice(existingIdx, 1);
      }
    } else if (quantity > 0) {
      this.data.cart[userId].push({
        productId,
        quantity,
        price: product.discountPrice
      });
    }

    this.save();
    return this.data.cart[userId];
  }

  public updateCartItem(userId: string, productId: string, quantity: number): ICartItem[] {
    if (!this.data.cart[userId]) return [];

    const existingIdx = this.data.cart[userId].findIndex(item => item.productId === productId);
    if (existingIdx > -1) {
      if (quantity <= 0) {
        this.data.cart[userId].splice(existingIdx, 1);
      } else {
        this.data.cart[userId][existingIdx].quantity = quantity;
      }
    }
    this.save();
    return this.data.cart[userId];
  }

  public removeCartItem(userId: string, productId: string): ICartItem[] {
    if (!this.data.cart[userId]) return [];
    this.data.cart[userId] = this.data.cart[userId].filter(item => item.productId !== productId);
    this.save();
    return this.data.cart[userId];
  }

  public clearCart(userId: string): void {
    this.data.cart[userId] = [];
    this.save();
  }

  // --- Wishlist collection ---
  public getWishlist(userId: string): IProduct[] {
    const productIds = this.data.wishlist[userId] || [];
    return productIds
      .map(id => this.getProductById(id))
      .filter((p): p is IProduct => p !== undefined);
  }

  public toggleWishlist(userId: string, productId: string): boolean {
    if (!this.data.wishlist[userId]) {
      this.data.wishlist[userId] = [];
    }
    const idx = this.data.wishlist[userId].indexOf(productId);
    let added = false;
    if (idx > -1) {
      this.data.wishlist[userId].splice(idx, 1);
      added = false;
    } else {
      this.data.wishlist[userId].push(productId);
      added = true;
    }
    this.save();
    return added;
  }

  // --- Coupons collection ---
  public getCoupon(code: string): ICoupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  }

  public getAllCoupons(): ICoupon[] {
    return this.data.coupons;
  }

  // --- Orders collection ---
  public createOrder(orderData: Omit<IOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): IOrder {
    const timestamp = new Date().toISOString();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `FC-${dateStr}-${randSuffix}`;
    const id = `ord-${Date.now()}`;

    const newOrder: IOrder = {
      ...orderData,
      id,
      orderNumber,
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp,
          note: `Order received with ${orderData.paymentMethod}`
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Deduct stock for items
    orderData.items.forEach(item => {
      this.updateProductStock(item.productId, item.quantity);
    });

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public getOrdersByUserId(userId: string): IOrder[] {
    return this.data.orders.filter(o => o.userId === userId);
  }

  public getOrderById(id: string): IOrder | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public getAllOrders(): IOrder[] {
    return this.data.orders;
  }

  public updateOrderStatus(orderId: string, status: IOrder['orderStatus'], note?: string): IOrder | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: order.updatedAt,
      note: note || `Status updated to ${status}`
    });

    if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    this.save();
    return order;
  }

  public cancelOrder(orderId: string, reason?: string): IOrder | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return null;
    }

    order.orderStatus = 'Cancelled';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: order.updatedAt,
      note: reason || 'Cancelled by customer'
    });

    // Restock items
    order.items.forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    });

    this.save();
    return order;
  }

  // --- Payments collection ---
  public recordPayment(payment: IPaymentRecord): void {
    this.data.payments.push(payment);
    this.save();
  }

  public getAllPayments(): IPaymentRecord[] {
    return this.data.payments;
  }

  // --- Reviews collection ---
  public getProductReviews(productId: string): IReview[] {
    return this.data.reviews.filter(r => r.productId === productId);
  }

  public addReview(reviewData: Omit<IReview, 'id' | 'createdAt'>): IReview {
    const newReview: IReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.push(newReview);

    // Update product rating and reviewsCount
    const prodReviews = this.getProductReviews(reviewData.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = Number(avgRating.toFixed(1));
      prod.reviewsCount = prodReviews.length;
    }

    this.save();
    return newReview;
  }

  // --- Analytics & Reports ---
  public getAnalytics() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders
      .filter(o => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = this.data.orders.filter(
      o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    ).length;

    const deliveredOrders = this.data.orders.filter(o => o.orderStatus === 'Delivered').length;
    const totalCustomers = this.data.users.filter(u => u.role === 'customer').length;
    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter(p => p.stock <= 30);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      deliveredOrders,
      lowStockProductsCount: lowStockProducts.length,
      lowStockProducts
    };
  }
}

export const db = new DatabaseStore();
