export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface IProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  stock: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isDeal?: boolean;
  isTrending?: boolean;
  isOrganic?: boolean;
  tags?: string[];
}

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
  role: 'customer' | 'admin';
  addresses: IUserAddress[];
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
