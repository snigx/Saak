import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useOverlay } from '../hooks/useOverlay';

// Sub-categories must match the filters used by the storefront grid
const SUBCATEGORY_OPTIONS = {
  sarees: [
    { value: 'tissue', label: 'Tissue' },
    { value: 'crepe', label: 'Crepe' }
  ],
  blouses: [
    { value: 'corset', label: 'Corset' },
    { value: 'blouse', label: 'Blouse' }
  ],
  sets: [
    { value: 'curated-duo', label: 'Duo set' }
  ]
};
import { 
  X, PlusCircle, Sparkles, Check, RefreshCw, Upload, 
  Trash2, Edit3, Image as ArrowLeft, AlertCircle,
  Camera, Layers, Loader2, Receipt, Tag
} from 'lucide-react';
import { uploadImageBlob } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import AdminOrdersView from './AdminOrdersView';
import AdminOffersView from './AdminOffersView';
import { getOfferStatus, describeOfferValue } from '../utils/offers';

export default function AtelierAdminModal() {
  const { 
    isAtelierModalOpen, 
    setIsAtelierModalOpen, 
    products, 
    orders = [],
    adminActiveTab,
    setAdminActiveTab,
    addNewProduct, 
    updateProduct, 
    deleteProduct, 
    editingProduct, 
    setEditingProduct, 
    resetCatalogToDefault,
    catalog,
    pairOffer,
    formatPrice 
  } = useShop();

  // Active Tab: 'inventory', 'orders', or 'editor'
  const [activeTab, setActiveTab] = useState(adminActiveTab || (editingProduct ? 'editor' : 'inventory'));

  // Re-sync the visible tab every time the console is opened from an entry point
  useEffect(() => {
    if (isAtelierModalOpen && adminActiveTab) {
      setActiveTab(adminActiveTab);
    }
  }, [adminActiveTab, isAtelierModalOpen]);

  const pendingOrdersCount = orders.filter(o => o.payment_status === 'pending_verification').length;
  const liveOffersCount = products.filter(p => getOfferStatus(p.discount) === 'live').length
    + (getOfferStatus(pairOffer) === 'live' ? 1 : 0);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4500,
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
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const [isUploadingFlatlay, setIsUploadingFlatlay] = useState(false);

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
    { label: 'Sunset orange (front)', url: '/assets/muse_sunset_tissue.jpg' },
    { label: 'Sunset orange (portrait)', url: '/assets/muse_sunset_tissue_2.jpg' },
    { label: 'Olive tissue', url: '/assets/muse_olive_tissue.jpg' },
    { label: 'Burnt copper', url: '/assets/muse_copper_tissue.jpg' },
    { label: 'Black saree (front)', url: '/assets/saak_muse_black_saree_gold_corset.jpg' },
    { label: 'Black saree (side)', url: '/assets/saak_muse_black_corset_side.jpg' }
  ];

  // Flat-lay Presets
  const flatlayPresets = [
    { label: 'Folded Copper Tissue', url: '/assets/saak_folded_copper_tissue.jpg' },
    { label: 'Green Tissue Drape', url: '/assets/saak_green_tissue_drape.jpg' },
    { label: 'Green Texture Swirl (Macro)', url: '/assets/saak_green_tissue_swirl.jpg' },
    { label: 'Brass Thali & Fresh Mogra', url: '/assets/saak_flatlay_copper_green.jpg' }
  ];

  // Handlers for Model Photos (Cloud Storage / Blob or Local Fallback)
  const handleModelPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingModel(true);
      try {
        const uploadedUrl = await uploadImageBlob(file, 'muse_looks');
        setFormData(prev => ({
          ...prev,
          modelPhotos: [...prev.modelPhotos, uploadedUrl]
        }));
      } catch (err) {
        console.error('Model photo upload error:', err);
      } finally {
        setIsUploadingModel(false);
        e.target.value = '';
      }
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

  // Handlers for Flat-lay Photos (Cloud Storage / Blob or Local Fallback)
  const handleFlatlayPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFlatlay(true);
      try {
        const uploadedUrl = await uploadImageBlob(file, 'flatlays');
        setFormData(prev => ({
          ...prev,
          flatlayPhotos: [...prev.flatlayPhotos, uploadedUrl]
        }));
      } catch (err) {
        console.error('Flat-lay photo upload error:', err);
      } finally {
        setIsUploadingFlatlay(false);
        e.target.value = '';
      }
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
    if (!formData.name || savedSuccess) return; // guard against double-submit

    const combinedGallery = [
      ...formData.modelPhotos,
      ...formData.flatlayPhotos
    ];

    const payload = {
      ...formData,
      price: Number(formData.price),
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
    // Edit the regular-price record, not the offer-priced copy
    setEditingProduct(catalog.find(p => p.id === prod.id) || prod);
    setActiveTab('editor');
  };

  const startCreateNew = () => {
    setEditingProduct(null);
    setActiveTab('editor');
  };

  const { isAdmin } = useAuth();
  useOverlay(isAtelierModalOpen && isAdmin, () => setIsAtelierModalOpen(false));

  if (!isAtelierModalOpen || !isAdmin) return null;

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
            <span>Admin</span>
          </div>
          <h2 className="admin-title">
            {activeTab === 'inventory' 
              ? 'Products' 
              : activeTab === 'orders'
              ? 'Orders and payments'
              : activeTab === 'offers'
              ? 'Offers'
              : (editingProduct ? `Edit: ${editingProduct.name}` : 'Add a product')}
          </h2>
          <p className="admin-subtitle">
            {activeTab === 'orders'
              ? 'Check UPI payments, approve or reject orders, ship them and message customers on WhatsApp.'
              : activeTab === 'offers'
              ? 'Run a discount on any piece, duo set or Mix & Match pair. Schedule it, pause it, or end it any time.'
              : 'Edit products, prices and photos on the live store.'}
          </p>

          {/* Navigation Tabs */}
          <div className="admin-tab-bar">
            <button 
              className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inventory');
                setEditingProduct(null);
                if (setAdminActiveTab) setAdminActiveTab('inventory');
              }}
            >
              Products ({products.length})
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('orders');
                setEditingProduct(null);
                if (setAdminActiveTab) setAdminActiveTab('orders');
              }}
            >
              <Receipt size={14} />
              <span>Orders ({orders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="admin-tab-pending-badge">{pendingOrdersCount} pending</span>
              )}
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('offers');
                setEditingProduct(null);
                if (setAdminActiveTab) setAdminActiveTab('offers');
              }}
            >
              <Tag size={14} />
              <span>Offers</span>
              {liveOffersCount > 0 && (
                <span className="admin-tab-live-badge">{liveOffersCount} live</span>
              )}
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'editor' && !editingProduct ? 'active' : ''}`}
              onClick={startCreateNew}
            >
              <PlusCircle size={14} />
              <span>Add product</span>
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
                      <span className="inv-price">{formatPrice(prod.basePrice ?? prod.price)}</span>
                      {['live', 'scheduled'].includes(getOfferStatus(prod.discount)) && (
                        <button
                          type="button"
                          className={`inv-offer-pill is-${getOfferStatus(prod.discount)}`}
                          onClick={() => setActiveTab('offers')}
                          title="Manage in Offers"
                        >
                          {getOfferStatus(prod.discount) === 'live' ? 'Offer live' : 'Offer scheduled'} · {describeOfferValue(prod.discount)}
                        </button>
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
                      title="Edit price, name and photos"
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
                        title="Remove from store"
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
                title="Reset to the original launch products"
              >
                <RefreshCw size={13} />
                <span>Reset products</span>
              </button>
            </div>
          </div>
        )}

        {/* OFFERS */}
        {activeTab === 'offers' && (
          <AdminOffersView />
        )}

        {/* TAB 2: CLIENT ORDERS & TRANSACTIONS AUDIT */}
        {activeTab === 'orders' && (
          <AdminOrdersView />
        )}

        {/* TAB 3: PRODUCT EDITOR (EDIT / CREATE) */}
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
                <span>Back to products</span>
              </button>
            </div>

            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group full-width">
                <label className="form-label">Product name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Champagne Tissue Saree"
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
                  onChange={(e) => {
                    const category = e.target.value;
                    const allowed = SUBCATEGORY_OPTIONS[category] || [];
                    const subCategory = allowed.some(o => o.value === formData.subCategory)
                      ? formData.subCategory
                      : (allowed[0]?.value || '');
                    setFormData({ ...formData, category, subCategory });
                  }}
                  className="form-select"
                >
                  <option value="sarees">Sarees</option>
                  <option value="blouses">Blouses &amp; Corsets</option>
                  <option value="sets">Duo sets</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select 
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  className="form-select"
                >
                  {(SUBCATEGORY_OPTIONS[formData.category] || []).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Price & Original Price */}
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <span className="form-label">Discount</span>
                <div className="editor-offer-note">
                  {editingProduct && getOfferStatus(editingProduct.discount) !== 'none'
                    ? <span>This piece has an offer ({describeOfferValue(editingProduct.discount)}).</span>
                    : <span>Sold at the price on the left.</span>}
                  <button
                    type="button"
                    className="editor-offer-link"
                    onClick={() => { setEditingProduct(null); setActiveTab('offers'); }}
                  >
                    Manage offers
                  </button>
                </div>
                <span className="form-hint">Enter the regular price here. Discounts are set in Offers.</span>
              </div>

              {/* Badge Tag */}
              <div className="form-group">
                <label className="form-label">Badge (e.g. New, Festive)</label>
                <input 
                  type="text" 
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Fabric Specification */}
              <div className="form-group">
                <label className="form-label">Fabric</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tissue silk"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Drape Weight */}
              <div className="form-group">
                <label className="form-label">Drape feel</label>
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
                <label className="form-label">Zari / embroidery</label>
                <input 
                  type="text" 
                  placeholder="e.g. Gold zari border / hand zardozi"
                  value={formData.zariWork}
                  onChange={(e) => setFormData({ ...formData, zariWork: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label className="form-label">Description</label>
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
                      <span>On model ({formData.modelPhotos.length})</span>
                    </div>
                    <h4 className="manager-title">Model photos</h4>
                    <span className="manager-sub">Add a few angles: front, side, close-up, back.</span>
                  </div>

                  {/* Upload from Computer Button */}
                  <label className={`upload-file-btn ${isUploadingModel ? 'uploading' : ''}`}>
                    {isUploadingModel ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                    <span>{isUploadingModel ? 'Uploading...' : 'Upload photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingModel}
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
                      <div className="thumb-order-badge">Model #{idx + 1}</div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveModelPhoto(idx)}
                        className="thumb-delete-btn"
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {formData.modelPhotos.length === 0 && (
                    <div className="no-photos-alert">
                      <AlertCircle size={18} />
                      <span>No model photos yet. Upload one or pick below.</span>
                    </div>
                  )}
                </div>

                {/* Add Model Photo by URL */}
                <div className="add-url-row">
                  <input 
                    type="text" 
                    placeholder="Or paste an image link"
                    value={customModelUrl}
                    onChange={(e) => setCustomModelUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddModelUrl}
                    className="btn btn-outline add-url-btn"
                  >
                    Add photo
                  </button>
                </div>

                {/* Pick from Muse Presets */}
                <div className="preset-strip">
                  <span className="preset-label">Quick add:</span>
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
                      <span>Flat-lays ({formData.flatlayPhotos.length})</span>
                    </div>
                    <h4 className="manager-title">Fabric and detail photos</h4>
                    <span className="manager-sub">Add folded shots and close-ups of the work.</span>
                  </div>

                  {/* Upload Flatlay Button */}
                  <label className={`upload-file-btn upload-flatlay-btn ${isUploadingFlatlay ? 'uploading' : ''}`}>
                    {isUploadingFlatlay ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                    <span>{isUploadingFlatlay ? 'Uploading...' : 'Upload photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingFlatlay}
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
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {formData.flatlayPhotos.length === 0 && (
                    <div className="no-photos-alert">
                      <AlertCircle size={18} />
                      <span>No flat-lay photos yet. Upload one or pick below.</span>
                    </div>
                  )}
                </div>

                {/* Add Flat-lay Photo by URL */}
                <div className="add-url-row">
                  <input 
                    type="text" 
                    placeholder="Or paste an image link"
                    value={customFlatlayUrl}
                    onChange={(e) => setCustomFlatlayUrl(e.target.value)}
                    className="url-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddFlatlayUrl}
                    className="btn btn-outline add-url-btn"
                  >
                    Add photo
                  </button>
                </div>

                {/* Pick from Flat-lay Presets */}
                <div className="preset-strip">
                  <span className="preset-label">Quick add:</span>
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
                disabled={savedSuccess}
                className={`btn btn-primary publish-btn ${savedSuccess ? 'success' : ''}`}
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{editingProduct ? 'Save changes' : 'Add to store'}</span>
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
          max-width: 1040px;
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
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent-gold);
          margin-bottom: 6px;
        }
        .admin-title {
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .admin-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .admin-tab-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 10px;
        }
        .admin-tab-btn {
          background: none;
          border: 1px solid var(--border-light);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: var(--text-xs);
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
        .admin-tab-pending-badge {
          background: #E65100;
          color: #FFFFFF;
          font-size: var(--text-xs);
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 10px;
        }
        .admin-tab-btn.active .admin-tab-pending-badge {
          background: #FFFFFF;
          color: #E65100;
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
          font-size: var(--text-base);
          color: var(--text-primary);
        }
        .inv-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          flex-wrap: wrap;
        }
        .inv-price {
          font-weight: 700;
          color: var(--accent-terracotta);
        }
        .inv-offer-pill {
          border: none;
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 1px 8px;
          border-radius: 10px;
          color: var(--accent-terracotta);
          background: rgba(163, 72, 53, 0.08);
        }
        .inv-offer-pill.is-scheduled {
          color: #8A6A2B;
          background: rgba(197, 160, 89, 0.16);
        }
        .admin-tab-live-badge {
          background: rgba(163, 72, 53, 0.1);
          color: var(--accent-terracotta);
          font-size: var(--text-xs);
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 10px;
        }
        .admin-tab-btn.active .admin-tab-live-badge {
          background: #FFFFFF;
        }
        .editor-offer-note {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding: 10px 14px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          background: var(--bg-primary);
          border: 1px dashed var(--border-gold);
          border-radius: 3px;
        }
        .editor-offer-link {
          background: none;
          border: none;
          padding: 0;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--accent-terracotta);
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }
        .inv-cat-pill {
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 6px;
          border-radius: 2px;
          font-size: var(--text-xs);
          text-transform: uppercase;
        }
        .inv-photo-count {
          color: var(--text-muted);
          font-size: var(--text-xs);
        }
        .inv-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .inv-edit-btn {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          font-weight: 700;
          color: #CF1322;
        }
        .confirm-yes {
          padding: 4px 8px;
          font-size: var(--text-xs);
          background: #CF1322;
          color: #FFFFFF;
          border: none;
        }
        .confirm-no {
          padding: 4px 8px;
          font-size: var(--text-xs);
        }
        .inventory-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-light);
          padding-top: 14px;
        }
        .reset-btn {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .form-input, .form-select, .form-textarea {
          padding: 10px 14px;
          font-size: var(--text-sm);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-base);
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .manager-sub {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          background: #FFFFFF;
          outline: none;
        }
        .add-url-btn {
          font-size: var(--text-xs);
          padding: 8px 14px;
        }
        .preset-strip {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .preset-label {
          font-size: var(--text-xs);
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
          font-size: var(--text-xs);
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
          .admin-modal {
            padding: 20px 14px;
            max-height: 94vh;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .manager-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .add-url-row {
            flex-direction: column;
            gap: 8px;
          }
          .add-url-btn {
            width: 100%;
          }
          .admin-actions {
            flex-direction: column-reverse;
            gap: 8px;
          }
          .publish-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
