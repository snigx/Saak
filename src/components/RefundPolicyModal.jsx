import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useOverlay } from '../hooks/useOverlay';
import { 
  X, ShieldCheck, AlertCircle, Camera, Video, 
  Clock, Sparkles, ChevronRight 
} from 'lucide-react';

export default function RefundPolicyModal() {
  const { isPolicyModalOpen, setIsPolicyModalOpen } = useShop();
  const [activeSection, setActiveSection] = useState('all');

  // Escape to close + background scroll lock
  useOverlay(isPolicyModalOpen, () => setIsPolicyModalOpen(false));

  if (!isPolicyModalOpen) return null;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="modal-overlay policy-overlay" onClick={() => setIsPolicyModalOpen(false)}>
      <div 
        className="modal-container policy-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
      >
        {/* Top Header */}
        <div className="policy-modal-header">
          <div className="header-meta">
            <div className="policy-badge">
              <ShieldCheck size={14} className="text-gold" />
              <span>Our policy</span>
            </div>
            <h2 id="policy-modal-title" className="policy-title">Returns, exchanges &amp; refunds</h2>
            <p className="policy-intro-quote">
              We want you to love what you buy. Please read this before you order.
            </p>
          </div>

          <button 
            type="button"
            className="modal-close-btn policy-close-btn"
            onClick={() => setIsPolicyModalOpen(false)}
            aria-label="Close returns policy"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick-Jump Section Navigator */}
        <div className="policy-nav-strip">
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-eligibility' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-eligibility')}
          >
            1. Eligibility
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-unboxing' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-unboxing')}
          >
            2. Unboxing video
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-exchanges' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-exchanges')}
          >
            3. Exchanges
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-refunds' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-refunds')}
          >
            4. Refunds
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-shipping' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-shipping')}
          >
            5. Return shipping
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-variations' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-variations')}
          >
            6. Handloom variations
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-cancellations' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-cancellations')}
          >
            7. Cancellations
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-contact' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-contact')}
          >
            8. Contact us
          </button>
        </div>

        {/* Policy Body */}
        <div className="policy-modal-body">
          {/* Section 1 */}
          <section id="sec-eligibility" className="policy-section">
            <div className="section-head">
              <span className="section-num">01</span>
              <h3 className="section-heading">What can be returned</h3>
            </div>
            <ul className="policy-bullets">
              <li>
                <strong>Change of mind:</strong> We don't accept returns on standard saree orders for a change of mind, colour or style.
              </li>
              <li>
                <strong>Damaged or wrong item:</strong> If your order is damaged, defective, wrong or not as described, contact us within <strong>48 hours of delivery</strong>.
              </li>
              <li>
                <strong>What we'll do:</strong> We'll review it and offer a replacement, exchange, repair or refund, as fits.
              </li>
              <li>
                <strong>Condition:</strong> Items worn, washed, altered, stained or damaged after delivery may not qualify, unless the fault was there from the start or the law requires otherwise.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="sec-unboxing" className="policy-section highlight-box">
            <div className="section-head">
              <span className="section-num">02</span>
              <h3 className="section-heading">Reporting a problem</h3>
            </div>
            <p className="policy-lead-text">
              When your parcel arrives, please:
            </p>
            <div className="unboxing-steps-grid">
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Video size={18} />
                </div>
                <h4>1. Record a video</h4>
                <p>Film the sealed parcel being opened, in one go.</p>
              </div>
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Camera size={18} />
                </div>
                <h4>2. Take photos</h4>
                <p>Photograph any damage, flaw or wrong item in good light.</p>
              </div>
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Clock size={18} />
                </div>
                <h4>3. Tell us within 48 hours</h4>
                <p>Send your order number and the video or photos within 48 hours of delivery.</p>
              </div>
            </div>
            <div className="packaging-note">
              <AlertCircle size={14} className="text-gold" />
              <span>
                Keep the original packaging until we've sorted it out. Not having a video doesn't remove your legal rights.
              </span>
            </div>
          </section>

          {/* Section 3 */}
          <section id="sec-exchanges" className="policy-section">
            <div className="section-head">
              <span className="section-num">03</span>
              <h3 className="section-heading">Exchanges</h3>
            </div>
            <p className="section-para">
              We don't usually exchange for a change of mind or colour. We will help if your item is damaged, defective, wrong or not as described.
            </p>
            <p className="section-para">
              Exchanges depend on stock. If we can't replace it, we'll work out another option with you, including a refund where it applies.
            </p>
          </section>

          {/* Section 4 */}
          <section id="sec-refunds" className="policy-section">
            <div className="section-head">
              <span className="section-num">04</span>
              <h3 className="section-heading">Refunds</h3>
            </div>
            <p className="section-para">
              Once we approve a return and receive or check the item, we refund to your original payment method where possible (UPI or bank account).
            </p>
            <p className="section-para">
              We start approved refunds promptly, within the time the law requires. How fast it shows up depends on your bank.
            </p>
          </section>

          {/* Section 5 */}
          <section id="sec-shipping" className="policy-section">
            <div className="section-head">
              <span className="section-num">05</span>
              <h3 className="section-heading">Return shipping</h3>
            </div>
            <p className="section-para">
              If the item was damaged, defective, wrong or not as described, <strong>we'll arrange or pay for reasonable return shipping</strong>.
            </p>
            <p className="section-para">
              For any other return or exchange we agree to, we'll confirm shipping and costs with you first.
            </p>
          </section>

          {/* Section 6 */}
          <section id="sec-variations" className="policy-section">
            <div className="section-head">
              <span className="section-num">06</span>
              <h3 className="section-heading">Colour and handloom variations</h3>
            </div>
            <p className="section-para">
              Handloom fabric can vary slightly in weave, texture or finish — that's the mark of handwork. Colours may also look a little different on your screen.
            </p>
            <p className="section-para">
              Small variations like these aren't defects. But if an item is clearly different from its description or photos, you're still covered.
            </p>
          </section>

          {/* Section 7 */}
          <section id="sec-cancellations" className="policy-section">
            <div className="section-head">
              <span className="section-num">07</span>
              <h3 className="section-heading">Cancellations</h3>
            </div>
            <p className="section-para">
              Need to cancel? Contact us as soon as you can. It depends on whether your order is already being made, shipped or customised (like custom dyeing or fall &amp; pico). This policy doesn't limit your legal rights.
            </p>
          </section>

          {/* Section 8 */}
          <section id="sec-contact" className="policy-section contact-card">
            <div className="section-head">
              <span className="section-num">08</span>
              <h3 className="section-heading">Contact us</h3>
            </div>
            <p className="section-para">
              For help with a return, exchange or refund:
            </p>

            <div className="contact-info-grid">
              <div className="contact-line">
                <span className="contact-label">Brand:</span>
                <span className="contact-val">Saak by Aprajita</span>
              </div>
              <div className="contact-line">
                <span className="contact-label">Email:</span>
                <a href="mailto:Saakbyaprajita@gmail.com" className="contact-val link">Saakbyaprajita@gmail.com</a>
              </div>
              <div className="contact-line">
                <span className="contact-label">WhatsApp:</span>
                <a 
                  href="https://wa.me/916267664409?text=Hi%20Aprajita%2C%20I%20have%20an%20inquiry%20regarding%20my%20order%20return%2Fexchange" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-val link"
                >
                  +91 6267664409
                </a>
              </div>
            </div>

            <div className="order-num-tip">
              <Sparkles size={13} className="text-gold" />
              <span>Please include your <strong>order number (e.g. #SAAK-XXXXXX)</strong> so we can help quickly.</span>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="policy-modal-footer">
          <div className="footer-left">
            <span className="reassurance-text">
              <ShieldCheck size={14} className="text-gold" />
              <span>Insured delivery</span>
            </span>
          </div>
          <div className="footer-right">
            <button 
              type="button" 
              onClick={() => setIsPolicyModalOpen(false)}
              className="btn btn-primary policy-done-btn"
            >
              <span>Got it</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .policy-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 22, 20, 0.75);
          backdrop-filter: blur(6px);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .policy-modal {
          background: #FFFFFF;
          border-radius: 6px;
          max-width: 820px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          border: 1px solid var(--border-gold);
          overflow: hidden;
          animation: slideUp 0.25s ease-out;
        }

        .policy-modal-header {
          padding: 28px 32px 18px 32px;
          border-bottom: 1px solid var(--border-light);
          background: #FAF6EF;
          position: relative;
        }

        .policy-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--border-light);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .policy-close-btn:hover {
          background: var(--text-primary);
          color: #FFFFFF;
        }

        .policy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-terracotta);
          margin-bottom: 8px;
        }

        .policy-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .policy-intro-quote {
          font-size: var(--text-sm);
          line-height: 1.55;
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
          max-width: 680px;
        }

        /* Nav Strip */
        .policy-nav-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px 32px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-light);
          scrollbar-width: none;
        }
        .policy-nav-strip::-webkit-scrollbar {
          display: none;
        }
        .policy-nav-chip {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s;
        }
        .policy-nav-chip:hover,
        .policy-nav-chip.active {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }

        /* Body */
        .policy-modal-body {
          padding: 24px 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: var(--text-primary);
          font-size: var(--text-sm);
          line-height: 1.6;
        }

        .policy-section {
          scroll-margin-top: 10px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-light);
        }
        .policy-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .section-num {
          font-family: var(--font-serif);
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--accent-terracotta);
          background: #FAF2EA;
          padding: 2px 7px;
          border-radius: 3px;
        }
        .section-heading {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .policy-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .policy-bullets li {
          position: relative;
          padding-left: 18px;
          line-height: 1.55;
        }
        .policy-bullets li::before {
          content: '•';
          position: absolute;
          left: 4px;
          top: 0;
          color: var(--accent-terracotta);
          font-weight: bold;
          font-size: var(--text-lg);
        }

        .section-para {
          margin: 0 0 8px 0;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .section-para:last-child {
          margin-bottom: 0;
        }

        /* Unboxing Box */
        .highlight-box {
          background: #FFFDF9;
          border: 1px solid #E6D7C3;
          border-left: 4px solid var(--accent-terracotta);
          border-radius: 4px;
          padding: 18px 20px;
        }
        .policy-lead-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .unboxing-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 14px;
        }
        @media (max-width: 600px) {
          .unboxing-steps-grid {
            grid-template-columns: 1fr;
          }
        }
        .unboxing-card {
          background: #FFFFFF;
          border: 1px solid #EFE4D6;
          border-radius: 4px;
          padding: 12px;
          text-align: center;
        }
        .unboxing-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FAF2EA;
          color: var(--accent-terracotta);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px auto;
        }
        .unboxing-card h4 {
          font-size: var(--text-xs);
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--text-primary);
        }
        .unboxing-card p {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }
        .packaging-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: var(--text-xs);
          color: var(--text-secondary);
          background: rgba(226, 202, 155, 0.15);
          padding: 8px 12px;
          border-radius: 3px;
        }

        /* Contact Section */
        .contact-card {
          background: #FAF6EF;
          border: 1px solid var(--border-gold);
          border-radius: 4px;
          padding: 18px 20px;
        }
        .contact-info-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 12px 0;
        }
        .contact-line {
          display: flex;
          gap: 8px;
          font-size: var(--text-sm);
        }
        .contact-label {
          font-weight: 600;
          color: var(--text-primary);
          width: 90px;
        }
        .contact-val {
          color: var(--text-secondary);
        }
        .contact-val.link {
          color: var(--accent-terracotta);
          text-decoration: underline;
        }
        .order-num-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-secondary);
          padding-top: 8px;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
        }

        /* Footer */
        .policy-modal-footer {
          padding: 16px 32px;
          background: #FAF6EF;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .reassurance-text {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .policy-done-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 8px 18px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 600px) {
          .policy-modal {
            width: 95%;
            max-width: 95%;
            max-height: 94vh;
          }
          .policy-modal-header {
            padding: 18px 16px 14px 16px;
          }
          .policy-title {
            font-size: var(--text-xl);
          }
          .policy-nav-strip {
            padding: 8px 14px;
          }
          .policy-modal-body {
            padding: 16px 14px;
            gap: 18px;
          }
          .policy-modal-footer {
            padding: 12px 14px;
            flex-direction: column;
            gap: 10px;
          }
          .policy-done-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
