import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Search, Sparkles, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const { 
    cart, 
    wishlist, 
    activeCategory, 
    setActiveCategory, 
    setIsCartOpen, 
    setIsWishlistOpen,
    formatPrice,
    cartTotal
  } = useShop();

  const { user, openAuthModal, openProfile } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleNavClick = (catKey) => {
    setActiveCategory(catKey);
    setMobileMenuOpen(false);
    // Smooth scroll to catalog section
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudioScroll = () => {
    setMobileMenuOpen(false);
    const studioEl = document.getElementById('mix-match-studio');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-header">
      <div className="container nav-container">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <div className="brand-logo-wrapper" onClick={() => handleNavClick('all')}>
          <span className="brand-name">Saak</span>
          <span className="brand-sub">by Aprajita</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button 
            className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleNavClick('all')}
          >
            All Creations
          </button>
          <button 
            className={`nav-link ${activeCategory === 'tissue' ? 'active' : ''}`}
            onClick={() => handleNavClick('tissue')}
          >
            The Tissue Series
          </button>
          <button 
            className={`nav-link ${activeCategory === 'corset' ? 'active' : ''}`}
            onClick={() => handleNavClick('corset')}
          >
            Sculpted Corsets
          </button>
          <button 
            className={`nav-link studio-nav-pill ${activeCategory === 'studio' ? 'active' : ''}`}
            onClick={handleStudioScroll}
          >
            <Sparkles size={13} className="text-gold" />
            <span>Mix &amp; Match Studio</span>
          </button>
          <button 
            className={`nav-link ${activeCategory === 'sets' ? 'active' : ''}`}
            onClick={() => handleNavClick('sets')}
          >
            Curated Duos
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="nav-actions">
          {/* Search Trigger */}
          <div className="search-box">
            {searchOpen ? (
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search tissue, black crepe, corset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="search-close-btn">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                className="action-icon-btn"
                title="Search collection"
              >
                <Search size={19} />
              </button>
            )}
          </div>

          {/* Wishlist */}
          <button 
            onClick={() => setIsWishlistOpen(true)}
            className="action-icon-btn"
            title="Wishlist"
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="icon-badge">{wishlist.length}</span>
            )}
          </button>

          {/* Patron Account / Sign In */}
          <button 
            onClick={() => user ? openProfile() : openAuthModal('signin')}
            className={`action-icon-btn patron-account-btn ${user ? 'is-logged-in' : ''}`}
            title={user ? `Patron Profile (${user.fullName || user.email})` : "Sign In to Atelier"}
          >
            {user ? (
              user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="nav-avatar-img" />
              ) : (
                <span className="nav-avatar-badge">{user.fullName ? user.fullName[0].toUpperCase() : 'P'}</span>
              )
            ) : (
              <User size={19} />
            )}
          </button>

          {/* Cart Bag */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="cart-trigger-btn"
            title="Shopping Bag"
          >
            <ShoppingBag size={19} />
            <div className="cart-btn-info">
              <span className="cart-count-pill">{cartItemCount}</span>
              {cartTotal > 0 && (
                <span className="cart-total-text">{formatPrice(cartTotal)}</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <button 
            className={`mobile-nav-link ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleNavClick('all')}
          >
            All Creations
          </button>
          <button 
            className={`mobile-nav-link ${activeCategory === 'tissue' ? 'active' : ''}`}
            onClick={() => handleNavClick('tissue')}
          >
            The Tissue Series (Shimmer Sarees)
          </button>
          <button 
            className={`mobile-nav-link ${activeCategory === 'corset' ? 'active' : ''}`}
            onClick={() => handleNavClick('corset')}
          >
            Sculpted Corsets (Heavy Zardozi)
          </button>
          <button 
            className="mobile-nav-link mobile-studio-link"
            onClick={handleStudioScroll}
          >
            <Sparkles size={15} />
            <span>Mix &amp; Match Styling Studio</span>
          </button>
          <button 
            className={`mobile-nav-link ${activeCategory === 'sets' ? 'active' : ''}`}
            onClick={() => handleNavClick('sets')}
          >
            Curated Duos (Save 10%)
          </button>

          <div className="mobile-auth-divider"></div>
          {user ? (
            <button 
              className="mobile-nav-link mobile-account-btn"
              onClick={() => { setMobileMenuOpen(false); openProfile(); }}
            >
              <User size={16} />
              <span>Patron Profile ({user.fullName || 'Member'})</span>
            </button>
          ) : (
            <button 
              className="mobile-nav-link mobile-account-btn"
              onClick={() => { setMobileMenuOpen(false); openAuthModal('signin'); }}
            >
              <User size={16} />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          background: rgba(250, 246, 239, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-subtle);
          z-index: 90;
          transition: var(--transition);
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 78px;
        }
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
        }
        .brand-logo-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
          text-decoration: none;
        }
        .brand-name {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          line-height: 1;
        }
        .brand-sub {
          font-size: 9px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--accent-terracotta);
          margin-top: 3px;
          font-weight: 600;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .nav-link {
          background: none;
          border: none;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          padding: 6px 0;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--accent-terracotta);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--accent-terracotta);
        }
        .studio-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(197, 160, 89, 0.12);
          border: 1px solid var(--border-gold);
          padding: 6px 14px;
          border-radius: 20px;
          color: #8C6D2B !important;
          font-weight: 600;
        }
        .studio-nav-pill:hover {
          background: var(--accent-gold);
          color: #FFFFFF !important;
        }
        .studio-nav-pill:hover .text-gold {
          color: #FFFFFF;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .action-icon-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          transition: var(--transition);
        }
        .action-icon-btn:hover {
          color: var(--accent-terracotta);
        }
        .patron-account-btn {
          position: relative;
        }
        .nav-avatar-badge {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: var(--accent-terracotta);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--accent-gold);
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .nav-avatar-img {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--accent-gold);
        }
        .mobile-auth-divider {
          height: 1px;
          background: var(--border-light);
          margin: 10px 0;
        }
        .mobile-account-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--accent-terracotta) !important;
          font-weight: 600;
        }
        .icon-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--accent-terracotta);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-trigger-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--text-primary);
          color: #FFFFFF;
          border: none;
          padding: 8px 14px;
          border-radius: 2px;
          cursor: pointer;
          transition: var(--transition);
        }
        .cart-trigger-btn:hover {
          background: var(--accent-terracotta);
          transform: translateY(-1px);
        }
        .cart-btn-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cart-count-pill {
          background: rgba(255, 255, 255, 0.2);
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .cart-total-text {
          font-size: 12px;
          font-weight: 600;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 4px 10px;
          box-shadow: var(--shadow-sm);
        }
        .search-input {
          border: none;
          outline: none;
          font-size: 12px;
          font-family: inherit;
          width: 180px;
        }
        .search-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }
        .mobile-nav-drawer {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-subtle);
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-nav-link {
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          padding: 8px 0;
          cursor: pointer;
        }
        .mobile-studio-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8C6D2B;
        }
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-toggle {
            display: block;
          }
        }
        @media (max-width: 640px) {
          .nav-container {
            height: 64px;
          }
          .nav-actions {
            gap: 10px;
          }
          .brand-name {
            font-size: 24px;
          }
          .brand-sub {
            font-size: 9px;
            letter-spacing: 0.16em;
          }
          .cart-total-text {
            display: none;
          }
          .cart-trigger-btn {
            padding: 7px 10px;
          }
          .search-input {
            width: 120px;
          }
          .action-icon-btn {
            padding: 4px;
          }
        }
      `}</style>
    </header>
  );
}
