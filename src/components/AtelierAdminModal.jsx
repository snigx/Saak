import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, PlusCircle, Sparkles, Check, RefreshCw, Upload, 
  Trash2, Edit3, Image as ImageIcon, ArrowLeft, AlertCircle 
} from 'lucide-react';

export default function AtelierAdminModal() {
  const { 
    isAtelierModalOpen, 
    setIsAtelierModalOpen, 
    products, 
    addNewProduct, 
    updateProduct, 
    deleteProduct, 
    editingProduct, 
    setEditingProduct, 
    resetCatalogToDefault,
    formatPrice 
  } = useShop();

  if (!isAtelierModalOpen) return null;

  // Active Tab: 'inventory' or 'editor'
  const [activeTab, setActiveTab] = useState(editingProduct ? 'editor' : 'inventory');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4500,
    originalPrice: '',
    tag: 'New Drop',
    tagColor: '#A34835',
    description: '',
    fabric: 'Crushed Metallic Shimmer Tissue',
    drapeStyle: 'Classic 6-Yard',
    drapeWeight: 'Featherlight & Fluid',
    zariWork: 'Banarasi Antique Gold Zari Border',
    isCustomColorAvailable: true,
    gallery: []
  });

  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // When editingProduct changes or modal opens
  useEffect(() => {
    if (editingProduct) {
      setActiveTab('editor');
      const gallery = (editingProduct.images?.gallery && editingProduct.images.gallery.length > 0)
        ? editingProduct.images.gallery
        : [editingProduct.images?.modelView, editingProduct.images?.flatlayView, editingProduct.images?.swatchZoom].filter(Boolean);

      setFormData({
        id: editingProduct.id,
        name: editingProduct.name,
        category: editingProduct.category,
        subCategory: editingProduct.subCategory,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice || '',
        tag: editingProduct.tag || '',
        tagColor: editingProduct.tagColor || '#A34835',
        description: editingProduct.description || '',
        fabric: editingProduct.fabric || '',
        drapeStyle: editingProduct.drapeStyle || 'Classic 6-Yard',
        drapeWeight: editingProduct.drapeWeight || 'Featherlight & Fluid',
        zariWork: editingProduct.zariWork || '',
        isCustomColorAvailable: Boolean(editingProduct.isCustomColorAvailable),
        gallery: gallery
      });
    } else {
      setFormData({
        id: '',
        name: '',
        category: 'sarees',
        subCategory: 'tissue',
        price: 4500,
        originalPrice: '',
        tag: 'New Drop',
        tagColor: '#A34835',
        description: '',
        fabric: 'Crushed Metallic Shimmer Tissue',
        drapeStyle: 'Classic 6-Yard',
        drapeWeight: 'Featherlight & Fluid',
        zariWork: 'Banarasi Antique Gold Zari Border',
        isCustomColorAvailable: true,
        gallery: [
          '/assets/muse_sunset_tissue.jpg',
          '/assets/saak_folded_copper_tissue.jpg'
        ]
      });
    }
  }, [editingProduct]);

  const musePresets = [
    { label: 'Sunset Orange Muse', url: '/assets/muse_sunset_tissue.jpg' },
    { label: 'Olive Tissue Muse', url: '/assets/muse_olive_tissue.jpg' },
    { label: 'Burnt Copper Muse', url: '/assets/muse_copper_tissue.jpg' },
    { label: 'Black Saree Muse', url: '/assets/saak_muse_black_saree_gold_corset.jpg' },
    { label: 'Copper Folded', url: '/assets/saak_folded_copper_tissue.jpg' },
    { label: 'Green Tissue Swatch', url: '/assets/saak_green_tissue_drape.jpg' },
    { label: 'Brass Thali & Mogra', url: '/assets/saak_flatlay_copper_green.jpg' }
  ];

  // Photo Upload Handler (FileReader)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImg = event.target.result;
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, newImg]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUrlPhoto = () => {
    if (customPhotoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, customPhotoUrl.trim()]
      }));
      setCustomPhotoUrl('');
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddPresetPhoto = (url) => {
    if (!formData.gallery.includes(url)) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, url]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      images: {
        modelView: formData.gallery[0] || '/assets/muse_sunset_tissue.jpg',
        flatlayView: formData.gallery[1] || formData.gallery[0] || '/assets/saak_folded_copper_tissue.jpg',
        swatchZoom: formData.gallery[2] || formData.gallery[0] || '/assets/saak_flatlay_copper_green.jpg',
        gallery: formData.gallery.length > 0 ? formData.gallery : ['/assets/muse_sunset_tissue.jpg']
      }
    };

    if (editingProduct) {
      updateProduct(payload);
    } else {
      addNewProduct(payload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingProduct(null);
      setActiveTab('inventory');
    }, 1200);
  };

  const handleDeleteItem = (id) => {
    deleteProduct(id);
    setConfirmDeleteId(null);
    if (editingProduct?.id === id) {
      setEditingProduct(null);
      setActiveTab('inventory');
    }
  };

  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    setActiveTab('editor');
  };

  const startCreateNew = () => {
    setEditingProduct(null);
    setActiveTab('editor');
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
            <span>SAAK ATELIER • PRODUCT MANAGEMENT ENGINE</span>
          </div>
          <h2 className="admin-title">
            {activeTab === 'inventory' 
              ? 'Catalog Inventory & Products' 
              : (editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Creation')}
          </h2>
          <p className="admin-subtitle">
            Manage your live store products, edit prices &amp; descriptions, upload or delete photos, and re-arrange looks in real time.
          </p>

          {/* Navigation Tabs */}
          <div className="admin-tab-bar">
            <button 
              className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inventory');
                setEditingProduct(null);
              }}
            >
              All Products ({products.length})
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'editor' && !editingProduct ? 'active' : ''}`}
              onClick={startCreateNew}
            >
              <PlusCircle size={14} />
              <span>Add New Creation</span>
            </button>
            {editingProduct && (
              <button className="admin-tab-btn active">
                <Edit3 size={14} />
                <span>Editing: {editingProduct.name.substring(0, 18)}...</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT LIST */}
        {activeTab === 'inventory' && (
          <div className="inventory-view">
            <div className="inventory-list">
              {products.map(prod => (
                <div key={prod.id} className="inventory-item-row">
                  <img 
                    src={prod.images?.modelView || prod.images?.flatlayView} 
                    alt={prod.name}
                    className="inv-thumb" 
                  />
                  <div className="inv-info">
                    <h4 className="inv-title">{prod.name}</h4>
                    <div className="inv-meta">
                      <span className="inv-price">{formatPrice(prod.price)}</span>
                      {prod.originalPrice && (
                        <span className="inv-strike">{formatPrice(prod.originalPrice)}</span>
                      )}
                      <span className="inv-cat-pill">{prod.category}</span>
                      <span className="inv-photo-count">
                        📷 {prod.images?.gallery?.length || 2} photos
                      </span>
                    </div>
                  </div>

                  <div className="inv-actions">
                    <button 
                      onClick={() => startEditProduct(prod)}
                      className="btn btn-outline inv-edit-btn"
                      title="Edit price, title, and photos"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId === prod.id ? (
                      <div className="confirm-delete-box">
                        <span className="confirm-text">Confirm?</span>
                        <button 
                          onClick={() => handleDeleteItem(prod.id)}
                          className="btn btn-primary confirm-yes"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn btn-outline confirm-no"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmDeleteId(prod.id)}
                        className="inv-delete-btn"
                        title="Remove product from store"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="inventory-footer">
              <button 
                type="button" 
                onClick={resetCatalogToDefault}
                className="btn btn-outline reset-btn"
                title="Reset catalog to default launch products"
              >
                <RefreshCw size={13} />
                <span>Restore Default Catalog</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT EDITOR (EDIT / CREATE) */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="editor-back-row">
              <button 
                type="button" 
                onClick={() => {
                  setActiveTab('inventory');
                  setEditingProduct(null);
                }}
                className="back-to-inv-btn"
              >
                <ArrowLeft size={14} />
                <span>Back to All Products</span>
              </button>
            </div>

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
                  <option value="crepe">Pure Fluid Crepe</option>
                  <option value="corset">Sculpted Corset Bustier</option>
                  <option value="curated-duo">Curated Complete Look</option>
                </select>
              </div>

              {/* Price & Original Price */}
              <div className="form-group">
                <label className="form-label">Offering Price (INR ₹) *</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">MRP / Strikethrough Price (Optional)</label>
                <input 
                  type="number" 
                  placeholder="Leave empty if you don't want discount tags"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="form-input"
                />
                <span className="form-hint">Leave blank for fixed luxury pricing with no discount.</span>
              </div>

              {/* Badge Tag */}
              <div className="form-group">
                <label className="form-label">Badge Tag (e.g. Hero Piece, Festive Classic)</label>
                <input 
                  type="text" 
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Fabric Specification */}
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

              {/* Drape Weight */}
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
              <div className="form-group">
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
                <label className="form-label">Product Description</label>
                <textarea 
                  rows="2"
                  placeholder="Describe the styling and occasion..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* PHOTO MANAGER: ADD / REMOVE PHOTOS */}
              <div className="form-group full-width photo-manager-block">
                <div className="manager-title-row">
                  <div>
                    <h4 className="manager-title">Photo Gallery Carousel ({formData.gallery.length} Photos)</h4>
                    <span className="manager-sub">These photos will display in the product card's side arrow carousel.</span>
                  </div>

                  {/* Upload from Computer Button */}
                  <label className="upload-file-btn">
                    <Upload size={14} />
                    <span>Upload From Computer</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Current Photos Strip with Remove Buttons */}
                <div className="gallery-thumbnails-grid">
                  {formData.gallery.map((photoUrl, idx) => (
                    <div key={idx} className="gallery-thumb-card">
                      <img src={photoUrl} alt="" className="thumb-preview-img" />
                      <div className="thumb-order-badge">#{idx + 1}</div>
                      <button 
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="thumb-delete-btn"
                        title="Remove this photo from carousel"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {formData.gallery.length === 0 && (
                    <div className="no-photos-alert">
                      <AlertCircle size={18} />
                      <span>No photos added yet. Upload a photo or pick from presets below.</span>
                    </div>
                  )}
                </div>

                {/* Add Photo by URL */}
                <div className="add-url-row">
                  <input 
                    type="text" 
                    placeholder="Or paste an image web link (https://... or /assets/...)"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddUrlPhoto}
                    className="btn btn-outline add-url-btn"
                  >
                    Add Photo
                  </button>
                </div>

                {/* Pick from Muse Presets */}
                <div className="preset-strip">
                  <span className="preset-label">Quick Add From Atelier Gallery:</span>
                  <div className="preset-chips">
                    {musePresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="preset-chip-btn"
                        onClick={() => handleAddPresetPhoto(preset.url)}
                      >
                        <img src={preset.url} alt="" className="mini-preset-img" />
                        <span>+ {preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-actions">
              <button 
                type="button" 
                onClick={() => {
                  setActiveTab('inventory');
                  setEditingProduct(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className={`btn btn-primary publish-btn ${savedSuccess ? 'success' : ''}`}
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{editingProduct ? 'Save Changes' : 'Publish Creation to Store'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .admin-modal {
          background: #FFFFFF;
          border-radius: 4px;
          max-width: 860px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-gold);
        }
        .admin-modal-header {
          margin-bottom: 20px;
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
          margin-bottom: 16px;
        }
        .admin-tab-bar {
          display: flex;
          gap: 10px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 10px;
        }
        .admin-tab-btn {
          background: none;
          border: 1px solid var(--border-light);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition);
        }
        .admin-tab-btn:hover {
          border-color: var(--accent-terracotta);
          color: var(--text-primary);
        }
        .admin-tab-btn.active {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }

        /* Inventory Tab Styling */
        .inventory-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 6px;
        }
        .inventory-item-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: 3px;
          transition: var(--transition);
        }
        .inventory-item-row:hover {
          border-color: var(--accent-gold);
          background: #FDF9F5;
        }
        .inv-thumb {
          width: 54px;
          height: 68px;
          object-fit: cover;
          border-radius: 2px;
          background: #EAE3D6;
          flex-shrink: 0;
        }
        .inv-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .inv-title {
          font-family: var(--font-serif);
          font-size: 15px;
          color: var(--text-primary);
        }
        .inv-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .inv-price {
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .inv-strike {
          color: var(--text-muted);
          text-decoration: line-through;
          font-size: 11px;
        }
        .inv-cat-pill {
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 6px;
          border-radius: 2px;
          font-size: 10px;
          text-transform: uppercase;
        }
        .inv-photo-count {
          color: var(--text-muted);
          font-size: 11px;
        }
        .inv-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .inv-edit-btn {
          font-size: 11px;
          padding: 6px 12px;
        }
        .inv-delete-btn {
          background: none;
          border: 1px solid var(--border-light);
          color: var(--text-muted);
          padding: 6px;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .inv-delete-btn:hover {
          border-color: #D32F2F;
          color: #D32F2F;
          background: rgba(211, 47, 47, 0.05);
        }
        .confirm-delete-box {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .confirm-text {
          font-size: 11px;
          color: #D32F2F;
          font-weight: 600;
        }
        .confirm-yes {
          padding: 4px 8px;
          font-size: 10px;
          background: #D32F2F;
        }
        .confirm-no {
          padding: 4px 8px;
          font-size: 10px;
        }
        .inventory-footer {
          padding-top: 14px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
        }

        /* Editor Tab Styling */
        .editor-back-row {
          margin-bottom: 12px;
        }
        .back-to-inv-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
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
        .form-hint {
          font-size: 10px;
          color: var(--text-muted);
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

        /* Photo Manager Block */
        .photo-manager-block {
          background: var(--bg-primary);
          padding: 18px;
          border-radius: 4px;
          border: 1px solid var(--border-gold);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .manager-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .manager-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .manager-sub {
          font-size: 11px;
          color: var(--text-muted);
        }
        .upload-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-terracotta);
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
        }
        .upload-file-btn:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
        }
        .gallery-thumbnails-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .gallery-thumb-card {
          position: relative;
          width: 80px;
          height: 104px;
          border-radius: 3px;
          overflow: hidden;
          background: #EAE3D6;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .thumb-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumb-order-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 2px;
        }
        .thumb-delete-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(211, 47, 47, 0.9);
          color: #FFFFFF;
          border: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .thumb-delete-btn:hover {
          background: #D32F2F;
          transform: scale(1.15);
        }
        .no-photos-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(163, 72, 53, 0.06);
          color: var(--accent-terracotta);
          font-size: 12px;
          border-radius: 3px;
          width: 100%;
        }
        .add-url-row {
          display: flex;
          gap: 8px;
        }
        .url-input {
          flex-grow: 1;
          padding: 8px 12px;
          font-size: 12px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: #FFFFFF;
          outline: none;
        }
        .add-url-btn {
          font-size: 11px;
          padding: 8px 14px;
        }
        .preset-strip {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .preset-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .preset-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .preset-chip-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border: 1px solid var(--border-light);
          background: #FFFFFF;
          border-radius: 3px;
          font-size: 10px;
          cursor: pointer;
          transition: var(--transition);
        }
        .preset-chip-btn:hover {
          border-color: var(--accent-terracotta);
          color: var(--accent-terracotta);
        }
        .mini-preset-img {
          width: 18px;
          height: 18px;
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
        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
