import { supabase, isSupabaseConfigured } from './supabaseClient';

const TABLE_NAME = 'orders';

export const SAMPLE_ORDERS = [
  {
    id: 'SAAK-89210',
    customer_name: 'Rhea Singhania',
    customer_phone: '+91 98201 44520',
    customer_email: 'rhea.singhania@gmail.com',
    shipping_address: 'Flat 14B, Sea Face Towers, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    styling_notes: 'Complimentary fall & pico requested. Preparing for Diwali cocktail drape.',
    items: [
      {
        id: 'saak-01',
        name: 'Sunset Copper Tissue Saree',
        category: 'sarees',
        price: 4500,
        selectedSize: 'One Size (6.5m)',
        customColor: null,
        quantity: 1,
        images: {
          modelView: '/assets/muse_copper_tissue.jpg',
          flatlayView: '/assets/saak_folded_copper_tissue.jpg'
        }
      },
      {
        id: 'saak-04',
        name: 'Sculpted Antique Gold Corset',
        category: 'blouses',
        price: 4000,
        selectedSize: 'M (34-36")',
        customColor: null,
        quantity: 1,
        images: {
          modelView: '/assets/saak_muse_black_saree_gold_corset.jpg',
          flatlayView: '/assets/saak_flatlay_copper_green.jpg'
        }
      }
    ],
    total_amount: 8500,
    utr_number: '429183019284',
    payment_method: 'Dynamic UPI QR',
    payment_screenshot_url: '/assets/saak_folded_copper_tissue.jpg',
    payment_status: 'succeeded',
    fulfillment_status: 'processing',
    verified_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    verified_by: 'Aprajita (Atelier Founder)',
    admin_notes: 'Bank ledger matched on HDFC NetBanking UPI portal. Fabric sent for hand-finishing fall.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'SAAK-90412',
    customer_name: 'Ananya Mehra',
    customer_phone: '+91 98112 55901',
    customer_email: 'ananya.mehra@outlook.com',
    shipping_address: 'B-42, Ring Road, Defence Colony',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110024',
    styling_notes: 'Need custom jade emerald border drape if possible. Event on 24th Oct.',
    items: [
      {
        id: 'saak-01',
        name: 'Sunset Copper Tissue Saree',
        category: 'sarees',
        price: 4500,
        selectedSize: 'One Size (6.5m)',
        customColor: { name: 'Royal Emerald', hex: '#004D40' },
        quantity: 1,
        images: {
          modelView: '/assets/muse_sunset_tissue.jpg',
          flatlayView: '/assets/saak_green_tissue_drape.jpg'
        }
      }
    ],
    total_amount: 4500,
    utr_number: '389104829104',
    payment_method: 'Direct UPI App',
    payment_screenshot_url: '/assets/muse_sunset_tissue.jpg',
    payment_status: 'pending_verification',
    fulfillment_status: 'unfulfilled',
    verified_at: null,
    verified_by: null,
    admin_notes: 'Awaiting admin cross-check against HDFC bank merchant statement.',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'SAAK-88341',
    customer_name: 'Tanvi Kapoor',
    customer_phone: '+91 99304 88129',
    customer_email: 'tanvi.kapoor@icloud.com',
    shipping_address: 'Plot 77, 12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    styling_notes: 'Sleeve alteration inquiry sent via WhatsApp.',
    items: [
      {
        id: 'saak-04',
        name: 'Sculpted Antique Gold Corset',
        category: 'blouses',
        price: 4000,
        selectedSize: 'S (32-34")',
        customColor: null,
        quantity: 1,
        images: {
          modelView: '/assets/saak_muse_black_corset_side.jpg',
          flatlayView: '/assets/saak_flatlay_copper_green.jpg'
        }
      }
    ],
    total_amount: 4000,
    utr_number: '000000000000',
    payment_method: 'Dynamic UPI QR',
    payment_screenshot_url: null,
    payment_status: 'failed',
    failure_reason: 'Invalid 12-digit UTR - Transaction not credited or rejected by remitting bank',
    fulfillment_status: 'cancelled',
    verified_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    verified_by: 'Atelier Audit System',
    admin_notes: 'Customer notified on WhatsApp to re-try payment or share valid bank reference.',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 'SAAK-87102',
    customer_name: 'Dr. Meera Nambiar',
    customer_phone: '+91 97401 22849',
    customer_email: 'meera.nambiar@aiims.edu',
    shipping_address: '9A Riverview Enclave, Boat Club Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    styling_notes: 'Pre-draped pleating request confirmed with Aprajita.',
    items: [
      {
        id: 'saak-01',
        name: 'Sunset Copper Tissue Saree',
        category: 'sarees',
        price: 4500,
        selectedSize: 'One Size (6.5m)',
        quantity: 1,
        images: {
          modelView: '/assets/muse_copper_tissue.jpg',
          flatlayView: '/assets/saak_folded_copper_tissue.jpg'
        }
      },
      {
        id: 'saak-02',
        name: 'Olive Twilight Tissue Saree',
        category: 'sarees',
        price: 4800,
        selectedSize: 'One Size (6.5m)',
        quantity: 1,
        images: {
          modelView: '/assets/muse_olive_tissue.jpg',
          flatlayView: '/assets/saak_green_tissue_drape.jpg'
        }
      }
    ],
    total_amount: 9300,
    utr_number: '291039481029',
    payment_method: 'Dynamic UPI QR',
    payment_screenshot_url: '/assets/muse_olive_tissue.jpg',
    payment_status: 'succeeded',
    fulfillment_status: 'shipped',
    tracking_number: 'BlueDart Express #BD-9041829',
    verified_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    verified_by: 'Aprajita (Atelier Founder)',
    admin_notes: 'Dispatched via premium insured courier with signature required.',
    created_at: new Date(Date.now() - 3600000 * 52).toISOString()
  },
  {
    id: 'SAAK-89945',
    customer_name: 'Priyanka Varma',
    customer_phone: '+91 98450 77120',
    customer_email: 'priyanka.varma@gmail.com',
    shipping_address: 'Villa 12, Palm Meadows, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    styling_notes: 'Prefers afternoon doorstep delivery. Cash on Delivery requested.',
    items: [
      {
        id: 'saak-02',
        name: 'Olive Twilight Tissue Saree',
        category: 'sarees',
        price: 4800,
        selectedSize: 'One Size (6.5m)',
        quantity: 1,
        images: {
          modelView: '/assets/muse_olive_tissue.jpg',
          flatlayView: '/assets/saak_green_tissue_drape.jpg'
        }
      }
    ],
    total_amount: 4800,
    utr_number: 'COD-PENDING',
    payment_method: 'Cash on Delivery (COD)',
    payment_screenshot_url: null,
    payment_status: 'cod_pending',
    fulfillment_status: 'unfulfilled',
    verified_at: null,
    verified_by: null,
    admin_notes: 'Cash on Delivery order. Awaiting concierge phone confirmation before hand-finishing fall & pico.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

/**
 * Fetch all client orders and transaction histories
 */
export async function fetchOrdersFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase orders fetch warning:', error.message);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Failed to communicate with Supabase orders table:', err);
    }
  }

  // LocalStorage fallback
  try {
    const local = localStorage.getItem('saak_orders_v2');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed sample orders if none exist
    localStorage.setItem('saak_orders_v2', JSON.stringify(SAMPLE_ORDERS));
    return SAMPLE_ORDERS;
  } catch (e) {
    return SAMPLE_ORDERS;
  }
}

