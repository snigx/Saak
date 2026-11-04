import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandIntro from './components/BrandIntro';
import MixMatchStudio from './components/MixMatchStudio';
import ProductGrid from './components/ProductGrid';
import InstagramFeed from './components/InstagramFeed';
import Footer from './components/Footer';
import ProductDetailModal from './components/ProductDetailModal';
import CustomShadeModal from './components/CustomShadeModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AtelierAdminModal from './components/AtelierAdminModal';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import RefundPolicyModal from './components/RefundPolicyModal';
import SearchModal from './components/SearchModal';

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
      <div className="saak-app">
        {/* Top Announcements */}
        <AnnouncementBar />

        {/* Brand Navigation */}
        <Navbar />

        {/* Editorial Hero */}
        <Hero />

        {/* Brand Intro & Philosophy */}
        <BrandIntro />

        {/* The Flagship Mix & Match Canvas */}
        <MixMatchStudio />

        {/* Complete Product Catalog */}
        <ProductGrid />

        {/* Official Instagram Community & Stories */}
        <InstagramFeed />

        {/* Footer & Textile Care */}
        <Footer />

        {/* Global Modals & Drawers */}
        <ProductDetailModal />
        <CustomShadeModal />
        <CartDrawer />
        <WishlistDrawer />
        <AtelierAdminModal />
        <CheckoutModal />
        <AuthModal />
        <ProfileModal />
        <RefundPolicyModal />
        <SearchModal />
      </div>
    </ShopProvider>
  </AuthProvider>
  );
}
