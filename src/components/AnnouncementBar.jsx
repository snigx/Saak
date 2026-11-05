import React from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageCircle, Receipt } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { getWhatsAppLink } from '../utils/contact';

export default function AnnouncementBar() {
  const { openAdminConsole, openOrdersAdmin } = useShop();
  const { isAdmin } = useAuth();

  return (
    <div className="announcement-bar">
      <div className="container announcement-content">
        <div className="announcement-right">
          {/* Admin Shortcut (Admin Only) */}
          {isAdmin && (
            <>
              <button 
                onClick={openAdminConsole}
                className="atelier-btn"
                title="Manage products, stock and prices"
              >
                <Sparkles size={13} className="text-gold" />
                <span>Products</span>
              </button>

              <button 
                onClick={openOrdersAdmin}
                className="atelier-btn"
                title="View orders and payments"
              >
                <Receipt size={13} />
                <span>Orders</span>
              </button>
            </>
          )}

          {/* Official Instagram */}
          <a 
            href="https://www.instagram.com/saakbyaprajita?srtk=MzNuendsOGdtdndu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-top-link"
            title="Follow @saakbyaprajita on Instagram"
          >
            <InstagramIcon size={12} />
            <span>@saakbyaprajita</span>
          </a>

          {/* WhatsApp Stylist */}
          <a 
            href={getWhatsAppLink("Hi Aprajita, I'm exploring Saak and would love some styling advice!")}
            target="_blank" 
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <MessageCircle size={13} />
            <span>WhatsApp us</span>
          </a>
        </div>
      </div>

      <style>{`
        .announcement-bar {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          font-size: var(--text-xs);
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(197, 160, 89, 0.3);
          position: relative;
          z-index: 100;
        }
        .announcement-content {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-top: 6px;
          padding-bottom: 6px;
          gap: 16px;
        }
        .text-gold {
          color: var(--accent-gold);
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
          font-size: var(--text-xs);
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
        .instagram-top-link {
          color: rgba(250, 246, 239, 0.9);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
          transition: var(--transition);
        }
        .instagram-top-link:hover {
          color: var(--accent-gold);
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
        @media (max-width: 650px) {
          .announcement-content {
            padding-top: 5px;
            padding-bottom: 5px;
            gap: 8px;
            justify-content: center;
          }
          .atelier-btn {
            display: none !important;
          }
          .instagram-top-link span,
          .whatsapp-link span {
            display: inline-block;
          }
          .announcement-right {
            gap: 12px;
            justify-content: center;
          }
        }
        @media (max-width: 420px) {
          .instagram-top-link span {
            display: none;
          }
          .whatsapp-link span {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
}
