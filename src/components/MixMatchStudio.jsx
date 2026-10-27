import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Check, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const COMBINATION_ASSETS = {
  'sunset-orange-tissue_the-gold-corset': {
    model: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/sunset-orange-tissue_the-gold-corset_model.jpg',
    flatlay: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/sunset-orange-tissue_the-gold-corset_flatlay.jpg',
    styling: "Aprajita's Styling: Sunset Orange Drape + Heavy Zardozi Corset"
  },
  'sunset-orange-tissue_the-ivory-raw-silk-blouse': {
    model: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/sunset-orange-tissue_the-ivory-raw-silk-blouse_model.jpg',
    flatlay: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/sunset-orange-tissue_the-ivory-raw-silk-blouse_flatlay.jpg',
    styling: "Aprajita's Styling: Sunset Orange Shimmer + Minimalist Ivory Raw Silk V-Neck"
  },
  'olive-bloom-tissue_the-gold-corset': {
    model: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/olive-bloom-tissue_the-gold-corset_model.jpg',
    flatlay: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/olive-bloom-tissue_the-gold-corset_flatlay.jpg',
    styling: "Aprajita's Styling: Olive Sage Shimmer + Sculpted Antique Gold Corset"
  },
  'olive-bloom-tissue_the-ivory-raw-silk-blouse': {
    model: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/olive-bloom-tissue_the-ivory-raw-silk-blouse_model.jpg',
    flatlay: 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/combinations/olive-bloom-tissue_the-ivory-raw-silk-blouse_flatlay.jpg',
    styling: "Aprajita's Styling: Olive Bloom Tissue + Tailored Ivory Raw Silk V-Neck"
  }
};

