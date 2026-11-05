import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { useOverlay } from '../hooks/useOverlay';
import OfferPrice from './OfferPrice';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateCartQty, 
    formatPrice, 
    cartTotal,
    cartSavings,
    openCheckout,
    openPolicyModal
  } = useShop();

  const [isCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useOverlay(isCartOpen, () => setIsCartOpen(false));

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    openCheckout();
  };

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={18} className="text-gold" />
            <h3 className="drawer-title">Your bag</h3>
            <span className="drawer-count">({cart.reduce((t, i) => t + i.quantity, 0)})</span>
          </div>
          <button 
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shipping is complimentary on every order */}
        <div className="shipping-progress-box">
          <div className="progress-text">
            <span className="free-ship-success">
              <Check size={13} />
              <span><strong>Free insured shipping</strong> on every order</span>
            </span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-body">
          {orderComplete ? (
            <div className="order-complete-state">
              <div className="complete-badge">
                <Check size={32} />
              </div>
              <h3 className="complete-title">Order received</h3>
              <p className="complete-desc">
                Thank you for shopping with <strong>Saak by Aprajita</strong>. We've started on your order.
              </p>
              <button 
                onClick={() => {
                  setOrderComplete(false);
                  setIsCartOpen(false);
                }}
                className="btn btn-primary"
              >
                Keep shopping
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={42} strokeWidth={1.5} className="empty-bag-icon" />
              <h4 className="empty-title">Your bag is empty</h4>
              <p className="empty-desc">Take a look at our tissue sarees and zardozi corsets.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn btn-outline"
              >
                Start shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.itemKey} className="cart-item-row">
                <img 
                  src={item.images?.modelView || item.images?.flatlayView} 
                  alt={item.name}
                  className="cart-item-img" 
                />

                <div className="cart-item-info">
                  <div className="item-title-row">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <button 
                      onClick={() => removeFromCart(item.itemKey)}
                      className="item-remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="item-specs-pills">
                    <span className="spec-pill">{item.selectedSize}</span>
                    {item.customColor && (
                      <span className="spec-pill color-pill">Shade: {item.customColor}</span>
                    )}
                    {item.isDuo && (
                      <span className="spec-pill duo-pill">Duo set</span>
                    )}
                    {item.offerLabel && item.basePrice > item.price && (
                      <span className="saak-tag is-offer cart-offer-tag">{item.offerLabel}</span>
                    )}
                  </div>

                  <div className="item-bottom-row">
                    <div className="qty-controls">
                      <button 
                        onClick={() => updateCartQty(item.itemKey, -1)}
                        className="qty-btn"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.itemKey, 1)}
                        className="qty-btn"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="cart-item-price-box">
                      <OfferPrice
                        className="item-price-current"
                        price={item.price * item.quantity}
                        basePrice={(item.basePrice ?? item.price) * item.quantity}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Checkout */}
        {!orderComplete && cart.length > 0 && (
          <div className="drawer-footer">
            {cartSavings > 0 && (
              <div className="savings-row">
                <span>Offer savings</span>
                <span>−{formatPrice(cartSavings)}</span>
              </div>
            )}
            <div className="subtotal-row">
              <span className="subtotal-label">Total</span>
              <span className="subtotal-val">{formatPrice(cartTotal)}</span>
            </div>

            <div className="perk-reassurance">
              <ShieldCheck size={13} className="text-gold" />
              <span>Free fall &amp; pico, and insured packaging</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn btn-primary checkout-btn"
            >
              {isCheckingOut ? (
                <span>One moment...</span>
              ) : (
                <>
                  <span>Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="cart-policy-badge">
              <RotateCcw size={11} className="text-gold" />
              <span>48-hour defect cover • <button type="button" onClick={openPolicyModal} className="cart-policy-link">Returns &amp; refunds</button></span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          max-width: 100%;
          height: 100%;
          max-height: 100%;
          background: rgba(26, 22, 20, 0.6);
          backdrop-filter: blur(4px);
          z-index: 999;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease-out;
          box-sizing: border-box;
        }
        .cart-drawer-panel {
          background: #FFFFFF;
          width: 100%;
          max-width: 440px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .drawer-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .drawer-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          color: var(--text-primary);
        }
        .drawer-count {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }
        .drawer-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .drawer-close-btn:hover {
          color: var(--text-primary);
        }
        .shipping-progress-box {
          background: var(--bg-primary);
          padding: 12px 24px;
          border-bottom: 1px solid var(--border-light);
        }
        .progress-text {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .free-ship-success {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #2E7D32;
        }
        .progress-bar-track {
          height: 4px;
          background: rgba(0, 0, 0, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-terracotta) 100%);
          transition: width 0.3s ease;
        }
        .cart-items-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cart-item-row {
          display: flex;
          gap: 14px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }
        .cart-item-img {
          width: 72px;
          height: 90px;
          object-fit: cover;
          border-radius: 3px;
          background: #EAE3D6;
          flex-shrink: 0;
        }
        .cart-item-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .item-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .cart-item-name {
          font-family: var(--font-serif);
          font-size: var(--text-base);
          color: var(--text-primary);
          line-height: 1.25;
        }
        .item-remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
        }
        .item-remove-btn:hover {
          color: var(--accent-terracotta);
        }
        .item-specs-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .spec-pill {
          font-size: var(--text-xs);
          background: var(--bg-primary);
          padding: 2px 6px;
          border-radius: 2px;
          color: var(--text-secondary);
        }
        .color-pill {
          background: rgba(163, 72, 53, 0.08);
          color: var(--accent-terracotta);
        }
        .duo-pill {
          background: rgba(197, 160, 89, 0.15);
          color: #8C6D2B;
          font-weight: 600;
        }
        .item-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }
        .qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-light);
          border-radius: 2px;
        }
        .qty-btn {
          background: none;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          color: var(--text-primary);
        }
        .qty-val {
          font-size: var(--text-xs);
          font-weight: 600;
          min-width: 18px;
          text-align: center;
        }
        .cart-item-price-box {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .item-price-current {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .item-price-strike {
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .empty-cart-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 12px;
          color: var(--text-muted);
        }
        .empty-bag-icon {
          color: var(--accent-gold);
        }
        .empty-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          color: var(--text-primary);
        }
        .empty-desc {
          font-size: var(--text-sm);
          max-width: 240px;
        }
        .order-complete-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 14px;
          padding: 20px;
        }
        .complete-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(46, 125, 50, 0.1);
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .complete-title {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          color: var(--text-primary);
        }
        .complete-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .drawer-footer {
          padding: 20px 24px;
          border-top: 1px solid var(--border-subtle);
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cart-savings-banner {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(197, 160, 89, 0.12);
          border: 1px solid var(--border-gold);
          padding: 8px 12px;
          border-radius: 2px;
          font-size: var(--text-xs);
          color: #8C6D2B;
        }
        .cart-offer-tag {
          padding: 2px 8px;
        }
        .savings-row {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-sm);
          color: var(--accent-terracotta);
          margin-bottom: 6px;
        }
        .subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .subtotal-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        .subtotal-val {
          font-family: var(--font-sans);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--accent-terracotta);
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums lining-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
        }
        .perk-reassurance {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .checkout-btn {
          width: 100%;
          padding: 14px;
          font-size: var(--text-sm);
        }
        .cart-policy-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-align: center;
          margin-top: -2px;
        }
        .cart-policy-link {
          background: none;
          border: none;
          padding: 0;
          color: var(--accent-terracotta);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          font-weight: 600;
        }
        .cart-policy-link:hover {
          color: #8A3B2B;
        }

        @media (max-width: 640px) {
          .cart-backdrop {
            justify-content: stretch;
          }
          .cart-drawer-panel {
            width: 100% !important;
            max-width: 100% !important;
          }
          .drawer-header {
            padding: 16px;
          }
          .shipping-progress-box {
            padding: 12px 16px;
          }
          .cart-items-body {
            padding: 12px 16px;
          }
          .drawer-footer {
            padding: 16px;
          }
          .cart-item-card {
            gap: 12px;
          }
          .cart-item-thumb {
            width: 68px;
            height: 90px;
          }
        }
      `}</style>
    </div>
  );
}
