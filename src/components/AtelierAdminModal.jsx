import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, PlusCircle, Sparkles, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

export default function AtelierAdminModal() {
  const { isAtelierModalOpen, setIsAtelierModalOpen, addNewProduct, resetCatalogToDefault } = useShop();

  if (!isAtelierModalOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4500,
    originalPrice: 5200,
    tag: 'New Atelier Drop',
    tagColor: '#A34835',
    description: '',
    fabric: 'Crushed Metallic Shimmer Tissue',
    drapeStyle: 'Classic 6-Yard',
    drapeWeight: 'Featherlight & Fluid',
    zariWork: 'Banarasi Antique Gold Zari Border',
    isCustomColorAvailable: true,
    modelView: '/assets/muse_olive_tissue.jpg',
    flatlayView: '/assets/saak_green_tissue_drape.jpg',
    swatchZoom: '/assets/saak_green_tissue_swirl.jpg'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const musePresets = [
    { label: 'Black Crepe Muse', url: '/assets/saak_muse_black_saree_gold_corset.jpg' },
    { label: 'Olive Tissue Muse', url: '/assets/muse_olive_tissue.jpg' },
    { label: 'Sunset Orange Muse', url: '/assets/muse_sunset_tissue.jpg' },
    { label: 'Burnt Copper Muse', url: '/assets/muse_copper_tissue.jpg' }
  ];

  const flatlayPresets = [
    { label: 'Green Tissue Swatch', url: '/assets/saak_green_tissue_drape.jpg' },
    { label: 'Copper Folded', url: '/assets/saak_folded_copper_tissue.jpg' },
    { label: 'Brass Thali & Mogra', url: '/assets/saak_flatlay_copper_green.jpg' },
    { label: 'Gold Zardozi Swatch', url: '/assets/saak_earthy_heritage_1791662639874.jpg' }
  ];

  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [field]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    addNewProduct({
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice)
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsAtelierModalOpen(false);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAtelierModalOpen(false)}>
      <div className="modal-container admin-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close-btn"
          onClick={() => setIsAtelierModalOpen(false)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="admin-modal-header">
          <div className="admin-badge">
            <Sparkles size={13} className="text-gold" />
            <span>ATELIER PRODUCT INGESTION ENGINE</span>
          </div>
          <h2 className="admin-title">Add New Creation to Saak</h2>
          <p className="admin-subtitle">
            Publish a new saree, designer corset, or curated duo. You can upload photos directly from your computer or pick from the Aprajita muse gallery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group full-width">
              <label className="form-label">Creation Title *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Royal Champagne Shimmer Tissue Saree"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Category & SubCategory */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                <option value="sarees">Sarees</option>
                <option value="blouses">Blouses &amp; Corsets</option>
                <option value="sets">Curated Sets / Duos</option>
                <option value="lehengas">Lehengas (Future Expansion)</option>
                <option value="fusion">Fusion &amp; Indo-Western</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Category</label>
              <select 
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="form-select"
              >
                <option value="tissue">Crushed Shimmer Tissue</option>
                <option value="pre-draped">Pre-Draped (60s Slip-on)</option>
                <option value="crepe">Fluid Crepe / Georgette</option>
                <option value="corset">Sculpted Corset Bustier</option>
                <option value="curated-duo">Curated Complete Look</option>
              </select>
            </div>

            {/* Price & Original Price */}
            <div className="form-group">
              <label className="form-label">Price (INR ₹)</label>
              <input 
                type="number" 
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Original Price (for discount tag)</label>
              <input 
                type="number" 
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Fabric & Drape Weight */}
            <div className="form-group">
              <label className="form-label">Fabric Specification</label>
              <input 
                type="text" 
                placeholder="e.g. Pure Tissue Silk with Metallic Weft"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Drape Weight Tag</label>
              <select 
                value={formData.drapeWeight}
                onChange={(e) => setFormData({ ...formData, drapeWeight: e.target.value })}
                className="form-select"
              >
                <option value="Featherlight & Fluid">Featherlight &amp; Fluid</option>
                <option value="Ultra-Light Sheen">Ultra-Light Sheen</option>
                <option value="Architectural & Secure">Architectural &amp; Secure (Corset)</option>
                <option value="Crisp Festive Volume">Crisp Festive Volume</option>
              </select>
            </div>

            {/* Zari / Work */}
            <div className="form-group full-width">
              <label className="form-label">Zari / Embroidery Details</label>
              <input 
                type="text" 
                placeholder="e.g. Banarasi Antique Gold Floral Border / Hand Zardozi"
                value={formData.zariWork}
                onChange={(e) => setFormData({ ...formData, zariWork: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label className="form-label">Story &amp; Description</label>
              <textarea 
                rows="2"
                placeholder="Describe the occasion, luster, and styling suggestions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
              />
            </div>

            {/* Toggles */}
            <div className="form-group checkbox-group full-width">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={formData.isCustomColorAvailable}
                  onChange={(e) => setFormData({ ...formData, isCustomColorAvailable: e.target.checked })}
                />
                <span>Allow Colour Customisation on Request</span>
              </label>

              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={formData.drapeStyle.includes('Pre-draped')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    drapeStyle: e.target.checked ? 'Pre-draped in 60s' : 'Classic 6-Yard' 
                  })}
                />
                <span>Tag as Pre-Draped in 60s (Zero-Stress)</span>
              </label>
            </div>

            {/* Photo 1: Model Drape Photo */}
            <div className="form-group full-width photo-upload-block">
              <div className="photo-block-header">
                <label className="form-label">1. Model Drape Photo (Aprajita / Model wearing this saree)</label>
                <label className="upload-file-btn">
                  <Upload size={13} />
                  <span>Upload From Computer</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload('modelView', e)} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {formData.modelView && (
                <div className="image-preview-strip">
                  <img src={formData.modelView} alt="Model Preview" className="uploaded-thumb" />
                  <span className="thumb-status">✓ Selected Model Photo</span>
                </div>
              )}

              <div className="preset-chips-row">
                <span className="preset-label">Or Pick From Gallery:</span>
                {musePresets.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`preset-btn ${formData.modelView === preset.url ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, modelView: preset.url })}
                  >
                    <img src={preset.url} alt="" className="preset-mini" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo 2: Studio Flat-lay Photo */}
            <div className="form-group full-width photo-upload-block">
              <div className="photo-block-header">
                <label className="form-label">2. Studio Flat-lay Photo (Fabric with Brass/Mogra props)</label>
                <label className="upload-file-btn">
                  <Upload size={13} />
                  <span>Upload From Computer</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload('flatlayView', e)} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {formData.flatlayView && (
                <div className="image-preview-strip">
                  <img src={formData.flatlayView} alt="Flatlay Preview" className="uploaded-thumb" />
                  <span className="thumb-status">✓ Selected Flat-lay Photo</span>
                </div>
              )}

              <div className="preset-chips-row">
                <span className="preset-label">Or Pick From Gallery:</span>
                {flatlayPresets.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`preset-btn ${formData.flatlayView === preset.url ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, flatlayView: preset.url })}
                  >
                    <img src={preset.url} alt="" className="preset-mini" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <button 
              type="button" 
              onClick={resetCatalogToDefault}
              className="btn btn-outline reset-btn"
              title="Reset catalog to default launch products"
            >
              <RefreshCw size={14} />
              <span>Reset Catalog</span>
            </button>

            <button 
              type="submit" 
              className={`btn btn-primary publish-btn ${savedSuccess ? 'success' : ''}`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Published to Store!</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Publish Creation to Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-modal {
          background: #FFFFFF;
          border-radius: 4px;
          max-width: 820px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-gold);
        }
        .admin-modal-header {
          margin-bottom: 24px;
        }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .admin-title {
          font-size: 26px;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .admin-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-input, .form-select, .form-textarea {
          padding: 9px 12px;
          font-size: 13px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: var(--bg-primary);
          outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--accent-terracotta);
          background: #FFFFFF;
        }
        .checkbox-group {
          display: flex;
          flex-direction: row;
          gap: 20px;
          background: var(--bg-primary);
          padding: 12px;
          border-radius: 3px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .photo-upload-block {
          background: var(--bg-primary);
          padding: 14px;
          border-radius: 3px;
          border: 1px dashed var(--border-gold);
        }
        .photo-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .upload-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-terracotta);
          cursor: pointer;
          transition: var(--transition);
        }
        .upload-file-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        .image-preview-strip {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          background: #FFFFFF;
          padding: 6px 12px;
          border-radius: 3px;
          border: 1px solid var(--border-light);
        }
        .uploaded-thumb {
          width: 44px;
          height: 54px;
          object-fit: cover;
          border-radius: 2px;
        }
        .thumb-status {
          font-size: 12px;
          font-weight: 600;
          color: #2E7D32;
        }
        .preset-chips-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .preset-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .preset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border: 1px solid var(--border-light);
          background: #FFFFFF;
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          transition: var(--transition);
        }
        .preset-btn.active {
          border-color: var(--accent-terracotta);
          background: #FDF9F5;
          box-shadow: 0 1px 4px rgba(163, 72, 53, 0.15);
        }
        .preset-mini {
          width: 22px;
          height: 22px;
          border-radius: 2px;
          object-fit: cover;
        }
        .admin-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }
        .publish-btn {
          padding: 12px 24px;
          font-size: 13px;
        }
        .publish-btn.success {
          background: #2E7D32;
        }
        .reset-btn {
          font-size: 11px;
          padding: 8px 14px;
        }
        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .checkbox-group {
            flex-direction: column;
            gap: 10px;
          }
          .photo-block-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
