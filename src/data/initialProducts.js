export const initialProducts = [
  {
    id: 'the-gold-corset',
    name: 'The Sculpted Antique Gold Corset',
    category: 'blouses',
    subCategory: 'corset',
    price: 5450,
    originalPrice: 6200,
    tag: 'Hero Statement Corset',
    tagColor: '#C5A059',
    description: 'A masterpiece of modern Indian corsetry. Structured boned bodice with dense antique gold zardozi, micro-sequins, and intricate threadwork. Features a sculpted sweetheart plunge neckline and slender straps. Acts as the jewelry statement of your ensemble, designed to pair across multiple fluid sarees.',
    fabric: 'Raw Silk Base with Dense Hand Zardozi Embroidery',
    drapeStyle: 'Structured Boned Corset Bustier',
    drapeWeight: 'Architectural & Secure',
    zariWork: 'Handcrafted Antique Gold Zari & Cut-dana Work',
    isCustomColorAvailable: false,
    sizeOptions: ['XS (Bust 32)', 'S (Bust 34)', 'M (Bust 36)', 'L (Bust 38)', 'XL (Bust 40)', 'Custom Bespoke'],
    isPadded: true,
    hasMargins: true,
    images: {
      modelPhotos: [
        '/assets/saak_muse_black_saree_gold_corset.jpg',
        '/assets/saak_muse_black_corset_side.jpg'
      ],
      flatlayPhotos: [
        '/assets/saak_flatlay_copper_green.jpg'
      ],
      modelView: '/assets/saak_muse_black_saree_gold_corset.jpg',
      flatlayView: '/assets/saak_flatlay_copper_green.jpg',
      swatchZoom: '/assets/saak_muse_black_corset_side.jpg',
      gallery: [
        '/assets/saak_muse_black_saree_gold_corset.jpg',
        '/assets/saak_muse_black_corset_side.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ]
    },
    recommendedPairings: ['sunset-orange-tissue', 'olive-bloom-tissue', 'burnt-copper-tissue'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'sunset-orange-tissue',
    name: 'Sunset Orange Shimmer Tissue Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4850,
    originalPrice: 5500,
    tag: 'Custom Shade Available',
    tagColor: '#A34835',
    description: 'Sunset orange tissue saree with a subtle golden sheen, perfect for festive occasions. The crushed metallic weave glints with dual-tone warmth under ambient light, bordered with an antique Banarasi zari weave. Colour customisation available on request.',
    fabric: 'Crushed Metallic Shimmer Tissue Silk',
    drapeStyle: 'Classic 6-Yard (Optional Pre-Stitched Pleats)',
    drapeWeight: 'Ultra-Lightweight & Fluid',
    zariWork: 'Banarasi Antique Gold Zari Brocade Border',
    isCustomColorAvailable: true,
    availableCustomColors: [
      { name: 'Sunset Terracotta', hex: '#A34835' },
      { name: 'Olive Green', hex: '#5B664B' },
      { name: 'Champagne Gold', hex: '#E2CA9B' },
      { name: 'Lilac Lavender', hex: '#C6B2DC' },
      { name: 'Powder Sage', hex: '#9EB09E' },
      { name: 'Deep Crimson Wine', hex: '#6B2228' }
    ],
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        '/assets/muse_sunset_tissue.jpg',
        '/assets/muse_sunset_tissue_2.jpg'
      ],
      flatlayPhotos: [
        '/assets/saak_folded_copper_tissue.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ],
      modelView: '/assets/muse_sunset_tissue.jpg',
      flatlayView: '/assets/saak_folded_copper_tissue.jpg',
      swatchZoom: '/assets/saak_flatlay_copper_green.jpg',
      gallery: [
        '/assets/muse_sunset_tissue.jpg',
        '/assets/muse_sunset_tissue_2.jpg',
        '/assets/saak_folded_copper_tissue.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ]
    },
    recommendedPairings: ['the-gold-corset'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'olive-bloom-tissue',
    name: 'Olive Bloom Shimmer Tissue Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4550,
    originalPrice: 5200,
    tag: 'Bestselling Sheen',
    tagColor: '#5B664B',
    description: 'Leaf green crushed tissue saree illuminated with a delicate golden metallic sheen. Unfolds with airy grace and effortless volume, accented by an intricately woven antique zari border. Lightweight, radiant, and comfortable.',
    fabric: 'Crushed Metallic Shimmer Tissue',
    drapeStyle: 'Classic 6-Yard (Fall & Pico Included)',
    drapeWeight: 'Featherlight & Luminous',
    zariWork: 'Banarasi Floral Zari Jaal Border',
    isCustomColorAvailable: true,
    availableCustomColors: [
      { name: 'Olive Leaf', hex: '#5B664B' },
      { name: 'Burnt Copper', hex: '#8C3B2B' },
      { name: 'Sand Gold', hex: '#C5A059' }
    ],
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        '/assets/muse_olive_tissue.jpg'
      ],
      flatlayPhotos: [
        '/assets/saak_green_tissue_drape.jpg',
        '/assets/saak_green_tissue_swirl.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ],
      modelView: '/assets/muse_olive_tissue.jpg',
      flatlayView: '/assets/saak_green_tissue_drape.jpg',
      swatchZoom: '/assets/saak_green_tissue_swirl.jpg',
      gallery: [
        '/assets/muse_olive_tissue.jpg',
        '/assets/saak_green_tissue_drape.jpg',
        '/assets/saak_green_tissue_swirl.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ]
    },
    recommendedPairings: ['the-gold-corset'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'signature-duo-black-gold',
    name: 'The Iconic Signature Duo (Black Crepe + Gold Corset)',
    category: 'sets',
    subCategory: 'curated-duo',
    price: 8460,
    originalPrice: 9400,
    tag: 'Save 10% as a Set',
    tagColor: '#8C3B2B',
    description: 'The definitive Saak by Aprajita look: our fluid Black Crepe Pre-Draped Saree paired with the showstopper Sculpted Antique Gold Corset. Minimalist effortless drape meets high-impact royal embellishment.',
    fabric: 'Black Pure Crepe Saree + Raw Silk Gold Zardozi Corset',
    drapeStyle: 'Complete 60-Second Ensemble',
    drapeWeight: 'Sculpted Silhouette',
    zariWork: 'Full Hand-Embroidered Zardozi Bodice',
    isCustomColorAvailable: false,
    sizeOptions: ['Waist 26 + Bust 32', 'Waist 28 + Bust 34', 'Waist 30 + Bust 36', 'Waist 32 + Bust 38', 'Custom Measurements'],
    images: {
      modelPhotos: [
        '/assets/saak_muse_black_saree_gold_corset.jpg',
        '/assets/saak_muse_black_corset_side.jpg'
      ],
      flatlayPhotos: [
        '/assets/saak_flatlay_copper_green.jpg'
      ],
      modelView: '/assets/saak_muse_black_saree_gold_corset.jpg',
      flatlayView: '/assets/saak_flatlay_copper_green.jpg',
      swatchZoom: '/assets/saak_muse_black_corset_side.jpg',
      gallery: [
        '/assets/saak_muse_black_saree_gold_corset.jpg',
        '/assets/saak_muse_black_corset_side.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ]
    },
    recommendedPairings: [],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'burnt-copper-tissue',
    name: 'Burnt Copper Metallic Tissue Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4900,
    originalPrice: 5600,
    tag: 'Festive Classic',
    tagColor: '#8C3B2B',
    description: 'Warm burnt copper and rust crushed tissue that catches golden hour light with unmatched luxury. Framed with an antique silver-gold zari border that drapes like liquid metal.',
    fabric: 'Dual-Tone Crushed Metallic Tissue',
    drapeStyle: 'Classic 6-Yard',
    drapeWeight: 'Light & Fluid',
    zariWork: 'Dual-Tone Antique Border',
    isCustomColorAvailable: true,
    availableCustomColors: [
      { name: 'Burnt Copper', hex: '#8C3B2B' },
      { name: 'Olive Green', hex: '#5B664B' },
      { name: 'Ivory Shimmer', hex: '#FAF6EF' }
    ],
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        '/assets/muse_copper_tissue.jpg'
      ],
      flatlayPhotos: [
        '/assets/saak_folded_copper_tissue.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ],
      modelView: '/assets/muse_copper_tissue.jpg',
      flatlayView: '/assets/saak_folded_copper_tissue.jpg',
      swatchZoom: '/assets/saak_flatlay_copper_green.jpg',
      gallery: [
        '/assets/muse_copper_tissue.jpg',
        '/assets/saak_folded_copper_tissue.jpg',
        '/assets/saak_flatlay_copper_green.jpg'
      ]
    },
    recommendedPairings: ['the-gold-corset'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: false
  }
];
