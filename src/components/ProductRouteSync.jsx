import { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';

// Keeps the address bar in sync with the open product so every piece has a
// shareable link: /product/<product-id>. Opening a product pushes a history
// entry (so the browser Back button closes it), and landing on a product URL
// opens that product directly.

const PRODUCT_PATH = /^\/product\/([^/?#]+)\/?$/;
const DEFAULT_TITLE = typeof document !== 'undefined' ? document.title : '';
const descriptionMeta = typeof document !== 'undefined'
  ? document.querySelector('meta[name="description"]')
  : null;
const DEFAULT_DESCRIPTION = descriptionMeta?.getAttribute('content') || '';

function productIdFromPath(pathname) {
  const match = PRODUCT_PATH.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ProductRouteSync() {
  const { products, selectedProduct, setSelectedProduct } = useShop();
  // True while the current history entry is one we pushed for an open product
  const pushedEntryRef = useRef(false);
  const initialIdRef = useRef(productIdFromPath(window.location.pathname));
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Deep link: open the product named in the URL once the catalog has it.
  useEffect(() => {
    const wantedId = initialIdRef.current;
    if (!wantedId || products.length === 0) return;
    const product = products.find(p => p.id === wantedId);
    if (product) {
      initialIdRef.current = null;
      setSelectedProduct(product);
    }
  }, [products, setSelectedProduct]);

  // Unknown product in the URL: fall back to the home page after the catalog settles.
  useEffect(() => {
    if (!initialIdRef.current) return undefined;
    const timer = setTimeout(() => {
      if (initialIdRef.current) {
        initialIdRef.current = null;
        window.history.replaceState(null, '', '/');
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      const id = productIdFromPath(window.location.pathname);
      pushedEntryRef.current = Boolean(window.history.state?.saakProduct);
      const product = id ? productsRef.current.find(p => p.id === id) : null;
      setSelectedProduct(product || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedProduct]);

  // Open / switch / close product → update URL, title and description
  useEffect(() => {
    const currentId = productIdFromPath(window.location.pathname);

    if (selectedProduct) {
      const url = `/product/${encodeURIComponent(selectedProduct.id)}`;
      if (currentId !== selectedProduct.id) {
        if (currentId) {
          // Switching between products: replace rather than stack entries
          window.history.replaceState(window.history.state, '', url);
        } else {
          window.history.pushState({ saakProduct: selectedProduct.id }, '', url);
          pushedEntryRef.current = true;
        }
      }
      document.title = `${selectedProduct.name} — Saak by Aprajita`;
      if (descriptionMeta && selectedProduct.description) {
        descriptionMeta.setAttribute('content', selectedProduct.description.slice(0, 160));
      }
      return;
    }

    document.title = DEFAULT_TITLE;
    if (descriptionMeta) descriptionMeta.setAttribute('content', DEFAULT_DESCRIPTION);

    // Don't touch the URL while a deep link is still waiting for the catalog
    if (currentId && !initialIdRef.current) {
      if (pushedEntryRef.current) {
        // Closing a product we opened: step back so Back doesn't reopen it
        pushedEntryRef.current = false;
        window.history.back();
      } else {
        // Landed directly on a product link: just return to the home URL
        window.history.replaceState(null, '', '/');
      }
    }
  }, [selectedProduct]);

  return null;
}