/**
 * Save new customer order and payment verification details
 * @param {Object} orderData
 */
export async function saveOrderToDb(orderData) {
  const payload = {
    id: orderData.orderId || `SAAK-${Math.floor(10000 + Math.random() * 90000)}`,
    customer_name: orderData.fullName,
    customer_phone: orderData.phone,
    customer_email: orderData.email || null,
    shipping_address: orderData.address,
    city: orderData.city,
    state: orderData.state,
    pincode: orderData.pincode,
    styling_notes: orderData.stylingNotes || null,
    items: orderData.items || [],
    total_amount: Number(orderData.totalAmount),
    utr_number: orderData.utrNumber,
    payment_method: orderData.paymentMethod || 'Dynamic UPI QR',
    payment_screenshot_url: orderData.paymentScreenshotUrl || null,
    payment_status: orderData.paymentStatus || 'pending_verification',
    failure_reason: orderData.failureReason || null,
    fulfillment_status: orderData.fulfillmentStatus || 'unfulfilled',
    tracking_number: orderData.trackingNumber || null,
    admin_notes: orderData.adminNotes || null,
    verified_at: orderData.verifiedAt || null,
    verified_by: orderData.verifiedBy || null,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        // Also sync local
        syncLocalOrder(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to insert order into Supabase:', err);
    }
  }

  // Local storage save
  syncLocalOrder(payload);
  return payload;
}

function syncLocalOrder(newOrder) {
  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const filtered = existing.filter(o => o.id !== newOrder.id);
    filtered.unshift(newOrder);
    localStorage.setItem('saak_orders_v2', JSON.stringify(filtered));
  } catch (e) {}
}

/**
 * Update transaction status, failure reason, or fulfillment tracking
 * @param {string} orderId
 * @param {Object} updates
 */
export async function updateOrderStatusInDb(orderId, updates) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        updateLocalOrder(orderId, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }
  }

  // LocalStorage update
  return updateLocalOrder(orderId, updates);
}

function updateLocalOrder(orderId, updates) {
  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const updated = existing.map(o => {
      if (o.id === orderId) {
        return { ...o, ...updates };
      }
      return o;
    });
    localStorage.setItem('saak_orders_v2', JSON.stringify(updated));
    return updated.find(o => o.id === orderId);
  } catch (e) {
    return null;
  }
}

/**
 * Delete an order by ID (for admin maintenance)
 * @param {string} orderId
 */
export async function deleteOrderFromDb(orderId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(TABLE_NAME).delete().eq('id', orderId);
    } catch (err) {}
  }

  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const filtered = existing.filter(o => o.id !== orderId);
    localStorage.setItem('saak_orders_v2', JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    return [];
  }
}

/**
 * Reset orders to demo state
 */
export function resetOrdersToDefault() {
  localStorage.setItem('saak_orders_v2', JSON.stringify(SAMPLE_ORDERS));
  return SAMPLE_ORDERS;
}
