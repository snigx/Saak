import React from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Mail } from 'lucide-react';

export default function Footer() {
  const { openAdminConsole, openOrdersAdmin, openPolicyModal } = useShop();
  const { isAdmin } = useAuth();

  return (
    <footer className="atelier-footer">
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
              title="Back to top"
              aria-label="Saak by Aprajita - back to top"
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
            Timeless Indian weaves, made for how you live now.
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
          <h4 className="footer-col-title">Care guide</h4>
          <ul className="footer-care-list">
            <li>
              <strong>Tissue sarees:</strong>
              <span>Dry clean only. Store rolled in muslin. Don't iron directly on the fabric.</span>
            </li>
            <li>
              <strong>Crepe sarees:</strong>
              <span>Steam gently on the reverse. Keep hooks fastened when stored.</span>
            </li>
            <li>
              <strong>Gold corset:</strong>
              <span>Keep away from perfume. Wrap in soft cotton to protect the zardozi.</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Styling & Support */}
        <div className="footer-col concierge-col">
          <h4 className="footer-col-title">Help &amp; styling</h4>
          <p className="concierge-desc">
            Dressing a group, or need a custom colour? Write to Aprajita's team.
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
              title="Returns, exchanges & refunds"
            >
              Returns, exchanges &amp; refunds →
            </button>
          </div>

          {isAdmin && (
            <div className="footer-admin-links">
              <button 
                onClick={openAdminConsole}
                className="portal-link-btn"
              >
                Admin: products
              </button>
              <span className="divider-dot">•</span>
              <button 
                onClick={openOrdersAdmin}
                className="portal-link-btn"
              >
                Admin: orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="container bottom-content">
          <p>© {new Date().getFullYear()} Saak by Aprajita. Made with love for Indian textiles.</p>
          <div className="bottom-badges">
            <span>Handcrafted</span>
            <span className="bottom-sep" aria-hidden="true">•</span>
            <span>Free insured shipping across India</span>
            <span className="bottom-sep" aria-hidden="true">•</span>
            <button 
              type="button" 
              onClick={openPolicyModal} 
              className="bottom-policy-link"
            >
              Returns, exchanges &amp; refunds
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-3xl);
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #FFFFFF;
          line-height: 1;
        }
        .footer-brand-sub {
          font-size: var(--text-xs);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-top: 3px;
          font-weight: 600;
        }
        .footer-brand-desc {
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-lg);
          color: var(--accent-gold-light);
          margin-bottom: 2px;
        }
        .footer-care-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: var(--text-xs);
          color: rgba(250, 246, 239, 0.75);
        }
        .footer-care-list strong {
          display: block;
          color: #FFFFFF;
          font-size: var(--text-xs);
          margin-bottom: 2px;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: var(--text-sm);
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
          font-size: var(--text-sm);
          color: rgba(250, 246, 239, 0.7);
          line-height: 1.5;
        }
        .footer-email-btn {
          margin-top: 6px;
          color: #FAF6EF;
          border-color: var(--accent-gold);
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .bottom-policy-link:hover {
          color: var(--accent-gold);
        }
        @media (max-width: 600px) {
          .bottom-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 10px;
          }
          .bottom-badges {
            flex-direction: column;
            gap: 6px;
          }
          .bottom-sep {
            display: none;
          }
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
