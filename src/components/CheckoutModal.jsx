import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext';
import { 
  X, Check, ShieldCheck, ArrowRight, ArrowLeft, Copy, 
  Smartphone, Sparkles, MessageCircle, AlertCircle, ShoppingBag,
  Upload, Clock, CheckCircle2, Loader2, Banknote, PhoneCall,
  Truck, ExternalLink, Mail 
} from 'lucide-react';
import { saveOrderToDb } from '../services/ordersService';
import { uploadImageBlob } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

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
    setAtelierUpiId,
    refreshOrders,
    orders = []
  } = useShop();

  const { user } = useAuth();

  if (!isCheckoutOpen) return null;

  // Step 1: 'shipping', Step 2: 'payment', Step 3: 'success'
  const [currentStep, setCurrentStep] = useState('shipping');

  // Customer Shipping Details
  const [shippingData, setShippingData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    stylingNotes: ''
  });

  // Validation Errors State
  const [formErrors, setFormErrors] = useState({});

  // Payment Verification State
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'cod'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedSuccessAwb, setCopiedSuccessAwb] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCopySuccessAwb = (awbCode) => {
    if (!awbCode) return;
    navigator.clipboard.writeText(awbCode);
    setCopiedSuccessAwb(true);
    setTimeout(() => setCopiedSuccessAwb(false), 2000);
  };

  // Guardrail: Disallow letters in phone input in real time
  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    // Strip all alphabetic characters (a-z, A-Z) and invalid characters
    let cleaned = raw.replace(/[a-zA-Z]/g, '').replace(/[^\d+\s-]/g, '');

    // Format '+' so it can only ever appear as the very first character
    if (cleaned.includes('+')) {
      const startsWithPlus = cleaned.startsWith('+');
      cleaned = (startsWithPlus ? '+' : '') + cleaned.replace(/\+/g, '');
    }

    setShippingData(prev => ({ ...prev, phone: cleaned }));

    // Clear error if phone digits reach valid length (10 to 15 digits)
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (formErrors.phone && digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      setFormErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    // Intercept letter keys directly to prevent any alphabet entry
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text') || '';
    const sanitized = pastedText.replace(/[a-zA-Z]/g, '').replace(/[^\d+\s-]/g, '');
    const currentVal = shippingData.phone || '';
    let combined = (currentVal + sanitized).replace(/[^\d+\s-]/g, '');
    if (combined.includes('+')) {
      const startsWithPlus = combined.startsWith('+');
      combined = (startsWithPlus ? '+' : '') + combined.replace(/\+/g, '');
    }
    setShippingData(prev => ({ ...prev, phone: combined }));
    const digitsOnly = combined.replace(/\D/g, '');
    if (formErrors.phone && digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      setFormErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setShippingData(prev => ({ ...prev, email: val }));

    if (formErrors.email) {
      const emailTrim = val.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailTrim || emailRegex.test(emailTrim)) {
        setFormErrors(prev => ({ ...prev, email: null }));
      }
    }
  };

  const handlePincodeChange = (e) => {
    // Only numbers, max 6 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
    setShippingData(prev => ({ ...prev, pincode: cleaned }));

    if (formErrors.pincode && cleaned.length === 6) {
      setFormErrors(prev => ({ ...prev, pincode: null }));
    }
  };

  // Generate unique order ID on open
  useEffect(() => {
    if (!orderId) {
      const generatedId = `SAAK-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
    }
  }, [orderId]);

  // Construct NPCI Standard UPI URI
  const payeeVpa = atelierUpiId || '6267664409@ybl';
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
      setPaymentScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPaymentScreenshot(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateShippingForm = () => {
    const errors = {};

    // 1. Full name validation
    if (!shippingData.fullName || !shippingData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    // 2. Phone validation (guardrail against letters, minimum 10 digits)
    const phoneRaw = (shippingData.phone || '').trim();
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    
    if (!phoneRaw) {
      errors.phone = 'Mobile contact is required.';
    } else if (/[a-zA-Z]/.test(phoneRaw)) {
      errors.phone = 'Phone number cannot contain letters.';
    } else if (phoneDigits.length < 10) {
      errors.phone = 'Please enter a valid 10-digit number.';
    } else if (phoneDigits.length > 15) {
      errors.phone = 'Phone number is too long (max 15 digits).';
    }

    // 3. Email validation (simple validation: if provided, must match email format)
    const emailTrim = (shippingData.email || '').trim();
    if (emailTrim) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    // 4. Address validation
    if (!shippingData.address || !shippingData.address.trim()) {
      errors.address = 'Please enter delivery address.';
    }

    // 5. City validation
    if (!shippingData.city || !shippingData.city.trim()) {
      errors.city = 'Please enter city.';
    }

    // 6. Pincode validation
    const pinDigits = (shippingData.pincode || '').replace(/\D/g, '');
    if (!shippingData.pincode || !shippingData.pincode.trim()) {
      errors.pincode = 'Pincode is required.';
    } else if (pinDigits.length !== 6) {
      errors.pincode = 'Please enter a valid 6-digit pincode.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!validateShippingForm()) {
      return;
    }
    setCurrentStep('payment');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 6) {
      alert('Please enter a valid 12-digit UPI Reference Number (UTR) from your payment app.');
      return;
    }

    setIsVerifying(true);
    try {
      let finalScreenshotUrl = paymentScreenshot;
      if (paymentScreenshotFile) {
        try {
          finalScreenshotUrl = await uploadImageBlob(paymentScreenshotFile, 'receipts');
        } catch (err) {
          console.warn('Screenshot upload fallback:', err);
        }
      }

      await saveOrderToDb({
        orderId,
        fullName: shippingData.fullName,
        phone: shippingData.phone,
        email: shippingData.email,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
        stylingNotes: shippingData.stylingNotes,
        items: cart,
        totalAmount: cartTotal,
        utrNumber,
        paymentScreenshotUrl: finalScreenshotUrl
      });
      if (refreshOrders) refreshOrders();
    } catch (err) {
      console.warn('Could not save order:', err);
    } finally {
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
    }
  };

  // Cash on Delivery confirmation handler
  const handleConfirmCodOrder = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await saveOrderToDb({
        orderId,
        fullName: shippingData.fullName,
        phone: shippingData.phone,
        email: shippingData.email,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode,
        stylingNotes: shippingData.stylingNotes,
        items: cart,
        totalAmount: cartTotal,
        utrNumber: 'COD-PENDING',
        paymentMethod: 'Cash on Delivery (COD)',
        paymentScreenshotUrl: null,
        paymentStatus: 'cod_pending',
        fulfillmentStatus: 'unfulfilled',
        adminNotes: 'Order placed via Cash on Delivery. Awaiting concierge phone confirmation before handcrafting fall & pico.'
      });
      if (refreshOrders) refreshOrders();
    } catch (err) {
      console.warn('Could not save COD order:', err);
    } finally {
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
    }
  };

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
            <span>SAAK ATELIER • BESPOKE CLIENT CHECKOUT</span>
          </div>
          <h2 className="checkout-title">
            {currentStep === 'shipping' && 'Delivery & Client Details'}
            {currentStep === 'payment' && (paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Scan & Pay via UPI')}
            {currentStep === 'success' && (paymentMethod === 'cod' ? 'Cash on Delivery Order Placed!' : 'Order Successfully Placed!')}
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
                <span>{paymentMethod === 'cod' ? 'Doorstep Payment' : 'Payment Preference'}</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SHIPPING & DELIVERY DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 'shipping' && (
          <form onSubmit={handleProceedToPayment} className="checkout-form" noValidate>
            <div className="form-sections-grid">
              {/* Left: Client Form */}
              <div className="form-col">
                <h4 className="section-subheading">Shipping Information</h4>

                <div className="form-group">
                  <label className="form-label">
                    <span>Full Name *</span>
                    {formErrors.fullName && <span className="field-error-text">{formErrors.fullName}</span>}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Priya Sharma"
                    value={shippingData.fullName}
                    onChange={(e) => {
                      setShippingData({ ...shippingData, fullName: e.target.value });
                      if (formErrors.fullName && e.target.value.trim()) {
                        setFormErrors(prev => ({ ...prev, fullName: null }));
                      }
                    }}
                    className={`form-input ${formErrors.fullName ? 'input-error' : ''}`}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <span>WhatsApp Contact *</span>
                      {formErrors.phone && <span className="field-error-text">{formErrors.phone}</span>}
                    </label>
                    <input 
                      type="tel" 
                      inputMode="tel"
                      placeholder="e.g. 98765 43210 or +91 98765 43210"
                      value={shippingData.phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onPaste={handlePhonePaste}
                      className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                    />
                    <span className="form-hint">Numbers only (no letters). For dispatch tracking &amp; drape fit updates</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Email Address (Optional)</span>
                      {formErrors.email && <span className="field-error-text">{formErrors.email}</span>}
                    </label>
                    <input 
                      type="email" 
                      placeholder="priya@example.com"
                      value={shippingData.email}
                      onChange={handleEmailChange}
                      className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                    />
                    <span className="form-hint">For order confirmation &amp; courier tracking emails</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Delivery Street Address *</span>
                    {formErrors.address && <span className="field-error-text">{formErrors.address}</span>}
                  </label>
                  <textarea 
                    rows="2"
                    placeholder="Flat/House number, Apartment name, Street, Landmark..."
                    value={shippingData.address}
                    onChange={(e) => {
                      setShippingData({ ...shippingData, address: e.target.value });
                      if (formErrors.address && e.target.value.trim()) {
                        setFormErrors(prev => ({ ...prev, address: null }));
                      }
                    }}
                    className={`form-textarea ${formErrors.address ? 'input-error' : ''}`}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <span>City *</span>
                      {formErrors.city && <span className="field-error-text">{formErrors.city}</span>}
                    </label>
                    <input 
                      type="text" 
                      placeholder="Mumbai / Delhi / Bengaluru"
                      value={shippingData.city}
                      onChange={(e) => {
                        setShippingData({ ...shippingData, city: e.target.value });
                        if (formErrors.city && e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, city: null }));
                        }
                      }}
                      className={`form-input ${formErrors.city ? 'input-error' : ''}`}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <span>Pincode *</span>
                      {formErrors.pincode && <span className="field-error-text">{formErrors.pincode}</span>}
                    </label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 400050"
                      value={shippingData.pincode}
                      onChange={handlePincodeChange}
                      onKeyDown={(e) => {
                        if (e.key.length === 1 && /\D/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                          e.preventDefault();
                        }
                      }}
                      className={`form-input ${formErrors.pincode ? 'input-error' : ''}`}
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
                  <span>Continue to Payment Method</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PAYMENT METHOD & VERIFICATION (UPI OR CASH ON DELIVERY) */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <div className="payment-step-wrapper">
            {/* Payment Method Selector Switch */}
            <div className="payment-method-selector-card">
              <span className="method-picker-label">Choose Payment Preference:</span>
              <div className="payment-method-options">
                <button
                  type="button"
                  className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="method-card-header">
                    <div className="method-title-group">
                      <Sparkles size={16} className={paymentMethod === 'upi' ? 'text-gold' : ''} />
                      <strong>Direct UPI Transfer</strong>
                    </div>
                    <span className="method-tag green">Zero Fee • Instant</span>
                  </div>
                  <p className="method-card-desc">
                    Scan dynamic QR with Google Pay, PhonePe, Paytm, or CRED for fastest confirmation.
                  </p>
                </button>

                <button
                  type="button"
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="method-card-header">
                    <div className="method-title-group">
                      <Banknote size={16} className={paymentMethod === 'cod' ? 'text-gold' : ''} />
                      <strong>Cash on Delivery (COD)</strong>
                    </div>
                    <span className="method-tag amber">Pay at Doorstep</span>
                  </div>
                  <p className="method-card-desc">
                    Pay via Cash or UPI to the courier delivery executive upon arrival at your door.
                  </p>
                </button>
              </div>
            </div>

            {/* View A: Direct UPI */}
            {paymentMethod === 'upi' && (
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

            {/* View B: Cash on Delivery */}
            {paymentMethod === 'cod' && (
              <form onSubmit={handleConfirmCodOrder} className="cod-step-container">
                <div className="cod-details-grid">
                  <div className="cod-reassurance-card">
                    <h4 className="cod-card-title">
                      <Banknote size={18} className="text-gold" />
                      <span>Doorstep Payment Assurance</span>
                    </h4>
                    
                    <div className="cod-perks-list">
                      <div className="cod-perk-item">
                        <ShieldCheck size={18} className="text-green" />
                        <div>
                          <strong>Zero Upfront Payment Required</strong>
                          <p>Pay cash or scan courier's QR code only when your Saak parcel arrives at your hands.</p>
                        </div>
                      </div>

                      <div className="cod-perk-item">
                        <PhoneCall size={18} className="text-gold" />
                        <div>
                          <strong>Concierge Drape Verification Call</strong>
                          <p>Our atelier team will contact <strong>{shippingData.phone}</strong> to re-confirm your delivery date and tailoring measurements before hand-finishing.</p>
                        </div>
                      </div>

                      <div className="cod-perk-item">
                        <Clock size={18} className="text-gold" />
                        <div>
                          <strong>Complimentary Fall &amp; Pico Stitching</strong>
                          <p>Bespoke hand-stitching service included with your drape.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="cod-summary-card">
                    <div className="cod-summary-top">
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep('shipping')}
                        className="back-btn"
                      >
                        <ArrowLeft size={13} />
                        <span>Back to Address</span>
                      </button>
                      <span className="order-tag">Order #{orderId}</span>
                    </div>

                    <h4 className="cod-card-title">
                      <ShoppingBag size={16} className="text-gold" />
                      <span>Order &amp; Delivery Summary</span>
                    </h4>

                    <div className="cod-delivery-preview">
                      <span className="delivery-label">Delivering To:</span>
                      <strong className="delivery-recipient">{shippingData.fullName}</strong>
                      <p className="delivery-address">{shippingData.address}, {shippingData.city}, {shippingData.state} - {shippingData.pincode}</p>
                      <span className="delivery-phone">Phone: {shippingData.phone}</span>
                      {shippingData.stylingNotes && (
                        <div className="delivery-note">Note: "{shippingData.stylingNotes}"</div>
                      )}
                    </div>

                    <div className="cod-amount-breakdown">
                      <div className="breakdown-row">
                        <span>Items Subtotal:</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Insured Express Shipping:</span>
                        <span className="text-green">COMPLIMENTARY</span>
                      </div>
                      <div className="breakdown-row">
                        <span>Cash on Delivery Handling Fee:</span>
                        <span className="text-green">₹0 (WAIVED)</span>
                      </div>
                      <div className="breakdown-row total-row">
                        <span>Amount to Pay on Arrival:</span>
                        <span className="total-highlight">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="btn btn-primary confirm-order-btn cod-submit-btn"
                    >
                      {isVerifying ? (
                        <span>Logging COD Order...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Place Cash on Delivery Order ({formatPrice(cartTotal)})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ORDER SUCCESS & TRACKING DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 'success' && (() => {
          const currentOrder = (orders || []).find(o => o.id === orderId);
          const isDispatched = currentOrder?.fulfillment_status === 'dispatched' || currentOrder?.fulfillment_status === 'shipped' || Boolean(currentOrder?.dispatch_details?.trackingNumber);
          const dispatchDetails = currentOrder?.dispatch_details || {};
          const courierName = dispatchDetails.courier || (currentOrder?.tracking_number ? currentOrder.tracking_number.split('#')[0].trim() : 'Insured Courier Partner');
          const trackingAwb = dispatchDetails.trackingNumber || (currentOrder?.tracking_number ? currentOrder.tracking_number.split('#')[1]?.trim() : '');
          const trackingUrl = dispatchDetails.trackingUrl || (trackingAwb ? `https://www.google.com/search?q=${encodeURIComponent(courierName + ' tracking ' + trackingAwb)}` : '');
          const estimatedDelivery = dispatchDetails.estimatedDelivery || '3-5 Business Days';

          return (
            <div className="success-step-container">
              <div className="success-icon-bubble">
                <Check size={36} color="#FFFFFF" />
              </div>

              <span className="success-sub">THANK YOU, {shippingData.fullName.toUpperCase()}</span>
              <h3 className="success-title">
                {paymentMethod === 'cod' 
                  ? 'Your Cash on Delivery Order is Confirmed!' 
                  : 'Your Saak Creation is Being Prepared!'}
              </h3>
              <p className="success-msg">
                {paymentMethod === 'cod' ? (
                  <>
                    Order <strong>#{orderId}</strong> has been logged for Cash on Delivery. Amount to pay upon arrival: <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>. Our concierge will contact you on <strong>{shippingData.phone}</strong> to confirm your delivery availability.
                  </>
                ) : (
                  <>
                    We have received your payment reference <strong>UTR: {utrNumber}</strong> for Order <strong>#{orderId}</strong>. Our atelier master dyers and tailors have begun preparing your ensemble.
                  </>
                )}
              </p>

              {/* Order Card */}
              <div className="success-order-card">
                <div className="card-top">
                  <span>Order Reference: <strong>#{orderId}</strong></span>
                  <span>
                    {paymentMethod === 'cod' ? 'Pay on Delivery: ' : 'Total Paid: '}
                    <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <div className="card-deliver">
                  <span>Delivery To:</span>
                  <strong>{shippingData.address}, {shippingData.city} - {shippingData.pincode}</strong>
                </div>
              </div>

              {/* Consignment & Tracking Details (Replaces WhatsApp block) */}
              {isDispatched ? (
                <div className="success-tracking-block dispatched">
                  <div className="tracking-header">
                    <div className="tracking-badge dispatched-badge">
                      <Truck size={14} />
                      <span>ORDER DISPATCHED</span>
                    </div>
                    {dispatchDetails.dispatched_at && (
                      <span className="dispatch-time-meta">
                        Dispatched {new Date(dispatchDetails.dispatched_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="tracking-details-grid">
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Courier Partner</span>
                      <span className="tracking-cell-val font-medium">{courierName}</span>
                    </div>
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Waybill / AWB No.</span>
                      <div className="tracking-awb-wrap">
                        <span className="tracking-cell-val font-mono">{trackingAwb || 'Provided on Dispatch'}</span>
                        {trackingAwb && (
                          <button 
                            type="button" 
                            onClick={() => handleCopySuccessAwb(trackingAwb)}
                            className="copy-awb-btn"
                            title="Copy AWB Number"
                          >
                            {copiedSuccessAwb ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                            <span>{copiedSuccessAwb ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Estimated Delivery</span>
                      <span className="tracking-cell-val">{estimatedDelivery}</span>
                    </div>
                  </div>

                  {trackingUrl && (
                    <a 
                      href={trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary track-consignment-btn"
                    >
                      <Truck size={16} />
                      <span>Track Consignment Live</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {shippingData.email && (
                    <div className="tracking-email-note">
                      <Mail size={12} />
                      <span>Tracking link &amp; status updates also emailed to <strong>{shippingData.email}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="success-tracking-block pending">
                  <div className="tracking-header">
                    <div className="tracking-badge pending-badge">
                      <Clock size={13} />
                      <span>AWAITING DISPATCH</span>
                    </div>
                  </div>

                  <div className="tracking-pending-content">
                    <div className="tracking-pending-icon">
                      <Truck size={22} className="text-gold" />
                    </div>
                    <div className="tracking-pending-info">
                      <h4 className="tracking-pending-title">
                        Tracking details will be shared as soon as it is available.
                      </h4>
                      <p className="tracking-pending-desc">
                        Our atelier artisans are hand-inspecting your pieces and tailoring the complimentary fall &amp; pico. Once handed over to our insured courier partner, your live tracking details and AWB will appear right here.
                      </p>
                    </div>
                  </div>

                  {shippingData.email && (
                    <div className="tracking-email-note">
                      <Mail size={12} />
                      <span>Order confirmation &amp; live tracking will be emailed to <strong>{shippingData.email}</strong></span>
                    </div>
                  )}
                </div>
              )}

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
          );
        })()}
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .field-error-text {
          font-size: 11px;
          color: #C62828;
          font-weight: 500;
          letter-spacing: 0;
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
          transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-terracotta);
          background: #FFFFFF;
        }
        .form-input.input-error, .form-textarea.input-error {
          border-color: #C62828 !important;
          background: #FFF9F9 !important;
          box-shadow: 0 0 0 1px rgba(198, 40, 40, 0.25);
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
          margin-bottom: 20px;
        }
        .success-order-card {
          background: #FAF6EF;
          border: 1px solid var(--border-gold);
          border-radius: 4px;
          padding: 16px;
          max-width: 500px;
          width: 100%;
          font-size: 12px;
          text-align: left;
          margin-bottom: 16px;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        /* Success Tracking Details Card (Replaces WhatsApp block) */
        .success-tracking-block {
          border-radius: 4px;
          padding: 18px 20px;
          max-width: 500px;
          width: 100%;
          text-align: left;
          margin-bottom: 22px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .success-tracking-block.pending {
          background: #FFFDF9;
          border: 1px solid #E6D7C3;
          border-left: 4px solid var(--accent-terracotta);
        }
        .success-tracking-block.dispatched {
          background: #F8FAF7;
          border: 1px solid #C8E6C9;
          border-left: 4px solid #2E7D32;
        }
        .tracking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .tracking-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 3px;
        }
        .tracking-badge.pending-badge {
          background: #FAF0E6;
          color: var(--accent-terracotta);
        }
        .tracking-badge.dispatched-badge {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .dispatch-time-meta {
          font-size: 11px;
          color: var(--text-muted);
        }
        .tracking-pending-content {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin: 10px 0 12px 0;
        }
        .tracking-pending-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #FAF4E8;
          border: 1px solid #E2CA9B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tracking-pending-info {
          flex: 1;
        }
        .tracking-pending-title {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 5px;
          line-height: 1.35;
        }
        .tracking-pending-desc {
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
        }
        .tracking-details-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid #E0ECE0;
          border-radius: 4px;
          padding: 12px 14px;
          margin: 12px 0;
        }
        @media (max-width: 540px) {
          .tracking-details-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
        .tracking-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .tracking-cell-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .tracking-cell-val {
          font-size: 13px;
          color: var(--text-primary);
        }
        .tracking-cell-val.font-medium {
          font-weight: 600;
        }
        .tracking-cell-val.font-mono {
          font-family: monospace;
          letter-spacing: 0.04em;
        }
        .tracking-awb-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .copy-awb-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F4F4F4;
          border: 1px solid #DDD;
          border-radius: 3px;
          padding: 2px 6px;
          font-size: 10px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .copy-awb-btn:hover {
          background: #EAEAEA;
          color: var(--text-primary);
        }
        .track-consignment-btn {
          width: 100%;
          background: var(--accent-terracotta);
          border-color: var(--accent-terracotta);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 11px;
          border-radius: 3px;
          margin-top: 10px;
          transition: background 0.2s;
        }
        .track-consignment-btn:hover {
          background: #8A3B2B;
        }
        .tracking-email-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
        }
        .close-success-btn {
          font-size: 12px;
        }

        /* Payment Method Selector */
        .payment-step-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .payment-method-selector-card {
          background: #FAF7F2;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .method-picker-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .payment-method-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .payment-method-card {
          background: #FFFFFF;
          border: 1.5px solid var(--border-light);
          border-radius: 4px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: var(--transition);
        }
        .payment-method-card:hover {
          border-color: var(--accent-terracotta);
          transform: translateY(-1px);
        }
        .payment-method-card.active {
          border-color: var(--accent-terracotta);
          background: #FFFDF9;
          box-shadow: 0 4px 12px rgba(163, 72, 53, 0.08);
        }
        .method-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .method-title-group {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--text-primary);
        }
        .method-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .method-tag.green {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .method-tag.amber {
          background: #FFF3E0;
          color: #E65100;
        }
        .method-card-desc {
          font-size: 11px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.35;
        }

        /* Cash on Delivery Step */
        .cod-step-container {
          display: flex;
          flex-direction: column;
        }
        .cod-details-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
        }
        .cod-reassurance-card {
          background: #FAF8F5;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cod-card-title {
          font-family: var(--font-serif);
          font-size: 17px;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 8px;
        }
        .cod-perks-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cod-perk-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .cod-perk-item strong {
          display: block;
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .cod-perk-item p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        .cod-summary-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cod-summary-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cod-delivery-preview {
          background: rgba(0, 0, 0, 0.02);
          border: 1px dashed var(--border-light);
          padding: 12px;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .delivery-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .delivery-recipient {
          font-size: 14px;
          color: var(--text-primary);
        }
        .delivery-address, .delivery-phone {
          margin: 0;
          color: var(--text-secondary);
        }
        .delivery-note {
          margin-top: 4px;
          font-style: italic;
          color: var(--accent-terracotta);
          font-size: 11px;
        }
        .cod-amount-breakdown {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          font-size: 12px;
        }
        .cod-amount-breakdown .breakdown-row {
          display: flex;
          justify-content: space-between;
        }
        .cod-amount-breakdown .total-row {
          font-size: 15px;
          font-weight: 700;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1px dashed var(--border-light);
        }
        .cod-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .payment-method-options, .cod-details-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 540px) {
          .checkout-modal {
            padding: 18px 12px;
            max-height: 94vh;
          }
          .checkout-title {
            font-size: 20px;
          }
          .step-connector {
            width: 16px;
          }
          .step-item span:not(.step-num) {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
