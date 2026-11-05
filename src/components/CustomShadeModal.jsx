import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getSizeSurcharge } from '../utils/pricing';
import { X, Palette, MessageCircle, Check, ShoppingBag } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useOverlay } from '../hooks/useOverlay';
import { getWhatsAppLink } from '../utils/contact';

const DEFAULT_SHADES = [
    { name: 'Sunset Terracotta', hex: '#A34835', description: 'Warm and earthy' },
    { name: 'Olive Bloom', hex: '#5B664B', description: 'Leaf green with a sheen' },
    { name: 'Champagne Gold', hex: '#E2CA9B', description: 'Soft and subtle' },
    { name: 'Lilac Lavender', hex: '#C6B2DC', description: 'Fresh pastel' },
    { name: 'Powder Sage', hex: '#9EB09E', description: 'Calm, good for day events' },
    { name: 'Crimson Wine', hex: '#6B2228', description: 'Deep, for evenings' },
    { name: 'Midnight Obsidian', hex: '#1F1A17', description: 'Bold and modern' },
    { name: 'Dusty Rose', hex: '#D9A0A0', description: 'Soft blush' }
];

export default function CustomShadeModal() {
  const { customShadeProduct, setCustomShadeProduct } = useShop();
  useOverlay(Boolean(customShadeProduct), () => setCustomShadeProduct(null));

  if (!customShadeProduct) return null;
  // Keyed so all local state resets when a different product is opened
  return <ShadeStudio key={customShadeProduct.id} customShadeProduct={customShadeProduct} />;
}

