import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, PlusCircle, Search, X, Layers, Scissors, Tag } from 'lucide-react';
import { searchAndRankProducts } from '../utils/searchUtils';

export default function ProductGrid() {
  const { 
    products, 
    activeCategory, 
    setActiveCategory, 
    setIsAtelierModalOpen, 
    searchQuery,
    clearSearch
  } = useShop();
  const { isAdmin } = useAuth();
  const [sortBy, setSortBy] = useState('featured');
  const [sareeSubFilter, setSareeSubFilter] = useState('all'); // 'all' | 'tissue' | 'crepe'
  const [blouseSubFilter, setBlouseSubFilter] = useState('all'); // 'all' | 'corset' | 'blouse'

  // If active search query exists, use intelligent relevance ranked search results
  const baseProducts = searchQuery && searchQuery.trim()
    ? searchAndRankProducts(products, searchQuery)
    : products;

  // Separate collections
  const allSarees = baseProducts.filter(p => p.category === 'sarees');
  const allBlouses = baseProducts.filter(p => p.category === 'blouses');
  const allSets = baseProducts.filter(p => p.category === 'sets');

  // Sub-filter Sarees
  const filteredSarees = allSarees.filter(p => {
    if (sareeSubFilter === 'tissue') return p.subCategory === 'tissue';
    if (sareeSubFilter === 'crepe') return p.subCategory === 'crepe';
    return true;
  });

  // Sub-filter Blouses
  const filteredBlouses = allBlouses.filter(p => {
    if (blouseSubFilter === 'corset') return p.subCategory === 'corset';
    if (blouseSubFilter === 'blouse') return p.subCategory === 'blouse';
    return true;
  });

  // Sort helper
  const sortProductsList = (list) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (searchQuery && searchQuery.trim() && sortBy === 'featured') return 0;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  };

  const sortedSarees = sortProductsList(filteredSarees);
  const sortedBlouses = sortProductsList(filteredBlouses);
  const sortedSets = sortProductsList(allSets);

  // Total counts for badges
  const totalSareesCount = products.filter(p => p.category === 'sarees').length;
  const totalBlousesCount = products.filter(p => p.category === 'blouses').length;
  const totalSetsCount = products.filter(p => p.category === 'sets').length;

  const showSarees = (activeCategory === 'all' || activeCategory === 'sarees' || activeCategory === 'tissue') && sortedSarees.length > 0;
  const showBlouses = (activeCategory === 'all' || activeCategory === 'blouses' || activeCategory === 'corset') && sortedBlouses.length > 0;
  const showSets = (activeCategory === 'all' || activeCategory === 'sets') && sortedSets.length > 0;

  const totalVisibleCount = (showSarees ? sortedSarees.length : 0) + 
                            (showBlouses ? sortedBlouses.length : 0) + 
                            (showSets ? sortedSets.length : 0);

  return (
    <section id="catalog-section" className="catalog-section">
      <div className="container">
        {/* Section Header */}
        <div className="catalog-header-row">
          <div>
            <div className="catalog-eyebrow">
              <Sparkles size={13} className="text-gold" />
              <span>THE CURATED COLLECTION</span>
            </div>
            <h2 className="catalog-title">
              {activeCategory === 'sarees' || activeCategory === 'tissue'
                ? 'Artisanal Sarees & Drapes'
                : activeCategory === 'blouses' || activeCategory === 'corset'
                ? 'Sculpted Blouses & Corsets'
                : activeCategory === 'sets'
                ? 'Curated Duos'
                : 'Artisanal Sarees & Sculpted Blouses'}
            </h2>
          </div>

          {isAdmin && (
            <div className="catalog-header-actions">
              <button 
                onClick={() => setIsAtelierModalOpen(true)}
                className="btn btn-outline-gold add-prod-trigger"
              >
                <PlusCircle size={15} />
                <span>Add New Creation</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Search Filter Banner */}
        {searchQuery && (
          <div className="catalog-search-banner">
            <div className="search-banner-info">
              <Search size={15} className="text-gold" />
              <span>
                Showing <strong>{totalVisibleCount}</strong> {totalVisibleCount === 1 ? 'creation' : 'creations'} matching <em>"{searchQuery}"</em>
              </span>
            </div>
            <button 
              type="button" 
              onClick={clearSearch} 
              className="clear-search-btn"
              title="Clear search filter"
            >
              <X size={13} />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Top Filter Pills & Sorting Controls */}
        <div className="catalog-controls-bar">
          <div className="category-pills-list">
            <button 
              className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory('all');
                setSareeSubFilter('all');
                setBlouseSubFilter('all');
              }}
            >
              All Creations ({products.length})
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'sarees' || activeCategory === 'tissue' ? 'active' : ''}`}
              onClick={() => setActiveCategory('sarees')}
            >
              Artisanal Sarees ({totalSareesCount})
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'blouses' || activeCategory === 'corset' ? 'active' : ''}`}
              onClick={() => setActiveCategory('blouses')}
            >
              Sculpted Blouses &amp; Corsets ({totalBlousesCount})
            </button>
            {totalSetsCount > 0 && (
              <button 
                className={`filter-pill ${activeCategory === 'sets' ? 'active' : ''}`}
                onClick={() => setActiveCategory('sets')}
              >
                Curated Duos (Save 10%)
              </button>
            )}
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              aria-label="Sort creations"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: ARTISANAL SAREES */}
        {/* ================================================================= */}
        {showSarees && (
          <div className="catalog-category-block" id="sarees-block">
            <div className="category-block-header">
              <div className="block-title-col">
                <div className="block-badge">
                  <span className="badge-dot terracotta"></span>
                  <span>FLUID DRAPES</span>
                </div>
                <h3 className="block-title">Artisanal Sarees</h3>
                <p className="block-subtitle">
                  Pure metallic tissue and fluid black crepe hand-finished with fall &amp; pico.
                </p>
              </div>

              {/* Saree Sub-filters: All / Tissue / Crepe */}
              <div className="sub-filter-pills">
                <button 
                  className={`sub-pill ${sareeSubFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSareeSubFilter('all')}
                >
                  All Sarees ({allSarees.length})
                </button>
                <button 
                  className={`sub-pill ${sareeSubFilter === 'tissue' ? 'active' : ''}`}
                  onClick={() => setSareeSubFilter('tissue')}
                >
                  The Tissue Series ({allSarees.filter(p => p.subCategory === 'tissue').length})
                </button>
                <button 
                  className={`sub-pill ${sareeSubFilter === 'crepe' ? 'active' : ''}`}
                  onClick={() => setSareeSubFilter('crepe')}
                >
                  Fluid Crepe ({allSarees.filter(p => p.subCategory === 'crepe').length})
                </button>
              </div>
            </div>

            <div className="products-grid">
              {sortedSarees.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* SECTION DIVIDER (when both Sarees & Blouses are displayed in All Creations) */}
        {activeCategory === 'all' && showSarees && showBlouses && !searchQuery && (
          <div className="category-section-divider">
            <div className="divider-line"></div>
            <div className="divider-emblem-badge">
              <Sparkles size={13} className="text-gold" />
              <span>STATEMENT PAIRINGS</span>
            </div>
            <div className="divider-line"></div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: SCULPTED BLOUSES & CORSETS */}
        {/* ================================================================= */}
        {showBlouses && (
          <div className="catalog-category-block" id="blouses-block">
            <div className="category-block-header">
              <div className="block-title-col">
                <div className="block-badge">
                  <span className="badge-dot gold"></span>
                  <span>HAUTE ATELIER</span>
                </div>
                <h3 className="block-title">Sculpted Blouses &amp; Corsets</h3>
                <p className="block-subtitle">
                  Structured boned corsets with dense hand zardozi and versatile tailored dupion silk blouses.
                </p>
              </div>

              {/* Blouse Sub-filters: All / Corsets / Silk Blouses */}
              <div className="sub-filter-pills">
                <button 
                  className={`sub-pill ${blouseSubFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBlouseSubFilter('all')}
                >
                  All Blouses ({allBlouses.length})
                </button>
                <button 
                  className={`sub-pill ${blouseSubFilter === 'corset' ? 'active' : ''}`}
                  onClick={() => setBlouseSubFilter('corset')}
                >
                  Statement Corsets ({allBlouses.filter(p => p.subCategory === 'corset').length})
                </button>
                <button 
                  className={`sub-pill ${blouseSubFilter === 'blouse' ? 'active' : ''}`}
                  onClick={() => setBlouseSubFilter('blouse')}
                >
                  Tailored Silks ({allBlouses.filter(p => p.subCategory === 'blouse').length})
                </button>
              </div>
            </div>

            <div className="products-grid">
              {sortedBlouses.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* SECTION DIVIDER (when Sets are also present) */}
        {activeCategory === 'all' && showSets && (showSarees || showBlouses) && !searchQuery && (
          <div className="category-section-divider">
            <div className="divider-line"></div>
            <div className="divider-emblem-badge">
              <Tag size={13} className="text-gold" />
              <span>PRE-STYLED ENSEMBLES</span>
            </div>
            <div className="divider-line"></div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: CURATED DUOS */}
        {/* ================================================================= */}
        {showSets && (
          <div className="catalog-category-block" id="sets-block">
            <div className="category-block-header">
              <div className="block-title-col">
                <div className="block-badge">
                  <span className="badge-dot gold"></span>
                  <span>COMPLETE ENSEMBLES • SAVE 10%</span>
                </div>
                <h3 className="block-title">Curated Duos</h3>
                <p className="block-subtitle">
                  Pre-matched saree and sculpted corset pairings ready for effortless festive occasions.
                </p>
              </div>
            </div>

            <div className="products-grid">
              {sortedSets.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Empty Catalog State */}
        {totalVisibleCount === 0 && (
          <div className="empty-catalog-state">
            <div className="empty-catalog-icon-box">
              <Search size={28} />
            </div>
            <p className="empty-catalog-msg">
              {searchQuery 
                ? `No creations matched "${searchQuery}".` 
                : 'No creations found in this category.'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => { 
                clearSearch(); 
                setActiveCategory('all'); 
                setSareeSubFilter('all'); 
                setBlouseSubFilter('all'); 
              }}
            >
              View All Creations
            </button>
          </div>
        )}
      </div>

      <style>{`
        .catalog-section {
          padding: 64px 0 80px 0;
          background: var(--bg-primary);
        }
        .catalog-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .catalog-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .catalog-title {
          font-size: clamp(26px, 3.2vw, 38px);
          color: var(--text-primary);
        }
        .add-prod-trigger {
          font-size: 12px;
          padding: 8px 16px;
        }
        .catalog-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .category-pills-list {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .filter-pill {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 8px 18px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }
        .filter-pill:hover {
          border-color: var(--accent-terracotta);
          color: var(--text-primary);
        }
        .filter-pill.active {
          background: var(--accent-terracotta);
          border-color: var(--accent-terracotta);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(163, 72, 53, 0.2);
        }
        .sort-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 6px 12px;
          border-radius: 20px;
        }
        .sort-icon {
          color: var(--text-muted);
        }
        .sort-select {
          border: none;
          background: transparent;
          font-size: 12px;
          font-family: inherit;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
        }

        /* Distinct Category Block Styling */
        .catalog-category-block {
          margin-bottom: 56px;
          scroll-margin-top: 100px;
        }
        .category-block-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          border-bottom: 1px dashed rgba(197, 160, 89, 0.3);
        }
        .block-title-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .block-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent-gold);
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-terracotta);
        }
        .badge-dot.gold {
          background: var(--accent-gold);
        }
        .badge-dot.terracotta {
          background: var(--accent-terracotta);
        }
        .block-title {
          font-family: var(--font-serif);
          font-size: 24px;
          font-weight: 400;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 0.02em;
        }
        .block-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 580px;
        }
        .sub-filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sub-pill {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sub-pill:hover {
          border-color: var(--accent-gold);
          color: var(--text-primary);
        }
        .sub-pill.active {
          background: #F4EFE6;
          border-color: var(--accent-gold);
          color: var(--text-primary);
          box-shadow: 0 1px 4px rgba(197, 160, 89, 0.15);
        }

        /* Category Section Divider */
        .category-section-divider {
          display: flex;
          align-items: center;
          margin: 48px 0 54px;
          gap: 16px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.4), transparent);
        }
        .divider-emblem-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #FFFFFF;
          border: 1px solid rgba(197, 160, 89, 0.3);
          border-radius: 20px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent-gold);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        /* Active Search Filter Banner */
        .catalog-search-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          border: 1px solid rgba(197, 160, 89, 0.4);
          border-left: 3px solid var(--accent-gold);
          border-radius: 6px;
          padding: 10px 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          animation: fadeIn 0.2s ease-out;
        }
        .search-banner-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text-primary);
        }
        .clear-search-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #F4EFE6;
          border: 1px solid #DDD1C0;
          color: var(--accent-terracotta);
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .clear-search-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 28px;
        }
        .empty-catalog-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .empty-catalog-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #EFE9DF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-terracotta);
        }
        .empty-catalog-msg {
          font-size: 15px;
          color: var(--text-primary);
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .catalog-header-row {
            margin-bottom: 18px;
          }
          .catalog-controls-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .category-pills-list {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .category-pills-list::-webkit-scrollbar {
            display: none;
          }
          .category-block-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .sub-filter-pills {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .sub-filter-pills::-webkit-scrollbar {
            display: none;
          }
          .sort-wrapper {
            align-self: flex-start;
            width: fit-content;
            box-sizing: border-box;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }
        @media (max-width: 460px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .catalog-title {
            font-size: 26px;
          }
          .block-title {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
