import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  sendOrderPlacedEmail, 
  sendOrderConfirmedEmail, 
  sendDispatchNotificationEmail, 
  sendOrderDeliveredEmail 
} from './emailService';

const TABLE_NAME = 'orders';

// Columns that exist on the live `orders` table before the fulfillment migration
const CORE_COLUMNS = [
  'id', 'customer_name', 'customer_phone', 'customer_email', 'shipping_address', 'city', 'state',
  'pincode', 'styling_notes', 'items', 'total_amount', 'utr_number', 'payment_screenshot_url',
  'payment_status', 'created_at'
];

const isMissingColumnError = (error) =>
  !!error && (error.code === 'PGRST204' || !!error.message?.includes('column'));

// Simulated admin test orders never trigger customer emails
export const isTestOrderId = (orderId) => String(orderId || '').startsWith('TEST-');

export const SAMPLE_ORDERS = [
  {
    id: 'SAAK-89210',
    customer_name: 'Rhea Singhania',
    customer_phone: '+91 98201 44520',
    customer_email: 'rhea.singhania@example.com',
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
    verified_by: 'Aprajita (Founder)',
    admin_notes: 'Bank ledger matched on HDFC NetBanking UPI portal. Fabric sent for hand-finishing fall.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'SAAK-90412',
    customer_name: 'Ananya Mehra',
    customer_phone: '+91 98112 55901',
    customer_email: 'ananya.mehra@example.com',
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
    customer_email: 'tanvi.kapoor@example.com',
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
    verified_by: 'Audit System',
    admin_notes: 'Customer notified on WhatsApp to re-try payment or share valid bank reference.',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 'SAAK-87102',
    customer_name: 'Dr. Meera Nambiar',
    customer_phone: '+91 97401 22849',
    customer_email: 'meera.nambiar@example.com',
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
    verified_by: 'Aprajita (Founder)',
    admin_notes: 'Dispatched via premium insured courier with signature required.',
    created_at: new Date(Date.now() - 3600000 * 52).toISOString()
  },
  {
    id: 'SAAK-89945',
    customer_name: 'Priyanka Varma',
    customer_phone: '+91 98450 77120',
    customer_email: 'priyanka.varma@example.com',
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
    admin_notes: 'Cash on Delivery order. Awaiting phone confirmation before hand-finishing fall & pico.',
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
      } else if (Array.isArray(data)) {
        // Overlay locally-tracked fields for columns the live table doesn't have yet
        const localById = new Map(readLocalOrders().map(o => [o.id, o]));
        return data.map(row => ({ ...(localById.get(row.id) || {}), ...row }));
      }
    } catch (err) {
      console.warn('Failed to communicate with Supabase orders table:', err);
    }
    // Supabase unreachable: show locally saved orders, but never demo samples
    return readLocalOrders();
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
    // Seed sample orders if none exist (demo mode only — Supabase not configured)
    localStorage.setItem('saak_orders_v2', JSON.stringify(SAMPLE_ORDERS));
    return SAMPLE_ORDERS;
  } catch {
    return SAMPLE_ORDERS;
  }
}

// Locally cached orders, excluding demo samples
function readLocalOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const sampleIds = new Set(SAMPLE_ORDERS.map(o => o.id));
    return Array.isArray(parsed) ? parsed.filter(o => o && !sampleIds.has(o.id)) : [];
  } catch {
    return [];
  }
}