export default function MixMatchStudio() {
  const { products, addDuoToCart, addToCart, formatPrice, toggleWishlist, wishlist } = useShop();

  const sarees = products.filter(p => p.category === 'sarees');
  const blouses = products.filter(p => p.category === 'blouses');

  const [selectedSareeId, setSelectedSareeId] = useState('sunset-orange-tissue');
  const [selectedBlouseId, setSelectedBlouseId] = useState('the-gold-corset');
  const [viewMode, setViewMode] = useState('model'); // 'model' or 'flatlay'

  const selectedSaree = sarees.find(s => s.id === selectedSareeId) || sarees[0];
  const selectedBlouse = blouses.find(b => b.id === selectedBlouseId) || blouses[0];

  const comboKey = `${selectedSaree?.id}_${selectedBlouse?.id}`;
  const currentCombo = COMBINATION_ASSETS[comboKey];

  const currentPreviewImage = viewMode === 'model'
    ? (currentCombo?.model || selectedSaree?.images.modelView)
    : (currentCombo?.flatlay || selectedSaree?.images.flatlayView);

  const stylingNote = currentCombo?.styling 
    || `Aprajita's Styling: ${selectedSaree?.name} + ${selectedBlouse?.name}`;

  const originalTotal = (selectedSaree?.price || 0) + (selectedBlouse?.price || 0);
  const bundleDiscount = Math.round(originalTotal * 0.1); // 10%
  const finalBundlePrice = originalTotal - bundleDiscount;

  const handleAddDuo = () => {
    if (selectedSaree && selectedBlouse) {
      addDuoToCart(selectedSaree, selectedBlouse);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#A34835', '#C5A059', '#FAF6EF', '#8C3B2B']
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  return (
    <section id="mix-match-studio" className="studio-section">
      <div className="container">
        {/* Section Header */}
        <div className="studio-header">
          <div className="studio-tag">
            <Sparkles size={13} className="text-gold" />
            <span>THE SAAK STYLING CANVAS</span>
          </div>
          <h2 className="studio-title">Mix &amp; Match Studio</h2>
          <p className="studio-subtitle">
            Pair our fluid minimalist sarees with heavy statement corsets or tailored silk blouses. Experience the contrast in real-time and unlock a <strong>10% Duo Privilege</strong>.
          </p>
        </div>

        {/* The 3-Column Interactive Canvas */}
        <div className="studio-canvas-grid">
          {/* Column 1: Saree Selector */}
          <div className="studio-column saree-column">
            <div className="column-header">
              <span className="step-num">01</span>
              <div>
                <h3 className="column-title">Select Saree</h3>
                <span className="column-hint">Fluid tissues &amp; pre-draped crepe</span>
              </div>
            </div>

            <div className="items-selector-list">
              {sarees.map(saree => {
                const isSelected = saree.id === selectedSareeId;
                return (
                  <div 
                    key={saree.id}
                    className={`selector-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedSareeId(saree.id)}
                  >
                    <div className="item-thumbnail-wrap">
                      <img 
                        src={saree.images.flatlayView || saree.images.modelView} 
                        alt={saree.name}
                        className="item-thumbnail" 
                      />
                      {isSelected && (
                        <div className="item-selected-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div className="item-info">
                      <h4 className="item-name">{saree.name}</h4>
                      <div className="item-meta">
                        <span className="item-fabric">{saree.fabric}</span>
                        <span className="item-price">{formatPrice(saree.price)}</span>
                      </div>
                      <span className="mini-badge">Fluid Drape</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Center Live Preview */}
          <div className="studio-column preview-column">
            <div className="preview-card-frame">
              {/* Image Toggle on Model vs Flatlay */}
              <div className="preview-view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'model' ? 'active' : ''}`}
                  onClick={() => setViewMode('model')}
                >
                  On Model (AI Drape)
                </button>
                <button 
                  className={`view-btn ${viewMode === 'flatlay' ? 'active' : ''}`}
                  onClick={() => setViewMode('flatlay')}
                >
                  Fabric &amp; Details
                </button>
              </div>

              <div className="preview-image-container">
                <img 
                  key={`${comboKey}_${viewMode}`}
                  src={currentPreviewImage} 
                  alt={`${selectedSaree?.name} with ${selectedBlouse?.name}`}
                  className="preview-main-img"
                />

                <div className="preview-styling-chip">
                  <Sparkles size={12} className="text-gold" />
                  <span>{stylingNote}</span>
                </div>
              </div>

              {/* Saree & Blouse Chips */}
              <div className="preview-duo-chips">
                <div className="preview-chip">
                  <span className="chip-label">Saree:</span>
                  <span className="chip-val">{selectedSaree?.name}</span>
                </div>
                <span className="chip-plus">+</span>
                <div className="preview-chip">
                  <span className="chip-label">Blouse:</span>
                  <span className="chip-val">{selectedBlouse?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Blouse Selector & Pricing Bundle Box */}
          <div className="studio-column blouse-column">
            <div className="column-header">
              <span className="step-num">02</span>
              <div>
                <h3 className="column-title">Pair With Blouse</h3>
                <span className="column-hint">Ornate boned corsets &amp; raw silk blouses</span>
              </div>
            </div>

            <div className="items-selector-list">
              {blouses.map(blouse => {
                const isSelected = blouse.id === selectedBlouseId;
                return (
                  <div 
                    key={blouse.id}
                    className={`selector-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedBlouseId(blouse.id)}
                  >
                    <div className="item-thumbnail-wrap">
                      <img 
                        src={blouse.images.modelView} 
                        alt={blouse.name}
                        className="item-thumbnail" 
                      />
                      {isSelected && (
                        <div className="item-selected-badge">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div className="item-info">
                      <h4 className="item-name">{blouse.name}</h4>
                      <div className="item-meta">
                        <span className="item-fabric">{blouse.fabric}</span>
                        <span className="item-price">{formatPrice(blouse.price)}</span>
                      </div>
                      <span className="mini-badge-gold">
                        {blouse.subCategory === 'corset' ? 'Padded Boned Fit' : 'Tailored V-Neck'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Price & Checkout Box */}
            <div className="bundle-summary-card">
              <div className="bundle-header">
                <span className="bundle-badge">
                  <Sparkles size={11} />
                  <span>10% DUO PRIVILEGE</span>
                </span>
                <span className="bundle-save-text">Save {formatPrice(bundleDiscount)}</span>
              </div>

              <div className="bundle-price-row">
                <div className="price-breakdown">
                  <span className="strike-total">{formatPrice(originalTotal)}</span>
                  <span className="final-duo-price">{formatPrice(finalBundlePrice)}</span>
                </div>
                <span className="set-label">Complete 2-Piece Set</span>
              </div>

              <p className="bundle-perk-note">
                Includes complimentary pre-stitched fall/pico + tailored blouse fit.
              </p>

              <button 
                onClick={handleAddDuo}
                className="btn btn-primary add-duo-btn"
              >
                <span>Add Complete Duo to Bag</span>
                <ArrowRight size={16} />
              </button>

              <div className="buy-individual-row">
                <button 
                  onClick={() => selectedSaree && addToCart(selectedSaree)}
                  className="buy-single-link"
                >
                  Buy Saree Only ({formatPrice(selectedSaree?.price)})
                </button>
                <span className="dot">•</span>
                <button 
                  onClick={() => selectedBlouse && addToCart(selectedBlouse)}
                  className="buy-single-link"
                >
                  Buy {selectedBlouse?.subCategory === 'corset' ? 'Corset' : 'Blouse'} Only ({formatPrice(selectedBlouse?.price)})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .studio-section {
          padding: 72px 0;
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
        }
        .studio-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 48px auto;
        }
        .studio-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--accent-gold);
          margin-bottom: 10px;
        }
        .studio-title {
          font-size: clamp(28px, 3.5vw, 42px);
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .studio-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .studio-canvas-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr 1fr;
          gap: 28px;
          align-items: start;
        }
        .studio-column {
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 20px;
        }
        .column-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .step-num {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 600;
          color: var(--accent-terracotta);
          line-height: 1;
        }
        .column-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .column-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .items-selector-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 360px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .selector-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 10px;
          border-radius: 3px;
          cursor: pointer;
          transition: var(--transition);
        }
        .selector-item-card:hover {
          border-color: var(--accent-terracotta);
          transform: translateX(2px);
        }
        .selector-item-card.selected {
          border-color: var(--accent-terracotta);
          background: #FDF9F5;
          box-shadow: 0 2px 8px rgba(163, 72, 53, 0.12);
        }
        .item-thumbnail-wrap {
          position: relative;
          width: 58px;
          height: 68px;
          border-radius: 2px;
          overflow: hidden;
          flex-shrink: 0;
          background: #EAE3D6;
        }
        .item-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-selected-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .item-name {
          font-family: var(--font-serif);
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.25;
        }
        .item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .item-fabric {
          font-size: 11px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 120px;
        }
        .item-price {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .mini-badge {
          align-self: flex-start;
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-terracotta);
          background: rgba(163, 72, 53, 0.08);
          padding: 1px 5px;
          border-radius: 2px;
          margin-top: 3px;
        }
        .mini-badge-gold {
          align-self: flex-start;
          font-size: 9px;
          font-weight: 700;
          color: #8C6D2B;
          background: rgba(197, 160, 89, 0.15);
          padding: 1px 5px;
          border-radius: 2px;
          margin-top: 3px;
        }
        /* Center Preview Column */
        .preview-column {
          background: #FAF6EF;
          padding: 16px;
        }
        .preview-card-frame {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .preview-view-toggle {
          display: flex;
          background: #EFE8DC;
          padding: 3px;
          border-radius: 20px;
        }
        .view-btn {
          flex: 1;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-radius: 18px;
          cursor: pointer;
          transition: var(--transition);
        }
        .view-btn.active {
          background: #FFFFFF;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .preview-image-container {
          position: relative;
          aspect-ratio: 4/5.2;
          border-radius: 3px;
          overflow: hidden;
          background: #EAE3D6;
          border: 1px solid var(--border-gold);
          box-shadow: var(--shadow-md);
        }
        .preview-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.4s ease;
        }
        .preview-styling-chip {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          padding: 8px 12px;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--border-gold);
        }
        .preview-duo-chips {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          padding: 8px 12px;
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
          font-size: 11px;
        }
        .preview-chip {
          display: flex;
          gap: 4px;
        }
        .chip-label {
          color: var(--text-muted);
        }
        .chip-val {
          font-weight: 600;
          color: var(--text-primary);
        }
        .chip-plus {
          color: var(--accent-terracotta);
          font-weight: 700;
        }
        /* Bundle Summary Box */
        .bundle-summary-card {
          margin-top: 18px;
          background: #FFFFFF;
          border: 1px solid var(--border-gold);
          border-radius: 3px;
          padding: 16px;
          box-shadow: var(--shadow-sm);
        }
        .bundle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .bundle-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(163, 72, 53, 0.1);
          color: var(--accent-terracotta);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          border-radius: 2px;
        }
        .bundle-save-text {
          font-size: 11px;
          font-weight: 700;
          color: #2E7D32;
        }
        .bundle-price-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .price-breakdown {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .strike-total {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .final-duo-price {
          font-size: 22px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .set-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .bundle-perk-note {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .add-duo-btn {
          width: 100%;
          padding: 12px;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .buy-individual-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
        }
        .buy-single-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          text-decoration: underline;
          cursor: pointer;
          font-size: 11px;
        }
        .buy-single-link:hover {
          color: var(--accent-terracotta);
        }
        .dot {
          color: var(--text-muted);
        }
        @media (max-width: 1024px) {
          .studio-canvas-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .preview-column {
            grid-column: span 2;
            order: -1;
          }
          .preview-image-container {
            max-height: 480px;
            margin: 0 auto;
            max-width: 440px;
          }
        }
        @media (max-width: 768px) {
          .studio-section {
            padding: 50px 0;
          }
          .studio-header {
            margin-bottom: 28px;
          }
          .studio-canvas-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .preview-column {
            grid-column: span 1;
            padding: 12px;
          }
          .studio-column {
            padding: 14px;
          }
          .items-selector-list {
            max-height: 260px;
          }
          .preview-image-container {
            max-width: 100%;
            aspect-ratio: 4/5;
          }
        }
      `}</style>
    </section>
  );
}
