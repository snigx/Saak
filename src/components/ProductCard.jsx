import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, Sparkles, Palette, ShoppingBag, Check, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';

export default function ProductCard({ product }) {
  const { 
    formatPrice, 
    toggleWishlist, 
    wishlist, 
    setSelectedProduct, 
    setCustomShadeProduct,
    addToCart,
    openEditProduct 
  } = useShop();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  // Collect clean isolated gallery images
  const galleryImages = (product.images.gallery && product.images.gallery.length > 0)
    ? product.images.gallery
    : [
        product.images.modelView,
        product.images.flatlayView,
        product.images.swatchZoom
      ].filter(Boolean);

  const activeImage = galleryImages[currentImageIndex] || product.images.modelView;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

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
      {/* Media Container with Carousel Slider */}
      <div className="card-media-wrapper">
        <img 
          src={activeImage} 
          alt={`${product.name} - View ${currentImageIndex + 1}`}
          className="product-main-img" 
        />

        {/* Carousel Side Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button 
              className="carousel-arrow arrow-left"
              onClick={handlePrevImage}
              aria-label="Previous Photo"
              title="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="carousel-arrow arrow-right"
              onClick={handleNextImage}
              aria-label="Next Photo"
              title="Next photo"
            >
              <ChevronRight size={18} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="carousel-dots-row" onClick={(e) => e.stopPropagation()}>
              {galleryImages.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`carousel-dot ${currentImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          </>
        )}

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

          {/* Photo type indicator badge */}
          {galleryImages.length > 1 && (
            <span className={`card-photo-type-pill ${(product.images?.modelPhotos?.includes(activeImage) || currentImageIndex < (product.images?.modelPhotos?.length || 1)) ? 'type-muse' : 'type-flatlay'}`}>
              {(product.images?.modelPhotos?.includes(activeImage) || currentImageIndex < (product.images?.modelPhotos?.length || 1)) ? 'On Muse' : 'Flat-lay'} • {currentImageIndex + 1}/{galleryImages.length}
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

        {/* Quick View & Edit Actions on Hover */}
        <div className="card-hover-actions">
          <button 
            className="card-hover-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            title="Quick View"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
          <button 
            className="card-hover-action-btn card-edit-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              openEditProduct(product);
            }}
            title="Edit product price, title & photos"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
        </div>
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
          transition: opacity 0.3s ease, transform 0.6s ease;
        }
        .product-card:hover .product-main-img {
          transform: scale(1.03);
        }

        /* Side Navigation Arrows */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          z-index: 5;
          opacity: 0;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .product-card:hover .carousel-arrow {
          opacity: 1;
        }
        .carousel-arrow:hover {
          background: #FFFFFF;
          color: var(--accent-terracotta);
          transform: translateY(-50%) scale(1.12);
        }
        .arrow-left {
          left: 10px;
        }
        .arrow-right {
          right: 10px;
        }

        /* Dots Indicator */
        .carousel-dots-row {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(26, 22, 20, 0.5);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 12px;
          z-index: 5;
        }
        .carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: var(--transition);
        }
        .carousel-dot.active {
          background: #FFFFFF;
          width: 14px;
          border-radius: 4px;
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
        .card-photo-type-pill {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          backdrop-filter: blur(4px);
          letter-spacing: 0.03em;
          width: fit-content;
        }
        .card-photo-type-pill.type-muse {
          background: rgba(163, 72, 53, 0.88);
          color: #FFFFFF;
        }
        .card-photo-type-pill.type-flatlay {
          background: rgba(31, 26, 23, 0.85);
          color: var(--accent-gold);
          border: 1px solid rgba(197, 160, 89, 0.4);
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
        .card-hover-actions {
          position: absolute;
          bottom: 34px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transform: translateY(8px);
          transition: var(--transition);
          z-index: 4;
        }
        .product-card:hover .card-hover-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .card-hover-action-btn {
          background: rgba(26, 22, 20, 0.88);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: var(--transition);
          backdrop-filter: blur(4px);
        }
        .card-hover-action-btn:hover {
          background: var(--text-primary);
          color: #FFFFFF;
        }
        .card-edit-action-btn {
          background: rgba(163, 72, 53, 0.9);
          border-color: rgba(197, 160, 89, 0.4);
        }
        .card-edit-action-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
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
        @media (max-width: 768px) {
          .carousel-arrow {
            opacity: 1;
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
