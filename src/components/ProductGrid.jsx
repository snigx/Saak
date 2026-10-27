import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, PlusCircle } from 'lucide-react';

export default function ProductGrid() {
  const { products, activeCategory, setActiveCategory, setIsAtelierModalOpen } = useShop();
  const [sortBy, setSortBy] = useState('featured');

  // Filter products
  const filteredProducts = products.filter(product => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'tissue') return product.subCategory === 'tissue';
    if (activeCategory === 'corset') return product.category === 'blouses';
    if (activeCategory === 'sets') return product.category === 'sets';
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

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
            <h2 className="catalog-title">Artisanal Sarees &amp; Sculpted Blouses</h2>
          </div>

          <div className="catalog-header-actions">
            <button 
              onClick={() => setIsAtelierModalOpen(true)}
              className="btn btn-outline-gold add-prod-trigger"
            >
              <PlusCircle size={15} />
              <span>Add New Creation</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Sorting Controls */}
        <div className="catalog-controls-bar">
          <div className="category-pills-list">
            <button 
              className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Creations ({products.length})
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'tissue' ? 'active' : ''}`}
              onClick={() => setActiveCategory('tissue')}
            >
              The Tissue Series
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'corset' ? 'active' : ''}`}
              onClick={() => setActiveCategory('corset')}
            >
              Corsets &amp; Blouses
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'sets' ? 'active' : ''}`}
              onClick={() => setActiveCategory('sets')}
            >
              Curated Duos (Save 10%)
            </button>
          </div>

          <div className="sort-wrapper">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="empty-catalog-state">
            <p>No creations found in this category.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveCategory('all')}
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
          margin-bottom: 32px;
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
          padding: 7px 16px;
          font-size: 12px;
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
        @media (max-width: 768px) {
          .catalog-header-row {
            margin-bottom: 18px;
          }
          .catalog-controls-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .category-pills-list {
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .category-pills-list::-webkit-scrollbar {
            display: none;
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
        }
      `}</style>
    </section>
  );
}
