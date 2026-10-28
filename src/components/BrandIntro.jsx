import React from 'react';
import { Sparkles, Heart, Feather, Compass, ArrowRight } from 'lucide-react';

export default function BrandIntro() {
  const handleExploreCreations = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about-saak" className="brand-intro-section">
      <div className="container intro-container">
        {/* Left Column: Editorial Brand Narrative */}
        <div className="intro-content-col">
          <div className="intro-badge">
            <Sparkles size={13} className="text-gold" />
            <span>THE SAAK STORY</span>
          </div>

          <h2 className="intro-headline">
            Rooted in Tradition. <br />
            <span className="intro-headline-italic">Reimagined for Today.</span>
          </h2>

          <div className="intro-narrative">
            <p className="intro-lead">
              SAAK by Aprajita was born from a desire to create something timeless and classic, deeply rooted in Indian tradition yet reimagined with a contemporary sensibility.
            </p>

            <p className="intro-body">
              Inspired by India’s rich and diverse cultural heritage, SAAK celebrates femininity in all its forms — graceful, confident, and unapologetically individual. We believe tradition is not simply something we inherit, but something we continue to interpret, express, and make our own.
            </p>

            {/* Featured Quote Card */}
            <div className="intro-quote-card">
              <div className="quote-icon-mark">“</div>
              <p className="intro-quote-text">
                At its heart, SAAK is a celebration of where we come from and all the ways we can carry it forward — keeping our heritage alive, relevant, and ever-evolving.
              </p>
              <div className="quote-signoff">
                <span className="signoff-name">— Aprajita</span>
                <span className="signoff-role">Founder &amp; Creative Director</span>
              </div>
            </div>
          </div>

          <div className="intro-actions">
            <button 
              type="button" 
              onClick={handleExploreCreations} 
              className="btn btn-primary intro-cta-btn"
            >
              <span>Explore Our Creations</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Column: High-Fashion Visual & Atelier Highlights */}
        <div className="intro-visual-col">
          <div className="visual-composition">
            {/* Primary Atelier Frame */}
            <div className="main-frame">
              <img 
                src="/assets/saak_muse_black_corset_side.jpg" 
                alt="SAAK by Aprajita — Indian Textile Heritage" 
                className="main-frame-img"
              />
              <div className="frame-overlay-gradient"></div>
              <div className="frame-tag">
                <Sparkles size={12} className="text-gold" />
                <span>HANDCRAFTED IN INDIA</span>
              </div>
            </div>

            {/* Overlapping Secondary Inset Frame */}
            <div className="inset-frame">
              <img 
                src="/assets/saak_flatlay_copper_green.jpg" 
                alt="Artisanal Handloom Fabric Detail" 
                className="inset-frame-img"
              />
            </div>

            {/* Floating Brand Pillars Card */}
            <div className="pillars-floating-card">
              <div className="pillar-row">
                <div className="pillar-bullet">01</div>
                <div className="pillar-text">
                  <strong>Timeless &amp; Classic</strong>
                  <span>Deeply rooted in Indian handloom craft</span>
                </div>
              </div>
              <div className="pillar-row">
                <div className="pillar-bullet">02</div>
                <div className="pillar-text">
                  <strong>Graceful &amp; Confident</strong>
                  <span>Celebrating femininity in all its forms</span>
                </div>
              </div>
              <div className="pillar-row">
                <div className="pillar-bullet">03</div>
                <div className="pillar-text">
                  <strong>Ever-Evolving Heritage</strong>
                  <span>Interpreting tradition with modern freedom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .brand-intro-section {
          padding: 88px 0 96px 0;
          background: #FAF7F2;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
        }

        .intro-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 64px;
          align-items: center;
        }

        /* Left Column */
        .intro-content-col {
          display: flex;
          flex-direction: column;
        }

        .intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(163, 72, 53, 0.08);
          border: 1px solid rgba(163, 72, 53, 0.22);
          color: var(--accent-terracotta);
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-radius: 2px;
          margin-bottom: 22px;
          align-self: flex-start;
        }

        .intro-headline {
          font-family: var(--font-serif);
          font-size: clamp(34px, 4vw, 48px);
          font-weight: 500;
          line-height: 1.18;
          color: var(--text-primary);
          margin-bottom: 28px;
          letter-spacing: -0.01em;
        }

        .intro-headline-italic {
          font-style: italic;
          color: var(--accent-terracotta);
          font-weight: 400;
        }

        .intro-narrative {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 32px;
        }

        .intro-lead {
          font-family: var(--font-serif);
          font-size: 19px;
          line-height: 1.6;
          color: var(--text-primary);
          font-weight: 500;
        }

        .intro-body {
          font-size: 15px;
          line-height: 1.75;
          color: var(--text-secondary);
        }

        /* Quote Highlight Card */
        .intro-quote-card {
          margin-top: 10px;
          background: #FFFFFF;
          border: 1px solid var(--border-gold);
          border-left: 4px solid var(--accent-terracotta);
          border-radius: 4px;
          padding: 24px 28px;
          position: relative;
          box-shadow: 0 8px 24px rgba(31, 26, 23, 0.05);
        }

        .quote-icon-mark {
          position: absolute;
          top: -12px;
          right: 20px;
          font-family: var(--font-serif);
          font-size: 64px;
          color: rgba(197, 160, 89, 0.25);
          line-height: 1;
          pointer-events: none;
        }

        .intro-quote-text {
          font-family: var(--font-serif);
          font-size: 16.5px;
          font-style: italic;
          line-height: 1.65;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .quote-signoff {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .signoff-name {
          font-weight: 700;
          color: var(--accent-terracotta);
          letter-spacing: 0.05em;
        }

        .signoff-role {
          color: var(--text-muted);
          position: relative;
          padding-left: 8px;
        }
        .signoff-role::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--border-gold);
        }

        .intro-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .intro-cta-btn {
          padding: 13px 26px;
          font-size: 13px;
        }

        /* Right Column Visual Composition */
        .intro-visual-col {
          position: relative;
          width: 100%;
        }

        .visual-composition {
          position: relative;
          max-width: 480px;
          margin-left: auto;
        }

        .main-frame {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-gold);
          aspect-ratio: 4 / 5;
        }

        .main-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .main-frame-img:hover {
          transform: scale(1.03);
        }

        .frame-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 65%, rgba(26, 22, 20, 0.65) 100%);
          pointer-events: none;
        }

        .frame-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-gold);
          padding: 5px 12px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-terracotta);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .inset-frame {
          position: absolute;
          bottom: -24px;
          left: -36px;
          width: 160px;
          height: 160px;
          border-radius: 4px;
          overflow: hidden;
          border: 3px solid #FFFFFF;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          z-index: 2;
        }

        .inset-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Floating Pillars Card */
        .pillars-floating-card {
          position: absolute;
          bottom: -40px;
          right: -20px;
          background: #FFFFFF;
          border: 1px solid var(--border-gold);
          border-radius: 4px;
          padding: 18px 20px;
          box-shadow: 0 16px 36px rgba(31, 26, 23, 0.12);
          z-index: 3;
          max-width: 310px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pillar-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .pillar-bullet {
          font-family: var(--font-serif);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-terracotta);
          background: #FAF2EA;
          padding: 2px 6px;
          border-radius: 2px;
          line-height: 1.3;
          flex-shrink: 0;
        }

        .pillar-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .pillar-text strong {
          font-size: 12px;
          color: var(--text-primary);
        }

        .pillar-text span {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        @media (max-width: 1024px) {
          .intro-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .visual-composition {
            margin: 0 auto;
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .brand-intro-section {
            padding: 56px 0 64px 0;
          }
          .intro-headline {
            font-size: 28px;
            line-height: 1.25;
          }
          .intro-lead {
            font-size: 16px;
            line-height: 1.6;
          }
          .intro-body {
            font-size: 14px;
            line-height: 1.65;
          }
          .intro-quote-card {
            padding: 16px 18px;
            margin: 20px 0;
          }
          .intro-quote-text {
            font-size: 13.5px;
          }
          .inset-frame {
            display: none !important;
          }
          .pillars-floating-card {
            position: static;
            margin-top: 14px;
            width: 100%;
            max-width: 100%;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border-gold);
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
