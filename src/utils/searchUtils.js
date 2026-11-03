/**
 * Search and Ranking Utility for SAAK by Aprajita
 * Provides fuzzy keyword matching, synonym resolution, category intent, and relevance scoring.
 */

const SYNONYMS = {
  saree: ['saree', 'sari', 'saaree', 'drape'],
  blouse: ['blouse', 'blouses', 'corset', 'choli', 'top'],
  tissue: ['tissue', 'shimmer', 'metallic', 'chanderi', 'organza'],
  crepe: ['crepe', 'viscose'],
  black: ['black', 'midnight', 'noir', 'dark'],
  gold: ['gold', 'golden', 'antique', 'zari', 'zardozi'],
  ivory: ['ivory', 'white', 'cream', 'offwhite', 'pearl', 'champagne'],
  orange: ['orange', 'amber', 'sunset'],
  green: ['green', 'olive', 'seafoam', 'emerald', 'teal', 'mint', 'moss'],
  yellow: ['yellow', 'marigold', 'sunshine', 'haldi', 'mustard']
};

/**
 * Expand token with fashion synonyms
 */
function expandToken(token) {
  const t = token.toLowerCase();
  const set = new Set([t]);

  for (const [key, list] of Object.entries(SYNONYMS)) {
    if (key === t || list.includes(t)) {
      set.add(key);
      list.forEach(item => set.add(item));
    }
  }

  return Array.from(set);
}

/**
 * Score a single product and track token match counts
 */
export function scoreProductWithMeta(product, query) {
  if (!query || !query.trim()) return { score: 0, matchedTokensCount: 0 };
  const rawQuery = query.trim().toLowerCase();
  const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

  if (queryTokens.length === 0) return { score: 0, matchedTokensCount: 0 };

  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const subCategory = (product.subCategory || '').toLowerCase();
  const fabric = (product.fabric || '').toLowerCase();
  const tag = (product.tag || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const zari = (product.zariWork || '').toLowerCase();
  const customColors = (product.availableCustomColors || []).map(c => c.name.toLowerCase()).join(' ');

  let score = 0;
  let matchedTokensCount = 0;

  // 1. Exact full-phrase matches
  if (name.includes(rawQuery)) score += 250;
  if (category === rawQuery || subCategory === rawQuery) score += 150;
  if (tag.includes(rawQuery)) score += 80;

  // 2. Category intent
  const isQueryBlouse = queryTokens.some(t => ['blouse', 'blouses', 'corset', 'choli'].includes(t));
  const isQuerySaree = queryTokens.some(t => ['saree', 'sari', 'saaree', 'drape'].includes(t));

  if (isQueryBlouse) {
    if (category === 'blouses') {
      score += 300;
    } else {
      // Heavily penalize sarees that only mention blouse in pairing or description
      score -= 100;
    }
  }

  if (isQuerySaree) {
    if (category === 'sarees') {
      score += 300;
    } else if (category === 'sets') {
      score += 100;
    } else {
      score -= 100;
    }
  }

  // 3. Token-by-token evaluation
  for (const token of queryTokens) {
    const expansions = expandToken(token);
    let tokenMatched = false;

    for (const exp of expansions) {
      if (name.includes(exp)) {
        score += 90;
        if (name.split(/\s+/).includes(exp)) score += 40;
        tokenMatched = true;
      }
      if (category.includes(exp) || subCategory.includes(exp)) {
        score += 70;
        tokenMatched = true;
      }
      if (tag.includes(exp)) {
        score += 40;
        tokenMatched = true;
      }
      if (fabric.includes(exp)) {
        score += 30;
        tokenMatched = true;
      }
      if (zari.includes(exp)) {
        score += 25;
        tokenMatched = true;
      }
      // Description match is lower weight
      if (desc.includes(exp) && !isQueryBlouse) {
        score += 15;
        tokenMatched = true;
      }
      if (customColors.includes(exp)) {
        score += 25;
        tokenMatched = true;
      }
    }

    if (tokenMatched) {
      matchedTokensCount++;
    }
  }

  return {
    score: Math.max(0, Math.round(score)),
    matchedTokensCount
  };
}

/**
 * Filter and rank products by query relevance
 */
export function searchAndRankProducts(products, query) {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim().toLowerCase();
  const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

  const scored = products.map(product => {
    const meta = scoreProductWithMeta(product, rawQuery);
    return { product, score: meta.score, matchedTokensCount: meta.matchedTokensCount };
  });

  // If multi-token query (e.g. "black saree"), check for full-token matches first
  if (queryTokens.length > 1) {
    const fullMatches = scored.filter(item => item.matchedTokensCount >= queryTokens.length && item.score > 50);
    if (fullMatches.length > 0) {
      return fullMatches.sort((a, b) => b.score - a.score).map(item => item.product);
    }
  }

  // For single-token queries or queries with category intent (e.g. "blouse")
  const isQueryBlouse = queryTokens.some(t => ['blouse', 'blouses', 'corset', 'choli'].includes(t));
  if (isQueryBlouse) {
    // Return only actual blouses first
    const blouseOnly = scored.filter(item => item.product.category === 'blouses' && item.score > 50);
    if (blouseOnly.length > 0) {
      return blouseOnly.sort((a, b) => b.score - a.score).map(item => item.product);
    }
  }

  const isQuerySaree = queryTokens.some(t => ['saree', 'sari', 'saaree', 'drape'].includes(t));
  if (isQuerySaree) {
    const sareeOnly = scored.filter(item => item.product.category === 'sarees' && item.score > 50);
    if (sareeOnly.length > 0) {
      return sareeOnly.sort((a, b) => b.score - a.score).map(item => item.product);
    }
  }

  return scored
    .filter(item => item.score > 40)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
