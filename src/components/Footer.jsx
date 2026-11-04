import React from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageCircle, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const { setIsAtelierModalOpen, openOrdersAdmin, openPolicyModal } = useShop();
  const { isAdmin } = useAuth();

  return (
    <footer className="atelier-footer">
      {/* Brand Manifesto Strip */}
      <div className="footer-manifesto-strip">
        <div className="container manifesto-content">
          <div className="manifesto-badge">
            <Sparkles size={14} className="text-gold" />
            <span>THE SAAK ETHOS</span>
          </div>
          <h3 className="manifesto-headline">
            "We believe the saree should feel like freedom — featherlight to carry, effortless to wear, and sculpted to celebrate you."
          </h3>
          <span className="manifesto-signoff">— Aprajita, Creative Director</span>
        </div>
      </div>

      <div className="container footer-main-grid">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div 
              className="footer-brand-lockup"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ cursor: 'pointer' }}
              title="Return to top of page"
              aria-label="Saak by Aprajita - Return to top of page"
            >
              <img 
                src="/assets/saak_emblem_transparent.png" 
                alt="Saak Peacock Emblem" 
                className="footer-brand-emblem" 
              />
              <div className="footer-brand-text">
                <span className="footer-brand-title">Saak</span>
                <span className="footer-brand-sub">by Aprajita</span>
              </div>
            </div>
          </div>
          <p className="footer-brand-desc">
            Born from a desire to create something timeless and classic, deeply rooted in Indian tradition yet reimagined with a contemporary sensibility.
          </p>

          <div className="footer-social-row">
            <a 
              href="https://www.instagram.com/saakbyaprajita?srtk=MzNuendsOGdtdndu" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-circle"
              aria-label="Instagram @saakbyaprajita"
              title="Instagram @saakbyaprajita"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a 
              href="mailto:Saakbyaprajita@gmail.com" 
              className="social-circle"
              aria-label="Email Saakbyaprajita@gmail.com"
              title="Email Saak by Aprajita"
            >
              <Mail size={16} />
            </a>
          </div>

          <a 
            href="https://www.instagram.com/saakbyaprajita?srtk=MzNuendsOGdtdndu"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-insta-tag"
          >
            <span>Instagram: <strong>@saakbyaprajita</strong></span>
          </a>

          <a 
            href="mailto:Saakbyaprajita@gmail.com"
            className="footer-insta-tag"
            style={{ marginTop: '4px' }}
          >
            <span>Email: <strong>Saakbyaprajita@gmail.com</strong></span>
          </a>
        </div>

        {/* Col 2: Textile & Garment Care Guide */}
        <div className="footer-col">
          <h4 className="footer-col-title">Garment Care Guide</h4>
          <ul className="footer-care-list">
            <li>
              <strong>Crushed Metallic Tissue:</strong>
              <span>Dry clean only. Store gently rolled in breathable muslin. Never iron directly over the crushed luster.</span>
            </li>
            <li>
              <strong>Pure Crepe Drapes:</strong>
              <span>Gentle vertical steam iron on reverse. Keep hooks fastened during storage.</span>
            </li>
            <li>
              <strong>Antique Gold Corset:</strong>
              <span>Keep away from direct sprays/perfumes. Wrap in soft cotton fabric to preserve zardozi sheen.</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Styling & Support */}
        <div className="footer-col concierge-col">
          <h4 className="footer-col-title">Styling &amp; Support</h4>
          <p className="concierge-desc">
            Planning your bridesmaid troupe, college farewell, or need custom colourways? Speak directly with Aprajita’s styling team.
          </p>

          <a 
            href="mailto:Saakbyaprajita@gmail.com" 
            className="btn btn-outline-gold footer-email-btn"
            title="Email Saakbyaprajita@gmail.com"
          >
            <Mail size={15} />
            <span>Saakbyaprajita@gmail.com</span>
          </a>

          <div className="footer-policy-quicklink">
            <button 
              type="button" 
              onClick={openPolicyModal} 
              className="footer-policy-link-btn"
              title="View SAAK Returns, Exchanges & Refunds Policy"
            >
              Returns, Exchanges &amp; Refunds →
            </button>
          </div>

          {isAdmin && (
            <div className="footer-admin-links">
              <button 
                onClick={() => setIsAtelierModalOpen(true)}
                className="portal-link-btn"
              >
                Admin Portal (Catalog &amp; Inventory)
              </button>
              <span className="divider-dot">•</span>
              <button 
                onClick={openOrdersAdmin}
                className="portal-link-btn"
              >
                Orders &amp; UPI Ledger
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="container bottom-content">
          <p>© 2026 Saak by Aprajita. Handcrafted with reverence for Indian textiles.</p>
          <div className="bottom-badges">
            <span>Pure Handcrafted Heritage</span>
            <span>•</span>
            <span>Worldwide Insured Shipping</span>
            <span>•</span>
            <button 
              type="button" 
              onClick={openPolicyModal} 
              className="bottom-policy-link"
            >
              Returns, Exchanges &amp; Refunds
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .atelier-footer {
          background-color: var(--bg-dark);
          color: var(--text-light);
          border-top: 1px solid var(--border-gold);
        }
        .footer-manifesto-strip {
          background: #141110;
          border-bottom: 1px solid rgba(197, 160, 89, 0.2);
          padding: 40px 0;
          text-align: center;
        }
        .manifesto-content {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .manifesto-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--accent-gold);
        }
        .manifesto-headline {
          font-family: var(--font-serif);
          font-size: clamp(20px, 2.5vw, 26px);
          font-style: italic;
          color: #FAF6EF;
          line-height: 1.4;
          font-weight: 400;
        }
        .manifesto-signoff {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: var(--accent-gold-light);
          text-transform: uppercase;
        }
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.4fr 1.2fr 1fr;
          gap: 40px;
          padding: 64px 24px;
        }
        .footer-policy-quicklink {
          margin-top: 8px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
        }
        .footer-brand-lockup {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .footer-brand-emblem {
          height: 48px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(197, 160, 89, 0.45));
        }
        .footer-brand-text {
          display: flex;
          flex-direction: column;
        }
        .footer-brand-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          line-height: 1;
        }
        .footer-brand-sub {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-top: 3px;
          font-weight: 600;
        }
        .footer-brand-desc {
          font-size: 13px;
          color: rgba(250, 246, 239, 0.7);
          line-height: 1.6;
        }
        .footer-social-row {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }
        .social-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(250, 246, 239, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FAF6EF;
          text-decoration: none;
          transition: var(--transition);
        }
        .social-circle:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          transform: translateY(-2px);
        }
        .footer-insta-tag {
          display: inline-block;
          font-size: 11px;
          color: var(--accent-gold);
          text-decoration: none;
          margin-top: 4px;
          transition: var(--transition);
        }
        .footer-insta-tag:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }
        .footer-col-title {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--accent-gold-light);
          margin-bottom: 2px;
        }
        .footer-care-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 12px;
          color: rgba(250, 246, 239, 0.75);
        }
        .footer-care-list strong {
          display: block;
          color: #FFFFFF;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
        }
        .footer-links-list a {
          color: rgba(250, 246, 239, 0.75);
          text-decoration: none;
          transition: var(--transition);
        }
        .footer-links-list a:hover {
          color: var(--accent-gold);
          padding-left: 3px;
        }
        .concierge-desc {
          font-size: 13px;
          color: rgba(250, 246, 239, 0.7);
          line-height: 1.5;
        }
        .footer-email-btn {
          margin-top: 6px;
          color: #FAF6EF;
          border-color: var(--accent-gold);
          font-size: 12px;
          padding: 10px 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: var(--transition);
        }
        .footer-email-btn:hover {
          background: var(--accent-gold);
          color: var(--bg-dark);
        }
        .portal-link-btn {
          background: none;
          border: none;
          color: rgba(250, 246, 239, 0.45);
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          margin-top: 10px;
          text-decoration: underline;
        }
        .portal-link-btn:hover {
          color: var(--accent-gold);
        }
        .footer-bottom-bar {
          background: #100D0C;
          padding: 18px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 11px;
          color: rgba(250, 246, 239, 0.5);
        }
        .bottom-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .bottom-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-policy-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: rgba(250, 246, 239, 0.7);
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s;
        }
        .footer-policy-link-btn:hover {
          color: var(--accent-gold);
        }
        .bottom-policy-link {
          background: none;
          border: none;
          padding: 0;
          color: rgba(250, 246, 239, 0.7);
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .bottom-policy-link:hover {
          color: var(--accent-gold);
        }
        @media (max-width: 992px) {
          .footer-main-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 600px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
