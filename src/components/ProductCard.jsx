import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { requiresSizeChoice } from '../utils/pricing';
import { Heart, Check, Plus, Edit3 } from 'lucide-react';
import { getDisplayTag } from '../utils/tags';
import OfferPrice from './OfferPrice';

export default function ProductCard({ product }) {
  const { 
    toggleWishlist, 
    wishlist, 
    setSelectedProduct, 
    setCustomShadeProduct,
    addToCart,
    openEditProduct 
  } = useShop();
  const { isAdmin } = useAuth();

  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  // Primary photo + an alternate shown on hover (desktop)
  const galleryImages = (product.images.gallery && product.images.gallery.length > 0)
    ? product.images.gallery
    : [product.images.modelView, product.images.flatlayView].filter(Boolean);
  const primaryImage = product.images.modelView || galleryImages[0];
  const hoverImage = galleryImages.find(src => src && src !== primaryImage);
  const tagLabel = getDisplayTag(product.tag);

  const needsSize = requiresSizeChoice(product);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (needsSize) {
      // Fitted pieces: open details so the shopper picks their size
      setSelectedProduct(product);
      return;
    }
    addToCart(product);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  const handleCustomShade = (e) => {
    e.stopPropagation();
    setCustomShadeProduct(product);
  };

  return (
    <article id={`product-card-${product.id}`} className="product-card" onClick={() => setSelectedProduct(product)}>
      <div className="card-media-wrapper">
        <img 
          src={primaryImage} 
          alt={product.name}
          className="product-main-img"
          loading="lazy"
        />
        {hoverImage && (
          <img 
            src={hoverImage} 
            alt=""
            aria-hidden="true"
            className="product-hover-img"
            loading="lazy"
          />
        )}

        {product.offer ? (
          <span className="saak-tag is-offer card-tag">{product.offer.short}</span>
        ) : tagLabel && (
          <span className="saak-tag card-tag">{tagLabel}</span>
        )}

        <button 
          className={`card-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} strokeWidth={1.6} fill={isWishlisted ? 'var(--accent-terracotta)' : 'none'} color={isWishlisted ? 'var(--accent-terracotta)' : 'var(--text-primary)'} />
        </button>

        {isAdmin && (
          <button 
            className="card-edit-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              openEditProduct(product);
            }}
            title="Edit product"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="card-details">
        <h3 className="card-title">{product.name}</h3>

        <div className="card-meta-row">
          <OfferPrice className="card-current-price" price={product.price} basePrice={product.basePrice} />
          <button 
            className={`card-quick-btn ${isAddedAnimation ? 'added' : ''}`}
            onClick={handleQuickAdd}
          >
            {isAddedAnimation ? (
              <><Check size={14} /><span>Added</span></>
            ) : (
              <><Plus size={14} /><span>{needsSize ? 'Choose size' : 'Add to bag'}</span></>
            )}
          </button>
        </div>

        {product.isCustomColorAvailable && product.availableCustomColors?.length > 0 && (
          <button className="card-shade-link" onClick={handleCustomShade}>
            <span className="palette-dots" aria-hidden="true">
              {product.availableCustomColors.slice(0, 4).map((col, idx) => (
                <span key={idx} className="color-dot" style={{ backgroundColor: col.hex }} />
              ))}
            </span>
            <span>Custom shades</span>
          </button>
        )}
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
          background: transparent;
        }
        .card-media-wrapper {
          position: relative;
          aspect-ratio: 3 / 4;
          background: var(--bg-secondary);
          overflow: hidden;
          border-radius: 2px;
        }
        .product-main-img,
        .product-hover-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: opacity 0.5s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .product-hover-img {
          opacity: 0;
        }
        @media (hover: hover) {
          .product-card:hover .product-hover-img {
            opacity: 1;
          }
          .product-card:hover .product-main-img,
          .product-card:hover .product-hover-img {
            transform: scale(1.025);
          }
        }
        .card-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          max-width: calc(100% - 64px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .card-wishlist-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(250, 246, 239, 0.85);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          z-index: 2;
        }
        .card-wishlist-btn:hover {
          background: #FFFFFF;
        }
        .card-edit-action-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 3;
          background: rgba(31, 26, 23, 0.85);
          color: #FFFFFF;
          border: none;
          padding: 6px 10px;
          font-size: var(--text-xs);
          font-weight: 600;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }
        .card-details {
          padding: 14px 2px 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }
        .card-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .card-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .card-current-price {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-secondary);
        }
        .card-quick-btn {
          background: none;
          border: none;
          padding: 4px 0;
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          border-bottom: 1px solid transparent;
          transition: var(--transition);
        }
        .card-quick-btn:hover {
          color: var(--accent-terracotta);
          border-bottom-color: currentColor;
        }
        .card-quick-btn.added {
          color: var(--accent-olive);
        }
        .card-shade-link {
          background: none;
          border: none;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          color: var(--text-muted);
          cursor: pointer;
          width: fit-content;
        }
        .card-shade-link:hover {
          color: var(--accent-terracotta);
        }
        .palette-dots {
          display: inline-flex;
          align-items: center;
        }
        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1.5px solid var(--bg-primary);
          margin-left: -4px;
          display: inline-block;
        }
        .color-dot:first-child {
          margin-left: 0;
        }
        @media (max-width: 600px) {
          .card-details {
            padding-top: 10px;
            gap: 4px;
          }
          .card-title {
            font-size: var(--text-base);
          }
          .card-current-price {
            font-size: var(--text-sm);
          }
          .card-wishlist-btn {
            width: 32px;
            height: 32px;
          }
          /* Long merchandising tags get cut off on small cards — show them in the product popup instead */
          .card-tag {
            display: none;
          }
          .card-tag.is-offer {
            display: block;
          }
          .card-quick-btn {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </article>
  );
}
