import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import { PlusCircle, Search, X, ArrowRight } from 'lucide-react';
import { searchAndRankProducts } from '../utils/searchUtils';
import { getDisplayTag } from '../utils/tags';
import OfferPrice from './OfferPrice';

// The catalog reads like a lookbook: numbered chapters that are always visible,
// a sticky chapter rail to jump between them, and quiet text facets instead of
// stacked filter pills.
const CHAPTERS = [
  {
    key: 'sarees',
    id: 'sarees-block',
    numeral: 'I',
    title: 'Sarees',
    blurb: 'Featherlight tissue and fluid crepe, finished by hand with fall and pico.',
    facets: [
      { key: 'all', label: 'All' },
      { key: 'tissue', label: 'Tissue' },
      { key: 'crepe', label: 'Crepe' }
    ]
  },
  {
    key: 'blouses',
    id: 'blouses-block',
    numeral: 'II',
    title: 'Blouses & Corsets',
    shortTitle: 'Blouses',
    blurb: 'Boned corsets with hand zardozi, and tailored silk blouses that pair with every drape.',
    facets: [
      { key: 'all', label: 'All' },
      { key: 'corset', label: 'Corsets' },
      { key: 'blouse', label: 'Silk blouses' }
    ]
  },
  {
    key: 'sets',
    id: 'sets-block',
    numeral: 'III',
    title: 'The Duo',
    blurb: 'A saree and blouse styled together by Aprajita, ready to wear.',
    facets: []
  }
];

const RAIL_OFFSET = 150; // navbar + chapter rail

