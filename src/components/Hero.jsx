import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

// Hero image hosted in Supabase Blob Storage CDN (Zero local git bloat)
const HERO_BLOB_IMAGE_URL = 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/hero/model_black_saree_modern.jpg';

export default function Hero() {
  const { setSelectedProduct, products, addDuoToCart } = useShop();

  const handleExplore = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    const storyEl = document.getElementById('about-saak');
    if (storyEl) {
      storyEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      handleExplore();
    }
  };

  const handleShopIconicDuo = () => {
    const duoProduct = products.find((p) => p.id === 'signature-duo-black-gold') 
      || products.find((p) => p.category === 'sets');
    if (duoProduct) {
      setSelectedProduct(duoProduct);
      return;
    }
    const goldCorset = products.find((p) => p.id === 'the-gold-corset');
    const saree = products.find((p) => p.category === 'sarees');
    if (goldCorset && saree) {
      addDuoToCart(saree, goldCorset);
    }
  };

  return (
    <section className="hero-editorial-opening" aria-label="Saak by Aprajita">
      {/* Background Layer with Original Model & Matching Heritage Architecture from Blob Storage */}
      <div className="hero-slides-layer">
        <div className="hero-bg-slide active">
          <img 
            src={HERO_BLOB_IMAGE_URL} 
            alt="Saak by Aprajita — black saree with gold corset" 
            className="hero-slide-image"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        {/* Cinematic Atmospheric Vignette Gradients */}
        <div className="hero-cinematic-overlay" />
      </div>

      {/* Foreground Content Container */}
      <div className="container hero-editorial-container">
        <div className="hero-editorial-content">
          {/* Eyebrow Label */}
          <div className="hero-eyebrow-text">
            <span>Handwoven sarees • Made for today</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-editorial-title">
            Our roots, <br />
            reimagined.
          </h1>

          {/* Italic Accent Tagline */}
          <p className="hero-editorial-tagline">
            By us, for you.
          </p>

          {/* Sleek Ghost Action Button */}
          <div className="hero-action-row">
            <button 
              type="button"
              onClick={handleExplore}
              className="hero-editorial-btn"
            >
              <span>Shop the collection</span>
              <ArrowRight size={16} className="btn-arrow-icon" />
            </button>

            {/* Quick Shoppable Tag for the Draped Outfit */}
            <button
              type="button"
              onClick={handleShopIconicDuo}
              className="hero-duo-quick-tag"
              title="Shop the black crepe and gold corset duo"
            >
              <Sparkles size={13} className="text-gold" />
              <span>Shop this look: black crepe + gold corset</span>
            </button>
          </div>
        </div>

        {/* Editorial Bottom Bar */}
        <div className="hero-bottom-bar">
          {/* Left Slide Indicator */}
          <div className="hero-pagination-cluster">
            <div className="pagination-step-item">
              <span className="pagination-num-text active">01</span>
              <div className="pagination-track-line">
                <div className="pagination-track-fill" />
              </div>
              <span className="pagination-label-text">Signature duo</span>
            </div>
          </div>

          {/* Right Scroll Indicator */}
          <div className="hero-scroll-cluster">
            <button 
              type="button" 
              onClick={handleScrollDown} 
              className="hero-scroll-btn"
              aria-label="Scroll down to our story"
              title="Our story"
            >
              <span className="scroll-hint-text">Our story</span>
              <ChevronDown size={16} className="scroll-chevron-icon" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero-editorial-opening {
          position: relative;
          width: 100%;
          min-height: 84vh;
          max-height: 920px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #191412;
        }

        /* Full-Bleed Background Layer */
        .hero-slides-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-bg-slide {
          position: absolute;
          inset: 0;
        }

        .hero-slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center right;
          display: block;
        }

        /* Cinematic Atmospheric Gradient Overlays */
        .hero-cinematic-overlay {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(to right, rgba(20, 16, 14, 0.90) 0%, rgba(20, 16, 14, 0.68) 36%, rgba(20, 16, 14, 0.22) 65%, rgba(20, 16, 14, 0.05) 100%),
            linear-gradient(to top, rgba(20, 16, 14, 0.82) 0%, rgba(20, 16, 14, 0.2) 28%, transparent 60%);
          pointer-events: none;
        }

        /* Content Container */
        .hero-editorial-container {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 84vh;
          max-height: 920px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 40px;
          padding-bottom: 64px;
        }

        .hero-editorial-content {
          max-width: 580px;
          animation: heroFadeSlideIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes heroFadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Eyebrow */
        .hero-eyebrow-text {
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(240, 235, 227, 0.9);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Main Editorial Title */
        .hero-editorial-title {
          font-family: var(--font-serif);
          font-size: clamp(40px, 5.2vw, 64px);
          line-height: 1.12;
          font-weight: 400;
          color: #FAF7F2;
          letter-spacing: -0.015em;
          margin-bottom: 22px;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
        }

        /* Tagline in Italic Serif */
        .hero-editorial-tagline {
          font-family: var(--font-serif);
          font-size: clamp(22px, 2.4vw, 29px);
          font-style: italic;
          font-weight: 400;
          line-height: 1.4;
          color: #F0EAE1;
          margin-bottom: 38px;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        }

        /* Action Row & Sleek Button */
        .hero-action-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .hero-editorial-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 30px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.75);
          color: #FFFFFF;
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          border-radius: 1px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-editorial-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
        }

        .btn-arrow-icon {
          transition: transform 0.3s ease;
        }

        .hero-editorial-btn:hover .btn-arrow-icon {
          transform: translateX(5px);
        }

        .hero-duo-quick-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(26, 22, 20, 0.65);
          border: 1px solid rgba(197, 160, 89, 0.4);
          padding: 12px 18px;
          border-radius: 2px;
          color: #F0EAE1;
          font-size: var(--text-xs);
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: all 0.3s ease;
        }

        .hero-duo-quick-tag:hover {
          background: rgba(163, 72, 53, 0.35);
          border-color: var(--accent-terracotta);
          color: #FFFFFF;
          transform: translateY(-2px);
        }

        /* Bottom Bar */
        .hero-bottom-bar {
          position: absolute;
          bottom: 28px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: inherit;
          padding-right: inherit;
          pointer-events: auto;
        }

        /* Left Slide Indicator */
        .hero-pagination-cluster {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pagination-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pagination-num-text {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #FAF7F2;
        }

        .pagination-track-line {
          width: 52px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
          border-radius: 2px;
        }

        .pagination-track-fill {
          position: absolute;
          inset: 0;
          background: #FFFFFF;
        }

        .pagination-label-text {
          font-size: var(--text-xs);
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.65);
          text-transform: uppercase;
          font-weight: 500;
        }

        /* Right Scroll Button */
        .hero-scroll-cluster {
          display: flex;
          align-items: center;
        }

        .hero-scroll-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          padding: 6px 10px;
        }

        .hero-scroll-btn:hover {
          color: #FFFFFF;
          transform: translateY(2px);
        }

        .scroll-chevron-icon {
          animation: bounceDown 2s infinite;
        }

        @keyframes bounceDown {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(4px);
          }
          60% {
            transform: translateY(2px);
          }
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .hero-editorial-opening {
            min-height: 72vh;
          }
          .hero-editorial-container {
            min-height: 72vh;
            padding-bottom: 74px;
          }
          .hero-editorial-content {
            max-width: 480px;
          }
          .hero-slide-image {
            object-position: 72% center;
          }
          .hero-cinematic-overlay {
            background: 
              linear-gradient(to right, rgba(20, 16, 14, 0.92) 0%, rgba(20, 16, 14, 0.74) 55%, rgba(20, 16, 14, 0.4) 100%),
              linear-gradient(to top, rgba(20, 16, 14, 0.85) 0%, transparent 50%);
          }
        }

        @media (max-width: 640px) {
          .hero-editorial-opening {
            min-height: 580px;
          }
          .hero-editorial-container {
            min-height: 580px;
            padding-top: 24px;
            padding-bottom: 64px;
          }
          .hero-slide-image {
            object-position: 78% center;
          }
          .hero-eyebrow-text {
            font-size: var(--text-xs);
            letter-spacing: 0.16em;
            margin-bottom: 16px;
          }
          .hero-editorial-title {
            font-size: var(--text-3xl);
            margin-bottom: 14px;
          }
          .hero-editorial-tagline {
            font-size: var(--text-xl);
            margin-bottom: 28px;
          }
          .hero-action-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .hero-editorial-btn {
            width: 100%;
            justify-content: center;
            padding: 13px 20px;
          }
          .hero-duo-quick-tag {
            width: 100%;
            justify-content: center;
          }
          .hero-bottom-bar {
            bottom: 18px;
          }
          .pagination-label-text {
            display: none;
          }
          .pagination-track-line {
            width: 32px;
          }
        }
      `}</style>
    </section>
  );
}
