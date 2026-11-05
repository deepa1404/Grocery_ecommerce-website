import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ICartItem, IProduct, ICoupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface CartContextValue {
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  coupon: ICoupon | null;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: IProduct, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getItemQuantity: (productId: string) => number;
  // Wishlist
  wishlist: IProduct[];
  toggleWishlist: (product: IProduct) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<ICartItem[]>([]);
  const [coupon, setCoupon] = useState<ICoupon | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<IProduct[]>([]);

  // Load cart when user status changes
  const fetchCartAndWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const cartRes = await api.getCart();
        if (cartRes.success) {
          setItems(cartRes.items || []);
        }
        const wishRes = await api.getWishlist();
        if (wishRes.success) {
          setWishlist(wishRes.wishlist || []);
        }
      } catch {
        // Fallback to local
      }
    } else {
      const localCart = localStorage.getItem('freshcart_local_cart');
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setWishlist([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCartAndWishlist();
  }, [fetchCartAndWishlist]);

  // Save guest cart locally
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('freshcart_local_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  // Financial calculations
  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? item.product.discountPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (coupon) {
      if (subtotal < coupon.minOrder) {
        setCoupon(null);
        setDiscount(0);
        showToast(`Coupon ${coupon.code} removed (Min order ₹${coupon.minOrder})`, 'info');
      } else {
        let disc = 0;
        if (coupon.discountType === 'percent') {
          disc = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount);
        } else {
          disc = Math.min(coupon.value, coupon.maxDiscount);
        }
        setDiscount(Math.round(disc));
      }
    } else {
      setDiscount(0);
    }
  }, [subtotal, coupon, showToast]);

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 30;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST on grocery / packaged goods
  const total = subtotal === 0 ? 0 : taxableAmount + deliveryFee + tax;

  const addToCart = async (product: IProduct, quantity: number = 1) => {
    if (isAuthenticated) {
      try {
        const res = await api.addToCart(product.id, quantity);
        if (res.success) {
          setItems(res.items);
          showToast(`Added ${product.name} to cart!`, 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Could not update cart', 'error');
      }
    } else {
      // Guest mode
      setItems(prev => {
        const existingIdx = prev.findIndex(i => i.productId === product.id);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [...prev, { productId: product.id, product, quantity, price: product.discountPrice }];
        }
      });
      showToast(`Added ${product.name} to cart!`, 'success');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      try {
        const res = await api.updateCartItem(productId, quantity);
        if (res.success) {
          setItems(res.items);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to update quantity', 'error');
      }
    } else {
      setItems(prev => {
        if (quantity <= 0) {
          return prev.filter(i => i.productId !== productId);
        }
        return prev.map(i => (i.productId === productId ? { ...i, quantity } : i));
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await api.removeCartItem(productId);
        if (res.success) {
          setItems(res.items);
          showToast('Item removed from cart', 'info');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to remove item', 'error');
      }
    } else {
      setItems(prev => prev.filter(i => i.productId !== productId));
      showToast('Item removed from cart', 'info');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.clearCart();
        setItems([]);
        setCoupon(null);
        setDiscount(0);
      } catch {
        // Fallback
      }
    } else {
      setItems([]);
      setCoupon(null);
      setDiscount(0);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.applyCoupon(code, subtotal);
      if (res.success && res.coupon) {
        setCoupon(res.coupon);
        setDiscount(res.discountAmount);
        showToast(`Coupon ${res.coupon.code} applied! Saved ₹${res.discountAmount}`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
    showToast('Coupon removed', 'info');
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  // Wishlist methods
  const toggleWishlist = async (product: IProduct) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      showToast('Please sign in to save items to your wishlist', 'info');
      return;
    }

    try {
      const res = await api.toggleWishlist(product.id);
      if (res.success) {
        setWishlist(res.wishlist);
        showToast(res.added ? `Saved ${product.name} to wishlist` : `Removed ${product.name} from wishlist`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update wishlist', 'error');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        coupon,
        discount,
        deliveryFee,
        tax,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
        wishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