export default function ProductGrid() {
  const {
    products,
    openCreateProduct,
    searchQuery,
    clearSearch,
    setSelectedProduct
  } = useShop();
  const { isAdmin } = useAuth();
  const [sortBy, setSortBy] = useState('featured');
  const [facets, setFacets] = useState({ sarees: 'all', blouses: 'all' });
  const [activeChapter, setActiveChapter] = useState('sarees');

  const isSearching = Boolean(searchQuery && searchQuery.trim());
  const baseProducts = isSearching ? searchAndRankProducts(products, searchQuery) : products;

  const sortList = (list) => [...list].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (isSearching) return 0;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const chapterData = CHAPTERS.map(chapter => {
    const all = baseProducts.filter(p => p.category === chapter.key);
    const facet = facets[chapter.key] || 'all';
    const visible = facet === 'all' ? all : all.filter(p => p.subCategory === facet);
    return { ...chapter, all, items: sortList(visible), facet };
  }).filter(chapter => chapter.all.length > 0);

  const totalVisible = chapterData.reduce((sum, c) => sum + c.items.length, 0);

  // Highlight the chapter currently in view
  useEffect(() => {
    const handleScroll = () => {
      let current = chapterData[0]?.key;
      for (const chapter of chapterData) {
        const el = document.getElementById(chapter.id);
        if (el && el.getBoundingClientRect().top - RAIL_OFFSET - 40 <= 0) current = chapter.key;
      }
      if (current) setActiveChapter(current);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterData.map(c => c.key).join('|')]);

  const scrollToChapter = (chapter) => {
    const el = document.getElementById(chapter.id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - RAIL_OFFSET + 10;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const setFacet = (chapterKey, facetKey) => {
    setFacets(prev => ({ ...prev, [chapterKey]: facetKey }));
  };

  return (
    <section id="catalog-section" className="catalog-section">
      <div className="container">
        <header className="catalog-intro">
          <span className="catalog-eyebrow">The Collection</span>
          <h2 className="catalog-title">Made to be worn together</h2>
          <p className="catalog-lede">
            Handwoven sarees, sculpted blouses and pairings — each piece finished by hand in India.
          </p>
          {isAdmin && (
            <button onClick={openCreateProduct} className="btn btn-outline-gold add-prod-trigger">
              <PlusCircle size={15} />
              <span>Add product</span>
            </button>
          )}
        </header>

        {/* Sticky chapter rail */}
        <nav className="chapter-rail" aria-label="Collection chapters">
          <div className="chapter-rail-links">
            {chapterData.map(chapter => (
              <button
                key={chapter.key}
                className={`chapter-link ${activeChapter === chapter.key ? 'active' : ''}`}
                onClick={() => scrollToChapter(chapter)}
              >
                <span className="chapter-link-numeral">{chapter.numeral}</span>
                <span className="chapter-link-title">
                  <span className="title-full">{chapter.title}</span>
                  <span className="title-short">{chapter.shortTitle || chapter.title}</span>
                </span>
              </button>
            ))}
          </div>
          <label className="chapter-sort">
            <span className="sr-only">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </nav>

        {isSearching && (
          <div className="catalog-search-banner">
            <span>
              <Search size={14} />
              {totalVisible} {totalVisible === 1 ? 'piece' : 'pieces'} for <em>“{searchQuery}”</em>
            </span>
            <button type="button" onClick={clearSearch} className="clear-search-btn">
              <X size={13} />
              <span>Clear</span>
            </button>
          </div>
        )}

        {chapterData.map(chapter => (
          <div className="chapter" id={chapter.id} key={chapter.key}>
            <div className="chapter-head">
              <span className="chapter-numeral" aria-hidden="true">{chapter.numeral}</span>
              <div className="chapter-head-text">
                <h3 className="chapter-title">{chapter.title}</h3>
                <p className="chapter-blurb">{chapter.blurb}</p>
              </div>
              {chapter.facets.length > 0 && (
                <div className="chapter-facets" role="group" aria-label={`Filter ${chapter.title}`}>
                  {chapter.facets.map(f => {
                    const count = f.key === 'all'
                      ? chapter.all.length
                      : chapter.all.filter(p => p.subCategory === f.key).length;
                    if (f.key !== 'all' && count === 0) return null;
                    return (
                      <button
                        key={f.key}
                        className={`facet ${chapter.facet === f.key ? 'active' : ''}`}
                        onClick={() => setFacet(chapter.key, f.key)}
                        aria-pressed={chapter.facet === f.key}
                      >
                        {f.label}
                        <sup>{count}</sup>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {chapter.key === 'sets' && chapter.items.length === 1 ? (
              <DuoFeature
                product={chapter.items[0]}
                onOpen={() => setSelectedProduct(chapter.items[0])}
              />
            ) : (
              <div className={`products-grid cols-${chapter.items.length % 4 === 0 ? 4 : 3}`}>
                {chapter.items.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ))}

        {totalVisible === 0 && (
          <div className="empty-catalog-state">
            <p className="empty-catalog-msg">
              {isSearching ? `Nothing matched “${searchQuery}”.` : 'No pieces here yet.'}
            </p>
            <button className="btn btn-outline" onClick={() => clearSearch()}>
              View the full collection
            </button>
          </div>
        )}
      </div>

      <style>{`
        .catalog-section {
          padding: 96px 0 104px;
          background: var(--bg-primary);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .catalog-intro {
          text-align: center;
          max-width: 620px;
          margin: 0 auto 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .catalog-eyebrow {
          font-size: var(--text-xs);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent-gold);
        }
        .catalog-title {
          font-size: var(--text-3xl);
          line-height: 1.15;
          color: var(--text-primary);
        }
        .catalog-lede {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.7;
        }
        .add-prod-trigger {
          margin-top: 8px;
          font-size: var(--text-sm);
          padding: 9px 18px;
        }

        /* Chapter rail */
        .chapter-rail {
          position: sticky;
          top: 78px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          margin-bottom: 8px;
          background: rgba(250, 246, 239, 0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .chapter-rail-links {
          display: flex;
          align-items: center;
          gap: 36px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .chapter-rail-links::-webkit-scrollbar { display: none; }
        .chapter-link {
          background: none;
          border: none;
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          padding: 4px 0;
          cursor: pointer;
          color: var(--text-muted);
          white-space: nowrap;
          border-bottom: 1px solid transparent;
          transition: var(--transition);
        }
        .chapter-link-numeral {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: var(--text-base);
          color: var(--accent-gold);
        }
        .chapter-link-title {
          font-size: var(--text-sm);
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .title-short { display: none; }
        .chapter-link:hover,
        .chapter-link.active {
          color: var(--text-primary);
        }
        .chapter-link.active {
          border-bottom-color: var(--text-primary);
        }
        .chapter-sort select {
          background: transparent;
          border: none;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px 2px;
        }

        .catalog-search-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 24px 0 0;
          padding: 12px 16px;
          border: 1px solid var(--border-gold);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .catalog-search-banner span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .clear-search-btn {
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Chapters */
        .chapter {
          padding-top: 64px;
        }
        .chapter-head {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: end;
          gap: 24px;
          margin-bottom: 32px;
        }
        .chapter-numeral {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 64px;
          line-height: 0.9;
          color: var(--accent-gold);
          opacity: 0.85;
          min-width: 56px;
        }
        .chapter-title {
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .chapter-blurb {
          font-size: var(--text-base);
          color: var(--text-secondary);
          max-width: 520px;
        }
        .chapter-facets {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .facet {
          background: none;
          border: none;
          padding: 4px 10px;
          font-size: var(--text-sm);
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          transition: var(--transition);
        }
        .facet + .facet::before {
          content: '·';
          position: absolute;
          left: -4px;
          color: var(--border-gold);
        }
        .facet sup {
          font-size: var(--text-xs);
          margin-left: 2px;
          color: var(--accent-gold);
        }
        .facet:hover,
        .facet.active {
          color: var(--text-primary);
        }
        .facet.active {
          text-decoration: underline;
          text-underline-offset: 6px;
          text-decoration-thickness: 1px;
        }

        .products-grid {
          display: grid;
          gap: 40px 28px;
        }
        .products-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
        .products-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }

        .empty-catalog-state {
          text-align: center;
          padding: 64px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-catalog-msg {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .products-grid.cols-4 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .catalog-section {
            padding: 64px 0 72px;
          }
          .catalog-title {
            font-size: var(--text-2xl);
          }
          .chapter-rail {
            top: 64px;
            padding: 10px 0;
          }
          .chapter-rail-links {
            gap: 18px;
          }
          .title-full { display: none; }
          .title-short { display: inline; }
          .chapter-link-numeral {
            font-size: var(--text-sm);
          }
          .chapter {
            padding-top: 44px;
          }
          .chapter-head {
            grid-template-columns: auto 1fr;
            align-items: start;
            gap: 6px 14px;
            margin-bottom: 20px;
          }
          .chapter-numeral {
            font-size: 40px;
            min-width: 32px;
            line-height: 1;
          }
          .chapter-title {
            font-size: var(--text-xl);
          }
          .chapter-blurb {
            font-size: var(--text-sm);
          }
          .chapter-facets {
            grid-column: 1 / -1;
            margin-left: -10px;
          }
          .products-grid,
          .products-grid.cols-3,
          .products-grid.cols-4 {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px 14px;
          }
        }
        @media (max-width: 420px) {
          .chapter-sort select {
            max-width: 96px;
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </section>
  );
}

function DuoFeature({ product, onOpen }) {
  const image = product.images?.modelView || product.images?.gallery?.[0];
  const detail = product.images?.flatlayView;
  const tag = getDisplayTag(product.tag);

  const goToStudio = (e) => {
    e.stopPropagation();
    document.getElementById('mix-match-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="duo-feature" id={`product-card-${product.id}`}>
      <button className="duo-feature-media" onClick={onOpen} aria-label={`View ${product.name}`}>
        <img src={image} alt={product.name} loading="lazy" />
        {product.offer ? (
          <span className="saak-tag is-offer duo-feature-tag">
            {product.offer.label ? `${product.offer.label} · ${product.offer.short}` : product.offer.short}
          </span>
        ) : tag && <span className="saak-tag duo-feature-tag">{tag}</span>}
      </button>
      <div className="duo-feature-body">
        {detail && detail !== image && (
          <img className="duo-feature-detail" src={detail} alt="" aria-hidden="true" loading="lazy" />
        )}
        <h4 className="duo-feature-title">{product.name}</h4>
        <p className="duo-feature-desc">{product.description}</p>
        <OfferPrice className="duo-feature-price" price={product.price} basePrice={product.basePrice} />
        <div className="duo-feature-actions">
          <button className="btn btn-primary" onClick={onOpen}>
            <span>View the duo</span>
            <ArrowRight size={15} />
          </button>
          <button className="duo-feature-link" onClick={goToStudio}>
            Or style your own in Mix &amp; Match
          </button>
        </div>
      </div>

      <style>{`
        .duo-feature {
          display: grid;
          grid-template-columns: minmax(0, 500px) minmax(0, 460px);
          justify-content: center;
          gap: 72px;
          align-items: center;
        }
        .duo-feature-media {
          position: relative;
          border: none;
          padding: 0;
          cursor: pointer;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: var(--bg-secondary);
          border-radius: 2px;
        }
        .duo-feature-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .duo-feature-media:hover img {
          transform: scale(1.02);
        }
        .duo-feature-tag {
          position: absolute;
          top: 16px;
          left: 16px;
        }
        .duo-feature-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 460px;
        }
        .duo-feature-detail {
          width: 120px;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 2px;
          border: 4px solid #FFFFFF;
          box-shadow: var(--shadow-md);
        }
        .duo-feature-title {
          font-size: var(--text-2xl);
          line-height: 1.25;
          font-weight: 400;
        }
        .duo-feature-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.75;
        }
        .duo-feature-price {
          font-size: var(--text-xl);
          color: var(--text-primary);
        }
        .duo-feature-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .duo-feature-link {
          background: none;
          border: none;
          padding: 0;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
        }
        .duo-feature-link:hover {
          color: var(--accent-terracotta);
        }
        @media (max-width: 768px) {
          .duo-feature {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .duo-feature-detail {
            display: none;
          }
          .duo-feature-title {
            font-size: var(--text-xl);
          }
          .duo-feature-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
