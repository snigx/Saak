import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, ShieldCheck, RotateCcw, AlertCircle, Camera, Video, 
  Mail, MessageCircle, Clock, Package, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function RefundPolicyModal() {
  const { isPolicyModalOpen, setIsPolicyModalOpen } = useShop();
  const [activeSection, setActiveSection] = useState('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPolicyModalOpen) {
        setIsPolicyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPolicyModalOpen, setIsPolicyModalOpen]);

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
              <span>SAAK ATELIER • CLIENT ASSURANCE</span>
            </div>
            <h2 id="policy-modal-title" className="policy-title">Returns, Exchanges &amp; Refunds</h2>
            <p className="policy-intro-quote">
              "At SAAK by Aprajita, each piece is chosen with care. We want you to love your purchase, so please review our policy before placing an order."
            </p>
          </div>

          <button 
            type="button"
            className="modal-close-btn policy-close-btn"
            onClick={() => setIsPolicyModalOpen(false)}
            aria-label="Close Returns Policy"
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
            2. Unboxing Video
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
            5. Return Shipping
          </button>
          <button 
            type="button" 
            className={`policy-nav-chip ${activeSection === 'sec-variations' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-variations')}
          >
            6. Handloom Nuances
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
            8. Contact Support
          </button>
        </div>

        {/* Policy Body */}
        <div className="policy-modal-body">
          {/* Section 1 */}
          <section id="sec-eligibility" className="policy-section">
            <div className="section-head">
              <span className="section-num">01</span>
              <h3 className="section-heading">Return Eligibility</h3>
            </div>
            <ul className="policy-bullets">
              <li>
                <strong>Change of Mind:</strong> Returns for a change of mind, colour preference or styling preference are not accepted on standard saree orders.
              </li>
              <li>
                <strong>Damage or Defect Coverage:</strong> If you receive a damaged, defective, incorrect or materially misdescribed product, please contact us within <strong>48 hours of delivery</strong>.
              </li>
              <li>
                <strong>Resolution Pathway:</strong> Eligible issues will be reviewed and resolved through an appropriate replacement, exchange, repair or refund, as applicable.
              </li>
              <li>
                <strong>Product Condition:</strong> Items that have been worn, washed, altered, stained, or damaged after delivery may not qualify for a return unless the issue is due to an original defect or applicable law requires otherwise.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="sec-unboxing" className="policy-section highlight-box">
            <div className="section-head">
              <span className="section-num">02</span>
              <h3 className="section-heading">Unboxing &amp; Reporting an Issue</h3>
            </div>
            <p className="policy-lead-text">
              For a smooth and swift resolution, please follow these simple steps upon receiving your consignment:
            </p>
            <div className="unboxing-steps-grid">
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Video size={18} />
                </div>
                <h4>1. Record Video</h4>
                <p>Record a continuous unboxing video showing the sealed parcel and the product unpackaging.</p>
              </div>
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Camera size={18} />
                </div>
                <h4>2. Capture Photos</h4>
                <p>Photograph any visible damage, weave flaw, or incorrect item clearly in natural light.</p>
              </div>
              <div className="unboxing-card">
                <div className="unboxing-icon-bubble">
                  <Clock size={18} />
                </div>
                <h4>3. Notify in 48 Hours</h4>
                <p>Contact our support team within 48 hours of delivery with your Order # and video/photo proof.</p>
              </div>
            </div>
            <div className="packaging-note">
              <AlertCircle size={14} className="text-gold" />
              <span>
                Please retain the original packaging until your concern has been resolved. Missing an unboxing video will not automatically remove any statutory rights you hold under applicable law.
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
              Exchanges for a change of mind or colour preference are not routinely offered. However, we will assist with eligible cases involving defective, damaged, incorrect or materially misdescribed products.
            </p>
            <p className="section-para">
              Any exchange is subject to product availability in our atelier. If a suitable replacement is unavailable, we will discuss an appropriate resolution, including a refund where applicable.
            </p>
          </section>

          {/* Section 4 */}
          <section id="sec-refunds" className="policy-section">
            <div className="section-head">
              <span className="section-num">04</span>
              <h3 className="section-heading">Refunds</h3>
            </div>
            <p className="section-para">
              Once an eligible return is approved and the returned product has been received or otherwise verified by our atelier artisans, refunds will be processed to the original payment method wherever possible (UPI or bank account).
            </p>
            <p className="section-para">
              We aim to initiate approved refunds promptly and within the timeframe required by applicable law. The time taken for the amount to appear in your account may depend on your bank or payment provider.
            </p>
          </section>

          {/* Section 5 */}
          <section id="sec-shipping" className="policy-section">
            <div className="section-head">
              <span className="section-num">05</span>
              <h3 className="section-heading">Return Shipping</h3>
            </div>
            <p className="section-para">
              If the return is due to a confirmed defect, damage, incorrect item or a material mismatch with the product description, <strong>SAAK by Aprajita will arrange or cover reasonable return shipping</strong>.
            </p>
            <p className="section-para">
              For any other return or exchange that we voluntarily approve, we will confirm the applicable shipping arrangements and costs with you before proceeding.
            </p>
          </section>

          {/* Section 6 */}
          <section id="sec-variations" className="policy-section">
            <div className="section-head">
              <span className="section-num">06</span>
              <h3 className="section-heading">Colour &amp; Handloom Variations</h3>
            </div>
            <p className="section-para">
              Handloom fabrics may have minor variations in weave, texture, motifs or finish that represent the authentic touch of artisanal craftsmanship. Product colours can also appear slightly different depending on studio lighting, photography and screen settings.
            </p>
            <p className="section-para">
              Such minor variations are inherent to handcrafted textiles and are not necessarily defects. However, this does not exclude remedies where a product is materially different from its description or images.
            </p>
          </section>

          {/* Section 7 */}
          <section id="sec-cancellations" className="policy-section">
            <div className="section-head">
              <span className="section-num">07</span>
              <h3 className="section-heading">Order Cancellations</h3>
            </div>
            <p className="section-para">
              Please contact us as soon as possible if you need to cancel an order. Cancellation depends on whether the order has already been processed, dispatched or specially prepared (such as bespoke color dying or complimentary fall &amp; pico tailoring). Nothing in this policy limits any cancellation or refund rights available under applicable law.
            </p>
          </section>

          {/* Section 8 */}
          <section id="sec-contact" className="policy-section contact-card">
            <div className="section-head">
              <span className="section-num">08</span>
              <h3 className="section-heading">Contact Us &amp; Support</h3>
            </div>
            <p className="section-para">
              For return, exchange or refund assistance, our atelier team is here to support you:
            </p>

            <div className="contact-info-grid">
              <div className="contact-line">
                <span className="contact-label">Brand:</span>
                <span className="contact-val">SAAK by Aprajita</span>
              </div>
              <div className="contact-line">
                <span className="contact-label">Email:</span>
                <a href="mailto:contact@saakbyaprajita.com" className="contact-val link">contact@saakbyaprajita.com</a>
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
              <span>Please include your <strong>Order Reference # (e.g. #SAAK-XXXXXX)</strong> in all correspondence so we can assist you promptly.</span>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="policy-modal-footer">
          <div className="footer-left">
            <span className="reassurance-text">
              <ShieldCheck size={14} className="text-gold" />
              <span>Insured delivery with signature verification</span>
            </span>
          </div>
          <div className="footer-right">
            <button 
              type="button" 
              onClick={() => setIsPolicyModalOpen(false)}
              className="btn btn-primary policy-done-btn"
            >
              <span>Understood • Return to Order</span>
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
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-terracotta);
          margin-bottom: 8px;
        }

        .policy-title {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .policy-intro-quote {
          font-size: 13px;
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
          font-size: 11px;
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
          font-size: 13px;
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
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-terracotta);
          background: #FAF2EA;
          padding: 2px 7px;
          border-radius: 3px;
        }
        .section-heading {
          font-family: var(--font-serif);
          font-size: 17px;
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
          font-size: 16px;
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
          font-size: 13px;
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
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--text-primary);
        }
        .unboxing-card p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }
        .packaging-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11.5px;
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
          font-size: 13px;
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
          font-size: 11.5px;
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
          font-size: 11px;
          color: var(--text-muted);
        }
        .policy-done-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
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
      `}</style>
    </div>
  );
}
