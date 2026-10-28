import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Eye, Sparkles } from 'lucide-react';

export default function WishlistDrawer() {
  const { 
    wishlist = [], 
    products = [], 
    isWishlistOpen, 
    setIsWishlistOpen, 
    toggleWishlist, 
    addToCart, 
    formatPrice,
    setSelectedProduct,
    setIsCartOpen 
  } = useShop();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        setIsWishlistOpen(false);
      }
    };
    if (isWishlistOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));
  const totalWishlistValue = wishlistedProducts.reduce((sum, p) => sum + (p.price || 0), 0);

  const handleMoveAllToBag = () => {
    wishlistedProducts.forEach(product => {
      addToCart(product);
      toggleWishlist(product.id);
    });
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Remove all saved creations from your wishlist?')) {
      wishlistedProducts.forEach(product => toggleWishlist(product.id));
    }
  };

  const handleExploreCatalog = () => {
    setIsWishlistOpen(false);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewProduct = (product) => {
    setIsWishlistOpen(false);
    setSelectedProduct(product);
  };

  return (
    <div 
      className="wishlist-backdrop" 
      onClick={() => setIsWishlistOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Your Atelier Wishlist"
    >
      <div 
        className="wishlist-drawer-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="wishlist-header">
          <div className="wishlist-title-group">
            <div className="wishlist-icon-badge">
              <Heart size={16} fill="var(--accent-terracotta)" color="var(--accent-terracotta)" />
            </div>
            <div>
              <h3 className="wishlist-title">Curated Wishlist</h3>
              <span className="wishlist-count-text">
                {wishlist.length} {wishlist.length === 1 ? 'saved piece' : 'saved pieces'}
              </span>
            </div>
          </div>
          <button 
            className="wishlist-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close Wishlist"
            title="Close Wishlist (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Body */}
        <div className="wishlist-items-body">
          {wishlistedProducts.length === 0 ? (
            <div className="empty-wishlist-state">
              <div className="empty-wishlist-halo">
                <Heart size={38} strokeWidth={1.5} className="empty-heart-icon" />
              </div>
              <h4 className="empty-title">Your Wishlist is Empty</h4>
              <p className="empty-desc">
                Save your favourite fluid tissue sarees, sculpted zardozi corsets, and curated festive duos here to review anytime.
              </p>
              <button 
                onClick={handleExploreCatalog}
                className="btn btn-primary explore-catalog-btn"
              >
                <span>Discover All Creations</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Quick Actions Strip */}
              <div className="wishlist-actions-bar">
                <span className="wishlist-subtotal-hint">
                  Total Value: <strong>{formatPrice(totalWishlistValue)}</strong>
                </span>
                <button 
                  onClick={handleClearWishlist}
                  className="wishlist-clear-link"
                  title="Remove all items from wishlist"
                >
                  Clear All
                </button>
              </div>

              {/* Items List */}
              <div className="wishlist-cards-list">
                {wishlistedProducts.map(product => {
                  const thumb = product.images?.modelView || product.images?.flatlayView || '/assets/muse_sunset_tissue.jpg';
                  return (
                    <div key={product.id} className="wishlist-item-card">
                      <div 
                        className="wishlist-item-thumb-wrapper"
                        onClick={() => handleViewProduct(product)}
                        title="Click to view full creation details"
                      >
                        <img 
                          src={thumb} 
                          alt={product.name}
                          className="wishlist-item-thumb" 
                        />
                        <span className="thumb-view-overlay">
                          <Eye size={14} />
                        </span>
                      </div>

                      <div className="wishlist-item-info">
                        <div className="item-title-row">
                          <h4 
                            className="wishlist-item-name"
                            onClick={() => handleViewProduct(product)}
                            title="Click to view creation details"
                          >
                            {product.name}
                          </h4>
                          <button 
                            onClick={() => toggleWishlist(product.id)}
                            className="item-remove-btn"
                            title="Remove from Wishlist"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="item-meta-strip">
                          <span className="wishlist-spec-pill">{product.fabric || 'Artisanal Weave'}</span>
                          {product.category === 'sets' && (
                            <span className="wishlist-spec-pill duo-tag">Set Privilege (Save 10%)</span>
                          )}
                          {product.isCustomColorAvailable && (
                            <span className="wishlist-spec-pill custom-color-tag">Custom Shades Available</span>
                          )}
                        </div>

                        <div className="item-bottom-row">
                          <div className="wishlist-price-tag">
                            <span className="current-price">{formatPrice(product.price)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="original-price">{formatPrice(product.originalPrice)}</span>
                            )}
                          </div>

                          <div className="wishlist-item-cta-group">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="btn btn-outline quick-view-btn"
                              title="Quick View Details"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <button 
                              onClick={() => {
                                addToCart(product);
                                toggleWishlist(product.id);
                              }}
                              className="btn btn-primary move-to-bag-btn"
                              title="Move this piece into your Shopping Bag"
                            >
                              <ShoppingBag size={12} />
                              <span>Move to Bag</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {wishlistedProducts.length > 0 && (
          <div className="wishlist-footer">
            <div className="wishlist-summary-row">
              <span className="summary-label">Wishlist Estimated Total:</span>
              <span className="summary-val">{formatPrice(totalWishlistValue)}</span>
            </div>
            <button 
              onClick={handleMoveAllToBag}
              className="btn btn-primary move-all-btn"
            >
              <ShoppingBag size={15} />
              <span>Move All to Shopping Bag ({wishlistedProducts.length})</span>
            </button>
            <button 
              onClick={handleExploreCatalog}
              className="btn btn-outline continue-btn"
            >
              Continue Exploring Catalog
            </button>
          </div>
        )}
      </div>

      <style>{`
        .wishlist-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          max-width: 100%;
          height: 100%;
          max-height: 100%;
          background: rgba(26, 22, 20, 0.65);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: wishlistFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }
        @keyframes wishlistFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .wishlist-drawer-panel {
          background: #FFFFFF;
          width: 100%;
          max-width: 460px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(26, 22, 20, 0.2);
          border-left: 1px solid var(--border-gold, #C5A059);
          animation: wishlistSlideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes wishlistSlideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .wishlist-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px;
          border-bottom: 1px solid var(--border-light, #EFEAE1);
          background: #FAF6EF;
        }
        .wishlist-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wishlist-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(163, 72, 53, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(163, 72, 53, 0.2);
        }
        .wishlist-title {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 20px;
          margin: 0;
          color: var(--text-dark, #1F1A17);
          font-weight: 500;
        }
        .wishlist-count-text {
          font-size: 11px;
          color: var(--text-muted, #7A726D);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .wishlist-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted, #7A726D);
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition, all 0.2s ease);
        }
        .wishlist-close-btn:hover {
          color: var(--text-dark, #1F1A17);
          background: rgba(0, 0, 0, 0.05);
        }
        .wishlist-items-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
        }
        .empty-wishlist-state {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }
        .empty-wishlist-halo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(163, 72, 53, 0.06);
          border: 1px dashed rgba(163, 72, 53, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .empty-heart-icon {
          color: var(--accent-terracotta, #A34835);
        }
        .empty-title {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 20px;
          margin: 0 0 8px 0;
          color: var(--text-dark, #1F1A17);
        }
        .empty-desc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-muted, #7A726D);
          margin: 0 0 24px 0;
          max-width: 300px;
        }
        .explore-catalog-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 13px;
        }
        .wishlist-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light, #EFEAE1);
          font-size: 12px;
        }
        .wishlist-subtotal-hint {
          color: var(--text-muted, #7A726D);
        }
        .wishlist-subtotal-hint strong {
          color: var(--text-dark, #1F1A17);
          margin-left: 4px;
        }
        .wishlist-clear-link {
          background: none;
          border: none;
          font-size: 11px;
          color: var(--text-muted, #7A726D);
          text-decoration: underline;
          cursor: pointer;
          transition: var(--transition, all 0.2s ease);
        }
        .wishlist-clear-link:hover {
          color: var(--accent-terracotta, #A34835);
        }
        .wishlist-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .wishlist-item-card {
          display: flex;
          gap: 14px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light, #EFEAE1);
          transition: var(--transition, all 0.2s ease);
        }
        .wishlist-item-card:last-child {
          border-bottom: none;
        }
        .wishlist-item-thumb-wrapper {
          position: relative;
          width: 80px;
          height: 104px;
          border-radius: 4px;
          overflow: hidden;
          background: #FAF6EF;
          flex-shrink: 0;
          cursor: pointer;
        }
        .wishlist-item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .wishlist-item-thumb-wrapper:hover .wishlist-item-thumb {
          transform: scale(1.05);
        }
        .thumb-view-overlay {
          position: absolute;
          inset: 0;
          background: rgba(31, 26, 23, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FAF6EF;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .wishlist-item-thumb-wrapper:hover .thumb-view-overlay {
          opacity: 1;
        }
        .wishlist-item-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .item-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .wishlist-item-name {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 15px;
          color: var(--text-dark, #1F1A17);
          margin: 0;
          line-height: 1.3;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .wishlist-item-name:hover {
          color: var(--accent-terracotta, #A34835);
        }
        .item-remove-btn {
          background: none;
          border: none;
          color: var(--text-muted, #7A726D);
          cursor: pointer;
          padding: 2px 4px;
          transition: color 0.2s ease;
        }
        .item-remove-btn:hover {
          color: var(--accent-terracotta, #A34835);
        }
        .item-meta-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin: 4px 0 8px 0;
        }
        .wishlist-spec-pill {
          font-size: 10px;
          background: #FAF6EF;
          border: 1px solid var(--border-light, #EFEAE1);
          padding: 2px 6px;
          border-radius: 2px;
          color: var(--text-muted, #7A726D);
        }
        .wishlist-spec-pill.duo-tag {
          background: rgba(197, 160, 89, 0.12);
          border-color: rgba(197, 160, 89, 0.3);
          color: #8C6D2B;
          font-weight: 600;
        }
        .wishlist-spec-pill.custom-color-tag {
          color: var(--accent-terracotta, #A34835);
          background: rgba(163, 72, 53, 0.06);
          border-color: rgba(163, 72, 53, 0.2);
        }
        .item-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .wishlist-price-tag {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .current-price {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-dark, #1F1A17);
        }
        .original-price {
          font-size: 12px;
          color: var(--text-muted, #7A726D);
          text-decoration: line-through;
        }
        .wishlist-item-cta-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .quick-view-btn {
          padding: 5px 9px;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .move-to-bag-btn {
          padding: 6px 12px;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .wishlist-footer {
          border-top: 1px solid var(--border-light, #EFEAE1);
          background: #FAF6EF;
          padding: 18px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wishlist-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }
        .summary-label {
          font-size: 12px;
          color: var(--text-muted, #7A726D);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .summary-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-terracotta, #A34835);
          font-family: var(--font-serif, Georgia, serif);
        }
        .move-all-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          font-size: 13px;
        }
        .continue-btn {
          width: 100%;
          padding: 10px 16px;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .wishlist-backdrop {
            justify-content: stretch;
          }
          .wishlist-drawer-panel {
            width: 100% !important;
            max-width: 100% !important;
          }
          .wishlist-item-card {
            flex-direction: column;
            gap: 10px;
          }
          .wishlist-item-thumb-wrapper {
            width: 100%;
            height: 180px;
          }
          .item-bottom-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .wishlist-item-cta-group {
            width: 100%;
          }
          .quick-view-btn, .move-to-bag-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
