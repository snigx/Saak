import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, Eye, EyeOff, Sparkles, AlertCircle, Loader2, 
  ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon,
  KeyRound, RefreshCw, ArrowLeft, CheckCircle2
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalView, 
    setAuthModalView, 
    pendingOtpData,
    setPendingOtpData,
    loginWithEmail, 
    registerWithEmail, 
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    loginWithDemoPatron
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [googleNotice, setGoogleNotice] = useState(false);

  // OTP Verification Specific State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = [
    useRef(null), useRef(null), useRef(null), 
    useRef(null), useRef(null), useRef(null)
  ];

  // Resend timer countdown effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Sync email and name from pendingOtpData if set
  useEffect(() => {
    if (pendingOtpData?.email) {
      setEmail(pendingOtpData.email);
    }
    if (pendingOtpData?.fullName) {
      setFullName(pendingOtpData.fullName);
    }
  }, [pendingOtpData]);

  // Auto-focus first OTP digit when transitioning to OTP view
  useEffect(() => {
    if (authModalView === 'otp') {
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs[0]?.current?.focus();
      }, 150);
    }
  }, [authModalView]);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setGoogleNotice(false);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.message === 'GOOGLE_PROVIDER_NOT_ENABLED') {
        setGoogleNotice(true);
      } else {
        setErrorMessage(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (authModalView === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      setIsSubmitting(true);
      try {
        await registerWithEmail(email.trim(), password, fullName.trim());
        setSuccessNotice(`Verification code dispatched to ${email.trim()}`);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to dispatch verification code. Please check your email.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authModalView === 'signin') {
      if (!password) {
        setErrorMessage('Please enter your password, or sign in using a One-Time Passcode.');
        return;
      }

      setIsSubmitting(true);
      try {
        await loginWithEmail(email.trim(), password);
      } catch (err) {
        setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Sign In with OTP Request Handler
  const handleRequestSignInOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your email address to receive a login code.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await sendOtp(email.trim(), fullName.trim(), 'signin');
      setPendingOtpData({ email: email.trim(), fullName: fullName.trim(), type: 'signin' });
      setAuthModalView('otp');
      setSuccessNotice(`Login code sent to ${email.trim()}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch login code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP digit changes with auto-advance
  const handleOtpDigitChange = (index, value) => {
    // Take only the last entered digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      otpInputRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs[focusIdx]?.current?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const enteredOtp = otpDigits.join('').trim();
    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    const targetEmail = pendingOtpData?.email || email.trim();
    const targetName = pendingOtpData?.fullName || fullName.trim();
    const targetPass = pendingOtpData?.password || password;

    setIsSubmitting(true);
    try {
      await verifyOtp(targetEmail, enteredOtp, targetName, targetPass);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setErrorMessage('');
    setSuccessNotice('');
    setIsSubmitting(true);
    try {
      const targetEmail = pendingOtpData?.email || email.trim();
      const targetName = pendingOtpData?.fullName || fullName.trim();
      await sendOtp(targetEmail, targetName, pendingOtpData?.type || 'signup');
      setResendCooldown(30);
      setSuccessNotice(`A fresh 6-digit code was sent to ${targetEmail}`);
      otpInputRefs[0]?.current?.focus();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (newView) => {
    setErrorMessage('');
    setSuccessNotice('');
    setAuthModalView(newView);
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={closeAuthModal}
          aria-label="Close Authentication Modal"
        >
          <X size={20} />
        </button>

        {/* Header & Atelier Branding */}
        <div className="auth-header">
          <img 
            src="/assets/saak_emblem_transparent.png" 
            alt="Saak Emblem" 
            className="auth-emblem-logo"
          />
          <div className="auth-badge">
            <Sparkles size={13} className="text-gold" />
            <span>SAAK ATELIER CIRCLE</span>
          </div>
          <h2 className="auth-title">
            {authModalView === 'otp' && 'Verify Your Email'}
            {authModalView === 'signin' && 'Welcome to the Atelier'}
            {authModalView === 'signup' && 'Create Patron Account'}
          </h2>
          <p className="auth-subtitle">
            {authModalView === 'otp' && `Enter the 6-digit code sent to ${pendingOtpData?.email || email || 'your email'}`}
            {authModalView === 'signin' && 'Sign in to access your bespoke orders, wishlist and VIP drape previews.'}
            {authModalView === 'signup' && 'Join Saak by Aprajita for saved measurements, order tracking and custom shade requests.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && (
          <div className="auth-success-alert">
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. OTP VERIFICATION VIEW */}
        {/* ================================================================= */}
        {authModalView === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="auth-form otp-form">
            <div className="otp-email-chip">
              <Mail size={14} className="text-gold" />
              <span>{pendingOtpData?.email || email}</span>
              <button 
                type="button" 
                className="chip-edit-btn"
                onClick={() => switchView('signup')}
              >
                Change
              </button>
            </div>

            <div className="otp-inputs-wrapper" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  disabled={isSubmitting}
                  className={`otp-digit-box ${digit ? 'filled' : ''}`}
                  aria-label={`Digit ${idx + 1} of verification code`}
                />
              ))}
            </div>

            {/* Submit Verification Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || otpDigits.join('').length !== 6}
              className="btn btn-primary auth-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Enter Atelier</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Resend Code Action */}
            <div className="otp-resend-row">
              {resendCooldown > 0 ? (
                <span className="resend-timer-text">
                  Resend code in <strong className="text-terracotta">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="resend-action-btn"
                >
                  <RefreshCw size={13} />
                  <span>Resend 6-Digit Code</span>
                </button>
              )}
            </div>

            {/* Back button */}
            <button
              type="button"
              className="otp-back-link"
              onClick={() => switchView(pendingOtpData?.type === 'signin' ? 'signin' : 'signup')}
            >
              <ArrowLeft size={14} />
              <span>Back to {pendingOtpData?.type === 'signin' ? 'Sign In' : 'Sign Up'}</span>
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* 2. SIGN IN & SIGN UP VIEWS */}
        {/* ================================================================= */}
        {authModalView !== 'otp' && (
          <>
            {/* Google OAuth 1-Tap Button */}
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="google-auth-btn"
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {authModalView === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
            </button>

            {/* Google OAuth Provider Setup Notice */}
            {googleNotice && (
              <div className="google-setup-notice">
                <div className="setup-notice-header">
                  <AlertCircle size={15} className="text-terracotta" />
                  <span>Google Provider Not Yet Enabled in Supabase</span>
                </div>
                <p className="setup-notice-desc">
                  To enable real Google accounts, turn on Google in <strong>Supabase Dashboard → Authentication → Providers → Google</strong> with your Google Cloud Client ID.
                </p>
                <button
                  type="button"
                  className="demo-patron-btn"
                  onClick={() => loginWithDemoPatron()}
                >
                  <Sparkles size={14} className="text-gold" />
                  <span>Instant Patron Sign-In (Test Drive)</span>
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="auth-divider">
              <span>or with email {authModalView === 'signup' ? '& verification code' : '& password'}</span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name (Sign Up only) */}
              {authModalView === 'signup' && (
                <div className="auth-input-group">
                  <label htmlFor="auth-fullName">Full Name</label>
                  <div className="input-with-icon">
                    <UserIcon size={16} className="input-icon" />
                    <input 
                      id="auth-fullName"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="auth-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    id="auth-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <div className="label-row">
                  <label htmlFor="auth-password">Password</label>
                  <span className="password-hint">Min. 6 characters</span>
                </div>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary auth-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{authModalView === 'signin' ? 'Sign In to Atelier' : 'Send Verification Code'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Alternative: 1-Click OTP Sign-In for existing patrons */}
              {authModalView === 'signin' && (
                <button
                  type="button"
                  onClick={handleRequestSignInOtp}
                  disabled={isSubmitting}
                  className="otp-magic-signin-btn"
                >
                  <KeyRound size={14} className="text-gold" />
                  <span>Sign In with 1-Time Email Code</span>
                </button>
              )}
            </form>

            {/* View Switcher Footer */}
            <div className="auth-footer-prompt">
              {authModalView === 'signin' ? (
                <p>
                  New to Saak Atelier?{' '}
                  <button 
                    type="button" 
                    onClick={() => switchView('signup')}
                    className="link-btn"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an Atelier account?{' '}
                  <button 
                    type="button" 
                    onClick={() => switchView('signin')}
                    className="link-btn"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Privacy & Trust Guarantee */}
        <div className="auth-trust-note">
          <ShieldCheck size={14} className="text-gold" />
          <span>Encrypted Session • Official Saak by Aprajita Atelier Guarantee</span>
        </div>
      </div>

      <style jsx>{`
        .auth-modal {
          max-width: 440px;
          width: 100%;
          background: #FAF6EF;
          border: 1px solid rgba(163, 72, 53, 0.2);
          border-radius: 4px;
          padding: 36px 32px;
          position: relative;
          box-shadow: 0 24px 60px rgba(31, 26, 23, 0.25);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-emblem-logo {
          height: 48px;
          width: auto;
          object-fit: contain;
          margin: 0 auto 12px;
          display: block;
          filter: drop-shadow(0 2px 8px rgba(197, 160, 89, 0.2));
        }
        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent-terracotta);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .auth-title {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .auth-subtitle {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }
        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FDF2F0;
          color: #B93826;
          border: 1px solid #F5C6CB;
          padding: 10px 14px;
          border-radius: 3px;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: left;
        }
        .auth-success-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F1F8F4;
          color: #2D6A4F;
          border: 1px solid #C3E6CB;
          padding: 10px 14px;
          border-radius: 3px;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: left;
        }
        .google-auth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          padding: 12px 18px;
          border-radius: 2px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .google-auth-btn:hover {
          border-color: var(--text-primary);
          background: #F8F6F2;
        }
        .google-setup-notice {
          margin-top: 12px;
          background: #FFFDF9;
          border: 1px dashed rgba(163, 72, 53, 0.4);
          border-radius: 4px;
          padding: 14px 16px;
          text-align: left;
        }
        .setup-notice-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-terracotta);
          margin-bottom: 6px;
        }
        .setup-notice-desc {
          font-size: 12px;
          line-height: 1.45;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .setup-notice-desc strong {
          color: var(--text-primary);
        }
        .demo-patron-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #FAF6EF;
          border: 1px solid rgba(197, 160, 89, 0.5);
          color: var(--text-primary);
          padding: 9px 12px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .demo-patron-btn:hover {
          background: #F2ECE0;
          border-color: var(--accent-gold);
        }
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 22px 0;
          color: var(--text-muted);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-light);
        }
        .auth-divider span {
          padding: 0 10px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .auth-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .auth-input-group label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .password-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-with-icon input {
          width: 100%;
          padding: 11px 40px 11px 38px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 2px;
          font-size: 14px;
          color: var(--text-primary);
          transition: var(--transition);
        }
        .input-with-icon input:focus {
          outline: none;
          border-color: var(--accent-terracotta);
          box-shadow: 0 0 0 2px rgba(163, 72, 53, 0.15);
        }
        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .password-toggle-btn:hover {
          color: var(--text-primary);
        }
        .auth-submit-btn {
          margin-top: 6px;
          width: 100%;
          padding: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .otp-magic-signin-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(197, 160, 89, 0.4);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .otp-magic-signin-btn:hover {
          background: #FFFFFF;
          border-color: var(--accent-gold);
        }

        /* OTP Specific Styles */
        .otp-form {
          gap: 20px;
        }
        .otp-email-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          color: var(--text-primary);
          margin: 0 auto;
        }
        .chip-edit-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: 11px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          padding: 0 0 0 4px;
        }
        .otp-inputs-wrapper {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 10px 0;
        }
        .otp-digit-box {
          width: 46px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          font-family: monospace;
          background: #FFFFFF;
          border: 1.5px solid var(--border-light);
          border-radius: 4px;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        .otp-digit-box:focus {
          outline: none;
          border-color: var(--accent-terracotta);
          box-shadow: 0 0 0 2px rgba(163, 72, 53, 0.2);
          background: #FFFDF9;
        }
        .otp-digit-box.filled {
          border-color: var(--accent-gold);
          background: #FCFBF7;
        }
        .otp-resend-row {
          text-align: center;
          margin-top: 4px;
        }
        .resend-timer-text {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .resend-action-btn {
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-terracotta);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .resend-action-btn:hover {
          color: #7D3122;
          text-decoration: underline;
        }
        .otp-back-link {
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          margin-top: 8px;
        }
        .otp-back-link:hover {
          color: var(--text-primary);
        }

        .auth-footer-prompt {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .link-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: inherit;
        }
        .link-btn:hover {
          color: #7D3122;
        }
        .auth-trust-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 18px;
          text-align: center;
        }
        @media (max-width: 480px) {
          .auth-modal {
            padding: 26px 18px;
            max-height: 94vh;
            overflow-y: auto;
          }
          .auth-title {
            font-size: 22px;
          }
          .auth-subtitle {
            font-size: 12px;
          }
          .google-auth-btn {
            font-size: 13px;
            padding: 10px 14px;
          }
          .otp-digit-box {
            width: 38px;
            height: 48px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
