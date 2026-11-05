import { useEffect, useRef } from 'react';

// Stack of open overlays' Escape handlers; only the top-most one reacts.
const overlayStack = [];

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || overlayStack.length === 0) return;
    e.preventDefault();
    overlayStack[overlayStack.length - 1]();
  });
}

/**
 * Standard behaviour for modals and drawers:
 *  - Escape closes the top-most open overlay (stacked overlays close one at a time)
 *  - The page behind is scroll-locked while any overlay is open
 */
export function useOverlay(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handler = () => onCloseRef.current?.();
    overlayStack.push(handler);
    document.body.style.overflow = 'hidden';

    return () => {
      const idx = overlayStack.lastIndexOf(handler);
      if (idx >= 0) overlayStack.splice(idx, 1);
      if (overlayStack.length === 0) document.body.style.overflow = '';
    };
  }, [isOpen]);
}
