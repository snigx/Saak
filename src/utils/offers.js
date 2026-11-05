// Offers (discounts) for Saak.
//
// An offer is stored on a product as `product.discount`, and the Mix & Match
// pair offer is stored once for the whole store. Both use the same shape:
//
//   {
//     type: 'percent' | 'amount',   // "10% off" or "₹500 off"
//     value: number,
//     label: string,                // shown to customers, e.g. "Diwali offer"
//     startsAt: ISO string | null,  // null = starts immediately
//     endsAt: ISO string | null,    // null = runs until switched off
//     enabled: boolean              // false = paused (kept for later)
//   }
//
// Rules:
// - The offer applies to the piece's own price. Add-ons such as fall & pico
//   (+₹450) are always charged in full.
// - Offers never stack. A pair gets whichever is cheaper for the customer:
//   each piece's own offer, or the pair offer on the full prices.
// - A piece never drops below 10% of its price, whatever is entered.

export const MAX_PERCENT = 90;
const MIN_PRICE_SHARE = 0.1;

export const DEFAULT_OFFER = Object.freeze({
  type: 'percent',
  value: 10,
  label: '',
  startsAt: null,
  endsAt: null,
  enabled: true
});

export function normalizeOffer(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const value = Number(raw.value);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    type: raw.type === 'amount' ? 'amount' : 'percent',
    value,
    label: typeof raw.label === 'string' ? raw.label.trim() : '',
    startsAt: raw.startsAt || null,
    endsAt: raw.endsAt || null,
    enabled: raw.enabled !== false
  };
}

// 'none' | 'paused' | 'scheduled' | 'live' | 'ended'
export function getOfferStatus(raw, now = Date.now()) {
  const offer = normalizeOffer(raw);
  if (!offer) return 'none';
  if (!offer.enabled) return 'paused';
  if (offer.endsAt && new Date(offer.endsAt).getTime() <= now) return 'ended';
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return 'scheduled';
  return 'live';
}

export function isOfferLive(raw, now = Date.now()) {
  return getOfferStatus(raw, now) === 'live';
}

// Price after the offer, rounded to whole rupees.
export function applyOffer(basePrice, raw) {
  const base = Math.max(0, Number(basePrice) || 0);
  const offer = normalizeOffer(raw);
  if (!offer || base === 0) return base;
  const percent = Math.min(offer.value, MAX_PERCENT);
  const reduced = offer.type === 'percent'
    ? base * (1 - percent / 100)
    : base - offer.value;
  const floor = Math.ceil(base * MIN_PRICE_SHARE);
  return Math.max(floor, Math.round(reduced));
}

// "10% off" / "₹500 off"
export function describeOfferValue(raw) {
  const offer = normalizeOffer(raw);
  if (!offer) return '';
  return offer.type === 'percent'
    ? `${Math.min(offer.value, MAX_PERCENT)}% off`
    : `₹${Math.round(offer.value).toLocaleString('en-IN')} off`;
}

export function formatOfferDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Customer-facing details for a live offer (null when no offer applies).
function describeLiveOffer(raw, basePrice, finalPrice) {
  const offer = normalizeOffer(raw);
  const saved = basePrice - finalPrice;
  if (!offer || saved <= 0) return null;
  return {
    label: offer.label,
    short: describeOfferValue(offer),
    saved,
    endsAt: offer.endsAt,
    endsLabel: offer.endsAt ? `Ends ${formatOfferDate(offer.endsAt)}` : ''
  };
}

// Adds the customer-facing price to a catalog product:
//   price      – what the customer pays now
//   basePrice  – the regular price
//   offer      – details of the live offer, or null
export function withOfferPricing(product, now = Date.now()) {
  const basePrice = Number(product.price) || 0;
  if (!isOfferLive(product.discount, now)) {
    return { ...product, basePrice, offer: null };
  }
  const price = applyOffer(basePrice, product.discount);
  return { ...product, price, basePrice, offer: describeLiveOffer(product.discount, basePrice, price) };
}

// Price for a saree + blouse picked together in Mix & Match.
// `saree` and `blouse` are products that already went through withOfferPricing.
export function getPairPricing(saree, blouse, pairOffer, extras = 0, now = Date.now()) {
  if (!saree || !blouse) return { price: 0, basePrice: 0, offer: null };
  const baseOf = (p) => Number(p.basePrice ?? p.price) || 0;
  const regular = baseOf(saree) + baseOf(blouse);
  const basePrice = regular + extras;

  // Option 1: each piece's own offer
  const individual = (Number(saree.price) || 0) + (Number(blouse.price) || 0);
  let best = { price: individual + extras, offer: null };
  if (individual < regular) {
    const pieceOffers = [saree.offer, blouse.offer].filter(Boolean);
    best.offer = {
      label: pieceOffers.length === 1 ? pieceOffers[0].label : '',
      short: pieceOffers.length === 1 ? pieceOffers[0].short : 'Offer price',
      saved: regular - individual,
      endsAt: null,
      endsLabel: ''
    };
  }

  // Option 2: the pair offer on the regular prices
  if (isOfferLive(pairOffer, now)) {
    const pairPrice = applyOffer(regular, pairOffer);
    if (pairPrice < individual) {
      best = { price: pairPrice + extras, offer: describeLiveOffer(pairOffer, regular, pairPrice) };
    }
  }

  return { price: best.price, basePrice, offer: best.offer };
}

// Next moment an offer starts or ends, so prices can refresh exactly then.
export function nextOfferChange(offers, now = Date.now()) {
  let next = Infinity;
  for (const raw of offers) {
    const offer = normalizeOffer(raw);
    if (!offer || !offer.enabled) continue;
    for (const iso of [offer.startsAt, offer.endsAt]) {
      const t = iso ? new Date(iso).getTime() : NaN;
      if (t > now && t < next) next = t;
    }
  }
  return next;
}

// Date input helpers ("YYYY-MM-DD" in the shop's local time)
export function dateInputToIso(value, endOfDay = false) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = endOfDay ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d, 0, 0, 0);
  return date.toISOString();
}

export function isoToDateInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
