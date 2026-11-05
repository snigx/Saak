// Parses a surcharge from option labels such as "Pre-Pleated Fall & Pico (+₹450)"
export function getSizeSurcharge(sizeLabel) {
  const match = /\(\+\s*₹\s*([\d,]+)\)/.exec(sizeLabel || '');
  return match ? Number(match[1].replace(/,/g, '')) : 0;
}

// Fitted pieces (blouses, corsets, duo sets) need the shopper to choose a size;
// sarees default safely to their standard drape.
export function requiresSizeChoice(product) {
  return Boolean(product) && product.category !== 'sarees' && (product.sizeOptions?.length || 0) > 1;
}