/**
 * Save new customer order and payment verification details.
 * The returned order carries `persistedToDb` (true when stored in Supabase, or when
 * Supabase isn't configured and localStorage is the store of record).
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
    fulfillment_status: orderData.fulfillmentStatus || 'processing', // "processing" = in process
    tracking_number: orderData.trackingNumber || null,
    dispatch_details: orderData.dispatchDetails || null,
    admin_notes: orderData.adminNotes || null,
    verified_at: orderData.verifiedAt || null,
    verified_by: orderData.verifiedBy || null,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // Attempt full insert
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        syncLocalOrder({ ...payload, ...data });
        triggerOrderConfirmation(payload);
        return { ...payload, ...data, persistedToDb: true };
      }

      // If schema cache lacks newer columns (code PGRST204), fallback to core columns
      if (isMissingColumnError(error)) {
        const corePayload = {};
        CORE_COLUMNS.forEach(k => { corePayload[k] = payload[k]; });

        const { data: fallbackData, error: fallbackError } = await supabase
          .from(TABLE_NAME)
          .insert(corePayload)
          .select()
          .single();

        if (!fallbackError && fallbackData) {
          syncLocalOrder(payload);
          triggerOrderConfirmation(payload);
          return { ...payload, persistedToDb: true };
        }
        console.error('Supabase core-column order insert failed:', fallbackError);
      } else if (error) {
        console.error('Supabase order insert failed:', error);
      }
    } catch (err) {
      console.error('Failed to insert order into Supabase:', err);
    }

    // Supabase is the store of record but the order never reached it: keep a local copy only
    syncLocalOrder(payload);
    return { ...payload, persistedToDb: false };
  }

  // Local storage save (demo mode — Supabase not configured)
  syncLocalOrder(payload);
  triggerOrderConfirmation(payload);
  return { ...payload, persistedToDb: true };
}

// Background helper to dispatch Order Placed email without blocking checkout UI
function triggerOrderConfirmation(orderPayload) {
  if (orderPayload.customer_email && !isTestOrderId(orderPayload.id)) {
    setTimeout(() => {
      sendOrderPlacedEmail(orderPayload).catch(e => console.warn('Order placed email trigger error:', e));
    }, 100);
  }
}

function syncLocalOrder(newOrder) {
  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const filtered = existing.filter(o => o.id !== newOrder.id);
    filtered.unshift(newOrder);
    localStorage.setItem('saak_orders_v2', JSON.stringify(filtered));
  } catch {}
}

/**
 * Dispatch an order and notify patron with tracking details
 * @param {string} orderId
 * @param {Object} dispatchDetails - { courier, trackingNumber, trackingUrl, estimatedDelivery, notes }
 * @param {boolean} sendEmail
 */
export async function dispatchOrderInDb(orderId, dispatchDetails, sendEmail = true) {
  const courier = dispatchDetails.courier || 'Blue Dart Express';
  const trackingNumber = dispatchDetails.trackingNumber || 'Pending';
  const trackingStr = `${courier} #${trackingNumber}`;

  const updates = {
    fulfillment_status: 'dispatched',
    tracking_number: trackingStr,
    dispatch_details: {
      ...dispatchDetails,
      dispatched_at: new Date().toISOString()
    },
    admin_notes: `Dispatched via ${trackingStr} on ${new Date().toLocaleDateString('en-IN')}. ${dispatchDetails.notes || ''}`.trim()
  };

  const updatedOrder = await updateOrderStatusInDb(orderId, updates);

  if (sendEmail && updatedOrder && updatedOrder.customer_email && !isTestOrderId(orderId)) {
    try {
      await sendDispatchNotificationEmail(updatedOrder, dispatchDetails);
    } catch (err) {
      console.warn('Dispatch email notification failed:', err);
    }
  }

  return updatedOrder;
}

/**
 * Confirm an order (payment verified / in handcrafting) and send Order Confirmed email
 * @param {string} orderId
 * @param {string} adminNotes
 * @param {boolean} sendEmail
 */
export async function confirmOrderInDb(orderId, adminNotes = '', sendEmail = true) {
  const updates = {
    payment_status: 'succeeded',
    failure_reason: null,
    fulfillment_status: 'processing',
    verified_at: new Date().toISOString(),
    verified_by: 'Aprajita (Founder)',
    admin_notes: adminNotes || `Payment verified by admin on ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Saree sent for hand-finishing fall & pico.`
  };

  const updatedOrder = await updateOrderStatusInDb(orderId, updates);

  if (sendEmail && updatedOrder && updatedOrder.customer_email && !isTestOrderId(orderId)) {
    try {
      await sendOrderConfirmedEmail(updatedOrder);
    } catch (err) {
      console.warn('Order confirmed email notification failed:', err);
    }
  }

  return updatedOrder;
}

/**
 * Mark an order as delivered and send Order Delivered celebration email
 * @param {string} orderId
 * @param {boolean} sendEmail
 */
