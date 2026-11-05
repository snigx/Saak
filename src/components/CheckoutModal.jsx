import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext';
import { 
  X, Check, ShieldCheck, ArrowRight, ArrowLeft, Copy, 
  Smartphone, Sparkles, MessageCircle, AlertCircle, ShoppingBag,
  Upload, Clock, CheckCircle2, Banknote, PhoneCall,
  Truck, ExternalLink, Mail, RotateCcw 
} from 'lucide-react';
import { saveOrderToDb } from '../services/ordersService';
import { uploadImageBlob } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useOverlay } from '../hooks/useOverlay';
import OfferPrice from './OfferPrice';

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const OWNER_WHATSAPP = '916267664409';
const OWNER_EMAIL = 'Saakbyaprajita@gmail.com';

// Saak sells in INR only
const formatInr = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartTotal, 
    cartSavings = 0,
    clearCart,
    atelierUpiId,
    refreshOrders,
    orders = [],
    openPolicyModal
  } = useShop();

  const { user } = useAuth();

  // Step 1: 'shipping', Step 2: 'payment', Step 3: 'success'
  const [currentStep, setCurrentStep] = useState('shipping');

  // Customer Shipping Details
  const [shippingData, setShippingData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
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
  const [utrError, setUtrError] = useState('');
  // Snapshot of the order just placed (cart is cleared right after placing it)
  const [placedOrder, setPlacedOrder] = useState(null);

  // Prefill name/email once the signed-in user loads (never overwrite what was typed)
  useEffect(() => {
    if (!user) return;
    setShippingData(prev => ({
      ...prev,
      fullName: prev.fullName || user.fullName || '',
      email: prev.email || user.email || ''
    }));
  }, [user]);

  // Clear per-order payment state so the next order gets a fresh ID
  const resetPaymentState = () => {
    setOrderId('');
    setUtrNumber('');
    setUtrError('');
    setPaymentScreenshot(null);
    setPaymentScreenshotFile(null);
    setQrDataUrl('');
  };

  const closeCheckout = () => {
    if (isVerifying) return;
    setIsCheckoutOpen(false);
    resetPaymentState();
    setPlacedOrder(null);
    setFormErrors({});
    setCurrentStep('shipping');
  };

  useOverlay(isCheckoutOpen, closeCheckout);

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
      errors.phone = 'Please enter your phone number.';
    } else if (/[a-zA-Z]/.test(phoneRaw)) {
      errors.phone = 'Phone number can only have digits.';
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
      errors.address = 'Please enter your address.';
    }

    // 5. City validation
    if (!shippingData.city || !shippingData.city.trim()) {
      errors.city = 'Please enter your city.';
    }

    // 6. State / UT validation
    if (!shippingData.state || !INDIAN_STATES_AND_UTS.includes(shippingData.state)) {
      errors.state = 'Please select your state / UT.';
    }

    // 7. Pincode validation
    const pinDigits = (shippingData.pincode || '').replace(/\D/g, '');
    if (!shippingData.pincode || !shippingData.pincode.trim()) {
      errors.pincode = 'Please enter your pincode.';
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

  // Snapshot what was placed, then show success (or a contact screen if it never persisted)
  const finishOrder = (savedOrder, method) => {
    const snapshot = {
      id: orderId,
      total: cartTotal,
      items: cart,
      utr: method === 'cod' ? null : utrNumber
    };
    setPlacedOrder(snapshot);
    setIsVerifying(false);

    if (!savedOrder || savedOrder.persistedToDb === false) {
      // Order kept on this device only — keep the cart and ID so the patron can retry or contact us
      setCurrentStep('failed');
      return;
    }

    setCurrentStep('success');
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A34835', '#C5A059', '#FAF6EF']
      });
    } catch {}
    if (clearCart) clearCart();
    resetPaymentState();
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(utrNumber)) {
      setUtrError('UTR must be exactly 12 digits.');
      return;
    }
    setUtrError('');

    setIsVerifying(true);
    let savedOrder = null;
    try {
      let finalScreenshotUrl = paymentScreenshot;
      if (paymentScreenshotFile) {
        try {
          finalScreenshotUrl = await uploadImageBlob(paymentScreenshotFile, 'receipts');
        } catch (err) {
          console.warn('Screenshot upload fallback:', err);
        }
      }

      savedOrder = await saveOrderToDb({
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
      finishOrder(savedOrder, 'upi');
    }
  };

  // Cash on Delivery confirmation handler
  const handleConfirmCodOrder = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    let savedOrder = null;
    try {
      savedOrder = await saveOrderToDb({
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
        adminNotes: 'Order placed via Cash on Delivery. Awaiting phone confirmation before handcrafting fall & pico.'
      });
      if (refreshOrders) refreshOrders();
    } catch (err) {
      console.warn('Could not save COD order:', err);
    } finally {
      finishOrder(savedOrder, 'cod');
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeCheckout}>
      <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={closeCheckout}
          aria-label="Close checkout"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="checkout-header">
          <div className="checkout-badge">
            <Sparkles size={13} className="text-gold" />
            <span>Checkout</span>
          </div>
          <h2 className="checkout-title">
            {currentStep === 'shipping' && 'Delivery details'}
            {currentStep === 'payment' && (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay with UPI')}
            {currentStep === 'success' && (paymentMethod === 'cod' ? 'Order placed' : 'Order received')}
            {currentStep === 'failed' && "We couldn't save your order"}
          </h2>

          {/* Stepper Navigation */}
          {currentStep !== 'success' && currentStep !== 'failed' && (
            <div className="checkout-steps-bar">
              <div className={`step-item ${currentStep === 'shipping' ? 'active' : 'completed'}`}>
                <span className="step-num">1</span>
                <span>Address</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step-item ${currentStep === 'payment' ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span>{paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment'}</span>
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

                <div className="form-group">
                  <label className="form-label">
                    <span>Full name *</span>
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
                      <span>WhatsApp number *</span>
                      {formErrors.phone && <span className="field-error-text">{formErrors.phone}</span>}
                    </label>
                    <input 
                      type="tel" 
                      inputMode="tel"
                      placeholder="e.g. 98765 43210"
                      value={shippingData.phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onPaste={handlePhonePaste}
                      className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                    />
                    <span className="form-hint">Digits only. For order and delivery updates.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Email (optional)</span>
                      {formErrors.email && <span className="field-error-text">{formErrors.email}</span>}
                    </label>
                    <input 
                      type="email" 
                      placeholder="priya@example.com"
                      value={shippingData.email}
                      onChange={handleEmailChange}
                      className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                    />
                    <span className="form-hint">For your order confirmation and tracking</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Address *</span>
                    {formErrors.address && <span className="field-error-text">{formErrors.address}</span>}
                  </label>
                  <textarea 
                    rows="2"
                    placeholder="House no., building, street, landmark"
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
                  <label className="form-label">
                    <span>State / UT *</span>
                    {formErrors.state && <span className="field-error-text">{formErrors.state}</span>}
                  </label>
                  <select
                    value={shippingData.state}
                    onChange={(e) => {
                      setShippingData({ ...shippingData, state: e.target.value });
                      if (formErrors.state && e.target.value) {
                        setFormErrors(prev => ({ ...prev, state: null }));
                      }
                    }}
                    className={`form-input ${formErrors.state ? 'input-error' : ''}`}
                  >
                    <option value="">Select state / UT</option>
                    {INDIAN_STATES_AND_UTS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Need it for a wedding on 14 Dec"
                    value={shippingData.stylingNotes}
                    onChange={(e) => setShippingData({ ...shippingData, stylingNotes: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Right: Order Summary Preview */}
              <div className="summary-col">
                <h4 className="section-subheading">Your order</h4>
                
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
                        <OfferPrice
                          className="summary-item-price"
                          price={item.price * item.quantity}
                          basePrice={(item.basePrice ?? item.price) * item.quantity}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-calc-box">
                  <div className="calc-row">
                    <span>Subtotal</span>
                    <span>{formatInr(cartTotal + cartSavings)}</span>
                  </div>
                  {cartSavings > 0 && (
                    <div className="calc-row offer-savings-row">
                      <span>Offer savings</span>
                      <span>−{formatInr(cartSavings)}</span>
                    </div>
                  )}
                  <div className="calc-row">
                    <span>Insured shipping</span>
                    <span className="text-green">Free</span>
                  </div>
                  <div className="calc-row">
                    <span>Fall &amp; pico</span>
                    <span className="text-green">Included</span>
                  </div>
                  <div className="calc-row total-row">
                    <span>Total</span>
                    <span className="total-highlight">{formatInr(cartTotal)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary next-step-btn">
                  <span>Continue to payment</span>
                  <ArrowRight size={16} />
                </button>

                <div className="checkout-policy-reassurance">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>
                    48-hour defect cover • <button type="button" onClick={openPolicyModal} className="policy-inline-trigger">Returns &amp; exchanges</button>
                  </span>
                </div>
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
              <span className="method-picker-label">How would you like to pay?</span>
              <div className="payment-method-options">
                <button
                  type="button"
                  className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="method-card-header">
                    <div className="method-title-group">
                      <Sparkles size={16} className={paymentMethod === 'upi' ? 'text-gold' : ''} />
                      <strong>UPI</strong>
                    </div>
                    <span className="method-tag green">No fees</span>
                  </div>
                  <p className="method-card-desc">
                    Scan the QR with any UPI app. Quickest to confirm.
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
                      <strong>Cash on Delivery</strong>
                    </div>
                    <span className="method-tag amber">Pay when it arrives</span>
                  </div>
                  <p className="method-card-desc">
                    Pay the courier in cash or UPI when your order arrives.
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
                    <span className="amount-label">Amount to pay</span>
                    <span className="amount-highlight">{formatInr(cartTotal)}</span>
                  </div>

                  {/* Dynamic QR Code Render */}
                  <div className="qr-graphic-frame">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Scan to pay via UPI" className="qr-image" />
                    ) : (
                      <div className="qr-loading">Loading QR code...</div>
                    )}
                    <div className="qr-corner corner-tl"></div>
                    <div className="qr-corner corner-tr"></div>
                    <div className="qr-corner corner-bl"></div>
                    <div className="qr-corner corner-br"></div>
                  </div>

                  <span className="qr-instruction">
                    Works with any UPI app: <strong>GPay, PhonePe, Paytm, CRED, BHIM</strong>
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
                    <span className="mobile-intent-hint">On your phone? Tap below:</span>
                    <a 
                      href={upiIntentUrl}
                      className="btn btn-primary mobile-pay-btn"
                    >
                      <Smartphone size={15} />
                      <span>Pay with a UPI app</span>
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
                    <span>Back to delivery details</span>
                  </button>

                  <h4 className="verif-heading">Confirm your payment</h4>
                  <p className="verif-desc">
                    Once you've paid, enter the <strong>12-digit UTR</strong> from your UPI app to confirm your order.
                  </p>

                  <form onSubmit={handleConfirmPayment} className="verif-form">
                    <div className="form-group">
                      <label className="form-label">
                        <span>12-digit UTR *</span>
                        {utrError && <span className="field-error-text">{utrError}</span>}
                      </label>
                      <input 
                        type="text" 
                        required 
                        inputMode="numeric"
                        placeholder="e.g. 429108472910"
                        maxLength={12}
                        value={utrNumber}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                          setUtrNumber(cleaned);
                          if (utrError && cleaned.length === 12) setUtrError('');
                        }}
                        className={`form-input utr-input ${utrError ? 'input-error' : ''}`}
                      />
                      <span className="form-hint">
                        You'll find it in your payment receipt as "UPI Transaction ID" or "UTR".
                      </span>
                    </div>

                    {/* Optional Screenshot Upload */}
                    <div className="form-group">
                      <label className="form-label">Payment screenshot (optional)</label>
                      <label className="screenshot-upload-box">
                        <Upload size={16} />
                        <span>{paymentScreenshot ? 'Screenshot added ✓' : 'Upload screenshot'}</span>
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
                        <span>No extra fees.</span>
                      </div>
                      <div className="reassurance-item">
                        <Clock size={14} className="text-gold" />
                        <span>We'll confirm once we've checked your payment.</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isVerifying}
                      className="btn btn-primary confirm-order-btn"
                    >
                      {isVerifying ? (
                        <span>Placing order...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm order ({formatInr(cartTotal)})</span>
                        </>
                      )}
                    </button>

                    <div className="checkout-policy-agreement">
                      <RotateCcw size={12} className="text-gold" />
                      <span>
                        Please read our <button type="button" onClick={openPolicyModal} className="policy-inline-trigger">returns policy</button> before you confirm.
                      </span>
                    </div>
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
                      <span>How COD works</span>
                    </h4>
                    
                    <div className="cod-perks-list">
                      <div className="cod-perk-item">
                        <ShieldCheck size={18} className="text-green" />
                        <div>
                          <strong>Nothing to pay now</strong>
                          <p>Pay in cash or UPI when your parcel arrives.</p>
                        </div>
                      </div>

                      <div className="cod-perk-item">
                        <PhoneCall size={18} className="text-gold" />
                        <div>
                          <strong>We'll call to confirm</strong>
                          <p>We'll call <strong>{shippingData.phone}</strong> to confirm your order before shipping.</p>
                        </div>
                      </div>

                      <div className="cod-perk-item">
                        <Clock size={18} className="text-gold" />
                        <div>
                          <strong>Free fall &amp; pico</strong>
                          <p>Hand-stitched and included with your saree.</p>
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
                        <span>Back to address</span>
                      </button>
                      <span className="order-tag">Order #{orderId}</span>
                    </div>

                    <h4 className="cod-card-title">
                      <ShoppingBag size={16} className="text-gold" />
                      <span>Order summary</span>
                    </h4>

                    <div className="cod-delivery-preview">
                      <span className="delivery-label">Delivering to</span>
                      <strong className="delivery-recipient">{shippingData.fullName}</strong>
                      <p className="delivery-address">{shippingData.address}, {shippingData.city}, {shippingData.state} - {shippingData.pincode}</p>
                      <span className="delivery-phone">Phone: {shippingData.phone}</span>
                      {shippingData.stylingNotes && (
                        <div className="delivery-note">Note: "{shippingData.stylingNotes}"</div>
                      )}
                    </div>

                    <div className="cod-amount-breakdown">
                      <div className="breakdown-row">
                        <span>Subtotal</span>
                        <span>{formatInr(cartTotal + cartSavings)}</span>
                      </div>
                      {cartSavings > 0 && (
                        <div className="breakdown-row offer-savings-row">
                          <span>Offer savings</span>
                          <span>−{formatInr(cartSavings)}</span>
                        </div>
                      )}
                      <div className="breakdown-row">
                        <span>Insured shipping</span>
                        <span className="text-green">Free</span>
                      </div>
                      <div className="breakdown-row">
                        <span>COD fee</span>
                        <span className="text-green">₹0</span>
                      </div>
                      <div className="breakdown-row total-row">
                        <span>Pay on delivery</span>
                        <span className="total-highlight">{formatInr(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="btn btn-primary confirm-order-btn cod-submit-btn"
                    >
                      {isVerifying ? (
                        <span>Placing order...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Place COD order ({formatInr(cartTotal)})</span>
                        </>
                      )}
                    </button>

                    <div className="checkout-policy-agreement">
                      <RotateCcw size={12} className="text-gold" />
                      <span>
                        Please read our <button type="button" onClick={openPolicyModal} className="policy-inline-trigger">returns policy</button> before you order.
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ORDER SUCCESS & TRACKING DETAILS */}
        {/* ========================================================================= */}
        {currentStep === 'failed' && placedOrder && (() => {
          const contactText = `Hello Saak, my order #${placedOrder.id} (${formatInr(placedOrder.total)}${placedOrder.utr ? `, UTR ${placedOrder.utr}` : ''}) could not be recorded at checkout. Please help.`;
          return (
            <div className="success-step-container">
              <div className="success-icon-bubble" style={{ background: '#C62828' }}>
                <AlertCircle size={32} color="#FFFFFF" />
              </div>
              <h3 className="success-title">Your order was not saved</h3>
              <p className="success-msg">
                We couldn't reach our order system, so order <strong>#{placedOrder.id}</strong> ({formatInr(placedOrder.total)}) has not been confirmed.
                {placedOrder.utr && <> If you have already paid, please share your <strong>UTR: {placedOrder.utr}</strong> with us.</>}
                {' '}Your bag has been kept so you can try again, or contact us and we'll place it for you.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                <a
                  href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(contactText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp +91 62676 64409</span>
                </a>
                <a
                  href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Order #${placedOrder.id} not recorded`)}&body=${encodeURIComponent(contactText)}`}
                  className="btn btn-outline"
                >
                  <Mail size={16} />
                  <span>Email {OWNER_EMAIL}</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('payment')}
                className="btn btn-outline close-success-btn"
              >
                Try again
              </button>
            </div>
          );
        })()}

        {currentStep === 'success' && placedOrder && (() => {
          const currentOrder = (orders || []).find(o => o.id === placedOrder.id);
          const isDispatched = currentOrder?.fulfillment_status === 'dispatched' || currentOrder?.fulfillment_status === 'shipped' || Boolean(currentOrder?.dispatch_details?.trackingNumber);
          const dispatchDetails = currentOrder?.dispatch_details || {};
          const courierName = dispatchDetails.courier || (currentOrder?.tracking_number ? currentOrder.tracking_number.split('#')[0].trim() : 'Our courier partner');
          const trackingAwb = dispatchDetails.trackingNumber || (currentOrder?.tracking_number ? currentOrder.tracking_number.split('#')[1]?.trim() : '');
          const trackingUrl = dispatchDetails.trackingUrl || (trackingAwb ? `https://www.google.com/search?q=${encodeURIComponent(courierName + ' tracking ' + trackingAwb)}` : '');
          const estimatedDelivery = dispatchDetails.estimatedDelivery || '3-5 Business Days';

          return (
            <div className="success-step-container">
              <img 
                src="/assets/saak_emblem_transparent.png" 
                alt="Saak emblem" 
                className="success-emblem-seal" 
              />
              <div className="success-icon-bubble">
                <Check size={32} color="#FFFFFF" />
              </div>

              <span className="success-sub">Thank you, {shippingData.fullName}</span>
              <h3 className="success-title">
                {paymentMethod === 'cod' 
                  ? 'Your order is placed' 
                  : "We're preparing your order"}
              </h3>
              <p className="success-msg">
                {paymentMethod === 'cod' ? (
                  <>
                    Order <strong>#{placedOrder.id}</strong> is booked for Cash on Delivery. Pay <strong>{formatInr(placedOrder.total)}</strong> when it arrives. We'll call you on <strong>{shippingData.phone}</strong> to confirm.
                  </>
                ) : (
                  <>
                    We've got your payment reference <strong>UTR: {placedOrder.utr}</strong> for order <strong>#{placedOrder.id}</strong>. We'll confirm once we've checked it.
                  </>
                )}
              </p>

              {/* Order Card */}
              <div className="success-order-card">
                <div className="card-top">
                  <span>Order: <strong>#{placedOrder.id}</strong></span>
                  <span>
                    {paymentMethod === 'cod' ? 'Pay on delivery: ' : 'Total paid: '}
                    <strong>{formatInr(placedOrder.total)}</strong>
                  </span>
                </div>
                <div className="card-deliver">
                  <span>Delivering to:</span>
                  <strong>{shippingData.address}, {shippingData.city}, {shippingData.state} - {shippingData.pincode}</strong>
                </div>
              </div>

              {/* Consignment & Tracking Details (Replaces WhatsApp block) */}
              {isDispatched ? (
                <div className="success-tracking-block dispatched">
                  <div className="tracking-header">
                    <div className="tracking-badge dispatched-badge">
                      <Truck size={14} />
                      <span>Shipped</span>
                    </div>
                    {dispatchDetails.dispatched_at && (
                      <span className="dispatch-time-meta">
                        Dispatched {new Date(dispatchDetails.dispatched_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="tracking-details-grid">
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Courier</span>
                      <span className="tracking-cell-val font-medium">{courierName}</span>
                    </div>
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Tracking number</span>
                      <div className="tracking-awb-wrap">
                        <span className="tracking-cell-val font-mono">{trackingAwb || 'Shared once shipped'}</span>
                        {trackingAwb && (
                          <button 
                            type="button" 
                            onClick={() => handleCopySuccessAwb(trackingAwb)}
                            className="copy-awb-btn"
                            title="Copy tracking number"
                          >
                            {copiedSuccessAwb ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                            <span>{copiedSuccessAwb ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="tracking-cell">
                      <span className="tracking-cell-label">Expected delivery</span>
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
                      <span>Track order</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {shippingData.email && (
                    <div className="tracking-email-note">
                      <Mail size={12} />
                      <span>Tracking updates also go to <strong>{shippingData.email}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="success-tracking-block pending">
                  <div className="tracking-header">
                    <div className="tracking-badge pending-badge">
                      <Clock size={13} />
                      <span>Not shipped yet</span>
                    </div>
                  </div>

                  <div className="tracking-pending-content">
                    <div className="tracking-pending-icon">
                      <Truck size={22} className="text-gold" />
                    </div>
                    <div className="tracking-pending-info">
                      <h4 className="tracking-pending-title">
                        We'll share tracking as soon as it ships.
                      </h4>
                      <p className="tracking-pending-desc">
                        We're checking your pieces and adding the fall &amp; pico. Once it ships, tracking will show up here.
                      </p>
                    </div>
                  </div>

                  {shippingData.email && (
                    <div className="tracking-email-note">
                      <Mail size={12} />
                      <span>We'll email your confirmation and tracking to <strong>{shippingData.email}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <div className="success-policy-note">
                <RotateCcw size={12} className="text-gold" />
                <span>
                  Questions about delivery or returns? <button type="button" onClick={openPolicyModal} className="policy-inline-trigger">Read our returns policy</button>
                </span>
              </div>

              <button 
                type="button"
                onClick={closeCheckout}
                className="btn btn-outline close-success-btn"
              >
                Keep shopping
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
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .checkout-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-lg);
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
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
        }
        .field-error-text {
          font-size: var(--text-xs);
          color: #C62828;
          font-weight: 500;
          letter-spacing: 0;
        }
        .form-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .form-input, .form-textarea {
          padding: 9px 12px;
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          margin-bottom: 20px;
        }
        .calc-row.offer-savings-row,
        .breakdown-row.offer-savings-row {
          color: var(--accent-terracotta);
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
          font-size: var(--text-base);
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
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .amount-highlight {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          font-family: monospace;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .mobile-pay-btn {
          width: 100%;
          padding: 10px;
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-lg);
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .verif-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .utr-input {
          font-size: var(--text-lg);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-base);
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
        .success-emblem-seal {
          height: 60px;
          width: auto;
          object-fit: contain;
          margin-bottom: 14px;
          filter: drop-shadow(0 4px 12px rgba(197, 160, 89, 0.25));
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
          font-size: var(--text-xs);
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #2E7D32;
          margin-bottom: 6px;
        }
        .success-title {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .success-msg {
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 5px;
          line-height: 1.35;
        }
        .tracking-pending-desc {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .tracking-cell-val {
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
        }
        .close-success-btn {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-lg);
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
          font-size: var(--text-sm);
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .cod-perk-item p {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .delivery-label {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .delivery-recipient {
          font-size: var(--text-base);
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
          font-size: var(--text-xs);
        }
        .cod-amount-breakdown {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          font-size: var(--text-xs);
        }
        .cod-amount-breakdown .breakdown-row {
          display: flex;
          justify-content: space-between;
        }
        .cod-amount-breakdown .total-row {
          font-size: var(--text-base);
          font-weight: 700;
          padding-top: 6px;
          margin-top: 4px;
          border-top: 1px dashed var(--border-light);
        }
        .cod-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: var(--text-sm);
        }

        /* Grid columns must be allowed to shrink below an input's default width */
        .form-sections-grid > *,
        .form-col,
        .form-group,
        .form-row > * {
          min-width: 0;
        }
        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .checkout-modal {
            padding: 18px 14px;
            width: 100%;
            max-width: 100%;
            margin: 0;
            max-height: 94vh;
          }
          .form-sections-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .payment-step-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .payment-method-options, .cod-details-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .qr-image {
            width: 180px;
            height: 180px;
          }
          .qr-container-card {
            padding: 18px 14px;
          }
        }

        .checkout-policy-reassurance {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 12px;
          text-align: center;
        }
        .checkout-policy-agreement {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 10px;
          text-align: center;
        }
        .policy-inline-trigger {
          background: none;
          border: none;
          padding: 0;
          color: var(--accent-terracotta);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          font-weight: 600;
          transition: color 0.15s;
        }
        .policy-inline-trigger:hover {
          color: #8A3B2B;
        }
        .success-policy-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-bottom: 16px;
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          padding: 6px 14px;
          border-radius: 20px;
        }

        @media (max-width: 540px) {
          .checkout-modal {
            padding: 16px 12px;
            width: 100%;
            max-width: 100%;
            margin: 0;
            max-height: 94vh;
            border-radius: 6px;
          }
          .checkout-title {
            font-size: var(--text-xl);
          }
          .checkout-badge span {
            font-size: var(--text-xs);
          }
          .step-connector {
            width: 12px;
          }
          .step-item span:not(.step-num) {
            font-size: var(--text-xs);
          }
          .checkout-steps-bar {
            gap: 4px;
          }
          .summary-col {
            padding: 14px 12px;
          }
          .form-input, .form-textarea {
            font-size: var(--text-base);
          }
        }
      `}</style>
    </div>
  );
}
