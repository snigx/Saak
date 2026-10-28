import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, ArrowRight, Sparkles, CornerDownLeft, ShoppingBag } from 'lucide-react';

const POPULAR_SEARCHES = [
  'Midnight Black Crepe',
  'The Gold Corset',
  'Sunset Orange Tissue',
  'Olive Bloom Tissue',
  'Ivory Raw Silk Blouse',
  'Signature Duo'
];

export default function SearchModal() {
  const {
    products,
    isSearchOpen,
    closeSearch,
    setSelectedProduct,
    setActiveCategory,
    setSearchQuery,
    formatPrice,
    addToCart
  } = useShop();

  const [localQuery, setLocalQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      setLocalQuery('');
    }
  }, [isSearchOpen]);

  // Global keyboard shortcuts: Esc to close, Cmd+K / Ctrl+K or '/' to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchOpen) closeSearch();
        else if (inputRef.current) inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const trimmed = localQuery.trim().toLowerCase();

  // Search filter
  const searchResults = trimmed
    ? products.filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(trimmed);
        const descMatch = product.description?.toLowerCase().includes(trimmed);
        const fabricMatch = product.fabric?.toLowerCase().includes(trimmed);
        const tagMatch = product.tag?.toLowerCase().includes(trimmed);
        const catMatch = product.category?.toLowerCase().includes(trimmed);
        const subCatMatch = product.subCategory?.toLowerCase().includes(trimmed);
        const zariMatch = product.zariWork?.toLowerCase().includes(trimmed);
        const colorMatch = product.availableCustomColors?.some((c) =>
          c.name.toLowerCase().includes(trimmed)
        );

        return (
          nameMatch ||
          descMatch ||
          fabricMatch ||
          tagMatch ||
          catMatch ||
          subCatMatch ||
          zariMatch ||
          colorMatch
        );
      })
    : [];

  const handleSelectProduct = (product) => {
    closeSearch();
    // Switch to category to make sure it's in the DOM
    if (product.category === 'sets') {
      setActiveCategory('sets');
    } else if (product.category === 'blouses') {
      setActiveCategory('corset');
    } else if (product.subCategory === 'tissue') {
      setActiveCategory('tissue');
    } else {
      setActiveCategory('all');
    }

    // Open detail modal directly
    setSelectedProduct(product);

    // Smooth scroll to card & trigger highlight
    setTimeout(() => {
      const cardEl = document.getElementById(`product-card-${product.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('search-highlight');
        setTimeout(() => cardEl.classList.remove('search-highlight'), 2400);
      } else {
        const catalogEl = document.getElementById('catalog-section');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 200);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    
    // If there is an exact single match or first match, navigate
    if (searchResults.length > 0) {
      setSearchQuery(localQuery);
      closeSearch();
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleChipClick = (term) => {
    setLocalQuery(term);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="search-modal-backdrop" onClick={closeSearch}>
      <div 
        className="search-palette-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search creations"
      >
        {/* Search Header Bar */}
        <form onSubmit={handleSearchSubmit} className="search-palette-header">
          <Search size={20} className="search-palette-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-palette-input"
            placeholder="Search tissue sarees, black crepe, corsets, blouses..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          {localQuery && (
            <button
              type="button"
              className="search-palette-clear"
              onClick={() => {
                setLocalQuery('');
                if (inputRef.current) inputRef.current.focus();
              }}
              title="Clear input"
            >
              <X size={15} />
            </button>
          )}
          <button 
            type="button" 
            className="search-palette-close" 
            onClick={closeSearch}
            title="Close (Esc)"
          >
            <span className="esc-pill">ESC</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="search-chips-container">
          <span className="chips-label">Popular Searches:</span>
          <div className="chips-row">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                className={`search-suggest-chip ${trimmed === term.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleChipClick(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="search-results-area">
          {trimmed ? (
            searchResults.length > 0 ? (
              <div className="search-results-list">
                <div className="results-header-info">
                  <span>FOUND {searchResults.length} {searchResults.length === 1 ? 'CREATION' : 'CREATIONS'}</span>
                  <button 
                    type="button" 
                    className="view-in-catalog-link"
                    onClick={() => {
                      setSearchQuery(localQuery);
                      closeSearch();
                      const catalogEl = document.getElementById('catalog-section');
                      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>View all in catalog</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {searchResults.map((product) => {
                  const thumb = product.images?.modelView || product.images?.gallery?.[0];
                  return (
                    <div
                      key={product.id}
                      className="search-result-row"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="search-thumb-box">
                        <img src={thumb} alt={product.name} className="search-thumb-img" />
                      </div>

                      <div className="search-item-info">
                        <div className="search-item-topline">
                          {product.tag && (
                            <span 
                              className="search-item-tag"
                              style={{ backgroundColor: `${product.tagColor || '#C5A059'}20`, color: product.tagColor || '#C5A059' }}
                            >
                              {product.tag}
                            </span>
                          )}
                          <span className="search-item-cat">{product.subCategory || product.category}</span>
                        </div>

                        <h4 className="search-item-name">{product.name}</h4>
                        <p className="search-item-fabric">{product.fabric}</p>

                        <div className="search-item-footer">
                          <span className="search-item-price">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="search-item-orig">{formatPrice(product.originalPrice)}</span>
                          )}
                        </div>
                      </div>

                      <div className="search-row-action">
                        <span className="navigate-hint">View Creation</span>
                        <ArrowRight size={15} className="navigate-arrow" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty-state">
                <div className="empty-icon-circle">
                  <Search size={24} />
                </div>
                <h4 className="empty-title">No creations matched "{localQuery}"</h4>
                <p className="empty-subtitle">
                  Try searching for our signature weaves like <strong>tissue</strong>, <strong>crepe</strong>, or <strong>corset</strong>.
                </p>
                <div className="empty-action-chips">
                  {POPULAR_SEARCHES.slice(0, 3).map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="empty-suggest-chip"
                      onClick={() => handleChipClick(term)}
                    >
                      <Sparkles size={11} className="text-gold" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* Default State when no query is typed */
            <div className="search-default-showcase">
              <div className="showcase-header">
                <Sparkles size={14} className="text-gold" />
                <span>ATELIER SIGNATURE CREATIONS</span>
              </div>
              <div className="showcase-grid">
                {products.slice(0, 4).map((product) => {
                  const thumb = product.images?.modelView || product.images?.gallery?.[0];
                  return (
                    <div
                      key={product.id}
                      className="showcase-card"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="showcase-thumb">
                        <img src={thumb} alt={product.name} />
                      </div>
                      <div className="showcase-details">
                        <span className="showcase-tag">{product.tag || 'Atelier'}</span>
                        <span className="showcase-name">{product.name}</span>
                        <span className="showcase-price">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="search-palette-footer">
          <div className="footer-keys-hint">
            <span>Click any creation to inspect drapes &amp; customize</span>
          </div>
          <div className="footer-quick-duo">
            <span>Tip: Type <strong>"black"</strong>, <strong>"orange"</strong>, or <strong>"corset"</strong></span>
          </div>
        </div>
      </div>

      <style>{`
        .search-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 14, 12, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 80px 20px 40px;
          animation: searchFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
          overflow-y: auto;
        }

        @keyframes searchFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .search-palette-card {
          background: #FAF7F2;
          width: 100%;
          max-width: 660px;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(197, 160, 89, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: searchCardSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes searchCardSlide {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header Form Bar */
        .search-palette-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(229, 218, 200, 0.7);
          background: #FFFFFF;
          gap: 12px;
        }

        .search-palette-icon {
          color: var(--accent-gold);
          flex-shrink: 0;
        }

        .search-palette-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 16px;
          color: var(--text-primary);
          font-weight: 400;
        }

        .search-palette-input::placeholder {
          color: #9E9287;
          font-size: 14.5px;
        }

        .search-palette-clear {
          background: #EFE9DF;
          border: none;
          color: var(--text-muted);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .search-palette-clear:hover {
          background: #E2D9CB;
          color: var(--text-primary);
        }

        .search-palette-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .esc-pill {
          background: #EDE6DA;
          color: #6E6359;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 3px 7px;
          border-radius: 4px;
          border: 1px solid #DCD0BF;
        }

        /* Popular Chips */
        .search-chips-container {
          padding: 12px 20px;
          background: #F4EFE6;
          border-bottom: 1px solid rgba(229, 218, 200, 0.5);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chips-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8C7E72;
          flex-shrink: 0;
        }

        .chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .search-suggest-chip {
          background: #FFFFFF;
          border: 1px solid #DDD1C0;
          color: #4A3E36;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-suggest-chip:hover,
        .search-suggest-chip.active {
          background: var(--text-primary);
          color: #FFFFFF;
          border-color: var(--text-primary);
        }

        /* Results Area */
        .search-results-area {
          max-height: 52vh;
          overflow-y: auto;
          padding: 12px 16px;
        }

        .results-header-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #8C7E72;
          border-bottom: 1px solid rgba(229, 218, 200, 0.5);
          margin-bottom: 8px;
        }

        .view-in-catalog-link {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-terracotta);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-transform: none;
          letter-spacing: normal;
        }

        .view-in-catalog-link:hover {
          text-decoration: underline;
        }

        /* Result Row */
        .search-result-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
        }

        .search-result-row:hover {
          background: #FFFFFF;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .search-thumb-box {
          width: 58px;
          height: 74px;
          border-radius: 4px;
          overflow: hidden;
          background: #EFE9DF;
          flex-shrink: 0;
        }

        .search-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .search-item-info {
          flex: 1;
          min-width: 0;
        }

        .search-item-topline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .search-item-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 2px 7px;
          border-radius: 3px;
        }

        .search-item-cat {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8C7E72;
          font-weight: 600;
        }

        .search-item-name {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 3px;
          line-height: 1.25;
        }

        .search-item-fabric {
          font-size: 12px;
          color: #7D7065;
          margin: 0 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-item-footer {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-item-price {
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-terracotta);
        }

        .search-item-orig {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .search-row-action {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-gold);
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .search-result-row:hover .search-row-action {
          opacity: 1;
          color: var(--accent-terracotta);
        }

        /* Empty State */
        .search-empty-state {
          padding: 36px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #EFE9DF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-terracotta);
          margin-bottom: 14px;
        }

        .empty-title {
          font-family: var(--font-serif);
          font-size: 18px;
          color: var(--text-primary);
          margin: 0 0 6px;
        }

        .empty-subtitle {
          font-size: 13px;
          color: #7D7065;
          margin: 0 0 16px;
          max-width: 380px;
          line-height: 1.45;
        }

        .empty-action-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .empty-suggest-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid #DCD0BF;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .empty-suggest-chip:hover {
          border-color: var(--accent-gold);
          background: #FDFBF7;
        }

        /* Default Showcase */
        .search-default-showcase {
          padding: 12px 8px;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #8C7E72;
          margin-bottom: 12px;
          padding-left: 6px;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .showcase-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: #FFFFFF;
          border-radius: 6px;
          border: 1px solid #ECE3D4;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .showcase-card:hover {
          border-color: var(--accent-gold);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .showcase-thumb {
          width: 44px;
          height: 56px;
          border-radius: 3px;
          overflow: hidden;
          background: #EFE9DF;
          flex-shrink: 0;
        }

        .showcase-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .showcase-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .showcase-tag {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent-terracotta);
          letter-spacing: 0.05em;
        }

        .showcase-name {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .showcase-price {
          font-size: 12px;
          font-weight: 700;
          color: #8C7E72;
        }

        /* Palette Footer */
        .search-palette-footer {
          padding: 10px 20px;
          background: #F0EAE1;
          border-top: 1px solid rgba(229, 218, 200, 0.7);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: #8C7E72;
        }

        @media (max-width: 600px) {
          .search-modal-backdrop {
            padding: 20px 10px;
          }
          .showcase-grid {
            grid-template-columns: 1fr;
          }
          .search-chips-container {
            padding: 10px 14px;
          }
          .chips-label {
            display: none;
          }
          .search-row-action {
            display: none;
          }
          .search-palette-footer {
            flex-direction: column;
            gap: 4px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
