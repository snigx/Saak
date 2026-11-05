import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useOverlay } from '../hooks/useOverlay';
import { getSizeSurcharge, requiresSizeChoice } from '../utils/pricing';
import { X, Heart, Sparkles, Check, ShoppingBag, ShieldCheck, Ruler, Palette, Edit3, Share2, ChevronLeft, ChevronRight, Camera, Layers, RotateCcw } from 'lucide-react';
import { getDisplayTag } from '../utils/tags';
import OfferPrice from './OfferPrice';

export default function ProductDetailModal() {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    wishlist,
    setCustomShadeProduct,
    openEditProduct,
    openPolicyModal
  } = useShop();
  const { isAdmin } = useAuth();

  useOverlay(Boolean(selectedProduct), () => setSelectedProduct(null));

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photoFilterTab, setPhotoFilterTab] = useState('all'); // 'all', 'model', 'flatlay'
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [isAdded, setIsAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Automatically reset to the primary On-Muse photo when modal opens or product changes
  useEffect(() => {
    if (selectedProduct) {
      setActivePhotoIndex(0);
      setPhotoFilterTab('all');
      // Fitted pieces start unselected so shoppers never silently get the first size
      setSelectedSize(requiresSizeChoice(selectedProduct) ? '' : (selectedProduct.sizeOptions?.[0] || 'Standard'));
      setSizeError(false);
    }
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.includes(selectedProduct.id);

  // Group photos into multiple model photos & multiple flat-lay photos
  const modelPhotos = selectedProduct.images?.modelPhotos || [selectedProduct.images?.modelView].filter(Boolean);
  const flatlayPhotos = selectedProduct.images?.flatlayPhotos || [selectedProduct.images?.flatlayView, selectedProduct.images?.swatchZoom].filter(Boolean);

  const allPhotos = [
    ...modelPhotos.map((url, idx) => ({ url, type: 'model', label: `On model (${idx + 1})` })),
    ...flatlayPhotos.map((url, idx) => ({ url, type: 'flatlay', label: `Fabric detail (${idx + 1})` }))
  ];

  // If activePhotoIndex is out of range, fallback
  const currentPhoto = allPhotos[activePhotoIndex] || allPhotos[0] || { url: selectedProduct.images?.modelView, type: 'model', label: 'On model' };

  const visiblePhotos = photoFilterTab === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.type === photoFilterTab);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart(selectedProduct, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${encodeURIComponent(selectedProduct.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: selectedProduct.name, text: `${selectedProduct.name} — Saak by Aprajita`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      // Share sheet dismissed or clipboard blocked — nothing to do
    }
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
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="detail-grid">
          {/* Left Gallery */}
          <div className="detail-gallery-col">
            {/* Photo Category Filter Tabs */}
            <div className="gallery-filter-tabs">
              <button 
                type="button"
                className={`filter-tab-pill ${photoFilterTab === 'all' ? 'active' : ''}`}
                onClick={() => setPhotoFilterTab('all')}
              >
                <span>All ({allPhotos.length})</span>
              </button>
              {modelPhotos.length > 0 && (
                <button 
                  type="button"
                  className={`filter-tab-pill ${photoFilterTab === 'model' ? 'active' : ''}`}
                  onClick={() => {
                    setPhotoFilterTab('model');
                    const firstModelIdx = allPhotos.findIndex(p => p.type === 'model');
                    if (firstModelIdx !== -1) setActivePhotoIndex(firstModelIdx);
                  }}
                >
                  <Camera size={12} />
                  <span>On model ({modelPhotos.length})</span>
                </button>
              )}
              {flatlayPhotos.length > 0 && (
                <button 
                  type="button"
                  className={`filter-tab-pill ${photoFilterTab === 'flatlay' ? 'active' : ''}`}
                  onClick={() => {
                    setPhotoFilterTab('flatlay');
                    const firstFlatlayIdx = allPhotos.findIndex(p => p.type === 'flatlay');
                    if (firstFlatlayIdx !== -1) setActivePhotoIndex(firstFlatlayIdx);
                  }}
                >
                  <Layers size={12} />
                  <span>Fabric ({flatlayPhotos.length})</span>
                </button>
              )}
            </div>

            {/* Main Image Viewport with Side Navigation */}
            <div className="main-image-viewport">
              <img 
                src={currentPhoto.url} 
                alt={selectedProduct.name}
                className="viewport-img" 
              />

              {/* Viewport Side Navigation Arrows */}
              {allPhotos.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="modal-nav-arrow arrow-left"
                    onClick={handlePrevPhoto}
                    aria-label="Previous photo"
                    title="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    type="button"
                    className="modal-nav-arrow arrow-right"
                    onClick={handleNextPhoto}
                    aria-label="Next photo"
                    title="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Top Badges */}
              <div className="viewport-badges-row">
                {getDisplayTag(selectedProduct.tag) && (
                  <span className="saak-tag">{getDisplayTag(selectedProduct.tag)}</span>
                )}
                
                {/* Photo Type Indicator */}
                <span className={`viewport-type-pill ${currentPhoto.type === 'model' ? 'pill-model' : 'pill-flatlay'}`}>
                  {currentPhoto.type === 'model' ? (
                    <>
                      <Camera size={11} />
                      <span>On model • {modelPhotos.indexOf(currentPhoto.url) + 1}/{modelPhotos.length}</span>
                    </>
                  ) : (
                    <>
                      <Layers size={11} />
                      <span>Fabric • {flatlayPhotos.indexOf(currentPhoto.url) + 1}/{flatlayPhotos.length}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="thumbnails-scroll-strip">
              {visiblePhotos.map((img, idx) => {
                const globalIndex = allPhotos.findIndex(p => p.url === img.url);
                const isActive = activePhotoIndex === globalIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActivePhotoIndex(globalIndex)}
                    title={img.label}
                  >
                    <img src={img.url} alt={img.label} className="thumb-img" />
                    <span className={`thumb-badge ${img.type === 'model' ? 'thumb-badge-model' : 'thumb-badge-flatlay'}`}>
                      {img.type === 'model' ? 'Model' : 'Fabric'}
                    </span>
                  </button>
                );
              })}
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
              <OfferPrice className="detail-price" price={selectedProduct.price} basePrice={selectedProduct.basePrice} />
              {selectedProduct.offer && (
                <div className="detail-offer-line">
                  <span className="saak-tag is-offer">
                    {selectedProduct.offer.label
                      ? `${selectedProduct.offer.label} · ${selectedProduct.offer.short}`
                      : selectedProduct.offer.short}
                  </span>
                  <span className="detail-offer-meta">
                    You save {formatPrice(selectedProduct.offer.saved)}
                    {selectedProduct.offer.endsLabel && ` · ${selectedProduct.offer.endsLabel}`}
                  </span>
                </div>
              )}
            </div>

            <p className="detail-description">{selectedProduct.description}</p>

            {/* Craft & Technical Highlights */}
            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-label">Drape:</span>
                <span className="spec-val">
                  <strong>{selectedProduct.drapeStyle}</strong>
                </span>
              </div>
              {selectedProduct.zariWork && (
                <div className="spec-row">
                  <span className="spec-label">Work:</span>
                  <span className="spec-val">{selectedProduct.zariWork}</span>
                </div>
              )}
              {selectedProduct.isPadded && (
                <div className="spec-row">
                  <span className="spec-label">Fit:</span>
                  <span className="spec-val">Padded cups, with 2" side margin to alter</span>
                </div>
              )}
            </div>

            {/* Custom Colourway Banner if applicable */}
            {selectedProduct.isCustomColorAvailable && (
              <div className="custom-shade-callout">
                <div className="callout-content">
                  <Palette size={16} className="text-gold" />
                  <div>
                    <strong>Want another colour?</strong>
                    <p>We can dye this {selectedProduct.category === 'blouses' ? 'blouse' : 'saree'} in a shade you choose.</p>
                  </div>
                </div>
                <button 
                  onClick={handleOpenCustomShades}
                  className="btn btn-outline-gold callout-btn"
                >
                  Pick colour
                </button>
              </div>
            )}

            {/* Sizing Selector */}
            {selectedProduct.sizeOptions && (
              <div className="size-selector-block">
                <div className="size-header">
                  <span className="size-label">Size</span>
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
                      onClick={() => { setSelectedSize(sz); setSizeError(false); }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="size-error-text" role="alert">Please select a size to continue.</p>
                )}
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
                    <span>Added to bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to bag • {formatPrice(selectedProduct.price + getSizeSurcharge(selectedSize))}</span>
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

              <button 
                type="button"
                onClick={handleShare}
                className="btn btn-outline detail-wishlist-btn"
                title={linkCopied ? 'Link copied' : 'Share this piece'}
                aria-label={linkCopied ? 'Link copied' : 'Share this piece'}
              >
                {linkCopied ? <Check size={18} color="#1F1A17" /> : <Share2 size={18} color="#1F1A17" />}
              </button>
            </div>

            {/* Guarantees */}
            <div className="detail-perks">
              <div className="perk-item">
                <ShieldCheck size={14} className="text-gold" />
                <span>Authentic handloom and zari</span>
              </div>
              <div className="perk-item">
                <Sparkles size={14} className="text-gold" />
                <span>Free fall &amp; pico stitching</span>
              </div>
              <button 
                type="button" 
                onClick={openPolicyModal} 
                className="perk-item perk-policy-btn"
                title="Returns, exchanges &amp; refunds"
              >
                <RotateCcw size={14} className="text-gold" />
                <span>Returns &amp; exchanges (48-hour window)</span>
              </button>
            </div>

            {/* Admin Direct Edit */}
            {isAdmin && (
            <div className="detail-admin-edit-box">
              <button 
                type="button"
                onClick={() => {
                  const prod = selectedProduct;
                  setSelectedProduct(null);
                  openEditProduct(prod);
                }}
                className="btn btn-outline detail-edit-btn"
                title="Edit this product's photos, price or name"
              >
                <Edit3 size={13} />
                <span>Edit product</span>
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .size-error-text {
          margin: 8px 0 0;
          font-size: var(--text-xs);
          color: var(--accent-terracotta);
        }
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
        /* Grid columns must be able to shrink below the thumbnail strip's width */
        .detail-grid > * {
          min-width: 0;
        }
        .detail-modal {
          overflow-x: hidden;
        }
        .detail-gallery-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .main-image-viewport {
          position: relative;
          aspect-ratio: 2/3; /* tall enough to show the full drape and pallu */
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
          color: #FFFFFF;
          font-size: var(--text-xs);
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 2px;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .gallery-filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 2px;
          flex-wrap: wrap;
        }
        .filter-tab-pill {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          padding: 5px 10px;
          font-size: var(--text-xs);
          font-weight: 600;
          border-radius: 14px;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-tab-pill:hover {
          border-color: var(--accent-terracotta);
          color: var(--text-primary);
        }
        .filter-tab-pill.active {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }
        .main-image-viewport {
          position: relative;
          aspect-ratio: 2/3; /* tall enough to show the full drape and pallu */
          max-height: 66vh;
          border-radius: 3px;
          overflow: hidden;
          background: #EAE3D6;
          border: 1px solid var(--border-light);
        }
        .modal-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(0, 0, 0, 0.08);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          z-index: 5;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .modal-nav-arrow:hover {
          background: #FFFFFF;
          transform: translateY(-50%) scale(1.08);
        }
        .modal-nav-arrow.arrow-left {
          left: 10px;
        }
        .modal-nav-arrow.arrow-right {
          right: 10px;
        }
        .viewport-badges-row {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 4;
          pointer-events: none;
        }
        .viewport-tag {
          color: #FFFFFF;
          font-size: var(--text-xs);
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 2px;
          letter-spacing: 0.03em;
        }
        .viewport-type-pill {
          background: rgba(26, 22, 20, 0.82);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .viewport-type-pill.pill-model {
          border: 1px solid rgba(163, 72, 53, 0.5);
        }
        .viewport-type-pill.pill-flatlay {
          border: 1px solid rgba(197, 160, 89, 0.5);
        }
        .thumbnails-scroll-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .thumb-btn {
          position: relative;
          background: #FAF6EF;
          border: 1.5px solid var(--border-light);
          border-radius: 2px;
          padding: 3px;
          cursor: pointer;
          flex: 0 0 76px;
          width: 76px;
          transition: var(--transition);
        }
        .thumb-btn.active {
          border-color: var(--accent-terracotta);
          box-shadow: 0 0 0 1px var(--accent-terracotta);
        }
        .thumb-img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-radius: 1px;
          display: block;
        }
        .thumb-badge {
          position: absolute;
          bottom: 5px;
          left: 5px;
          right: 5px;
          font-size: var(--text-xs);
          font-weight: 700;
          text-align: center;
          padding: 2px 0;
          border-radius: 2px;
          letter-spacing: 0.04em;
        }
        .thumb-badge-model {
          background: rgba(163, 72, 53, 0.9);
          color: #FFFFFF;
        }
        .thumb-badge-flatlay {
          background: rgba(45, 38, 33, 0.88);
          color: var(--accent-gold);
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
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .detail-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          line-height: 1.25;
        }
        .detail-price-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .detail-offer-line {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px 10px;
        }
        .detail-offer-meta {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .detail-price {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .detail-description {
          font-size: var(--text-base);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
        }
        .callout-content p {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .callout-btn {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
        }
        .size-label {
          font-weight: 600;
          color: var(--text-primary);
        }
        .size-guide-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-base);
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
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .perk-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .perk-policy-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          text-decoration: underline;
          text-decoration-color: rgba(197, 160, 89, 0.4);
          text-underline-offset: 3px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .perk-policy-btn:hover {
          color: var(--accent-terracotta);
          text-decoration-color: var(--accent-terracotta);
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
          font-size: var(--text-xs);
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
        @media (max-width: 600px) {
          /* Phones: full-screen sheet with the buy button pinned at the bottom */
          .detail-modal {
            position: fixed;
            inset: 0;
            width: 100%;
            max-width: 100%;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
            border: none;
            margin: 0;
          }
          .detail-grid {
            padding: 14px 10px;
            gap: 14px;
          }
          .main-image-viewport {
            aspect-ratio: 3/4;
            max-height: 70vh;
            border-radius: 2px;
          }
          .gallery-filter-tabs {
            gap: 4px;
          }
          .filter-tab-pill {
            padding: 4px 8px;
            font-size: var(--text-xs);
          }
          .modal-close-btn {
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            z-index: 10;
          }
          .detail-title {
            font-size: var(--text-xl);
            line-height: 1.25;
          }
          .detail-price {
            font-size: var(--text-xl);
          }
          .size-pills-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .size-pill-btn {
            padding: 7px 10px;
            font-size: var(--text-xs);
          }
          .detail-actions {
            position: sticky;
            bottom: 0;
            z-index: 5;
            gap: 8px;
            margin: 8px -10px 0;
            padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
            background: #FFFFFF;
            border-top: 1px solid var(--border-light);
          }
          .detail-add-btn {
            padding: 14px 10px;
            font-size: var(--text-sm);
          }
          .detail-wishlist-btn {
            padding: 12px 14px;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
}
