import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { LocationModal } from './components/LocationModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AddressesPage } from './pages/AddressesPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

import { IProduct, IOrder } from './types/index.ts';

function MainApp() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dealOnlyFilter, setDealOnlyFilter] = useState<boolean>(false);
  const [trendingOnlyFilter, setTrendingOnlyFilter] = useState<boolean>(false);

  // Selected product for quick details modal
  const [modalProduct, setModalProduct] = useState<IProduct | null>(null);

  // Active placed order for success screen
  const [confirmedOrder, setConfirmedOrder] = useState<IOrder | null>(null);

  // Active order ID for tracking page
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  const navigateTo = (view: string, param?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'products') {
      if (param?.dealOnly) {
        setDealOnlyFilter(true);
        setTrendingOnlyFilter(false);
      } else if (param?.trendingOnly) {
        setTrendingOnlyFilter(true);
        setDealOnlyFilter(false);
      } else {
        setDealOnlyFilter(false);
        setTrendingOnlyFilter(false);
      }
    }

    if (view === 'track-order' && param?.orderId) {
      setTrackingOrderId(param.orderId);
    }

    setCurrentView(view);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setDealOnlyFilter(false);
    setTrendingOnlyFilter(false);
    navigateTo('products');
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setSelectedCategory('All');
    setDealOnlyFilter(false);
    setTrendingOnlyFilter(false);
    navigateTo('products');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onSearch={handleSearch}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectCategory={handleCategorySelect}
            onSelectProduct={(p) => setModalProduct(p)}
          />
        )}

        {currentView === 'products' && (
          <ProductsPage
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            searchQuery={searchQuery}
            dealOnly={dealOnlyFilter}
            trendingOnly={trendingOnlyFilter}
            onSelectProduct={(p) => setModalProduct(p)}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onNavigate={navigateTo}
            onSelectProduct={(p) => setModalProduct(p)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={navigateTo}
            onOrderSuccess={(order) => {
              setConfirmedOrder(order);
              setCurrentView('order-success');
            }}
          />
        )}

        {currentView === 'order-success' && confirmedOrder && (
          <OrderSuccessPage
            order={confirmedOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage
            onNavigate={navigateTo}
            onSelectOrderForTracking={(id) => {
              setTrackingOrderId(id);
              setCurrentView('track-order');
            }}
          />
        )}

        {currentView === 'track-order' && (
          <OrderTrackingPage
            orderId={trackingOrderId}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onNavigate={navigateTo}
            onSelectProduct={(p) => setModalProduct(p)}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage onNavigate={navigateTo} />
        )}

        {currentView === 'addresses' && (
          <AddressesPage onNavigate={navigateTo} />
        )}

        {currentView === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {currentView === 'contact' && (
          <ContactPage />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Global Modals */}
      <LocationModal />
      <AuthModal />
      <ProductDetailModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onSelectCategory={handleCategorySelect}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
