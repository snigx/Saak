import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, MessageCircle, PlusCircle, Globe } from 'lucide-react';

export default function AnnouncementBar() {
  const { currency, setCurrency, setIsAtelierModalOpen } = useShop();

  return (
    <div className="announcement-bar">
      <div className="container announcement-content">
        <div className="announcement-left">
          <span className="announcement-text">
            <Sparkles size={13} className="text-gold" />
            <span><strong>FESTIVE PREVIEW:</strong> Complimentary Pre-Stitched Fall &amp; Pico on all Tissue Sarees</span>
          </span>
          <span className="divider-dot">•</span>
          <span className="announcement-subtext">Custom Colourways on Request &amp; Worldwide Shipping</span>
        </div>

        <div className="announcement-right">
          {/* Atelier Admin Shortcut */}
          <button 
            onClick={() => setIsAtelierModalOpen(true)}
            className="atelier-btn"
            title="Add a new Saree or Blouse to the catalog"
          >
            <PlusCircle size={13} />
            <span>Atelier Portal (Add Products)</span>
          </button>

          {/* WhatsApp Stylist */}
          <a 
            href="https://wa.me/?text=Hi%20Aprajita,%20I'm%20exploring%20Saak%20and%20would%20love%20some%20styling%20advice!" 
            target="_blank" 
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <MessageCircle size={13} />
            <span>Stylist WhatsApp</span>
          </a>

          {/* Currency Toggle */}
          <div className="currency-selector">
            <Globe size={13} />
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="currency-select"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (AED)</option>
            </select>
          </div>
        </div>
      </div>

      <style>{`
        .announcement-bar {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          font-size: 11px;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(197, 160, 89, 0.3);
          position: relative;
          z-index: 100;
        }
        .announcement-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          padding-bottom: 8px;
          gap: 16px;
        }
        .announcement-left {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .announcement-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .text-gold {
          color: var(--accent-gold);
        }
        .divider-dot {
          color: var(--accent-gold);
          opacity: 0.6;
        }
        .announcement-subtext {
          color: rgba(250, 246, 239, 0.75);
        }
        .announcement-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .atelier-btn {
          background: rgba(197, 160, 89, 0.18);
          border: 1px solid rgba(197, 160, 89, 0.4);
          color: var(--accent-gold-light);
          padding: 3px 9px;
          font-size: 11px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: var(--transition);
        }
        .atelier-btn:hover {
          background: var(--accent-gold);
          color: var(--text-primary);
        }
        .whatsapp-link {
          color: #FAF6EF;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: var(--transition);
        }
        .whatsapp-link:hover {
          color: #25D366;
        }
        .currency-selector {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(250, 246, 239, 0.8);
        }
        .currency-select {
          background: transparent;
          color: #FAF6EF;
          border: none;
          font-size: 11px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
        }
        .currency-select option {
          background: var(--text-primary);
          color: #FAF6EF;
        }
        @media (max-width: 900px) {
          .announcement-subtext, .divider-dot {
            display: none;
          }
        }
        @media (max-width: 650px) {
          .atelier-btn span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
