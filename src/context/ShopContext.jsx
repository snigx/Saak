import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts } from '../data/initialProducts';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('saak_products_v5');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

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
  const [currency, setCurrency] = useState('INR'); // INR, USD, GBP, AED

  // Rates approximation
  const currencyRates = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 0.012 },
    GBP: { symbol: '£', rate: 0.0095 },
    AED: { symbol: 'AED ', rate: 0.044 }
  };

  useEffect(() => {
    try {
      localStorage.setItem('saak_products_v5', JSON.stringify(products));
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
    const gallery = newProd.gallery && newProd.gallery.length > 0 
      ? newProd.gallery 
      : [newProd.modelView, newProd.flatlayView].filter(Boolean);

    const productWithDefaults = {
      ...newProd,
      id: newProd.id || `saak-${Date.now()}`,
      inStock: true,
      featured: true,
      images: {
        modelView: newProd.modelView || gallery[0] || '/assets/muse_sunset_tissue.jpg',
        flatlayView: newProd.flatlayView || gallery[1] || gallery[0] || '/assets/saak_folded_copper_tissue.jpg',
        swatchZoom: newProd.swatchZoom || gallery[2] || gallery[0] || '/assets/saak_flatlay_copper_green.jpg',
        gallery: gallery.length > 0 ? gallery : ['/assets/muse_sunset_tissue.jpg']
      },
      sizeOptions: newProd.sizeOptions?.length > 0 ? newProd.sizeOptions : ['Standard Fit', 'Custom Sizing'],
      recommendedPairings: newProd.recommendedPairings || ['the-gold-corset']
    };

    setProducts(prev => [productWithDefaults, ...prev]);
  };

  // Update existing product
  const updateProduct = (updatedProd) => {
    const gallery = updatedProd.gallery && updatedProd.gallery.length > 0
      ? updatedProd.gallery
      : [updatedProd.images?.modelView, updatedProd.images?.flatlayView].filter(Boolean);

    setProducts(prev => prev.map(p => {
      if (p.id === updatedProd.id) {
        return {
          ...p,
          ...updatedProd,
          price: Number(updatedProd.price),
          originalPrice: updatedProd.originalPrice ? Number(updatedProd.originalPrice) : undefined,
          images: {
            ...p.images,
            ...updatedProd.images,
            modelView: updatedProd.modelView || gallery[0] || p.images?.modelView,
            flatlayView: updatedProd.flatlayView || gallery[1] || gallery[0] || p.images?.flatlayView,
            gallery: gallery.length > 0 ? gallery : [p.images?.modelView]
          }
        };
      }
      return p;
    }));
  };

  // Delete product
  const deleteProduct = (productId) => {
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

  const resetCatalogToDefault = () => {
    setProducts(initialProducts);
    localStorage.setItem('saak_products_v5', JSON.stringify(initialProducts));
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
