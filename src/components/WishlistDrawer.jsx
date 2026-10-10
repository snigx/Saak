import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer() {
  const { 
    wishlist, 
    products, 
    isWishlistOpen, 
    setIsWishlistOpen, 
    toggleWishlist, 
    addToCart, 
    formatPrice 
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="cart-backdrop" onClick={() => setIsWishlistOpen(false)}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={18} className="text-terracotta" />
            <h3 className="drawer-title">Curated Wishlist</h3>
            <span className="drawer-count">({wishlist.length})</span>
          </div>
          <button 
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close Wishlist"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-body">
          {wishlistedProducts.length === 0 ? (
            <div className="empty-cart-state">
              <Heart size={42} strokeWidth={1.5} className="text-terracotta" />
              <h4 className="empty-title">Your Wishlist is Empty</h4>
              <p className="empty-desc">Save your favorite festive looks and statement corsets here.</p>
              <button 
                onClick={() => setIsWishlistOpen(false)}
                className="btn btn-outline"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            wishlistedProducts.map(product => (
              <div key={product.id} className="cart-item-row">
                <img 
                  src={product.images?.modelView || product.images?.flatlayView} 
                  alt={product.name}
                  className="cart-item-img" 
                />

                <div className="cart-item-info">
                  <div className="item-title-row">
                    <h4 className="cart-item-name">{product.name}</h4>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="item-remove-btn"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <span className="spec-pill">{product.fabric}</span>

                  <div className="item-bottom-row">
                    <span className="item-price-current">{formatPrice(product.price)}</span>
                    <button 
                      onClick={() => {
                        addToCart(product);
                        toggleWishlist(product.id);
                      }}
                      className="btn btn-dark"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <ShoppingBag size={12} />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .text-terracotta {
          color: var(--accent-terracotta);
        }
      `}</style>
    </div>
  );
}
