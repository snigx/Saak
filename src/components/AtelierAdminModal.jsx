import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, PlusCircle, Sparkles, Check, RefreshCw, Upload, 
  Trash2, Edit3, Image as ImageIcon, ArrowLeft, AlertCircle,
  Camera, Layers 
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
    modelPhotos: [],
    flatlayPhotos: []
  });

  const [customModelUrl, setCustomModelUrl] = useState('');
  const [customFlatlayUrl, setCustomFlatlayUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // When editingProduct changes or modal opens
  useEffect(() => {
    if (editingProduct) {
      setActiveTab('editor');
      const modelPhotos = editingProduct.images?.modelPhotos 
        || [editingProduct.images?.modelView].filter(Boolean);
      const flatlayPhotos = editingProduct.images?.flatlayPhotos 
        || [editingProduct.images?.flatlayView, editingProduct.images?.swatchZoom].filter(Boolean);

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
        modelPhotos: modelPhotos.length > 0 ? modelPhotos : ['/assets/muse_sunset_tissue.jpg'],
        flatlayPhotos: flatlayPhotos.length > 0 ? flatlayPhotos : ['/assets/saak_folded_copper_tissue.jpg']
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
        modelPhotos: [
          '/assets/muse_sunset_tissue.jpg',
          '/assets/muse_sunset_tissue_2.jpg'
        ],
        flatlayPhotos: [
          '/assets/saak_folded_copper_tissue.jpg',
          '/assets/saak_flatlay_copper_green.jpg'
        ]
      });
    }
  }, [editingProduct]);

  // Model Presets
  const musePresets = [
    { label: 'Sunset Orange Muse (Front)', url: '/assets/muse_sunset_tissue.jpg' },
    { label: 'Sunset Orange Muse (Portrait #2)', url: '/assets/muse_sunset_tissue_2.jpg' },
    { label: 'Olive Tissue Muse', url: '/assets/muse_olive_tissue.jpg' },
    { label: 'Burnt Copper Muse', url: '/assets/muse_copper_tissue.jpg' },
    { label: 'Black Saree Muse (Front)', url: '/assets/saak_muse_black_saree_gold_corset.jpg' },
    { label: 'Black Saree Muse (Side Profile)', url: '/assets/saak_muse_black_corset_side.jpg' }
  ];

  // Flat-lay Presets
  const flatlayPresets = [
    { label: 'Folded Copper Tissue', url: '/assets/saak_folded_copper_tissue.jpg' },
    { label: 'Green Tissue Drape', url: '/assets/saak_green_tissue_drape.jpg' },
    { label: 'Green Texture Swirl (Macro)', url: '/assets/saak_green_tissue_swirl.jpg' },
    { label: 'Brass Thali & Fresh Mogra', url: '/assets/saak_flatlay_copper_green.jpg' }
  ];

  // Handlers for Model Photos
  const handleModelPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImg = event.target.result;
        setFormData(prev => ({
          ...prev,
          modelPhotos: [...prev.modelPhotos, newImg]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddModelUrl = () => {
    if (customModelUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        modelPhotos: [...prev.modelPhotos, customModelUrl.trim()]
      }));
      setCustomModelUrl('');
    }
  };

  const handleRemoveModelPhoto = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      modelPhotos: prev.modelPhotos.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleAddModelPreset = (url) => {
    if (!formData.modelPhotos.includes(url)) {
      setFormData(prev => ({
        ...prev,
        modelPhotos: [...prev.modelPhotos, url]
      }));
    }
  };

  // Handlers for Flat-lay Photos
  const handleFlatlayPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImg = event.target.result;
        setFormData(prev => ({
          ...prev,
          flatlayPhotos: [...prev.flatlayPhotos, newImg]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFlatlayUrl = () => {
    if (customFlatlayUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        flatlayPhotos: [...prev.flatlayPhotos, customFlatlayUrl.trim()]
      }));
      setCustomFlatlayUrl('');
    }
  };

  const handleRemoveFlatlayPhoto = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      flatlayPhotos: prev.flatlayPhotos.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleAddFlatlayPreset = (url) => {
    if (!formData.flatlayPhotos.includes(url)) {
      setFormData(prev => ({
        ...prev,
        flatlayPhotos: [...prev.flatlayPhotos, url]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const combinedGallery = [
      ...formData.modelPhotos,
      ...formData.flatlayPhotos
    ];

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      modelPhotos: formData.modelPhotos,
      flatlayPhotos: formData.flatlayPhotos,
      gallery: combinedGallery.length > 0 ? combinedGallery : ['/assets/muse_sunset_tissue.jpg'],
      images: {
        modelPhotos: formData.modelPhotos.length > 0 ? formData.modelPhotos : ['/assets/muse_sunset_tissue.jpg'],
        flatlayPhotos: formData.flatlayPhotos.length > 0 ? formData.flatlayPhotos : ['/assets/saak_folded_copper_tissue.jpg'],
        modelView: formData.modelPhotos[0] || formData.flatlayPhotos[0] || '/assets/muse_sunset_tissue.jpg',
        flatlayView: formData.flatlayPhotos[0] || formData.modelPhotos[0] || '/assets/saak_folded_copper_tissue.jpg',
        swatchZoom: formData.flatlayPhotos[1] || formData.flatlayPhotos[0] || '/assets/saak_flatlay_copper_green.jpg',
        gallery: combinedGallery.length > 0 ? combinedGallery : ['/assets/muse_sunset_tissue.jpg']
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
            Manage your live store products, edit prices &amp; descriptions, upload multiple model and flat-lay photos, and re-arrange looks in real time.
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
                        📷 {prod.images?.modelPhotos?.length || 1} model • {prod.images?.flatlayPhotos?.length || 1} flat-lay
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
                  <option value="Ultra-Lightweight & Fluid">Ultra-Lightweight &amp; Fluid</option>
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

              {/* ========================================================================= */}
              {/* SECTION 1: MODEL / ON MUSE PHOTOS (MULTIPLE) */}
              {/* ========================================================================= */}
              <div className="form-group full-width photo-manager-block model-photos-block">
                <div className="manager-title-row">
                  <div>
                    <div className="photo-section-badge badge-muse">
                      <Camera size={13} />
                      <span>MODEL / ON MUSE LOOKS ({formData.modelPhotos.length})</span>
                    </div>
                    <h4 className="manager-title">Photos of Model Wearing the Outfit</h4>
                    <span className="manager-sub">Add multiple model angles (full drape, side angle, close-up with jewelry, back pleats).</span>
                  </div>

                  {/* Upload from Computer Button */}
                  <label className="upload-file-btn">
                    <Upload size={14} />
                    <span>Upload Model Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleModelPhotoUpload} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Model Photos Grid with Trash Buttons */}
                <div className="gallery-thumbnails-grid">
                  {formData.modelPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="gallery-thumb-card card-model">
                      <img src={photoUrl} alt="" className="thumb-preview-img" />
                      <div className="thumb-order-badge">Muse #{idx + 1}</div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveModelPhoto(idx)}
                        className="thumb-delete-btn"
                        title="Remove this model photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {formData.modelPhotos.length === 0 && (
                    <div className="no-photos-alert">
                      <AlertCircle size={18} />
                      <span>No model photos added yet. Upload a photo or select from presets below.</span>
                    </div>
                  )}
                </div>

                {/* Add Model Photo by URL */}
                <div className="add-url-row">
                  <input 
                    type="text" 
                    placeholder="Or paste model image link (https://... or /assets/...)"
                    value={customModelUrl}
                    onChange={(e) => setCustomModelUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddModelUrl}
                    className="btn btn-outline add-url-btn"
                  >
                    Add Model Photo
                  </button>
                </div>

                {/* Pick from Muse Presets */}
                <div className="preset-strip">
                  <span className="preset-label">Quick Add From Muse Gallery:</span>
                  <div className="preset-chips">
                    {musePresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="preset-chip-btn"
                        onClick={() => handleAddModelPreset(preset.url)}
                      >
                        <img src={preset.url} alt="" className="mini-preset-img" />
                        <span>+ {preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 2: STUDIO FLAT-LAYS & SWATCHES (MULTIPLE) */}
              {/* ========================================================================= */}
              <div className="form-group full-width photo-manager-block flatlay-photos-block">
                <div className="manager-title-row">
                  <div>
                    <div className="photo-section-badge badge-flatlay">
                      <Layers size={13} />
                      <span>STUDIO FLAT-LAYS &amp; SWATCHES ({formData.flatlayPhotos.length})</span>
                    </div>
                    <h4 className="manager-title">Folded Sarees, Swatches &amp; Craft Details</h4>
                    <span className="manager-sub">Add multiple flat-lay angles (folded look, embroidery close-ups, brass thali &amp; flowers).</span>
                  </div>

                  {/* Upload Flatlay Button */}
                  <label className="upload-file-btn upload-flatlay-btn">
                    <Upload size={14} />
                    <span>Upload Flat-lay Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFlatlayPhotoUpload} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Flatlay Photos Grid with Trash Buttons */}
                <div className="gallery-thumbnails-grid">
                  {formData.flatlayPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="gallery-thumb-card card-flatlay">
                      <img src={photoUrl} alt="" className="thumb-preview-img" />
                      <div className="thumb-order-badge">Flat-lay #{idx + 1}</div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveFlatlayPhoto(idx)}
                        className="thumb-delete-btn"
                        title="Remove this flat-lay photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {formData.flatlayPhotos.length === 0 && (
                    <div className="no-photos-alert">
                      <AlertCircle size={18} />
                      <span>No flat-lay photos added yet. Upload a photo or select from presets below.</span>
                    </div>
                  )}
                </div>

                {/* Add Flat-lay Photo by URL */}
                <div className="add-url-row">
                  <input 
                    type="text" 
                    placeholder="Or paste flat-lay image link (https://... or /assets/...)"
                    value={customFlatlayUrl}
                    onChange={(e) => setCustomFlatlayUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddFlatlayUrl}
                    className="btn btn-outline add-url-btn"
                  >
                    Add Flat-lay Photo
                  </button>
                </div>

                {/* Pick from Flat-lay Presets */}
                <div className="preset-strip">
                  <span className="preset-label">Quick Add From Flat-lay Gallery:</span>
                  <div className="preset-chips">
                    {flatlayPresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className="preset-chip-btn"
                        onClick={() => handleAddFlatlayPreset(preset.url)}
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
          max-width: 880px;
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
          flex-wrap: wrap;
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
          width: 32px;
          height: 32px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .inv-delete-btn:hover {
          background: rgba(211, 47, 47, 0.1);
          color: #D32F2F;
          border-color: #D32F2F;
        }
        .confirm-delete-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFF1F0;
          border: 1px solid #FFA39E;
          padding: 4px 8px;
          border-radius: 3px;
        }
        .confirm-text {
          font-size: 11px;
          font-weight: 700;
          color: #CF1322;
        }
        .confirm-yes {
          padding: 4px 8px;
          font-size: 11px;
          background: #CF1322;
          color: #FFFFFF;
          border: none;
        }
        .confirm-no {
          padding: 4px 8px;
          font-size: 11px;
        }
        .inventory-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-light);
          padding-top: 14px;
        }
        .reset-btn {
          font-size: 11px;
          gap: 6px;
        }

        /* Editor Form Styling */
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .editor-back-row {
          margin-bottom: -10px;
        }
        .back-to-inv-btn {
          background: none;
          border: none;
          color: var(--accent-terracotta);
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .form-input, .form-select, .form-textarea {
          padding: 10px 14px;
          font-size: 13px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: var(--bg-primary);
          outline: none;
          transition: var(--transition);
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--accent-terracotta);
          background: #FFFFFF;
        }

        /* Photo Manager Dual Blocks */
        .photo-manager-block {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .photo-manager-block.model-photos-block {
          border-left: 3px solid var(--accent-terracotta);
        }
        .photo-manager-block.flatlay-photos-block {
          border-left: 3px solid var(--accent-gold);
        }
        .photo-section-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 2px 8px;
          border-radius: 2px;
          margin-bottom: 4px;
          width: fit-content;
        }
        .photo-section-badge.badge-muse {
          background: rgba(163, 72, 53, 0.12);
          color: var(--accent-terracotta);
        }
        .photo-section-badge.badge-flatlay {
          background: rgba(197, 160, 89, 0.18);
          color: #7D6124;
        }
        .manager-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .manager-title {
          font-size: 15px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .manager-sub {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .upload-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--text-primary);
          color: #FFFFFF;
          padding: 8px 14px;
          border-radius: 2px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }
        .upload-file-btn:hover {
          background: var(--accent-terracotta);
        }
        .upload-flatlay-btn {
          background: #3B332E;
        }
        .upload-flatlay-btn:hover {
          background: #7D6124;
        }
        .gallery-thumbnails-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .gallery-thumb-card {
          position: relative;
          width: 84px;
          height: 110px;
          border-radius: 3px;
          overflow: hidden;
          background: #EAE3D6;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .gallery-thumb-card.card-model {
          border-top: 2px solid var(--accent-terracotta);
        }
        .gallery-thumb-card.card-flatlay {
          border-top: 2px solid var(--accent-gold);
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
          background: rgba(0, 0, 0, 0.72);
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
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
          padding: 14px;
          background: rgba(0, 0, 0, 0.04);
          color: var(--text-muted);
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
          padding: 4px 9px;
          border: 1px solid var(--border-light);
          background: #FFFFFF;
          border-radius: 3px;
          font-size: 11px;
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
          object-fit: cover;
          border-radius: 2px;
        }

        .admin-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
        }
        .publish-btn {
          min-width: 190px;
        }
        .publish-btn.success {
          background: #2E7D32;
        }
        @media (max-width: 650px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .manager-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
