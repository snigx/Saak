import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandIntro from './components/BrandIntro';
import MixMatchStudio from './components/MixMatchStudio';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import ProductDetailModal from './components/ProductDetailModal';
import CustomShadeModal from './components/CustomShadeModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import RefundPolicyModal from './components/RefundPolicyModal';
import SearchModal from './components/SearchModal';
import ProductRouteSync from './components/ProductRouteSync';

// Admin console (catalog editor + orders ledger) is split into its own chunk and
// only downloaded once an admin is signed in — shoppers never load it.
const AtelierAdminModal = lazy(() => import('./components/AtelierAdminModal'));

function AdminConsole() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  return (
    <Suspense fallback={null}>
      <AtelierAdminModal />
    </Suspense>
  );
}

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

        {/* Footer & Textile Care */}
        <Footer />

        {/* Global Modals & Drawers */}
        <ProductDetailModal />
        <CustomShadeModal />
        <CartDrawer />
        <WishlistDrawer />
        <AdminConsole />
        <CheckoutModal />
        <AuthModal />
        <ProfileModal />
        <RefundPolicyModal />
        <SearchModal />

        {/* Shareable /product/<id> links + Back button support */}
        <ProductRouteSync />
      </div>
    </ShopProvider>
  </AuthProvider>
  );
}
