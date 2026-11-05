import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { 
  X, User, Lock, LogOut, Check, AlertCircle, 
  Sparkles, Package, KeyRound, Loader2, Clock, CheckCircle2, Truck, ExternalLink, Copy
} from 'lucide-react';
import { useOverlay } from '../hooks/useOverlay';

export default function ProfileModal() {
  const { 
    user, 
    isProfileOpen, 
    closeProfile, 
    updatePassword, 
    updateProfile, 
    logout 
  } = useAuth();

  const { orders = [] } = useShop();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'security' | 'orders'
  
  // Password change form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Editable Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Copied feedback for tracking AWB
  const [copiedAwb, setCopiedAwb] = useState(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.fullName || '');
    }
  }, [user, isProfileOpen]);

  const handleCopyAwb = (awb, orderId) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(orderId);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  // Only the signed-in patron's own orders (matched by email)
  const userEmail = (user?.email || '').trim().toLowerCase();
  const displayedOrders = userEmail
    ? orders.filter(o => (o.customer_email || '').trim().toLowerCase() === userEmail)
    : [];

  useOverlay(isProfileOpen && !!user, closeProfile);

  if (!isProfileOpen || !user) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Could not update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile({ fullName: nameInput.trim() });
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={closeProfile}>
      <div className="modal-container profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={closeProfile}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Profile Header Banner */}
        <div className="profile-hero">
          <div className="profile-avatar-circle">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
            ) : (
              <span className="avatar-initials">{getInitials(user.fullName)}</span>
            )}
          </div>
          
          <div className="profile-hero-info">
            <div className="patron-badge">
              <Sparkles size={12} className="text-gold" />
              <span>Your account</span>
            </div>
            
            {isEditingName ? (
              <div className="name-edit-box">
                <input 
                  type="text" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)}
                  className="name-input"
                  autoFocus
                />
                <button 
                  onClick={handleSaveName} 
                  disabled={isSavingName}
                  className="btn btn-sm btn-primary"
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setIsEditingName(false)} 
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="name-display-row">
                <h2 className="patron-name">{user.fullName || 'Your account'}</h2>
                <button 
                  onClick={() => setIsEditingName(true)} 
                  className="edit-name-btn"
                  title="Edit name"
                >
                  Edit
                </button>
              </div>
            )}

            <span className="patron-email">{user.email}</span>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={15} />
            <span>Details</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={15} />
            <span>Password</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={15} />
            <span>Orders ({displayedOrders.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MINIMAL INFO */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-content">
            <div className="info-cards-grid">
              <div className="info-card">
                <span className="info-card-label">Sign-in</span>
                <span className="info-card-value">
                  {user.provider === 'google' ? 'Google' : 'Email and password'}
                </span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Account</span>
                <span className="info-card-value text-terracotta">Active</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Member since</span>
                <span className="info-card-value">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Styling help</span>
                <span className="info-card-value">On WhatsApp</span>
              </div>
            </div>

            <div className="atelier-privilege-callout">
              <Sparkles size={16} className="text-gold" />
              <div>
                <strong>Need help with sizing or styling?</strong>
                <p>WhatsApp us on +91 62676 64409.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHANGE PASSWORD FLOW */}
        {activeTab === 'security' && (
          <div className="tab-content security-content">
            <div className="section-head">
              <h3 className="section-title">Change password</h3>
              <p className="section-desc">
                Keep your account and orders secure.
              </p>
            </div>

            {passwordSuccess && (
              <div className="alert-success">
                <CheckCircle2 size={16} />
                <span>Password updated.</span>
              </div>
            )}

            {passwordError && (
              <div className="alert-error">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label htmlFor="new-password">New password</label>
                <div className="input-box">
                  <Lock size={16} className="input-icon" />
                  <input 
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="input-box">
                  <Lock size={16} className="input-icon" />
                  <input 
                    id="confirm-password"
                    type="password"
                    placeholder="Type it again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isChangingPassword}
                className="btn btn-primary submit-password-btn"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: RECENT ORDERS */}
        {activeTab === 'orders' && (
          <div className="tab-content orders-content">
            {displayedOrders.length === 0 ? (
              <div className="empty-orders-view">
                <Package size={36} className="empty-icon" />
                <h4>No orders yet</h4>
                <p>Your UPI and Cash on Delivery orders will show up here, with their status and tracking.</p>
              </div>
            ) : (
              <div className="orders-list">
                {displayedOrders.map((ord, idx) => {
                  const isCancelled = ord.fulfillment_status === 'cancelled';
                  const isFailed = ord.payment_status === 'failed';
                  const isClosed = isCancelled || isFailed;
                  const isDelivered = ord.fulfillment_status === 'delivered';
                  const isDispatched = isDelivered || ord.fulfillment_status === 'dispatched' || ord.fulfillment_status === 'shipped' || Boolean(ord.tracking_number);
                  const dispatch = ord.dispatch_details || {};
                  const courier = dispatch.courier || (ord.tracking_number ? ord.tracking_number.split('#')[0].trim() : 'Blue Dart Express');
                  const awb = dispatch.trackingNumber || (ord.tracking_number ? ord.tracking_number.split('#')[1]?.trim() : 'Pending');
                  const trackingUrl = dispatch.trackingUrl || `https://www.bluedart.com/tracking?trackNumber=${awb}`;
                  const estDelivery = dispatch.estimatedDelivery || '3-5 Business Days';

                  return (
                    <div key={idx} className="order-item-card">
                      {/* Order Card Header */}
                      <div className="order-item-header">
                        <div>
                          <span className="order-id">{ord.id}</span>
                          <span className="order-date">
                            {new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className={`order-status-badge ${isClosed ? 'badge-closed' : isDispatched ? 'badge-dispatched' : 'badge-processing'}`}>
                          {isClosed ? (
                            <>
                              <AlertCircle size={12} />
                              <span>{isFailed ? 'Payment failed' : 'Cancelled'}</span>
                            </>
                          ) : isDelivered ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Delivered</span>
                            </>
                          ) : isDispatched ? (
                            <>
                              <Truck size={12} />
                              <span>Dispatched ({courier})</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>Being made</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Visual Stepper (not shown for failed / cancelled orders) */}
                      {!isClosed && (
                      <div className="order-stepper">
                        <div className="step-item step-completed">
                          <div className="step-dot"><Check size={10} /></div>
                          <span className="step-label">Confirmed</span>
                        </div>
                        <div className="step-line active"></div>
                        <div className="step-item step-completed">
                          <div className="step-dot"><Check size={10} /></div>
                          <span className="step-label">Being made</span>
                        </div>
                        <div className={`step-line ${isDispatched ? 'active' : ''}`}></div>
                        <div className={`step-item ${isDispatched ? 'step-completed' : 'step-pending'}`}>
                          <div className="step-dot">
                            {isDispatched ? <Truck size={10} /> : <Clock size={10} />}
                          </div>
                          <span className="step-label">Dispatched</span>
                        </div>
                        <div className={`step-line ${isDelivered ? 'active' : ''}`}></div>
                        <div className={`step-item ${isDelivered ? 'step-completed' : 'step-pending'}`}>
                          <div className="step-dot"><Check size={10} /></div>
                          <span className="step-label">Delivered</span>
                        </div>
                      </div>
                      )}

                      {/* DYNAMIC DISPATCH / IN-PROCESS CALLOUT (Requested by User) */}
                      {isClosed ? (
                        <div className="patron-inprocess-box">
                          <div className="inprocess-header">
                            <AlertCircle size={14} className="text-terracotta" />
                            <strong>{isFailed ? "We couldn't verify the payment for this order." : 'This order has been cancelled.'}</strong>
                          </div>
                          <p className="inprocess-desc">
                            {ord.failure_reason || 'Please WhatsApp us on +91 62676 64409 for help.'}
                          </p>
                        </div>
                      ) : isDispatched ? (
                        <div className="patron-dispatch-box">
                          <div className="dispatch-box-top">
                            <div className="dispatch-courier-info">
                              <Truck size={16} className="text-terracotta" />
                              <div>
                                <span className="courier-name">{courier}</span>
                                <span className="delivery-est">Expected delivery: <strong>{estDelivery}</strong></span>
                              </div>
                            </div>
                            <a 
                              href={trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="track-external-btn"
                            >
                              <span>Track order</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>

                          <div className="awb-row">
                            <span className="awb-label">Tracking / AWB:</span>
                            <span className="awb-code">{awb}</span>
                            <button 
                              type="button" 
                              onClick={() => handleCopyAwb(awb, ord.id)}
                              className="copy-awb-btn"
                              title="Copy tracking number"
                            >
                              {copiedAwb === ord.id ? <Check size={12} color="#2E7D32" /> : <Copy size={12} />}
                              <span>{copiedAwb === ord.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="patron-inprocess-box">
                          <div className="inprocess-header">
                            <Clock size={14} className="text-terracotta" />
                            <strong>We're working on your order. Tracking details will follow soon.</strong>
                          </div>
                          <p className="inprocess-desc">
                            We're checking your piece and adding the fall &amp; pico. Once it ships, your tracking link will appear here and in your email.
                          </p>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="order-products-summary">
                        {ord.items && ord.items.map((it, iIdx) => (
                          <div key={iIdx} className="order-line-item">
                            <span>{it.name} ({it.selectedSize || 'Standard'}) x{it.quantity}</span>
                            <span>₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="order-footer-row">
                        <div className="order-delivery-tag">
                          <span>Delivering to {ord.city || 'India'}</span>
                          {ord.payment_method && <span className="order-method">• {ord.payment_method}</span>}
                        </div>
                        <div className="order-total-block">
                          <span className="order-total-label">Total:</span>
                          <strong className="order-total-val">₹{Number(ord.total_amount).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="profile-footer">
          <button 
            type="button"
            onClick={logout}
            className="logout-action-btn"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      <style>{`
        .profile-modal {
          max-width: 580px;
          width: 100%;
          background: #FAF6EF;
          border: 1px solid rgba(163, 72, 53, 0.2);
          border-radius: 4px;
          padding: 0;
          overflow: hidden;
          position: relative;
          box-shadow: 0 24px 60px rgba(31, 26, 23, 0.25);
        }
        .profile-hero {
          background: linear-gradient(135deg, #1F1A17 0%, #2D2420 100%);
          padding: 36px 32px 28px;
          color: #FAF6EF;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .profile-avatar-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: var(--accent-terracotta);
          border: 2px solid var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-initials {
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          color: #FAF6EF;
          letter-spacing: 0.05em;
        }
        .profile-hero-info {
          flex: 1;
        }
        .patron-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          letter-spacing: 0.15em;
          color: var(--accent-gold);
          font-weight: 600;
          margin-bottom: 4px;
        }
        .name-display-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .patron-name {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 400;
          color: #FFFFFF;
          margin: 0;
        }
        .edit-name-btn {
          background: none;
          border: none;
          color: var(--accent-gold-light);
          font-size: var(--text-xs);
          cursor: pointer;
          text-decoration: underline;
        }
        .name-edit-box {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 4px 0;
        }
        .name-input {
          padding: 4px 8px;
          font-size: var(--text-base);
          border-radius: 2px;
          border: 1px solid var(--accent-gold);
          background: #FAF6EF;
          color: var(--text-primary);
        }
        .patron-email {
          font-size: var(--text-xs);
          color: #BDB3A7;
          display: block;
          margin-top: 2px;
        }
        .profile-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-light);
          background: #F3ECE0;
        }
        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }
        .tab-btn.active {
          background: #FAF6EF;
          color: var(--accent-terracotta);
          border-bottom-color: var(--accent-terracotta);
        }
        .tab-content {
          padding: 28px 32px;
          max-height: 380px;
          overflow-y: auto;
        }
        .info-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .info-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 14px 16px;
          border-radius: 3px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-card-label {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .info-card-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }
        .text-terracotta {
          color: var(--accent-terracotta);
        }
        .atelier-privilege-callout {
          display: flex;
          gap: 12px;
          background: rgba(197, 160, 89, 0.12);
          border: 1px solid rgba(197, 160, 89, 0.3);
          border-radius: 3px;
          padding: 14px 16px;
          font-size: var(--text-xs);
          line-height: 1.5;
          color: var(--text-primary);
        }
        .atelier-privilege-callout strong {
          display: block;
          margin-bottom: 2px;
          color: #7D6124;
        }
        .section-head {
          margin-bottom: 20px;
        }
        .section-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .section-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .alert-success {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #EDF7ED;
          color: #1E4620;
          border: 1px solid #C8E6C9;
          padding: 10px 14px;
          border-radius: 3px;
          font-size: var(--text-sm);
          margin-bottom: 16px;
        }
        .alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FDF2F0;
          color: #B93826;
          border: 1px solid #F5C6CB;
          padding: 10px 14px;
          border-radius: 3px;
          font-size: var(--text-sm);
          margin-bottom: 16px;
        }
        .password-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-box .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .input-box input {
          width: 100%;
          padding: 10px 14px 10px 36px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 2px;
          font-size: var(--text-sm);
        }
        .input-box input:focus {
          outline: none;
          border-color: var(--accent-terracotta);
        }
        .submit-password-btn {
          margin-top: 8px;
          padding: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: var(--text-sm);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .empty-orders-view {
          text-align: center;
          padding: 30px 10px;
          color: var(--text-muted);
        }
        .empty-orders-view h4 {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          color: var(--text-primary);
          margin: 10px 0 6px;
        }
        .empty-orders-view p {
          font-size: var(--text-xs);
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .order-item-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          padding: 14px 16px;
        }
        .order-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed var(--border-light);
        }
        .order-id {
          font-weight: 700;
          font-size: var(--text-sm);
          color: var(--text-primary);
          display: block;
        }
        .order-date {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .order-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 2px;
        }
        .badge-processing {
          background: #FFF4E5;
          color: #B25E00;
          border: 1px solid #FFE0B2;
        }
        .badge-closed {
          background: #FDECEA;
          color: #C62828;
          border: 1px solid #F5C6CB;
        }
        .badge-dispatched {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #C8E6C9;
        }
        .order-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 14px 0 16px 0;
          padding: 0 8px;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          z-index: 2;
        }
        .step-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          background: #EDE6DC;
          color: #8C827A;
          transition: var(--transition);
        }
        .step-item.step-completed .step-dot {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        .step-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .step-item.step-completed .step-label {
          color: var(--text-primary);
          font-weight: 600;
        }
        .step-line {
          flex: 1;
          height: 2px;
          background: #EDE6DC;
          margin: 0 4px 14px 4px;
        }
        .step-line.active {
          background: var(--accent-terracotta);
        }
        .patron-inprocess-box {
          background: #FFFDF9;
          border: 1px solid #E2CA9B;
          border-left: 3px solid var(--accent-terracotta);
          border-radius: 3px;
          padding: 12px 14px;
          margin-bottom: 14px;
          text-align: left;
        }
        .inprocess-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .inprocess-desc {
          font-size: var(--text-xs);
          line-height: 1.45;
          color: var(--text-secondary);
          margin: 0;
        }
        .patron-dispatch-box {
          background: #F4FBF4;
          border: 1px solid #C8E6C9;
          border-left: 3px solid #2E7D32;
          border-radius: 3px;
          padding: 12px 14px;
          margin-bottom: 14px;
          text-align: left;
        }
        .dispatch-box-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .dispatch-courier-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .courier-name {
          font-size: var(--text-sm);
          font-weight: 700;
          color: #1F1A17;
          display: block;
        }
        .delivery-est {
          font-size: var(--text-xs);
          color: #5C524B;
        }
        .track-external-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #1F1A17;
          color: #FAF6EF;
          text-decoration: none;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 6px 12px;
          border-radius: 2px;
          transition: var(--transition);
        }
        .track-external-btn:hover {
          background: var(--accent-terracotta);
        }
        .awb-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          padding-top: 8px;
          border-top: 1px dashed rgba(46, 125, 50, 0.2);
        }
        .awb-label {
          color: #5C524B;
        }
        .awb-code {
          font-family: monospace;
          font-weight: 700;
          font-size: var(--text-xs);
          color: #1F1A17;
          background: #FFFFFF;
          padding: 2px 6px;
          border-radius: 2px;
          border: 1px solid #D7ECD8;
        }
        .copy-awb-btn {
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: var(--text-xs);
          color: #2E7D32;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
        }
        .order-products-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .order-line-item {
          display: flex;
          justify-content: space-between;
        }
        .order-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid var(--border-light);
          font-size: var(--text-xs);
        }
        .order-delivery-tag {
          color: var(--text-muted);
          font-size: var(--text-xs);
        }
        .order-total-block {
          text-align: right;
        }
        .order-total-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-right: 6px;
        }
        .order-total-val {
          color: var(--accent-terracotta);
          font-size: var(--text-sm);
          font-weight: 700;
        }
        .profile-footer {
          padding: 16px 32px;
          border-top: 1px solid var(--border-light);
          background: #F3ECE0;
          display: flex;
          justify-content: flex-end;
        }
        .logout-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid rgba(163, 72, 53, 0.4);
          color: var(--accent-terracotta);
          padding: 8px 16px;
          border-radius: 2px;
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: var(--transition);
        }
        .logout-action-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }

        @media (max-width: 580px) {
          .profile-modal {
            max-height: 94vh;
          }
          .profile-hero {
            padding: 22px 16px 18px;
            gap: 12px;
          }
          .profile-avatar-circle {
            width: 50px;
            height: 50px;
          }
          .patron-name {
            font-size: var(--text-lg);
          }
          .profile-tabs {
            overflow-x: auto;
          }
          .tab-btn {
            padding: 11px 8px;
            font-size: var(--text-xs);
            white-space: nowrap;
          }
          .tab-content {
            padding: 18px 14px;
          }
          .info-cards-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .profile-footer {
            padding: 12px 16px;
          }
          .logout-action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
