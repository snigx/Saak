// Product tags are merchandising labels ("Bestselling Sheen", "Custom Shade Available").
// Sale / discount tags are no longer shown anywhere on the storefront.
const SALE_PATTERN = /(\bsave\b|%|\boff\b|\bsale\b|\bdiscount\b|\bdeal\b)/i;

export function getDisplayTag(tag) {
  const text = (tag || '').trim();
  if (!text || SALE_PATTERN.test(text)) return null;
  return text;
}