export async function deliverOrderInDb(orderId, sendEmail = true) {
  const updates = {
    fulfillment_status: 'delivered',
    delivered_at: new Date().toISOString(),
    admin_notes: `Marked delivered on ${new Date().toLocaleDateString('en-IN')}. Delivery celebration email dispatched.`
  };

  const updatedOrder = await updateOrderStatusInDb(orderId, updates);

  if (sendEmail && updatedOrder && updatedOrder.customer_email && !isTestOrderId(orderId)) {
    try {
      await sendOrderDeliveredEmail(updatedOrder);
    } catch (err) {
      console.warn('Order delivered email notification failed:', err);
    }
  }

  return updatedOrder;
}

/**
 * Update transaction status, failure reason, or fulfillment tracking
 * @param {string} orderId
 * @param {Object} updates
 */
/**
 * Returns the merged order. When Supabase is configured but some/all fields could not be
 * stored there (e.g. fulfillment columns not migrated yet), the result carries `_syncWarning`
 * and the change is kept locally on this device only.
 */
export async function updateOrderStatusInDb(orderId, updates) {
  if (isSupabaseConfigured && supabase) {
    let baseRow = null;
    let syncWarning = 'Saved on this device only — the database update failed.';
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        return updateLocalOrder(orderId, data, data);
      }

      // If schema cache lacks newer columns, retry with only the columns the live table has
      if (isMissingColumnError(error)) {
        const knownUpdates = {};
        Object.keys(updates).forEach(k => {
          if (CORE_COLUMNS.includes(k) && updates[k] !== undefined) knownUpdates[k] = updates[k];
        });
        const skipped = Object.keys(updates).filter(k => !(k in knownUpdates));
        syncWarning = `Saved on this device only — database is missing columns (${skipped.join(', ')}). Run the orders migration.`;

        if (Object.keys(knownUpdates).length > 0) {
          const { data: partialData, error: partialError } = await supabase
            .from(TABLE_NAME)
            .update(knownUpdates)
            .eq('id', orderId)
            .select()
            .single();
          if (!partialError && partialData) {
            baseRow = partialData;
            syncWarning = `Partially saved — ${Object.keys(knownUpdates).join(', ')} stored; ${skipped.join(', ')} kept on this device only. Run the orders migration.`;
          }
        }
      }

      if (!baseRow) {
        const { data: existingRow } = await supabase.from(TABLE_NAME).select('*').eq('id', orderId).maybeSingle();
        baseRow = existingRow || null;
      }
    } catch (err) {
      console.warn('Supabase update order error:', err);
    }

    const merged = updateLocalOrder(orderId, updates, baseRow);
    return merged ? { ...merged, _syncWarning: syncWarning } : null;
  }

  // LocalStorage update
  return updateLocalOrder(orderId, updates);
}

function updateLocalOrder(orderId, updates, baseRow = null) {
  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    let found = false;
    const updated = existing.map(o => {
      if (o.id === orderId) {
        found = true;
        return { ...o, ...(baseRow || {}), ...updates };
      }
      return o;
    });
    // Order lives only in the database: cache it locally so the update is remembered here
    if (!found && baseRow) updated.unshift({ ...baseRow, ...updates });
    localStorage.setItem('saak_orders_v2', JSON.stringify(updated));
    return updated.find(o => o.id === orderId) || null;
  } catch {
    return baseRow ? { ...baseRow, ...updates } : null;
  }
}

/**
 * Delete an order by ID (for admin maintenance)
 * @param {string} orderId
 */
export async function deleteOrderFromDb(orderId) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(TABLE_NAME).delete().eq('id', orderId).select();
    if (error || !data || data.length === 0) {
      // 0 rows deleted: either a local-only order, or RLS silently blocked the delete
      const { data: stillThere } = await supabase.from(TABLE_NAME).select('id').eq('id', orderId).maybeSingle();
      if (error || stillThere) {
        throw new Error('Delete failed — database permission missing');
      }
    }
  }

  try {
    const existing = JSON.parse(localStorage.getItem('saak_orders_v2') || '[]');
    const filtered = existing.filter(o => o.id !== orderId);
    localStorage.setItem('saak_orders_v2', JSON.stringify(filtered));
    return filtered;
  } catch {
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
