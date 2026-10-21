import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, User, Mail, Lock, LogOut, Check, AlertCircle, 
  Sparkles, Shield, Package, KeyRound, Loader2, ArrowRight,
  Clock, CheckCircle2 
} from 'lucide-react';

export default function ProfileModal() {
  const { 
    user, 
    isProfileOpen, 
    closeProfile, 
    updatePassword, 
    updateProfile, 
    logout 
  } = useAuth();

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

  // Recent customer orders from local storage
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setNameInput(user.fullName || '');
      try {
        const stored = JSON.parse(localStorage.getItem('saak_orders') || '[]');
        setRecentOrders(stored);
      } catch (e) {
        setRecentOrders([]);
      }
    }
  }, [user, isProfileOpen]);

  if (!isProfileOpen || !user) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
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
          aria-label="Close Profile Modal"
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
              <span>SAAK ATELIER CIRCLE PATRON</span>
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
                <h2 className="patron-name">{user.fullName || 'Atelier Patron'}</h2>
                <button 
                  onClick={() => setIsEditingName(true)} 
                  className="edit-name-btn"
                  title="Edit Name"
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
            <span>Patron Details</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={15} />
            <span>Change Password</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={15} />
            <span>Atelier Orders ({recentOrders.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MINIMAL INFO */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-content">
            <div className="info-cards-grid">
              <div className="info-card">
                <span className="info-card-label">Authentication Method</span>
                <span className="info-card-value">
                  {user.provider === 'google' ? 'Google Account (OAuth)' : 'Email & Encrypted Password'}
                </span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Patron Status</span>
                <span className="info-card-value text-terracotta">Active VIP Member</span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Member Since</span>
                <span className="info-card-value">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="info-card">
                <span className="info-card-label">Bespoke Styling Privileges</span>
                <span className="info-card-value">Direct Atelier Access Unlocked</span>
              </div>
            </div>

            <div className="atelier-privilege-callout">
              <Sparkles size={16} className="text-gold" />
              <div>
                <strong>Curated Drapes &amp; Early Releases:</strong>
                <p>As a Saak Patron, your custom shade orders and sculpted corsets receive priority tailoring queue at Aprajita's studio.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHANGE PASSWORD FLOW */}
        {activeTab === 'security' && (
          <div className="tab-content security-content">
            <div className="section-head">
              <h3 className="section-title">Change Account Password</h3>
              <p className="section-desc">
                Update your password to ensure secure access to your bespoke orders and measurements.
              </p>
            </div>

            {passwordSuccess && (
              <div className="alert-success">
                <CheckCircle2 size={16} />
                <span>Password updated successfully!</span>
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
                <label htmlFor="new-password">New Password</label>
                <div className="input-box">
                  <Lock size={16} className="input-icon" />
                  <input 
                    id="new-password"
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <div className="input-box">
                  <Lock size={16} className="input-icon" />
                  <input 
                    id="confirm-password"
                    type="password"
                    placeholder="Re-type new password"
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: RECENT ORDERS */}
        {activeTab === 'orders' && (
          <div className="tab-content orders-content">
            {recentOrders.length === 0 ? (
              <div className="empty-orders-view">
                <Package size={32} className="empty-icon" />
                <h4>No Atelier Orders Yet</h4>
                <p>Pieces you order via direct UPI checkout will automatically appear here with their tracking and verification receipts.</p>
              </div>
            ) : (
              <div className="orders-list">
                {recentOrders.map((ord, idx) => (
                  <div key={idx} className="order-item-card">
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
                      <span className="order-status-badge">
                        <Clock size={12} />
                        <span>UPI Verified (UTR: {ord.utr_number || 'Pending'})</span>
                      </span>
                    </div>

                    <div className="order-products-summary">
                      {ord.items && ord.items.map((it, iIdx) => (
                        <div key={iIdx} className="order-line-item">
                          <span>{it.name} ({it.selectedSize || 'Standard'}) x{it.quantity}</span>
                          <span>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer-row">
                      <span className="order-total-label">Total Amount Paid:</span>
                      <strong className="order-total-val">₹{Number(ord.total_amount).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
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
            <span>Sign Out from Atelier</span>
          </button>
        </div>
      </div>

      <style jsx>{`
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
          font-size: 24px;
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
          font-size: 10px;
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
          font-size: 22px;
          font-weight: 400;
          color: #FFFFFF;
          margin: 0;
        }
        .edit-name-btn {
          background: none;
          border: none;
          color: var(--accent-gold-light);
          font-size: 11px;
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
          font-size: 14px;
          border-radius: 2px;
          border: 1px solid var(--accent-gold);
          background: #FAF6EF;
          color: var(--text-primary);
        }
        .patron-email {
          font-size: 12px;
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
          font-size: 12px;
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
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .info-card-value {
          font-size: 13px;
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
          font-size: 12px;
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
          font-size: 18px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .section-desc {
          font-size: 12px;
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
          font-size: 13px;
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
          font-size: 13px;
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
          font-size: 11px;
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
          font-size: 13px;
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
          font-size: 13px;
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
          font-size: 16px;
          color: var(--text-primary);
          margin: 10px 0 6px;
        }
        .empty-orders-view p {
          font-size: 12px;
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
          font-size: 13px;
          color: var(--text-primary);
          display: block;
        }
        .order-date {
          font-size: 11px;
          color: var(--text-muted);
        }
        .order-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #E8F5E9;
          color: #2E7D32;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 2px;
        }
        .order-products-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
          font-size: 12px;
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
          font-size: 13px;
        }
        .order-total-val {
          color: var(--accent-terracotta);
          font-size: 14px;
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
          font-size: 12px;
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
            font-size: 18px;
          }
          .profile-tabs {
            overflow-x: auto;
          }
          .tab-btn {
            padding: 11px 8px;
            font-size: 10px;
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
