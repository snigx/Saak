import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

export default function InstagramFeed() {
  const instagramUrl = "https://www.instagram.com/saakbyaprajita?srtk=MzNuendsOGdtdndu";

  const feedItems = [
    {
      id: 1,
      image: '/assets/muse_sunset_tissue.jpg',
      caption: 'Sunset orange metallic tissue with our signature golden sheen. Styled with antique jewelry.',
      likes: '348',
      tag: '#SaakTissueSeries'
    },
    {
      id: 2,
      image: '/assets/saak_muse_black_saree_gold_corset.jpg',
      caption: 'The Gold Sculpted Corset paired with fluid black crepe. Architectural drape meets raw elegance.',
      likes: '512',
      tag: '#SculptedCorset'
    },
    {
      id: 3,
      image: '/assets/muse_olive_tissue.jpg',
      caption: 'Olive bloom sheen catching the late afternoon sun. Featherlight 6-yard festive statement.',
      likes: '294',
      tag: '#SaakMuses'
    },
    {
      id: 4,
      image: '/assets/saak_flatlay_copper_green.jpg',
      caption: 'Fresh mogra blossoms, brass thalis, and pure metallic zari. Studio mornings at Saak.',
      likes: '416',
      tag: '#SaakDiaries'
    },
    {
      id: 5,
      image: '/assets/muse_copper_tissue.jpg',
      caption: 'Burnt copper metallic glow. Available in bespoke custom shades on personal request.',
      likes: '382',
      tag: '#BespokePalette'
    }
  ];

  return (
    <section className="insta-feed-section">
      <div className="container">
        <div className="insta-header-row">
          <div>
            <div className="insta-badge">
              <InstagramIcon size={13} className="text-gold" />
              <span>COMMUNITY DIARY • @SAAKBYAPRAJITA</span>
            </div>
            <h2 className="insta-title">Stories from the Studio</h2>
            <p className="insta-subtitle">
              Follow our visual journal on Instagram for launch previews, styling notes, and real muses celebrating life in Saak.
            </p>
          </div>

          <a 
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline insta-follow-btn"
          >
            <InstagramIcon size={16} />
            <span>Follow @saakbyaprajita</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* 5-Column Grid */}
        <div className="insta-grid">
          {feedItems.map(item => (
            <a 
              key={item.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-tile"
              title="View on Instagram @saakbyaprajita"
            >
              <img src={item.image} alt={item.caption} className="insta-img" />
              <div className="insta-overlay">
                <div className="insta-overlay-icon">
                  <InstagramIcon size={22} color="#FFFFFF" />
                </div>
                <p className="insta-overlay-caption">{item.caption}</p>
                <div className="insta-overlay-footer">
                  <span className="insta-tag">{item.tag}</span>
                  <span className="insta-view-text">View Post ↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .insta-feed-section {
          padding: 80px 0;
          background: #FAF6EF;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }
        .insta-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 24px;
        }
        .insta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-terracotta);
          margin-bottom: 8px;
        }
        .insta-title {
          font-family: var(--font-serif);
          font-size: var(--text-3xl);
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .insta-subtitle {
          font-size: var(--text-base);
          color: var(--text-secondary);
          max-width: 580px;
          line-height: 1.5;
        }
        .insta-follow-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: var(--text-sm);
          font-weight: 600;
          white-space: nowrap;
          border-color: var(--accent-terracotta);
          color: var(--accent-terracotta);
          transition: var(--transition);
        }
        .insta-follow-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }

        .insta-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .insta-tile {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 3px;
          display: block;
          background: #EAE3D6;
          box-shadow: var(--shadow-sm);
        }
        .insta-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .insta-tile:hover .insta-img {
          transform: scale(1.08);
        }
        .insta-overlay {
          position: absolute;
          inset: 0;
          background: rgba(31, 26, 23, 0.75);
          backdrop-filter: blur(2px);
          opacity: 0;
          transition: opacity 0.3s ease;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #FFFFFF;
        }
        .insta-tile:hover .insta-overlay {
          opacity: 1;
        }
        .insta-overlay-icon {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.15);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .insta-overlay-caption {
          font-size: var(--text-xs);
          line-height: 1.45;
          color: #F5EFEB;
          margin-top: auto;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .insta-overlay-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--text-xs);
          color: var(--accent-gold);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 8px;
        }
        .insta-tag {
          font-weight: 600;
        }
        .insta-view-text {
          color: #FFFFFF;
          font-weight: 600;
        }

        @media (max-width: 992px) {
          .insta-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .insta-tile:nth-child(n+4) {
            display: none;
          }
          .insta-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        @media (max-width: 600px) {
          .insta-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .insta-feed-section {
            padding: 50px 0;
          }
        }
      `}</style>
    </section>
  );
}