function ShadeStudio({ customShadeProduct }) {
  const { setCustomShadeProduct, addToCart, formatPrice } = useShop();

  // Prefer the shades configured on the product (what the card advertises)
  const defaultShades = (customShadeProduct.availableCustomColors?.length > 0)
    ? customShadeProduct.availableCustomColors.map(c => ({ description: '', ...c }))
    : DEFAULT_SHADES;
  const sizeOptions = customShadeProduct.sizeOptions?.length > 0 ? customShadeProduct.sizeOptions : ['Standard'];
  const itemNoun = customShadeProduct.category === 'blouses' ? 'blouse' : 'saree';

  const [selectedShade, setSelectedShade] = useState(defaultShades[0]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [customNote, setCustomNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Hi Aprajita, I am looking at the *${customShadeProduct.name}* (${selectedSize}) on Saak by Aprajita and would love to customize it in the *${selectedShade.name}* shade (${selectedShade.hex}). ${customNote ? `Note: ${customNote}` : ''}`
  );

  const handleAddCustomToBag = () => {
    addToCart(customShadeProduct, selectedSize, selectedShade.name, 1, { customNote: customNote.trim() });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setCustomShadeProduct(null);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={() => setCustomShadeProduct(null)}>
      <div className="modal-container shade-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close-btn"
          onClick={() => setCustomShadeProduct(null)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="shade-modal-header">
          <div className="shade-badge">
            <Palette size={13} className="text-gold" />
            <span>Custom colour</span>
          </div>
          <h2 className="shade-title">Pick your colour</h2>
          <p className="shade-subtitle">
            Choose a colour for the <strong>{customShadeProduct.name}</strong>. We'll make your {itemNoun} in that shade.
          </p>
        </div>

        {/* Selected Shade Spotlight */}
        <div className="shade-spotlight" style={{ borderColor: selectedShade.hex }}>
          <div 
            className="spotlight-swatch"
            style={{ backgroundColor: selectedShade.hex }}
          ></div>
          <div className="spotlight-text">
            <span className="spotlight-tag">Selected colour:</span>
            <h3 className="spotlight-name" style={{ color: selectedShade.hex }}>{selectedShade.name}</h3>
            <span className="spotlight-desc">{selectedShade.description}</span>
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="palette-grid">
          {defaultShades.map((shade, idx) => {
            const isSelected = selectedShade.name === shade.name;
            return (
              <div 
                key={idx}
                className={`palette-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedShade(shade)}
              >
                <div 
                  className="tile-color-circle" 
                  style={{ backgroundColor: shade.hex }}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" />}
                </div>
                <span className="tile-name">{shade.name}</span>
              </div>
            );
          })}
        </div>

        {sizeOptions.length > 1 && (
          <div className="custom-note-block">
            <label className="note-label" htmlFor="shade-size-select">Size / finish</label>
            <select
              id="shade-size-select"
              className="note-input"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {sizeOptions.map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>
          </div>
        )}

        {/* Custom note / reference */}
        <div className="custom-note-block">
          <label className="note-label">Have a specific shade in mind?</label>
          <input 
            type="text" 
            placeholder="e.g., Match my sister's mehendi lehenga / Pantone 18-1438"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="note-input"
          />
        </div>

        {/* Actions */}
        <div className="shade-actions-row">
          <button 
            onClick={handleAddCustomToBag}
            className={`btn btn-primary shade-add-btn ${isAdded ? 'added' : ''}`}
          >
            {isAdded ? (
              <>
                <Check size={15} />
                <span>Added to bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>Add to bag ({formatPrice(customShadeProduct.price + getSizeSurcharge(selectedSize))})</span>
              </>
            )}
          </button>

          <a 
            href={getWhatsAppLink(decodeURIComponent(whatsappMessage))}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-gold whatsapp-shade-btn"
            title="Chat with us on WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </a>

          <a 
            href="https://www.instagram.com/saakbyaprajita?srtk=MzNuendsOGdtdndu"
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline insta-shade-btn"
            title="Message us on Instagram @saakbyaprajita"
          >
            <InstagramIcon size={15} />
            <span>DM on Instagram</span>
          </a>
        </div>
      </div>

      <style>{`
        .shade-modal {
          background: #FFFFFF;
          border-radius: 4px;
          max-width: 620px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-gold);
        }
        .shade-modal-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .shade-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 8px;
        }
        .shade-title {
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .shade-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .shade-spotlight {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-primary);
          border-radius: 4px;
          border: 2px solid;
          margin-bottom: 24px;
          transition: var(--transition);
        }
        .spotlight-swatch {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
        }
        .spotlight-text {
          display: flex;
          flex-direction: column;
        }
        .spotlight-tag {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .spotlight-name {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
        }
        .spotlight-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        .palette-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .palette-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 10px 6px;
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: 3px;
          cursor: pointer;
          transition: var(--transition);
        }
        .palette-tile:hover {
          border-color: var(--accent-terracotta);
          transform: translateY(-2px);
        }
        .palette-tile.selected {
          border-color: var(--accent-terracotta);
          background: #FAF2EC;
          box-shadow: 0 2px 6px rgba(163, 72, 53, 0.15);
        }
        .tile-color-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tile-name {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }
        .custom-note-block {
          margin-bottom: 24px;
        }
        .note-label {
          display: block;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .note-input {
          width: 100%;
          padding: 10px 14px;
          font-size: var(--text-sm);
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: var(--bg-primary);
          outline: none;
        }
        .note-input:focus {
          border-color: var(--accent-terracotta);
        }
        .shade-actions-row {
          display: flex;
          gap: 12px;
        }
        .shade-add-btn {
          flex: 1.2;
          padding: 12px;
          font-size: var(--text-sm);
        }
        .whatsapp-shade-btn {
          flex: 0.8;
          padding: 12px;
          font-size: var(--text-sm);
          text-decoration: none;
        }
        .insta-shade-btn {
          flex: 0.9;
          padding: 12px;
          font-size: var(--text-sm);
          text-decoration: none;
          color: var(--accent-terracotta);
          border-color: rgba(163, 72, 53, 0.3);
        }
        .insta-shade-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        @media (max-width: 580px) {
          .shade-modal {
            padding: 20px 14px;
          }
          .palette-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .shade-actions-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
