import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, Sparkles, Check, ShoppingBag, ShieldCheck, Ruler, Palette, Edit3 } from 'lucide-react';

export default function ProductDetailModal() {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    wishlist,
    setCustomShadeProduct,
    openEditProduct
  } = useShop();

  if (!selectedProduct) return null;

  const [activeImageKey, setActiveImageKey] = useState('modelView');
  const [selectedSize, setSelectedSize] = useState(selectedProduct.sizeOptions?.[0] || 'Standard');
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wishlist.includes(selectedProduct.id);

  const galleryImages = [
    { key: 'modelView', label: 'On Model (AI Drape)', url: selectedProduct.images.modelView },
    { key: 'flatlayView', label: 'Studio Flat-lay & Flowers', url: selectedProduct.images.flatlayView },
    { key: 'swatchZoom', label: 'Texture Macro Zoom', url: selectedProduct.images.swatchZoom }
  ].filter(img => Boolean(img.url));

  const currentImageUrl = selectedProduct.images[activeImageKey] || selectedProduct.images.modelView;

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleOpenCustomShades = () => {
    setSelectedProduct(null);
    setCustomShadeProduct(selectedProduct);
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
      <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={() => setSelectedProduct(null)}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div className="detail-grid">
          {/* Left Gallery */}
          <div className="detail-gallery-col">
            <div className="main-image-viewport">
              <img 
                src={currentImageUrl} 
                alt={selectedProduct.name}
                className="viewport-img" 
              />
              {selectedProduct.tag && (
                <span 
                  className="viewport-tag"
                  style={{ backgroundColor: selectedProduct.tagColor || 'var(--accent-terracotta)' }}
                >
                  {selectedProduct.tag}
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            <div className="thumbnails-row">
              {galleryImages.map(img => (
                <button
                  key={img.key}
                  className={`thumb-btn ${activeImageKey === img.key ? 'active' : ''}`}
                  onClick={() => setActiveImageKey(img.key)}
                >
                  <img src={img.url} alt={img.label} className="thumb-img" />
                  <span className="thumb-label">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Information */}
          <div className="detail-info-col">
            <div className="detail-eyebrow">
              <span className="eyebrow-text">{selectedProduct.fabric}</span>
              <span className="dot">•</span>
              <span className="eyebrow-weight">{selectedProduct.drapeWeight}</span>
            </div>

            <h2 className="detail-title">{selectedProduct.name}</h2>

            <div className="detail-price-box">
              <span className="detail-price">{formatPrice(selectedProduct.price)}</span>
              {selectedProduct.originalPrice && (
                <span className="detail-old-price">{formatPrice(selectedProduct.originalPrice)}</span>
              )}
              {selectedProduct.bundleDiscountPercent && (
                <span className="detail-discount-tag">Save {selectedProduct.bundleDiscountPercent}%</span>
              )}
            </div>

            <p className="detail-description">{selectedProduct.description}</p>

            {/* Craft & Technical Highlights */}
            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-label">Drape Style:</span>
                <span className="spec-val">
                  <strong>{selectedProduct.drapeStyle}</strong>
                </span>
              </div>
              {selectedProduct.zariWork && (
                <div className="spec-row">
                  <span className="spec-label">Zari / Work:</span>
                  <span className="spec-val">{selectedProduct.zariWork}</span>
                </div>
              )}
              {selectedProduct.isPadded && (
                <div className="spec-row">
                  <span className="spec-label">Tailoring:</span>
                  <span className="spec-val">In-built padded cups + 2" side margin for easy alteration</span>
                </div>
              )}
            </div>

            {/* Custom Colourway Banner if applicable */}
            {selectedProduct.isCustomColorAvailable && (
              <div className="custom-shade-callout">
                <div className="callout-content">
                  <Palette size={16} className="text-gold" />
                  <div>
                    <strong>Colour Customisation Available</strong>
                    <p>Have this saree dyed in your personal shade of choice.</p>
                  </div>
                </div>
                <button 
                  onClick={handleOpenCustomShades}
                  className="btn btn-outline-gold callout-btn"
                >
                  Pick Shade
                </button>
              </div>
            )}

            {/* Sizing Selector */}
            {selectedProduct.sizeOptions && (
              <div className="size-selector-block">
                <div className="size-header">
                  <span className="size-label">Select Sizing:</span>
                  <span className="size-guide-hint">
                    <Ruler size={12} />
                    <span>Free custom sizing available</span>
                  </span>
                </div>
                <div className="size-chips-grid">
                  {selectedProduct.sizeOptions.map(sz => (
                    <button
                      key={sz}
                      className={`size-chip ${selectedSize === sz ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions">
              <button 
                onClick={handleAddToCart}
                className={`btn btn-primary detail-add-btn ${isAdded ? 'added' : ''}`}
              >
                {isAdded ? (
                  <>
                    <Check size={16} />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Bag • {formatPrice(selectedProduct.price)}</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`btn btn-outline detail-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                title="Wishlist"
              >
                <Heart size={18} fill={isWishlisted ? '#A34835' : 'none'} color={isWishlisted ? '#A34835' : '#1F1A17'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className="detail-perks">
              <div className="perk-item">
                <ShieldCheck size={14} className="text-gold" />
                <span>100% Authentic Handloom / Artisanal Zari</span>
              </div>
              <div className="perk-item">
                <Sparkles size={14} className="text-gold" />
                <span>Complimentary Fall &amp; Pico Stitching Included</span>
              </div>
            </div>

            {/* Atelier Admin Direct Edit */}
            <div className="detail-admin-edit-box">
              <button 
                type="button"
                onClick={() => {
                  const prod = selectedProduct;
                  setSelectedProduct(null);
                  openEditProduct(prod);
                }}
                className="btn btn-outline detail-edit-btn"
                title="Open product in Atelier Engine to update photos, price, or title"
              >
                <Edit3 size={13} />
                <span>Edit Product Details &amp; Photos in Atelier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-modal {
          background: #FFFFFF;
          border-radius: 4px;
          max-width: 980px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-subtle);
        }
        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--border-light);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          z-index: 10;
          transition: var(--transition);
        }
        .modal-close-btn:hover {
          background: var(--text-primary);
          color: #FFFFFF;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 36px;
          padding: 32px;
        }
        .detail-gallery-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .main-image-viewport {
          position: relative;
          aspect-ratio: 4/5;
          border-radius: 3px;
          overflow: hidden;
          background: #EAE3D6;
          border: 1px solid var(--border-light);
        }
        .viewport-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }
        .viewport-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 2px;
        }
        .thumbnails-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .thumb-btn {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 2px;
          padding: 4px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: var(--transition);
        }
        .thumb-btn.active {
          border-color: var(--accent-terracotta);
          box-shadow: 0 0 0 1px var(--accent-terracotta);
        }
        .thumb-img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 2px;
        }
        .thumb-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: center;
        }
        .detail-info-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .detail-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .detail-title {
          font-family: var(--font-serif);
          font-size: 24px;
          color: var(--text-primary);
          line-height: 1.25;
        }
        .detail-price-box {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .detail-price {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .detail-old-price {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .detail-discount-tag {
          font-size: 11px;
          font-weight: 700;
          color: #2E7D32;
          background: rgba(46, 125, 50, 0.1);
          padding: 2px 8px;
          border-radius: 2px;
        }
        .detail-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px;
          background: var(--bg-primary);
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
          font-size: 12px;
        }
        .spec-row {
          display: flex;
          gap: 8px;
        }
        .spec-label {
          color: var(--text-muted);
          min-width: 90px;
        }
        .spec-val {
          color: var(--text-primary);
        }
        .custom-shade-callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(197, 160, 89, 0.1);
          border: 1px solid var(--border-gold);
          border-radius: 3px;
          gap: 12px;
        }
        .callout-content {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
        }
        .callout-content p {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .callout-btn {
          font-size: 11px;
          padding: 6px 12px;
          white-space: nowrap;
        }
        .size-selector-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .size-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .size-label {
          font-weight: 600;
          color: var(--text-primary);
        }
        .size-guide-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--accent-terracotta);
        }
        .size-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .size-chip {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          border-radius: 2px;
          cursor: pointer;
          transition: var(--transition);
        }
        .size-chip:hover {
          border-color: var(--accent-terracotta);
        }
        .size-chip.active {
          background: var(--text-primary);
          color: #FFFFFF;
          border-color: var(--text-primary);
        }
        .detail-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .detail-add-btn {
          flex-grow: 1;
          padding: 14px;
          font-size: 14px;
        }
        .detail-wishlist-btn {
          padding: 14px 18px;
        }
        .detail-perks {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-muted);
        }
        .perk-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-admin-edit-box {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed var(--border-light);
        }
        .detail-edit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-terracotta);
          border-color: rgba(163, 72, 53, 0.3);
          background: #FAF6EF;
          padding: 8px 12px;
        }
        .detail-edit-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        @media (max-width: 820px) {
          .detail-grid {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
