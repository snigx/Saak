import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  const { setActiveCategory, addDuoToCart, products, setSelectedProduct, addToCart } = useShop();

  const handleExploreTissue = () => {
    setActiveCategory('tissue');
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStudioScroll = () => {
    const studioEl = document.getElementById('mix-match-studio');
    if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopIconicDuo = () => {
    // 1. Look for the curated Signature Duo product
    const duoProduct = products.find(p => p.id === 'signature-duo-black-gold') 
      || products.find(p => p.category === 'sets');

    if (duoProduct) {
      setSelectedProduct(duoProduct);
      return;
    }

    // 2. Fallback: pair gold corset with available saree
    const goldCorset = products.find(p => p.id === 'the-gold-corset');
    const saree = products.find(p => p.category === 'sarees');
    if (goldCorset && saree) {
      addDuoToCart(saree, goldCorset);
    }
  };

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* Left Editorial Narrative */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-badge">
              <Sparkles size={12} className="text-gold" />
              <span>THE FESTIVE ATELIER</span>
            </span>
            <span className="eyebrow-line"></span>
          </div>

          <h1 className="hero-title">
            Understated Drapes. <br />
            <span className="hero-title-italic">Sculpted Statements.</span>
          </h1>

          <p className="hero-description">
            Fluid crushed metallic shimmer tissue and pure crepe drapes, paired with hand-embroidered antique gold zardozi corsets. Effortless modern luxury crafted for the women of today.
          </p>

          <div className="hero-ctas">
            <button onClick={handleExploreTissue} className="btn btn-primary">
              <span>The Tissue Series</span>
              <ArrowRight size={16} />
            </button>
            <button onClick={handleStudioScroll} className="btn btn-outline-gold studio-cta-btn">
              <Sparkles size={15} className="text-gold" />
              <span>Mix &amp; Match Studio</span>
            </button>
          </div>

          {/* Key Brand Pillars */}
          <div className="hero-features-list">
            <div className="feature-item">
              <CheckCircle2 size={16} className="feature-icon" />
              <div>
                <strong>Featherlight Drapes</strong>
                <span>Fluid tissue &amp; pure crepe</span>
              </div>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={16} className="feature-icon" />
              <div>
                <strong>Sculpted Corset Fit</strong>
                <span>Padded boning, zero jewelry needed</span>
              </div>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={16} className="feature-icon" />
              <div>
                <strong>Custom Colourways</strong>
                <span>Tailored shades on request</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right High-Fashion Visual & Muse Showcase */}
        <div className="hero-visual-wrapper">
          <div className="hero-image-frame">
            <img 
              src="/assets/saak_muse_black_saree_gold_corset.jpg" 
              alt="Aprajita in Midnight Black Crepe Saree & Gold Zardozi Corset"
              className="hero-main-image"
            />
            <div className="hero-image-overlay"></div>

            {/* Floating Shoppable Duo Badge */}
            <div 
              className="hero-floating-card" 
              onClick={handleShopIconicDuo}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShopIconicDuo(); }}
            >
              <div className="floating-card-pill">
                <Sparkles size={11} className="text-gold" />
                <span>SIGNATURE DUO</span>
              </div>
              <h4 className="floating-card-title">Black Crepe + Gold Corset</h4>
              <p className="floating-card-subtitle">Fluid minimalist drape meets ornate royal corsetry.</p>
              <div className="floating-card-footer">
                <div className="floating-price">
                  <span className="price-current">₹8,460</span>
                  <span className="price-old">₹9,400</span>
                  <span className="discount-tag">Save 10%</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleShopIconicDuo(); }}
                  className="btn btn-dark floating-buy-btn"
                >
                  Shop The Set
                </button>
              </div>
            </div>
          </div>

          {/* Ambient Decorative Badge */}
          <div className="hero-texture-tag">
            <span>SUNLIT CRUSHED TISSUE &amp; ZARDOZI ATELIER</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 48px 0 64px 0;
          background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          border-bottom: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: center;
        }
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .eyebrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(163, 72, 53, 0.08);
          border: 1px solid rgba(163, 72, 53, 0.2);
          color: var(--accent-terracotta);
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          border-radius: 2px;
        }
        .eyebrow-line {
          height: 1px;
          flex-grow: 1;
          background: linear-gradient(90deg, rgba(163, 72, 53, 0.25) 0%, transparent 100%);
        }
        .hero-title {
          font-size: clamp(38px, 4.8vw, 58px);
          line-height: 1.12;
          color: var(--text-primary);
          margin-bottom: 20px;
          font-weight: 500;
        }
        .hero-title-italic {
          font-style: italic;
          color: var(--accent-terracotta);
        }
        .hero-description {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.68;
          max-width: 540px;
          margin-bottom: 32px;
        }
        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 44px;
          flex-wrap: wrap;
        }
        .studio-cta-btn {
          background: rgba(255, 255, 255, 0.8);
        }
        .hero-features-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border-subtle);
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .feature-icon {
          color: var(--accent-terracotta);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .feature-item div {
          display: flex;
          flex-direction: column;
        }
        .feature-item strong {
          font-size: 12px;
          color: var(--text-primary);
        }
        .feature-item span {
          font-size: 11px;
          color: var(--text-muted);
        }
        .hero-visual-wrapper {
          position: relative;
        }
        .hero-image-frame {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-subtle);
          aspect-ratio: 4/4.8;
          background: #EAE3D6;
        }
        .hero-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.6s ease;
        }
        .hero-main-image:hover {
          transform: scale(1.02);
        }
        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(26, 22, 20, 0.6) 100%);
          pointer-events: none;
        }
        .hero-floating-card {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          padding: 18px 20px;
          border-radius: 4px;
          border: 1px solid var(--border-gold);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hero-floating-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(31, 26, 23, 0.16);
        }
        .floating-card-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .floating-card-title {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .floating-card-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .floating-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .floating-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .price-current {
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .price-old {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .discount-tag {
          font-size: 10px;
          font-weight: 700;
          color: #2E7D32;
          background: rgba(46, 125, 50, 0.1);
          padding: 1px 5px;
          border-radius: 2px;
        }
        .floating-buy-btn {
          padding: 8px 16px;
          font-size: 12px;
        }
        .hero-texture-tag {
          margin-top: 14px;
          text-align: right;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--accent-terracotta);
          font-weight: 600;
        }
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-features-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        @media (max-width: 640px) {
          .hero-section {
            padding: 36px 0 32px;
          }
          .hero-title {
            font-size: clamp(28px, 7.5vw, 40px);
            margin-bottom: 14px;
          }
          .hero-description {
            font-size: 14px;
            margin-bottom: 24px;
          }
          .hero-ctas {
            flex-direction: column;
            gap: 10px;
            margin-bottom: 30px;
          }
          .hero-ctas .btn {
            width: 100%;
          }
          .hero-features-list {
            grid-template-columns: 1fr;
            gap: 10px;
            padding-top: 18px;
          }
          .hero-floating-card {
            left: 12px;
            right: 12px;
            bottom: 12px;
            padding: 12px 14px;
          }
          .floating-card-title {
            font-size: 15px;
          }
          .floating-card-subtitle {
            font-size: 11px;
            margin-bottom: 8px;
          }
          .floating-buy-btn {
            padding: 6px 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
}
