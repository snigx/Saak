const CDN_BASE = 'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media';

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
        `${CDN_BASE}/blouses/the-gold-corset/model_front.jpg`,
        `${CDN_BASE}/blouses/the-gold-corset/model_side.jpg`
      ],
      flatlayPhotos: [
        '/assets/gold_corset_flatlay.jpg'
      ],
      modelView: `${CDN_BASE}/blouses/the-gold-corset/model_front.jpg`,
      flatlayView: '/assets/gold_corset_flatlay.jpg',
      swatchZoom: `${CDN_BASE}/blouses/the-gold-corset/model_side.jpg`,
      gallery: [
        `${CDN_BASE}/blouses/the-gold-corset/model_front.jpg`,
        `${CDN_BASE}/blouses/the-gold-corset/model_side.jpg`,
        '/assets/gold_corset_flatlay.jpg'
      ]
    },
    recommendedPairings: ['midnight-black-crepe-saree', 'sunset-orange-tissue', 'olive-bloom-tissue', 'seafoam-emerald-tissue', 'sunshine-marigold-tissue', 'pearl-ivory-geometric-tissue'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'the-ivory-raw-silk-blouse',
    name: 'The Ivory Raw Silk Sculpted Blouse',
    category: 'blouses',
    subCategory: 'blouse',
    price: 3850,
    originalPrice: 4400,
    tag: 'Essential Minimalist',
    tagColor: '#C5A059',
    description: 'A masterclass in understated elegance. Tailored from premium pure raw silk in warm champagne ivory, featuring a sculpted plunging V-neckline, broad comfortable straps, and neat under-bust darting. Designed as the ultimate versatile companion to contrast and elevate fluid metallic tissue sarees.',
    fabric: 'Pure Raw Silk / Dupion with Subtle Slub Texture',
    drapeStyle: 'Sleeveless Tailored V-Neck Blouse',
    drapeWeight: 'Lightweight & Structured',
    zariWork: 'Minimalist Clean Edges with Gold Stitch Accents',
    isCustomColorAvailable: true,
    availableCustomColors: [
      { name: 'Champagne Ivory', hex: '#F7F3EA' },
      { name: 'Warm Sand', hex: '#E5DAC8' },
      { name: 'Midnight Black', hex: '#1F1A17' }
    ],
    sizeOptions: ['XS (Bust 32)', 'S (Bust 34)', 'M (Bust 36)', 'L (Bust 38)', 'XL (Bust 40)', 'Custom Bespoke'],
    isPadded: true,
    hasMargins: true,
    images: {
      modelPhotos: [
        `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg`,
        '/assets/black_saree_ivory_blouse_model.jpg'
      ],
      flatlayPhotos: [
        `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/flatlay.jpg`
      ],
      modelView: `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg`,
      flatlayView: `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/flatlay.jpg`,
      swatchZoom: '/assets/black_saree_ivory_blouse_model.jpg',
      gallery: [
        `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg`,
        '/assets/black_saree_ivory_blouse_model.jpg',
        `${CDN_BASE}/blouses/the-ivory-raw-silk-blouse/flatlay.jpg`
      ]
    },
    recommendedPairings: ['midnight-black-crepe-saree', 'sunset-orange-tissue', 'olive-bloom-tissue', 'seafoam-emerald-tissue'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'the-sunshine-marigold-blouse',
    name: 'The Sunshine Marigold Silk Blouse',
    category: 'blouses',
    subCategory: 'blouse',
    price: 3950,
    originalPrice: 4600,
    tag: 'Monochrome Haldi Statement',
    tagColor: '#D49B00',
    description: 'Tailored from pure chanderi raw silk in radiant sunshine marigold. Features an architectural high-neck collar with an artisanal statement bow-tie front and clean-cut sleeves. Perfectly matched in shade and weave with our Sunshine Marigold Saree.',
    fabric: 'Pure Chanderi Raw Silk',
    drapeStyle: 'Structured Bow-Neck Blouse with Fitted Darting',
    drapeWeight: 'Lightweight & Structured',
    zariWork: 'Tonal Edge Stitching with Gold Button Accents',
    isCustomColorAvailable: false,
    availableCustomColors: [],
    sizeOptions: ['XS (Bust 32)', 'S (Bust 34)', 'M (Bust 36)', 'L (Bust 38)', 'XL (Bust 40)', 'Custom Bespoke'],
    isPadded: true,
    hasMargins: true,
    images: {
      modelPhotos: [
        `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/model_front.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/flatlay.jpg`
      ],
      modelView: `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/model_front.jpg`,
      flatlayView: `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/flatlay.jpg`,
      swatchZoom: `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/flatlay.jpg`,
      gallery: [
        `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/model_front.jpg`,
        `${CDN_BASE}/blouses/the-sunshine-marigold-blouse/flatlay.jpg`
      ]
    },
    recommendedPairings: ['sunshine-marigold-tissue'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'the-ivory-gold-striped-blouse',
    name: 'The Ivory & Gold Striped Zari Blouse',
    category: 'blouses',
    subCategory: 'blouse',
    price: 3950,
    originalPrice: 4650,
    tag: 'Original Runway Pairing',
    tagColor: '#C5A059',
    description: 'The authentic signature pairing shown with our Pearl Ivory Architectural Zari Saree. Tailored from lustrous pure silk blend in soft ivory, accented with fine horizontal metallic gold zari stripes. Features an elegant boat-round neckline, elbow-length sleeves, and structured comfort fit.',
    fabric: 'Pure Silk & Woven Metallic Gold Zari',
    drapeStyle: 'Structured Boat-Neck Blouse with Elbow Sleeves',
    drapeWeight: 'Lightweight & Structured',
    zariWork: 'Fine Horizontal Woven Gold Zari Pinstripes',
    isCustomColorAvailable: false,
    availableCustomColors: [],
    sizeOptions: ['XS (Bust 32)', 'S (Bust 34)', 'M (Bust 36)', 'L (Bust 38)', 'XL (Bust 40)', 'Custom Bespoke'],
    isPadded: true,
    hasMargins: true,
    images: {
      modelPhotos: [
        `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/model_front.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/flatlay.jpg`
      ],
      modelView: `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/model_front.jpg`,
      flatlayView: `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/flatlay.jpg`,
      swatchZoom: `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/flatlay.jpg`,
      gallery: [
        `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/model_front.jpg`,
        `${CDN_BASE}/blouses/the-ivory-gold-striped-blouse/flatlay.jpg`
      ]
    },
    recommendedPairings: ['pearl-ivory-geometric-tissue'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'midnight-black-crepe-saree',
    name: 'Midnight Black Fluid Crepe Saree',
    category: 'sarees',
    subCategory: 'crepe',
    price: 3950,
    originalPrice: 4500,
    tag: 'Pre-Draped Fluid Crepe',
    tagColor: '#1A1614',
    description: 'Sculpted from pure featherlight fluid crepe in deep obsidian black. Falls in effortless, liquid drapes with a modern, sensual minimalist silhouette. Designed to provide high-impact contrast with heavy statement corsets or tailored raw silk blouses.',
    fabric: 'Pure Featherlight Fluid Crepe',
    drapeStyle: 'Classic 6-Yard (Optional Pre-Stitched Pleats)',
    drapeWeight: 'Ultra-Fluid, Sensual & Weightless',
    zariWork: 'Minimalist Clean Edges with Micro Gold Piping',
    isCustomColorAvailable: false,
    availableCustomColors: [],
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        `${CDN_BASE}/sarees/midnight-black-crepe-saree/model_front.jpg`,
        '/assets/saak_muse_black_corset_side.jpg'
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/midnight-black-crepe-saree/flatlay_folded.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/midnight-black-crepe-saree/model_front.jpg`,
      flatlayView: `${CDN_BASE}/sarees/midnight-black-crepe-saree/flatlay_folded.jpg`,
      swatchZoom: '/assets/saak_muse_black_corset_side.jpg',
      gallery: [
        `${CDN_BASE}/sarees/midnight-black-crepe-saree/model_front.jpg`,
        '/assets/saak_muse_black_corset_side.jpg',
        '/assets/signature_duo_black_gold_flatlay.jpg'
      ]
    },
    recommendedPairings: ['the-gold-corset', 'the-ivory-raw-silk-blouse'],
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
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_drape.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_copper.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/sunset-orange-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/swatch_texture.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/sunset-orange-tissue/model_front.jpg`,
      flatlayView: `${CDN_BASE}/sarees/sunset-orange-tissue/flatlay_folded.jpg`,
      swatchZoom: `${CDN_BASE}/sarees/sunset-orange-tissue/swatch_texture.jpg`,
      gallery: [
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_drape.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/model_copper.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/sunset-orange-tissue/swatch_texture.jpg`
      ]
    },
    recommendedPairings: ['the-gold-corset', 'the-ivory-raw-silk-blouse'],
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
        `${CDN_BASE}/sarees/olive-bloom-tissue/model_front.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/olive-bloom-tissue/flatlay_drape.jpg`,
        `${CDN_BASE}/sarees/olive-bloom-tissue/swatch_swirl.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/olive-bloom-tissue/model_front.jpg`,
      flatlayView: `${CDN_BASE}/sarees/olive-bloom-tissue/flatlay_drape.jpg`,
      swatchZoom: `${CDN_BASE}/sarees/olive-bloom-tissue/swatch_swirl.jpg`,
      gallery: [
        `${CDN_BASE}/sarees/olive-bloom-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/olive-bloom-tissue/flatlay_drape.jpg`,
        `${CDN_BASE}/sarees/olive-bloom-tissue/swatch_swirl.jpg`
      ]
    },
    recommendedPairings: ['the-gold-corset', 'the-ivory-raw-silk-blouse'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'seafoam-emerald-tissue',
    name: 'Seafoam Emerald Shimmer Tissue Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4750,
    originalPrice: 5400,
    tag: 'Festive Dual-Tone Weave',
    tagColor: '#2E8B75',
    description: 'Artisanal crushed metallic shimmer tissue saree in layered vertical ombre stripes of turquoise teal, vibrant emerald green, and mint seafoam. Embellished with delicate hand-embroidered gold zari butis and framed by an ornate antique Banarasi floral zari jaal border. Lightweight, luminous, and draped with effortless grace.',
    fabric: 'Crushed Metallic Shimmer Tissue Silk',
    drapeStyle: 'Classic 6-Yard (Fall & Pico Included)',
    drapeWeight: 'Featherlight, Fluid & Radiant',
    zariWork: 'Banarasi Antique Gold Zari Floral Border & Buti Weave',
    isCustomColorAvailable: false,
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/model_ivory.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/swatch_texture.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/seafoam-emerald-tissue/model_front.jpg`,
      flatlayView: `${CDN_BASE}/sarees/seafoam-emerald-tissue/flatlay_folded.jpg`,
      swatchZoom: `${CDN_BASE}/sarees/seafoam-emerald-tissue/swatch_texture.jpg`,
      gallery: [
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/model_ivory.jpg`,
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/seafoam-emerald-tissue/swatch_texture.jpg`
      ]
    },
    recommendedPairings: ['the-gold-corset', 'the-ivory-raw-silk-blouse'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'sunshine-marigold-tissue',
    name: 'Sunshine Marigold Striped Tissue Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4650,
    originalPrice: 5200,
    tag: 'Festive Haldi Radiance',
    tagColor: '#D49B00',
    description: 'Radiant sunshine marigold saree handcrafted in fine metallic shimmer tissue and chanderi silk. Woven with subtle translucent alternating vertical and horizontal stripes, finished with delicate gold zari accents and hand-knotted pallu tassels. Luminous, airy, and celebratory.',
    fabric: 'Chanderi Shimmer Tissue Silk with Alternating Sheer Stripes',
    drapeStyle: 'Classic 6-Yard (Fall & Pico Included)',
    drapeWeight: 'Featherlight, Crisp & Fluid',
    zariWork: 'Fine Gold Zari Accent Border with Hand-Tied Tassels',
    isCustomColorAvailable: false,
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/model_gold.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/swatch_texture.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/sunshine-marigold-tissue/model_front.jpg`,
      flatlayView: `${CDN_BASE}/sarees/sunshine-marigold-tissue/flatlay_folded.jpg`,
      swatchZoom: `${CDN_BASE}/sarees/sunshine-marigold-tissue/swatch_texture.jpg`,
      gallery: [
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/model_front.jpg`,
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/model_gold.jpg`,
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/sunshine-marigold-tissue/swatch_texture.jpg`
      ]
    },
    recommendedPairings: ['the-sunshine-marigold-blouse', 'the-gold-corset'],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  },
  {
    id: 'pearl-ivory-geometric-tissue',
    name: 'Pearl Ivory Architectural Zari Saree',
    category: 'sarees',
    subCategory: 'tissue',
    price: 4950,
    originalPrice: 5600,
    tag: 'Sculpted Dual-Tone Border',
    tagColor: '#C49A2C',
    description: 'Ethereal translucent pearl ivory organza tissue saree illuminated by delicate handwoven silver and gold floral butis. Grounded by a statement architectural border in mustard yellow and antique gold zari featuring sculptural circular loop chain motifs. Featherlight, structured, and modern.',
    fabric: 'Pure Translucent Organza Tissue Silk with Handwoven Butis',
    drapeStyle: 'Classic 6-Yard (Fall & Pico Included)',
    drapeWeight: 'Featherlight, Ethereal & Sculpted',
    zariWork: 'Mustard Yellow & Antique Gold Geometric Chain Border',
    isCustomColorAvailable: false,
    availableCustomColors: [],
    sizeOptions: ['Standard 6-Yard', 'Pre-Pleated Fall & Pico (+₹450)'],
    images: {
      modelPhotos: [
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg`,
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/model_drape_muse.jpg`
      ],
      flatlayPhotos: [
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg`
      ],
      modelView: `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg`,
      flatlayView: `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg`,
      swatchZoom: `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg`,
      gallery: [
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg`,
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/model_drape_muse.jpg`,
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg`,
        `${CDN_BASE}/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg`
      ]
    },
    recommendedPairings: ['the-ivory-gold-striped-blouse', 'the-gold-corset'],
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
        `${CDN_BASE}/sets/signature-duo-black-gold/model_front.jpg`,
        `${CDN_BASE}/sets/signature-duo-black-gold/model_side.jpg`
      ],
      flatlayPhotos: [
        '/assets/signature_duo_black_gold_flatlay.jpg'
      ],
      modelView: `${CDN_BASE}/sets/signature-duo-black-gold/model_front.jpg`,
      flatlayView: '/assets/signature_duo_black_gold_flatlay.jpg',
      swatchZoom: `${CDN_BASE}/sets/signature-duo-black-gold/model_side.jpg`,
      gallery: [
        `${CDN_BASE}/sets/signature-duo-black-gold/model_front.jpg`,
        `${CDN_BASE}/sets/signature-duo-black-gold/model_side.jpg`,
        '/assets/signature_duo_black_gold_flatlay.jpg'
      ]
    },
    recommendedPairings: [],
    bundleDiscountPercent: 10,
    inStock: true,
    featured: true
  }
];
