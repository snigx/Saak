import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts } from '../data/initialProducts';
import { fetchProductsFromDb, saveProductToDb, deleteProductFromDb } from '../services/productsService';
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

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('saak_products_v9');
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
  const [currency, setCurrency] = useState('INR'); // INR, USD, GBP, AED

  // Rates approximation
  const currencyRates = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 0.012 },
    GBP: { symbol: '£', rate: 0.0095 },
    AED: { symbol: 'AED ', rate: 0.044 }
  };

  // Asynchronously sync with Supabase PostgreSQL if configured
  useEffect(() => {
    let isMounted = true;
    fetchProductsFromDb().then(dbProducts => {
      if (isMounted && dbProducts && dbProducts.length > 0) {
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
      localStorage.setItem('saak_products_v9', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('saak_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('saak_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const formatPrice = (inrPrice) => {
    const cur = currencyRates[currency] || currencyRates.INR;
    const converted = Math.round(inrPrice * cur.rate);
    return `${cur.symbol}${converted.toLocaleString('en-IN')}`;
  };

  const addToCart = (product, size = null, customColor = null, count = 1) => {
    const chosenSize = size || (product.sizeOptions ? product.sizeOptions[0] : 'Standard');
    const itemKey = `${product.id}-${chosenSize}-${customColor || 'default'}`;

    setCart(prev => {
      const existing = prev.find(item => item.itemKey === itemKey);
      if (existing) {
        return prev.map(item =>
          item.itemKey === itemKey ? { ...item, quantity: item.quantity + count } : item
        );
      }
      return [...prev, {
        ...product,
        itemKey,
        selectedSize: chosenSize,
        customColor,
        quantity: count
      }];
    });
    setIsCartOpen(true);
  };

  const addDuoToCart = (saree, blouse) => {
    const totalOriginal = saree.price + blouse.price;
    const discountedTotal = Math.round(totalOriginal * 0.9); // 10% discount
    const itemKey = `duo-${saree.id}-${blouse.id}`;

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
        name: `Curated Duo: ${saree.name} + ${blouse.name}`,
        price: discountedTotal,
        originalPrice: totalOriginal,
        isDuo: true,
        saree,
        blouse,
        selectedSize: `${saree.sizeOptions[0]} | ${blouse.sizeOptions[0]}`,
        images: {
          modelView: saree.images.modelView || blouse.images.modelView
        },
        quantity: 1
      }];
    });
    setIsCartOpen(true);
  };

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

  // Add new product (Atelier Admin function)
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
  const updateProduct = (updatedProd) => {
    const modelPhotos = updatedProd.modelPhotos || (updatedProd.images?.modelPhotos) || [updatedProd.modelView || updatedProd.images?.modelView].filter(Boolean);
    const flatlayPhotos = updatedProd.flatlayPhotos || (updatedProd.images?.flatlayPhotos) || [updatedProd.flatlayView || updatedProd.images?.flatlayView].filter(Boolean);

    let gallery = updatedProd.gallery || updatedProd.images?.gallery || [];
    if (gallery.length === 0) {
      gallery = [...modelPhotos, ...flatlayPhotos];
    }

    const mergedProduct = {
      ...updatedProd,
      price: Number(updatedProd.price),
      originalPrice: updatedProd.originalPrice ? Number(updatedProd.originalPrice) : undefined,
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
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setIsAtelierModalOpen(true);
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
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
    localStorage.setItem('saak_products_v6', JSON.stringify(initialProducts));
  };

  const updateOrderStatus = async (orderId, updates) => {
    await updateOrderStatusInDb(orderId, updates);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
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

  const openOrdersAdmin = () => {
    setAdminActiveTab('orders');
    setIsAtelierModalOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartSavings = cart.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <ShopContext.Provider value={{
      products,
      orders,
      adminActiveTab,
      setAdminActiveTab,
      openOrdersAdmin,
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
      selectedProduct,
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
      currency,
      setCurrency,
      formatPrice,
      addToCart,
      addDuoToCart,
      removeFromCart,
      updateCartQty,
      toggleWishlist,
      addNewProduct,
      resetCatalogToDefault,
      cartTotal,
      cartSavings
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
