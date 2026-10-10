import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, Sparkles, Palette, ShoppingBag, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { 
    formatPrice, 
    toggleWishlist, 
    wishlist, 
    setSelectedProduct, 
    setCustomShadeProduct,
    addToCart 
  } = useShop();

  const [activeView, setActiveView] = useState('model'); // 'model' or 'flatlay'
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const displayImage = activeView === 'model' 
    ? (product.images.modelView || product.images.flatlayView)
    : (product.images.flatlayView || product.images.modelView);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  const handleCustomShade = (e) => {
    e.stopPropagation();
    setCustomShadeProduct(product);
  };

  return (
    <div className="product-card" onClick={() => setSelectedProduct(product)}>
      {/* Media Container */}
      <div className="card-media-wrapper">
        <img 
          src={displayImage} 
          alt={product.name}
          className="product-main-img" 
        />

        {/* View Toggle Pill */}
        <div className="card-view-switch" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`switch-btn ${activeView === 'model' ? 'active' : ''}`}
            onClick={() => setActiveView('model')}
            title="View on model (AI Drape)"
          >
            Model
          </button>
          <button 
            className={`switch-btn ${activeView === 'flatlay' ? 'active' : ''}`}
            onClick={() => setActiveView('flatlay')}
            title="View fabric flat-lay with mogra blossoms"
          >
            Flatlay
          </button>
        </div>

        {/* Top Badges */}
        <div className="card-top-badges">
          {product.tag && (
            <span 
              className="card-badge"
              style={{ backgroundColor: product.tagColor || 'var(--accent-terracotta)' }}
            >
              {product.tag}
            </span>
          )}
          {product.drapeStyle?.includes('Pre-draped') && (
            <span className="card-badge badge-dark">
              ⚡ 60s Slip-on
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className={`card-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#A34835' : 'none'} color={isWishlisted ? '#A34835' : '#1F1A17'} />
        </button>

        {/* Quick View Button on Hover */}
        <button 
          className="card-quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
        >
          <Eye size={14} />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="card-details">
        <div className="card-fabric-tag">
          <span>{product.fabric}</span>
          <span className="dot">•</span>
          <span>{product.drapeWeight}</span>
        </div>

        <h3 className="card-title">{product.name}</h3>

        <div className="card-price-row">
          <div className="price-group">
            <span className="card-current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="card-old-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.bundleDiscountPercent && (
            <span className="save-badge">Save {product.bundleDiscountPercent}%</span>
          )}
        </div>

        {/* Custom Colour Palette Preview if available */}
        {product.isCustomColorAvailable && product.availableCustomColors && (
          <div className="custom-palette-row" onClick={handleCustomShade}>
            <span className="palette-label">Custom Shades:</span>
            <div className="palette-dots">
              {product.availableCustomColors.slice(0, 5).map((col, idx) => (
                <span 
                  key={idx} 
                  className="color-dot" 
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
              <span className="more-colors-count">+{product.availableCustomColors.length - 5}</span>
            </div>
            <button className="custom-shade-btn" title="Request custom colour on WhatsApp">
              <Palette size={12} />
              <span>Customize</span>
            </button>
          </div>
        )}

        {/* Card Actions */}
        <div className="card-actions-row">
          <button 
            className={`btn btn-dark card-add-bag-btn ${isAddedAnimation ? 'added' : ''}`}
            onClick={handleQuickAdd}
          >
            {isAddedAnimation ? (
              <>
                <Check size={14} />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .product-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }
        .product-card:hover {
          border-color: var(--accent-terracotta);
          box-shadow: var(--shadow-md);
          transform: translateY(-3px);
        }
        .card-media-wrapper {
          position: relative;
          aspect-ratio: 4/5.2;
          background: #EAE3D6;
          overflow: hidden;
        }
        .product-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.6s ease;
        }
        .product-card:hover .product-main-img {
          transform: scale(1.04);
        }
        .card-view-switch {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 2px;
          display: flex;
          box-shadow: var(--shadow-sm);
          z-index: 2;
        }
        .switch-btn {
          border: none;
          background: none;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 14px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .switch-btn.active {
          background: var(--text-primary);
          color: #FFFFFF;
        }
        .card-top-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 2;
        }
        .card-badge {
          font-size: 10px;
          font-weight: 700;
          color: #FFFFFF;
          padding: 3px 8px;
          border-radius: 2px;
          letter-spacing: 0.04em;
        }
        .badge-dark {
          background: rgba(18, 16, 14, 0.88) !important;
        }
        .card-wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          z-index: 2;
          box-shadow: var(--shadow-sm);
        }
        .card-wishlist-btn:hover {
          background: #FFFFFF;
          transform: scale(1.1);
        }
        .card-quick-view-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(26, 22, 20, 0.85);
          color: #FFFFFF;
          border: none;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          opacity: 0;
          transform: translateY(8px);
          transition: var(--transition);
          z-index: 2;
        }
        .product-card:hover .card-quick-view-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .card-details {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }
        .card-fabric-tag {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dot {
          color: var(--accent-gold);
        }
        .card-title {
          font-family: var(--font-serif);
          font-size: 16px;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 2px;
        }
        .card-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 2px;
        }
        .price-group {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .card-current-price {
          font-size: 17px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .card-old-price {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .save-badge {
          font-size: 10px;
          font-weight: 700;
          color: #2E7D32;
          background: rgba(46, 125, 50, 0.1);
          padding: 1px 6px;
          border-radius: 2px;
        }
        .custom-palette-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-top: 1px dashed var(--border-light);
          margin-top: 4px;
        }
        .palette-label {
          font-size: 10px;
          color: var(--text-muted);
        }
        .palette-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          display: inline-block;
        }
        .more-colors-count {
          font-size: 10px;
          color: var(--text-muted);
        }
        .custom-shade-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .custom-shade-btn:hover {
          text-decoration: underline;
        }
        .card-actions-row {
          margin-top: 10px;
        }
        .card-add-bag-btn {
          width: 100%;
          padding: 9px;
          font-size: 12px;
          border-radius: 2px;
        }
        .card-add-bag-btn.added {
          background: #2E7D32;
        }
      `}</style>
    </div>
  );
}
