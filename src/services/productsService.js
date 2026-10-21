import { supabase, isSupabaseConfigured } from './supabaseClient';
import { initialProducts } from '../data/initialProducts';

const TABLE_NAME = 'products';

// Helper to convert database record (snake_case) to client model (camelCase)
function mapDbToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subCategory: row.sub_category,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    tag: row.tag || '',
    tagColor: row.tag_color || '#A34835',
    description: row.description || '',
    fabric: row.fabric || '',
    drapeStyle: row.drape_style || 'Classic 6-Yard',
    drapeWeight: row.drape_weight || 'Featherlight & Fluid',
    zariWork: row.zari_work || '',
    isCustomColorAvailable: Boolean(row.is_custom_color_available),
    availableCustomColors: row.available_custom_colors || [],
    sizeOptions: row.size_options || ['Standard 6-Yard'],
    images: {
      modelPhotos: row.model_photos || [row.model_view].filter(Boolean),
      flatlayPhotos: row.flatlay_photos || [row.flatlay_view].filter(Boolean),
      modelView: row.model_view || row.model_photos?.[0] || '/assets/muse_sunset_tissue.jpg',
      flatlayView: row.flatlay_view || row.flatlay_photos?.[0] || '/assets/saak_folded_copper_tissue.jpg',
      swatchZoom: row.swatch_zoom || row.flatlay_photos?.[1] || '/assets/saak_flatlay_copper_green.jpg',
      gallery: row.gallery || [...(row.model_photos || []), ...(row.flatlay_photos || [])]
    },
    recommendedPairings: row.recommended_pairings || ['the-gold-corset'],
    bundleDiscountPercent: row.bundle_discount_percent || 10,
    inStock: row.in_stock !== false,
    featured: Boolean(row.featured)
  };
}

// Helper to convert client model to database record
function mapProductToDb(product) {
  const modelPhotos = product.modelPhotos || product.images?.modelPhotos || [product.images?.modelView].filter(Boolean);
  const flatlayPhotos = product.flatlayPhotos || product.images?.flatlayPhotos || [product.images?.flatlayView].filter(Boolean);
  const gallery = product.gallery || product.images?.gallery || [...modelPhotos, ...flatlayPhotos];

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    sub_category: product.subCategory,
    price: Number(product.price),
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
    tag: product.tag || null,
    tag_color: product.tagColor || '#A34835',
    description: product.description || '',
    fabric: product.fabric || '',
    drape_style: product.drapeStyle || 'Classic 6-Yard',
    drape_weight: product.drapeWeight || 'Featherlight & Fluid',
    zari_work: product.zariWork || '',
    is_custom_color_available: Boolean(product.isCustomColorAvailable),
    available_custom_colors: product.availableCustomColors || [],
    size_options: product.sizeOptions || ['Standard 6-Yard'],
    model_photos: modelPhotos,
    flatlay_photos: flatlayPhotos,
    gallery: gallery,
    model_view: modelPhotos[0] || gallery[0] || '/assets/muse_sunset_tissue.jpg',
    flatlay_view: flatlayPhotos[0] || gallery[1] || gallery[0] || '/assets/saak_folded_copper_tissue.jpg',
    swatch_zoom: flatlayPhotos[1] || flatlayPhotos[0] || '/assets/saak_flatlay_copper_green.jpg',
    recommended_pairings: product.recommendedPairings || ['the-gold-corset'],
    bundle_discount_percent: product.bundleDiscountPercent || 10,
    in_stock: product.inStock !== false,
    featured: Boolean(product.featured),
    updated_at: new Date().toISOString()
  };
}

export async function fetchProductsFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching products from Supabase:', error.message);
      } else if (data && data.length > 0) {
        return data.map(mapDbToProduct);
      }
    } catch (err) {
      console.error('Failed to communicate with Supabase:', err);
    }
  }

  // Fallback to local storage or initial seed
  try {
    const saved = localStorage.getItem('saak_products_v6');
    return saved ? JSON.parse(saved) : initialProducts;
  } catch {
    return initialProducts;
  }
}

export async function saveProductToDb(product) {
  const dbRecord = mapProductToDb(product);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .upsert(dbRecord)
        .select()
        .single();

      if (error) {
        console.error('Error saving product to Supabase:', error.message);
      } else if (data) {
        return mapDbToProduct(data);
      }
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    }
  }

  return product;
}

export async function deleteProductFromDb(productId) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Failed to delete from Supabase:', err);
    }
  }
  return true;
}
