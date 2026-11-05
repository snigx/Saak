import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialProducts } from '../data/initialProducts';
import { getSizeSurcharge } from '../utils/pricing';
import { fetchProductsFromDb, saveProductToDb, deleteProductFromDb, saveProductOfferToDb } from '../services/productsService';
import { fetchPairOffer, savePairOffer } from '../services/settingsService';
import { withOfferPricing, getPairPricing, nextOfferChange, normalizeOffer } from '../utils/offers';
import { 
  fetchOrdersFromDb, 
  updateOrderStatusInDb, 
  confirmOrderInDb, 
  dispatchOrderInDb, 
  deliverOrderInDb, 
  deleteOrderFromDb, 
  resetOrdersToDefault 
} from '../services/ordersService';

const ShopContext = createContext();

const PRODUCTS_STORAGE_KEY = 'saak_products_v10';

// Fields added for display only; never saved back to the catalog
function stripPricing(product) {
  const { basePrice, offer: _offer, ...rest } = product;
  return basePrice !== undefined ? { ...rest, price: basePrice } : rest;
}

export function ShopProvider({ children }) {
  // `catalog` holds products at their regular prices (what admins edit).
  // `products` is what customers see: the same list with live offers applied.
  const [catalog, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [orders, setOrders] = useState([]);
  const [adminActiveTab, setAdminActiveTab] = useState('inventory'); // 'inventory', 'orders', 'editor'

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('saak_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('saak_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAtelierModalOpen, setIsAtelierModalOpen] = useState(false);
  const [customShadeProduct, setCustomShadeProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const clearSearch = () => setSearchQuery('');

  const openPolicyModal = () => setIsPolicyModalOpen(true);

  // Auto-open policy modal if URL hash matches
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#returns-policy' || hash === '#refund-policy' || hash === '#policy' || hash === '#refunds') {
        setIsPolicyModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [atelierUpiId, setAtelierUpiId] = useState(() => {
    try {
      const saved = localStorage.getItem('saak_upi_id');
      if (saved && saved !== 'saakbyaprajita@okhdfcbank') {
        return saved;
      }
      localStorage.setItem('saak_upi_id', '6267664409@ybl');
      return '6267664409@ybl';
    } catch {
      return '6267664409@ybl';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saak_upi_id', atelierUpiId);
    } catch {}
  }, [atelierUpiId]);
  // Asynchronously sync with Supabase PostgreSQL if configured
  useEffect(() => {
    let isMounted = true;
    fetchProductsFromDb().then(dbProducts => {
      // null means "no remote catalog" — keep the locally persisted catalog
      if (isMounted && Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Asynchronously load client orders
  const refreshOrders = async () => {
    try {
      const data = await fetchOrdersFromDb();
      setOrders(data || []);
      return data;
    } catch (e) {
      console.warn('Orders refresh error:', e);
      return [];
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(catalog));
    } catch (e) {
      console.error(e);
    }
  }, [catalog]);

  // ---- Offers -------------------------------------------------------------
  const [pairOffer, setPairOffer] = useState(null);
  const [offerClock, setOfferClock] = useState(() => Date.now());

  useEffect(() => {
    let isMounted = true;
    fetchPairOffer().then(offer => { if (isMounted) setPairOffer(offer); });
    return () => { isMounted = false; };
  }, []);

  // Re-price exactly when the next scheduled offer starts or ends
  useEffect(() => {
    const next = nextOfferChange([...catalog.map(p => p.discount), pairOffer], offerClock);
    if (!Number.isFinite(next)) return undefined;
    const delay = Math.min(Math.max(next - Date.now(), 0) + 500, 24 * 60 * 60 * 1000);
    const timer = setTimeout(() => setOfferClock(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [catalog, pairOffer, offerClock]);

  const products = useMemo(
    () => catalog.map(p => withOfferPricing(p, offerClock)),
    [catalog, offerClock]
  );

  // The open product, kept in step with live prices
  const liveSelectedProduct = useMemo(
    () => (selectedProduct ? (products.find(p => p.id === selectedProduct.id) || selectedProduct) : null),
    [selectedProduct, products]
  );

  const getPairPrice = useCallback((saree, blouse, sareeSize = null, blouseSize = null) => {
    const extras = getSizeSurcharge(sareeSize) + getSizeSurcharge(blouseSize);
    return getPairPricing(saree, blouse, pairOffer, extras, offerClock);
  }, [pairOffer, offerClock]);

  // Admin: set or clear the offer on one product. Returns { ok, error? }.
  const setProductOffer = async (productId, offer) => {
    const discount = offer ? normalizeOffer(offer) : null;
    const result = await saveProductOfferToDb(productId, discount);
    if (result.ok) {
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, discount } : p)));
      setOfferClock(Date.now());
    }
    return result;
  };

  // Admin: set or clear the Mix & Match pair offer. Returns { ok, error? }.
  const updatePairOffer = async (offer) => {
    const value = offer ? normalizeOffer(offer) : null;
    const result = await savePairOffer(value);
    if (result.ok) {
      setPairOffer(value);
      setOfferClock(Date.now());
    }
    return result;
  };

  useEffect(() => {
    try {
      localStorage.setItem('saak_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Drop wishlist entries for products that no longer exist in the catalog
  useEffect(() => {
    if (products.length === 0) return;
    setWishlist(prev => {
      const pruned = prev.filter(id => products.some(p => p.id === id));
      return pruned.length === prev.length ? prev : pruned;
    });
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('saak_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Saak sells in INR only
  const formatPrice = (inrPrice) => `₹${Math.round(Number(inrPrice) || 0).toLocaleString('en-IN')}`;

  const addToCart = (incoming, size = null, customColor = null, count = 1, extras = {}) => {
    // Always price from the live catalog so the current offer applies
    const product = products.find(p => p.id === incoming.id) || withOfferPricing(stripPricing(incoming), offerClock);
    const chosenSize = size || (product.sizeOptions ? product.sizeOptions[0] : 'Standard');
    const itemKey = `${product.id}-${chosenSize}-${customColor || 'default'}`;
    // Options like "Pre-Pleated Fall & Pico (+₹450)" carry a surcharge
    const surcharge = getSizeSurcharge(chosenSize);

    setCart(prev => {
      const existing = prev.find(item => item.itemKey === itemKey);
      if (existing) {
        return prev.map(item =>
          item.itemKey === itemKey ? { ...item, quantity: item.quantity + count } : item
        );
      }
      return [...prev, {
        ...product,
        price: Number(product.price) + surcharge,
        basePrice: Number(product.basePrice ?? product.price) + surcharge,
        offerLabel: product.offer ? (product.offer.label || product.offer.short) : null,
        itemKey,
        selectedSize: chosenSize,
        customColor,
        ...(extras.customNote ? { customNote: extras.customNote } : {}),
        quantity: count
      }];
    });
    setIsCartOpen(true);
  };

  const addDuoToCart = (sareeIn, blouseIn, sareeSize = null, blouseSize = null) => {
    const saree = products.find(p => p.id === sareeIn.id) || sareeIn;
    const blouse = products.find(p => p.id === blouseIn.id) || blouseIn;
    const chosenSareeSize = sareeSize || saree.sizeOptions?.[0] || 'Standard';
    const chosenBlouseSize = blouseSize || blouse.sizeOptions?.[0] || 'Standard';
    const pair = getPairPrice(saree, blouse, chosenSareeSize, chosenBlouseSize);
    const itemKey = `duo-${saree.id}-${blouse.id}-${chosenSareeSize}-${chosenBlouseSize}`;

    setCart(prev => {
      const existing = prev.find(item => item.itemKey === itemKey);
      if (existing) {
        return prev.map(item =>
          item.itemKey === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: itemKey,
        itemKey,
        name: `Duo: ${saree.name} + ${blouse.name}`,
        price: pair.price,
        basePrice: pair.basePrice,
        offerLabel: pair.offer ? (pair.offer.label || pair.offer.short) : null,
        isDuo: true,
        saree: stripPricing(saree),
        blouse: stripPricing(blouse),
        sareeSize: chosenSareeSize,
        blouseSize: chosenBlouseSize,
        selectedSize: `${chosenSareeSize} | ${chosenBlouseSize}`,
        images: {
          modelView: saree.images.modelView || blouse.images.modelView
        },
        quantity: 1
      }];
    });
    setIsCartOpen(true);
  };

  // Keep bag prices current when an offer starts, ends or is edited
  useEffect(() => {
    setCart(prev => {
      let changed = false;
      const next = prev.map(item => {
        let price;
        let basePrice;
        let offerLabel;
        if (item.isDuo) {
          const saree = products.find(p => p.id === item.saree?.id);
          const blouse = products.find(p => p.id === item.blouse?.id);
          if (!saree || !blouse) return item;
          const [sSize, bSize] = (item.selectedSize || '').split(' | ');
          const pair = getPairPrice(saree, blouse, item.sareeSize || sSize, item.blouseSize || bSize);
          ({ price, basePrice } = pair);
          offerLabel = pair.offer ? (pair.offer.label || pair.offer.short) : null;
        } else {
          const product = products.find(p => p.id === item.id);
          if (!product) return item;
          const surcharge = getSizeSurcharge(item.selectedSize);
          price = product.price + surcharge;
          basePrice = product.basePrice + surcharge;
          offerLabel = product.offer ? (product.offer.label || product.offer.short) : null;
        }
        if (item.price === price && item.basePrice === basePrice && (item.offerLabel ?? null) === offerLabel) {
          return item;
        }
        changed = true;
        return { ...item, price, basePrice, offerLabel };
      });
      return changed ? next : prev;
    });
  }, [products, getPairPrice]);

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const updateCartQty = (itemKey, delta) => {
    setCart(prev => prev.map(item => {
      if (item.itemKey === itemKey) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const [editingProduct, setEditingProduct] = useState(null);

  // Add new product (Admin function)
  const addNewProduct = (newProd) => {
    const modelPhotos = newProd.modelPhotos || (newProd.images?.modelPhotos) || [newProd.modelView || newProd.images?.modelView].filter(Boolean);
    const flatlayPhotos = newProd.flatlayPhotos || (newProd.images?.flatlayPhotos) || [newProd.flatlayView || newProd.images?.flatlayView].filter(Boolean);

    let gallery = newProd.gallery || newProd.images?.gallery || [];
    if (gallery.length === 0) {
      gallery = [...modelPhotos, ...flatlayPhotos];
    }
    if (gallery.length === 0) {
      gallery = ['/assets/muse_sunset_tissue.jpg'];
    }

    const productWithDefaults = {
      ...newProd,
      id: newProd.id || `saak-${Date.now()}`,
      inStock: true,
      featured: true,
      images: {
        modelPhotos: modelPhotos.length > 0 ? modelPhotos : [gallery[0]],
        flatlayPhotos: flatlayPhotos.length > 0 ? flatlayPhotos : (gallery.length > 1 ? [gallery[1]] : [gallery[0]]),
        modelView: modelPhotos[0] || gallery[0] || '/assets/muse_sunset_tissue.jpg',
        flatlayView: flatlayPhotos[0] || gallery[1] || gallery[0] || '/assets/saak_folded_copper_tissue.jpg',
        swatchZoom: newProd.images?.swatchZoom || flatlayPhotos[0] || gallery[0],
        gallery: gallery
      },
      sizeOptions: newProd.sizeOptions?.length > 0 ? newProd.sizeOptions : ['Standard Fit', 'Custom Sizing'],
      recommendedPairings: newProd.recommendedPairings || ['the-gold-corset']
    };

    saveProductToDb(productWithDefaults);
    setProducts(prev => [productWithDefaults, ...prev]);
  };

  // Update existing product
  const updateProduct = (incomingProd) => {
    const existing = catalog.find(p => p.id === incomingProd.id) || {};
    const updatedProd = {
      ...existing,
      ...stripPricing(incomingProd),
      images: { ...(existing.images || {}), ...(incomingProd.images || {}) }
    };
    const modelPhotos = updatedProd.modelPhotos || (updatedProd.images?.modelPhotos) || [updatedProd.modelView || updatedProd.images?.modelView].filter(Boolean);
    const flatlayPhotos = updatedProd.flatlayPhotos || (updatedProd.images?.flatlayPhotos) || [updatedProd.flatlayView || updatedProd.images?.flatlayView].filter(Boolean);

    let gallery = updatedProd.gallery || updatedProd.images?.gallery || [];
    if (gallery.length === 0) {
      gallery = [...modelPhotos, ...flatlayPhotos];
    }

    const mergedProduct = {
      ...updatedProd,
      price: Number(updatedProd.price),
      originalPrice: undefined,
      images: {
        ...updatedProd.images,
        modelPhotos: modelPhotos.length > 0 ? modelPhotos : [updatedProd.images?.modelView],
        flatlayPhotos: flatlayPhotos.length > 0 ? flatlayPhotos : [updatedProd.images?.flatlayView],
        modelView: modelPhotos[0] || updatedProd.images?.modelView || gallery[0],
        flatlayView: flatlayPhotos[0] || updatedProd.images?.flatlayView || gallery[1] || gallery[0],
        gallery: gallery.length > 0 ? gallery : [updatedProd.images?.modelView]
      }
    };

    saveProductToDb(mergedProduct);
    setProducts(prev => prev.map(p => (p.id === updatedProd.id ? { ...p, ...mergedProduct } : p)));
  };

  // Delete product
  const deleteProduct = (productId) => {
    deleteProductFromDb(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const openEditProduct = (product) => {
    // Edit the regular-price record, not the offer-priced copy shown to customers
    setEditingProduct(catalog.find(p => p.id === product.id) || stripPricing(product));
    setAdminActiveTab('editor');
    setIsAtelierModalOpen(true);
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setAdminActiveTab('editor');
    setIsAtelierModalOpen(true);
  };

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('saak_cart');
    } catch {}
  };

  const resetCatalogToDefault = () => {
    setProducts(initialProducts);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
    } catch {}
  };

  const updateOrderStatus = async (orderId, updates) => {
    const result = await updateOrderStatusInDb(orderId, updates);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    return result; // may carry _syncWarning when the database couldn't persist every field
  };

  const confirmOrder = async (orderId, notes = '', sendEmail = true) => {
    const updated = await confirmOrderInDb(orderId, notes, sendEmail);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    }
    return updated;
  };

  const dispatchOrder = async (orderId, dispatchDetails, sendEmail = true) => {
    const updated = await dispatchOrderInDb(orderId, dispatchDetails, sendEmail);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    }
    return updated;
  };

  const deliverOrder = async (orderId, sendEmail = true) => {
    const updated = await deliverOrderInDb(orderId, sendEmail);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    }
    return updated;
  };

  const deleteOrder = async (orderId) => {
    await deleteOrderFromDb(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const resetOrders = () => {
    const fresh = resetOrdersToDefault();
    setOrders(fresh);
  };

  const openAdminConsole = () => {
    setAdminActiveTab('inventory');
    setIsAtelierModalOpen(true);
  };

  const openOrdersAdmin = () => {
    setAdminActiveTab('orders');
    setIsAtelierModalOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartSavings = cart.reduce(
    (sum, item) => sum + Math.max(0, ((item.basePrice ?? item.price) - item.price) * item.quantity),
    0
  );

  return (
    <ShopContext.Provider value={{
      products,
      catalog,
      pairOffer,
      getPairPrice,
      setProductOffer,
      updatePairOffer,
      cartSavings,
      orders,
      adminActiveTab,
      setAdminActiveTab,
      openOrdersAdmin,
      openAdminConsole,
      refreshOrders,
      updateOrderStatus,
      confirmOrder,
      dispatchOrder,
      deliverOrder,
      deleteOrder,
      resetOrders,
      cart,
      wishlist,
      activeCategory,
      setActiveCategory,
      selectedProduct: liveSelectedProduct,
      setSelectedProduct,
      isCartOpen,
      setIsCartOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      isAtelierModalOpen,
      setIsAtelierModalOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      openCheckout,
      isPolicyModalOpen,
      setIsPolicyModalOpen,
      openPolicyModal,
      isSearchOpen,
      setIsSearchOpen,
      openSearch,
      closeSearch,
      searchQuery,
      setSearchQuery,
      clearSearch,
      atelierUpiId,
      setAtelierUpiId,
      clearCart,
      editingProduct,
      setEditingProduct,
      openEditProduct,
      openCreateProduct,
      updateProduct,
      deleteProduct,
      customShadeProduct,
      setCustomShadeProduct,
      formatPrice,
      addToCart,
      addDuoToCart,
      getSizeSurcharge,
      removeFromCart,
      updateCartQty,
      toggleWishlist,
      addNewProduct,
      resetCatalogToDefault,
      cartTotal
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
