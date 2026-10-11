import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext';
import { 
  X, Check, ShieldCheck, ArrowRight, ArrowLeft, Copy, 
  Smartphone, Sparkles, MessageCircle, AlertCircle, ShoppingBag,
  Upload, Clock, CheckCircle2 
} from 'lucide-react';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartTotal, 
    cartSavings, 
    formatPrice, 
    clearCart,
    atelierUpiId,
    setAtelierUpiId 
  } = useShop();

  if (!isCheckoutOpen) return null;

  // Step 1: 'shipping', Step 2: 'payment', Step 3: 'success'
  const [currentStep, setCurrentStep] = useState('shipping');

  // Customer Shipping Details
  const [shippingData, setShippingData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    stylingNotes: ''
  });

  // Payment Verification State
  const [orderId, setOrderId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate unique order ID on open
  useEffect(() => {
    if (!orderId) {
      const generatedId = `SAAK-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
    }
  }, [orderId]);

  // Construct NPCI Standard UPI URI
  const payeeVpa = atelierUpiId || 'saakbyaprajita@okhdfcbank';
  const payeeName = 'Saak by Aprajita';
  const amountStr = cartTotal.toFixed(2);
  const transactionNote = `Order ${orderId}`;

  // Standard NPCI URI spec:
  // upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE&tr=REF_ID
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${orderId}`;

  // Generate QR Code data URL when entering payment step
  useEffect(() => {
    if (currentStep === 'payment' && cartTotal > 0) {
      QRCode.toDataURL(upiIntentUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1F1A17',
          light: '#FAF6EF'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating UPI QR code:', err));
    }
  }, [currentStep, upiIntentUrl, cartTotal]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPaymentScreenshot(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.phone || !shippingData.address || !shippingData.pincode) {
      alert('Please fill in all required delivery details.');
      return;
    }
    setCurrentStep('payment');
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 6) {
      alert('Please enter a valid 12-digit UPI Reference Number (UTR) from your payment app.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStep('success');
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A34835', '#C5A059', '#FAF6EF']
        });
      } catch (e) {}
      if (clearCart) clearCart();
    }, 1200);
  };

  // WhatsApp formatted message for direct client-to-Aprajita confirmation
  const orderSummaryText = cart.map(i => `• ${i.name} (${i.selectedSize}${i.customColor ? `, Shade: ${i.customColor}` : ''}) x${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
  const whatsappReceiptMessage = encodeURIComponent(
    `✨ *NEW ORDER CONFIRMATION: ${orderId}*\n\n` +
    `*Client:* ${shippingData.fullName}\n` +
    `*Phone:* ${shippingData.phone}\n` +
    `*Delivery Address:*\n${shippingData.address}, ${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}\n\n` +
    `*Items Ordered:*\n${orderSummaryText}\n\n` +
    `*Total Paid via UPI:* ₹${cartTotal.toLocaleString('en-IN')}\n` +
    `*UPI UTR / Ref No:* ${utrNumber}\n` +
    `${shippingData.stylingNotes ? `*Tailoring Note:* ${shippingData.stylingNotes}\n` : ''}\n` +
    `Please confirm the order and dispatch timeline from Saak Atelier!`
  );

  return (
    <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
      <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={() => setIsCheckoutOpen(false)}
          aria-label="Close Checkout"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="checkout-header">
          <div className="checkout-badge">
            <Sparkles size={13} className="text-gold" />
            <span>DIRECT UPI ATELIER CHECKOUT • ZERO FEES</span>
          </div>
          <h2 className="checkout-title">
            {currentStep === 'shipping' && 'Delivery & Client Details'}
            {currentStep === 'payment' && 'Scan & Pay via UPI'}
            {currentStep === 'success' && 'Order Successfully Placed!'}
          </h2>

          {/* Stepper Navigation */}
          {currentStep !== 'success' && (
            <div className="checkout-steps-bar">
              <div className={`step-item ${currentStep === 'shipping' ? 'active' : 'completed'}`}>
                <span className="step-num">1</span>
                <span>Delivery Address</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step-item ${currentStep === 'payment' ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span>Direct UPI Payment</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SHIPPING & DELIVERY DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 'shipping' && (
          <form onSubmit={handleProceedToPayment} className="checkout-form">
            <div className="form-sections-grid">
              {/* Left: Client Form */}
              <div className="form-col">
                <h4 className="section-subheading">Shipping Information</h4>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Priya Sharma"
                    value={shippingData.fullName}
                    onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WhatsApp Contact *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. +91 98765 43210"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="form-input"
                    />
                    <span className="form-hint">For dispatch tracking &amp; drape fit updates</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="priya@example.com"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Street Address *</label>
                  <textarea 
                    rows="2"
                    required 
                    placeholder="Flat/House number, Apartment name, Street, Landmark..."
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Mumbai / Delhi / Bengaluru"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 400050"
                      value={shippingData.pincode}
                      onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Drape or Tailoring Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stitch pleats to 38 height / Sister's sangeet on Dec 14th"
                    value={shippingData.stylingNotes}
                    onChange={(e) => setShippingData({ ...shippingData, stylingNotes: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Right: Order Summary Preview */}
              <div className="summary-col">
                <h4 className="section-subheading">Order Overview</h4>
                
                <div className="summary-items-list">
                  {cart.map(item => (
                    <div key={item.itemKey} className="summary-item-card">
                      <img 
                        src={item.images?.modelView || item.images?.flatlayView} 
                        alt="" 
                        className="summary-item-thumb" 
                      />
                      <div className="summary-item-info">
                        <span className="summary-item-name">{item.name}</span>
                        <span className="summary-item-meta">{item.selectedSize} {item.customColor && `• ${item.customColor}`} • Qty {item.quantity}</span>
                        <span className="summary-item-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-calc-box">
                  <div className="calc-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {cartSavings > 0 && (
                    <div className="calc-row savings-row">
                      <span>Privilege Savings:</span>
                      <span>-{formatPrice(cartSavings)}</span>
                    </div>
                  )}
                  <div className="calc-row">
                    <span>Shipping &amp; Insurance:</span>
                    <span className="text-green">COMPLIMENTARY</span>
                  </div>
                  <div className="calc-row">
                    <span>Fall &amp; Pico Stitching:</span>
                    <span className="text-green">INCLUDED</span>
                  </div>
                  <div className="calc-row total-row">
                    <span>Total Payable:</span>
                    <span className="total-highlight">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary next-step-btn">
                  <span>Continue to Direct UPI Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DYNAMIC UPI PAYMENT (SCAN & PAY) */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <div className="payment-step-grid">
            {/* Left: Dynamic QR Code Box */}
            <div className="qr-container-card">
              <div className="qr-top-bar">
                <span className="amount-label">Exact Payable Amount:</span>
                <span className="amount-highlight">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Dynamic QR Code Render */}
              <div className="qr-graphic-frame">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan to pay via UPI" className="qr-image" />
                ) : (
                  <div className="qr-loading">Generating Dynamic UPI QR...</div>
                )}
                <div className="qr-corner corner-tl"></div>
                <div className="qr-corner corner-tr"></div>
                <div className="qr-corner corner-bl"></div>
                <div className="qr-corner corner-br"></div>
              </div>

              <span className="qr-instruction">
                Scan with any UPI App: <strong>GPay, PhonePe, Paytm, CRED, BHIM</strong>
              </span>

              {/* Copy UPI ID Row */}
              <div className="upi-id-pill">
                <span className="vpa-text">{payeeVpa}</span>
                <button 
                  type="button" 
                  onClick={handleCopyUpi} 
                  className="copy-btn"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={13} color="#2E7D32" /> : <Copy size={13} />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Mobile 1-Tap Pay Direct App Links */}
              <div className="mobile-intent-block">
                <span className="mobile-intent-hint">Browsing on your phone? Tap below:</span>
                <a 
                  href={upiIntentUrl}
                  className="btn btn-primary mobile-pay-btn"
                >
                  <Smartphone size={15} />
                  <span>Tap to Pay via any UPI App</span>
                </a>
              </div>
            </div>

            {/* Right: Payment Verification Form */}
            <div className="verification-card">
              <button 
                type="button" 
                onClick={() => setCurrentStep('shipping')}
                className="back-btn"
              >
                <ArrowLeft size={13} />
                <span>Back to Shipping Details</span>
              </button>

              <h4 className="verif-heading">Verify &amp; Confirm Your Payment</h4>
              <p className="verif-desc">
                After approving the payment in your UPI app, please enter your <strong>12-digit UPI Reference Number (UTR)</strong> below to confirm your order.
              </p>

              <form onSubmit={handleConfirmPayment} className="verif-form">
                <div className="form-group">
                  <label className="form-label">12-Digit UPI Ref Number (UTR) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 429108472910"
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="form-input utr-input"
                  />
                  <span className="form-hint">
                    Found in your GPay / PhonePe / Paytm transaction receipt under "UPI Transaction ID" or "UTR".
                  </span>
                </div>

                {/* Optional Screenshot Upload */}
                <div className="form-group">
                  <label className="form-label">Payment Screenshot (Optional)</label>
                  <label className="screenshot-upload-box">
                    <Upload size={16} />
                    <span>{paymentScreenshot ? 'Screenshot Uploaded ✓' : 'Upload Payment Screenshot'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleScreenshotUpload}
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                <div className="perks-reassurance-box">
                  <div className="reassurance-item">
                    <ShieldCheck size={14} className="text-gold" />
                    <span>Zero convenience or gateway fees charged.</span>
                  </div>
                  <div className="reassurance-item">
                    <Clock size={14} className="text-gold" />
                    <span>Orders confirmed within 15 minutes by Aprajita's atelier.</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isVerifying}
                  className="btn btn-primary confirm-order-btn"
                >
                  {isVerifying ? (
                    <span>Verifying Transfer...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm Order ({formatPrice(cartTotal)})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ORDER SUCCESS & WHATSAPP CONFIRMATION */}
        {/* ========================================================================= */}
        {currentStep === 'success' && (
          <div className="success-step-container">
            <div className="success-icon-bubble">
              <Check size={36} color="#FFFFFF" />
            </div>

            <span className="success-sub">THANK YOU, {shippingData.fullName.toUpperCase()}</span>
            <h3 className="success-title">Your Saak Creation is Being Prepared!</h3>
            <p className="success-msg">
              We have received your payment reference <strong>UTR: {utrNumber}</strong> for Order <strong>#{orderId}</strong>. Our atelier master dyers and tailors have begun preparing your ensemble.
            </p>

            {/* Order Card */}
            <div className="success-order-card">
              <div className="card-top">
                <span>Order Reference: <strong>#{orderId}</strong></span>
                <span>Total Amount: <strong>₹{cartTotal.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="card-deliver">
                <span>Delivery To:</span>
                <strong>{shippingData.address}, {shippingData.city} - {shippingData.pincode}</strong>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Action */}
            <div className="whatsapp-action-block">
              <p className="wa-prompt">
                To receive real-time saree weaving videos, custom blouse fitting notes, or direct dispatch tracking:
              </p>
              <a 
                href={`https://wa.me/?text=${whatsappReceiptMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary whatsapp-order-btn"
              >
                <MessageCircle size={18} />
                <span>Send Order &amp; Receipt to Aprajita on WhatsApp</span>
              </a>
            </div>

            <button 
              type="button"
              onClick={() => {
                setIsCheckoutOpen(false);
                setCurrentStep('shipping');
              }}
              className="btn btn-outline close-success-btn"
            >
              Continue Exploring Collection
            </button>
          </div>
        )}
      </div>

      <style>{`
        .checkout-modal {
          background: #FFFFFF;
          border-radius: 4px;
          max-width: 900px;
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          padding: 32px;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-gold);
        }
        .checkout-header {
          margin-bottom: 24px;
          text-align: center;
        }
        .checkout-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .checkout-title {
          font-family: var(--font-serif);
          font-size: 26px;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .checkout-steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .step-item.active {
          color: var(--accent-terracotta);
        }
        .step-item.completed {
          color: #2E7D32;
        }
        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        .step-item.active .step-num {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        .step-item.completed .step-num {
          background: #2E7D32;
          color: #FFFFFF;
        }
        .step-connector {
          width: 40px;
          height: 1px;
          background: var(--border-light);
        }

        /* Step 1 Layout */
        .form-sections-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr;
          gap: 32px;
        }
        .section-subheading {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--text-primary);
          margin-bottom: 14px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 6px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 12px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-hint {
          font-size: 10px;
          color: var(--text-muted);
        }
        .form-input, .form-textarea {
          padding: 9px 12px;
          font-size: 13px;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: var(--bg-primary);
          outline: none;
          font-family: inherit;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-terracotta);
          background: #FFFFFF;
        }

        /* Summary Preview Column */
        .summary-col {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 220px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
        .summary-item-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          padding: 8px;
          border-radius: 3px;
          border: 1px solid var(--border-light);
        }
        .summary-item-thumb {
          width: 44px;
          height: 56px;
          object-fit: cover;
          border-radius: 2px;
        }
        .summary-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
        }
        .summary-item-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .summary-item-meta {
          color: var(--text-muted);
        }
        .summary-item-price {
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .summary-calc-box {
          border-top: 1px solid var(--border-light);
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          margin-bottom: 20px;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
        }
        .savings-row {
          color: var(--accent-terracotta);
          font-weight: 600;
        }
        .text-green {
          color: #2E7D32;
          font-weight: 600;
        }
        .total-row {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          border-top: 1px dashed var(--border-light);
          padding-top: 8px;
        }
        .total-highlight {
          color: var(--accent-terracotta);
        }
        .next-step-btn {
          width: 100%;
          padding: 12px;
          font-size: 13px;
          gap: 6px;
        }

        /* Step 2: Payment Layout */
        .payment-step-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }
        .qr-container-card {
          background: #FAF6EF;
          border: 1px solid var(--border-gold);
          border-radius: 4px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .qr-top-bar {
          margin-bottom: 16px;
        }
        .amount-label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
        }
        .amount-highlight {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .qr-graphic-frame {
          position: relative;
          background: #FFFFFF;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid var(--border-light);
          margin-bottom: 14px;
          box-shadow: var(--shadow-sm);
        }
        .qr-image {
          display: block;
          width: 220px;
          height: 220px;
        }
        .qr-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: var(--accent-gold);
        }
        .corner-tl { top: -2px; left: -2px; border-top: 3px solid; border-left: 3px solid; }
        .corner-tr { top: -2px; right: -2px; border-top: 3px solid; border-right: 3px solid; }
        .corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid; border-left: 3px solid; }
        .corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid; border-right: 3px solid; }
        .qr-instruction {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .upi-id-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-family: monospace;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .mobile-intent-block {
          width: 100%;
          border-top: 1px solid var(--border-light);
          padding-top: 14px;
        }
        .mobile-intent-hint {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .mobile-pay-btn {
          width: 100%;
          padding: 10px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
        }

        /* Verification Form Right Column */
        .verification-card {
          display: flex;
          flex-direction: column;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          margin-bottom: 14px;
          align-self: flex-start;
        }
        .back-btn:hover {
          color: var(--accent-terracotta);
        }
        .verif-heading {
          font-family: var(--font-serif);
          font-size: 18px;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .verif-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .utr-input {
          font-size: 16px;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        .screenshot-upload-box {
          border: 1px dashed var(--border-light);
          background: #FAF6EF;
          padding: 12px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: var(--accent-terracotta);
          cursor: pointer;
          transition: var(--transition);
        }
        .screenshot-upload-box:hover {
          background: #FFFFFF;
          border-color: var(--accent-terracotta);
        }
        .perks-reassurance-box {
          background: #FAF6EF;
          padding: 12px;
          border-radius: 3px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 14px 0 20px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .reassurance-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .confirm-order-btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Step 3: Success Layout */
        .success-step-container {
          text-align: center;
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .success-icon-bubble {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(46, 125, 50, 0.25);
        }
        .success-sub {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #2E7D32;
          margin-bottom: 6px;
        }
        .success-title {
          font-family: var(--font-serif);
          font-size: 28px;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .success-msg {
          font-size: 13px;
          color: var(--text-secondary);
          max-width: 520px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .success-order-card {
          background: #FAF6EF;
          border: 1px solid var(--border-gold);
          border-radius: 4px;
          padding: 16px;
          max-width: 480px;
          width: 100%;
          font-size: 12px;
          text-align: left;
          margin-bottom: 24px;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .whatsapp-action-block {
          background: #F4FBF4;
          border: 1px solid #C8E6C9;
          border-radius: 4px;
          padding: 20px;
          max-width: 520px;
          width: 100%;
          margin-bottom: 20px;
        }
        .wa-prompt {
          font-size: 12px;
          color: #2E7D32;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .whatsapp-order-btn {
          width: 100%;
          background: #25D366;
          border-color: #25D366;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          text-decoration: none;
          padding: 12px;
        }
        .whatsapp-order-btn:hover {
          background: #1EBE5D;
        }
        .close-success-btn {
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .form-sections-grid, .payment-step-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .checkout-modal {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
