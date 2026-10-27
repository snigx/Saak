import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    num: '01',
    image: '/assets/hero_roots_reimagined.jpg',
    alt: 'SAAK by Aprajita — Our Roots Reimagined in Indian Heritage',
    eyebrow: 'TIMELESS INDIAN WEAVES • CONTEMPORARY SILHOUETTES',
    headline: ['Our roots,', 'reimagined.'],
    tagline: 'By us, for you.',
    ctaText: 'EXPLORE THE COLLECTION',
    actionType: 'catalog',
  },
  {
    id: 2,
    num: '02',
    image: '/assets/hero_black_gold_duo.jpg',
    alt: 'Midnight Black Crepe Saree & Antique Gold Zardozi Corset',
    eyebrow: 'SIGNATURE ATELIER DUO • SCULPTED CORSETRY',
    headline: ['Understated Drapes.', 'Sculpted Statements.'],
    tagline: 'Fluid minimalist drape meets ornate royal corsetry.',
    ctaText: 'SHOP THE ICONIC DUO',
    actionType: 'duo',
  },
  {
    id: 3,
    num: '03',
    image: '/assets/hero_sunset_tissue.jpg',
    alt: 'Crushed Metallic Sunset Shimmer Tissue Saree',
    eyebrow: 'THE TISSUE SERIES • FEATHERLIGHT FORM',
    headline: ['Sunlit Shimmer.', 'Liquid Copper Weaves.'],
    tagline: 'Woven with metallic sheen for effortless modern celebrations.',
    ctaText: 'DISCOVER TISSUE SAREES',
    actionType: 'tissue',
  },
];

export default function Hero() {
  const { setActiveCategory, addDuoToCart, products, setSelectedProduct } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slides every 7 seconds when not paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const handleCtaClick = (actionType) => {
    if (actionType === 'duo') {
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
        return;
      }
    }

    if (actionType === 'tissue') {
      setActiveCategory('tissue');
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Default 'catalog' or explore
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const active = heroSlides[currentSlide];

  return (
    <section 
      className="hero-editorial-opening"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="SAAK Editorial Opening Carousel"
    >
      {/* Background Slides with Crossfade */}
      <div className="hero-slides-layer">
        {heroSlides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`hero-bg-slide ${index === currentSlide ? 'active' : ''}`}
            aria-hidden={index !== currentSlide}
          >
            <img 
              src={slide.image} 
              alt={slide.alt} 
              className="hero-slide-image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        {/* Cinematic Atmospheric Vignette Gradients */}
        <div className="hero-cinematic-overlay" />
      </div>

      {/* Foreground Content Container */}
      <div className="container hero-editorial-container">
        <div className="hero-editorial-content" key={active.id}>
          {/* Eyebrow Label */}
          <div className="hero-eyebrow-text">
            <span>{active.eyebrow}</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-editorial-title">
            {active.headline[0]} <br />
            {active.headline[1]}
          </h1>

          {/* Italic Accent Tagline */}
          <p className="hero-editorial-tagline">
            {active.tagline}
          </p>

          {/* Sleek Ghost Action Button */}
          <div className="hero-action-row">
            <button 
              type="button"
              onClick={() => handleCtaClick(active.actionType)}
              className="hero-editorial-btn"
            >
              <span>{active.ctaText}</span>
              <ArrowRight size={16} className="btn-arrow-icon" />
            </button>
          </div>
        </div>

        {/* Editorial Bottom Navigation Bar */}
        <div className="hero-bottom-bar">
          {/* Slide Indicator: 01 —— 02 03 */}
          <div className="hero-pagination-cluster">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div key={slide.id} className="pagination-step-item">
                  <button 
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`pagination-num-btn ${isActive ? 'active' : ''}`}
                    title={`Slide ${slide.num}`}
                  >
                    {slide.num}
                  </button>

                  {/* Horizontal Progress Track for Active Slide */}
                  {isActive && (
                    <div className="pagination-track-line">
                      <div 
                        className={`pagination-track-fill ${isPaused ? 'paused' : ''}`}
                        key={`fill-${currentSlide}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Minimalist Arrow Controls */}
          <div className="hero-arrows-cluster">
            <button 
              type="button" 
              onClick={handlePrev} 
              className="hero-arrow-btn"
              aria-label="Previous Slide"
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button" 
              onClick={handleNext} 
              className="hero-arrow-btn"
              aria-label="Next Slide"
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hero-editorial-opening {
          position: relative;
          width: 100%;
          min-height: 84vh;
          max-height: 900px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #191412;
        }

        /* Full-Bleed Background Slides */
        .hero-slides-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-bg-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1), transform 1.6s ease-out;
          transform: scale(1.04);
        }

        .hero-bg-slide.active {
          opacity: 1;
          visibility: visible;
          transform: scale(1);
        }

        .hero-slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center right;
          display: block;
        }

        /* Cinematic Gradient Overlays: Ensure crisp contrast on the left without hiding the muse on the right */
        .hero-cinematic-overlay {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(to right, rgba(20, 16, 14, 0.88) 0%, rgba(20, 16, 14, 0.65) 38%, rgba(20, 16, 14, 0.25) 65%, rgba(20, 16, 14, 0.05) 100%),
            linear-gradient(to top, rgba(20, 16, 14, 0.78) 0%, rgba(20, 16, 14, 0.2) 28%, transparent 60%);
          pointer-events: none;
        }

        /* Content Container */
        .hero-editorial-container {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 84vh;
          max-height: 900px;
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
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Eyebrow */
        .hero-eyebrow-text {
          font-family: var(--font-sans);
          font-size: 11.5px;
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
          font-size: 11.5px;
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

        /* Bottom Bar: Indicators & Arrows */
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

        /* Slide Indicator: 01 —— 02 03 */
        .hero-pagination-cluster {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .pagination-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pagination-num-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.45);
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          padding: 4px 2px;
          transition: color 0.3s ease;
        }

        .pagination-num-btn:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .pagination-num-btn.active {
          color: #FAF7F2;
          font-weight: 700;
        }

        .pagination-track-line {
          width: 52px;
          height: 2px;
          background: rgba(255, 255, 255, 0.28);
          position: relative;
          overflow: hidden;
          border-radius: 2px;
        }

        .pagination-track-fill {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          background: #FFFFFF;
          transform: translateX(-100%);
          animation: fillProgress 7s linear forwards;
        }

        .pagination-track-fill.paused {
          animation-play-state: paused;
        }

        @keyframes fillProgress {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }

        /* Minimalist Arrow Buttons */
        .hero-arrows-cluster {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-arrow-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.8);
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(6px);
        }

        .hero-arrow-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: #FFFFFF;
          color: #FFFFFF;
          transform: scale(1.05);
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
            object-position: 70% center;
          }
          .hero-cinematic-overlay {
            background: 
              linear-gradient(to right, rgba(20, 16, 14, 0.92) 0%, rgba(20, 16, 14, 0.72) 55%, rgba(20, 16, 14, 0.4) 100%),
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
            font-size: 10px;
            letter-spacing: 0.16em;
            margin-bottom: 16px;
          }
          .hero-editorial-title {
            font-size: 34px;
            margin-bottom: 14px;
          }
          .hero-editorial-tagline {
            font-size: 20px;
            margin-bottom: 28px;
          }
          .hero-editorial-btn {
            width: 100%;
            justify-content: center;
            padding: 13px 20px;
          }
          .hero-bottom-bar {
            bottom: 18px;
          }
          .pagination-track-line {
            width: 32px;
          }
        }
      `}</style>
    </section>
  );
}
