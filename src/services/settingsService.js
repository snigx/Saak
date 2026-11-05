import { supabase, isSupabaseConfigured } from './supabaseClient';
import { normalizeOffer } from '../utils/offers';

// Store-wide settings live in the `store_settings` table (key → jsonb value).
// Without Supabase the app runs locally and keeps them in localStorage.

const TABLE_NAME = 'store_settings';
const PAIR_OFFER_KEY = 'pair_offer';
const LOCAL_PREFIX = 'saak_setting_';

function readLocal(key) {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    if (value == null) localStorage.removeItem(LOCAL_PREFIX + key);
    else localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage unavailable — nothing else to do
  }
}

export async function fetchPairOffer() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('value')
        .eq('key', PAIR_OFFER_KEY)
        .maybeSingle();
      if (!error) return normalizeOffer(data?.value);
      // Table not created yet: no pair offer
      return null;
    } catch {
      return null;
    }
  }
  return normalizeOffer(readLocal(PAIR_OFFER_KEY));
}

// Returns { ok: true } or { ok: false, error }
export async function savePairOffer(offer) {
  const value = offer ? normalizeOffer(offer) : null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({ key: PAIR_OFFER_KEY, value, updated_at: new Date().toISOString() });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  writeLocal(PAIR_OFFER_KEY, value);
  return { ok: true };
}

// Checks that the offers migration has been run.
// Returns { ready, missing: [...] } — always ready when running locally.
export async function checkOffersSetup() {
  if (!isSupabaseConfigured || !supabase) return { ready: true, missing: [] };
  const missing = [];
  try {
    const { error } = await supabase.from('products').select('discount').limit(1);
    if (error) missing.push('products.discount');
  } catch {
    missing.push('products.discount');
  }
  try {
    const { error } = await supabase.from(TABLE_NAME).select('key').limit(1);
    if (error) missing.push(TABLE_NAME);
  } catch {
    missing.push(TABLE_NAME);
  }
  return { ready: missing.length === 0, missing };
}
