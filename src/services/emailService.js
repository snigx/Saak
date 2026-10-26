/**
 * SAAK BY APRAJITA — BESPOKE EMAIL NOTIFICATION SERVICE
 * Handles luxury transactional emails:
 * 1. Order Confirmation ("Your order is in process, dispatch details shortly")
 * 2. Dispatch & Tracking Notification (Courier partner, AWB, live tracking link, estimated delivery)
 * 
 * Supports Resend, Webhooks, EmailJS, and a built-in Atelier Outbox with HTML preview.
 */

const OUTBOX_STORAGE_KEY = 'saak_outbox_emails';

// Sender configuration (Can be set via .env or defaults to Aprajita's Atelier)
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL || 'orders@saakbyaprajita.com';
const SENDER_NAME = 'Saak by Aprajita Atelier';
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || null;
const EMAIL_WEBHOOK_URL = import.meta.env.VITE_EMAIL_WEBHOOK_URL || null;

/**
 * Generate luxury responsive HTML for Order Confirmation Email
 */
export function generateOrderConfirmationHtml(order) {
  const itemsListHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #EFEAE1; vertical-align: middle;">
        <div style="font-weight: 600; font-size: 14px; color: #1F1A17; margin-bottom: 3px;">
          ${item.name}
        </div>
        <div style="font-size: 12px; color: #7A726D;">
          Size: ${item.selectedSize || 'Standard'} ${item.customColor ? `• Custom Shade: ${item.customColor.name || item.customColor}` : ''}
        </div>
        <div style="font-size: 11px; color: #A34835; margin-top: 2px;">
          ✓ Includes Hand-Stitched Fall & Pico
        </div>
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid #EFEAE1; text-align: center; color: #4A423D; font-size: 13px; vertical-align: middle;">
        x${item.quantity || 1}
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid #EFEAE1; text-align: right; font-weight: 600; color: #1F1A17; font-size: 14px; vertical-align: middle;">
        ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak by Aprajita Order is Confirmed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 600px; width: 100%;">
          
          <!-- Atelier Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1F1A17 0%, #2A221E 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #C5A059;">
              <div style="color: #C5A059; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">
                Bespoke Festive Atelier
              </div>
              <h1 style="color: #FAF6EF; font-family: Georgia, serif; font-size: 28px; margin: 0 0 6px 0; font-weight: 400; letter-spacing: 0.04em;">
                Saak by Aprajita
              </h1>
              <div style="color: #D6CBC0; font-size: 12px; font-style: italic;">
                Fluid Drapes &amp; Sculpted Statements
              </div>
            </td>
          </tr>

          <!-- In-Process Notice Callout (Requested by User) -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4ECE1; border: 1px solid #E2CA9B; border-left: 4px solid #A34835; border-radius: 4px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="color: #A34835; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">
                      ⏳ ORDER STATUS: IN PROCESS
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #1F1A17; margin-bottom: 6px; font-family: Georgia, serif;">
                      Your order is in process. We will share the dispatch details shortly.
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #5C524B;">
                      Dear ${order.customer_name || 'Patron'}, Aprajita’s atelier has received your booking. Our artisans are currently inspecting your chosen pieces, preparing the hand-finished fall &amp; pico, and hand-packing your bespoke ensemble.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Meta -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 4px; padding: 16px 20px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A;">Order Reference:</span>
                    <strong style="font-size: 14px; color: #1F1A17; margin-left: 8px; font-family: monospace;">${order.id}</strong>
                  </td>
                  <td style="padding-bottom: 8px; text-align: right;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A;">Date:</span>
                    <span style="font-size: 13px; color: #1F1A17; margin-left: 6px;">${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A;">Payment Method:</span>
                    <span style="font-size: 13px; color: #1F1A17; margin-left: 6px;">${order.payment_method || 'Dynamic UPI'} (${order.payment_status === 'succeeded' ? 'Verified' : 'Pending Verification'})</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A;">UTR / Reference:</span>
                    <span style="font-size: 12px; color: #A34835; font-family: monospace; margin-left: 6px;">${order.utr_number || 'N/A'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 12px 32px 0 32px;">
              <h3 style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 12px 0; color: #1F1A17; font-weight: 400; border-bottom: 1px solid #E5DDCF; padding-bottom: 8px;">
                Your Atelier Selection
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr style="border-bottom: 1px solid #E5DDCF;">
                    <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; text-align: left; padding-bottom: 8px; font-weight: 600;">Item</th>
                    <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; text-align: center; padding-bottom: 8px; font-weight: 600;">Qty</th>
                    <th style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; text-align: right; padding-bottom: 8px; font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding-top: 16px; font-size: 14px; font-weight: 600; color: #1F1A17; text-align: right;">
                      Total Amount:
                    </td>
                    <td style="padding-top: 16px; font-size: 18px; font-weight: 700; color: #A34835; text-align: right;">
                      ₹${Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Shipping Destination -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 4px; padding: 16px 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; font-weight: 600; margin-bottom: 6px;">
                  📦 Shipping Destination
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #1F1A17; margin-bottom: 4px;">
                  ${order.customer_name}
                </div>
                <div style="font-size: 13px; line-height: 1.5; color: #5C524B;">
                  ${order.shipping_address}<br />
                  ${order.city}, ${order.state} — ${order.pincode}<br />
                  Phone: ${order.customer_phone}
                </div>
                ${order.styling_notes ? `
                  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #EFEAE1; font-size: 12px; color: #7A726D; font-style: italic;">
                    <strong>Styling Notes:</strong> ${order.styling_notes}
                  </div>
                ` : ''}
              </div>
            </td>
          </tr>

          <!-- Footer / Atelier Concierge -->
          <tr>
            <td style="background: #F2ECE0; padding: 24px 32px; text-align: center; border-top: 1px solid #E5DDCF;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #4A423D; line-height: 1.5;">
                Need custom styling assistance or bespoke blouse adjustments?<br />
                Our atelier concierge is available on WhatsApp at <strong style="color: #A34835;">+91 62676 64409</strong>.
              </p>
              <div style="margin-top: 14px; font-size: 11px; color: #8A817A;">
                © ${new Date().getFullYear()} Saak by Aprajita. Fluid Drapes &amp; Sculpted Statements.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate luxury responsive HTML for Order Dispatched & Tracking Email
 */
export function generateDispatchNotificationHtml(order, dispatchDetails) {
  const courier = dispatchDetails.courier || 'Blue Dart Express';
  const trackingNumber = dispatchDetails.trackingNumber || dispatchDetails.tracking_number || 'Pending';
  const trackingUrl = dispatchDetails.trackingUrl || dispatchDetails.tracking_url || 'https://www.bluedart.com';
  const estimatedDelivery = dispatchDetails.estimatedDelivery || dispatchDetails.estimated_delivery || '3-5 Business Days';
  const notes = dispatchDetails.notes || 'Your saree has been hand-pressed and packaged in our luxury keepsake box.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak by Aprajita Order Has Been Dispatched!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 600px; width: 100%;">
          
          <!-- Atelier Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1F1A17 0%, #2A221E 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #C5A059;">
              <div style="color: #C5A059; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">
                Atelier Shipment Notification
              </div>
              <h1 style="color: #FAF6EF; font-family: Georgia, serif; font-size: 28px; margin: 0 0 6px 0; font-weight: 400; letter-spacing: 0.04em;">
                Your Order is on the Way
              </h1>
              <div style="color: #D6CBC0; font-size: 12px; font-style: italic;">
                Order Reference: ${order.id}
              </div>
            </td>
          </tr>

          <!-- Main Announcement Card -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 32px; margin-bottom: 8px;">🚚✨</div>
                <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1F1A17; margin: 0 0 8px 0; font-weight: 400;">
                  Dispatched from the Studio
                </h2>
                <p style="font-size: 14px; line-height: 1.6; color: #5C524B; margin: 0; max-width: 480px; display: inline-block;">
                  Dear ${order.customer_name || 'Patron'}, your bespoke drapes have been completed, inspected by Aprajita, and dispatched with our insured courier partner.
                </p>
              </div>

              <!-- Tracking Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border: 1px solid #E2CA9B; border-radius: 6px; padding: 22px; box-shadow: 0 4px 12px rgba(197,160,89,0.08); margin-bottom: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A817A; font-weight: 600;">
                            Courier Partner:
                          </div>
                          <div style="font-size: 16px; font-weight: 700; color: #1F1A17; margin-top: 2px;">
                            ${courier}
                          </div>
                        </td>
                        <td style="padding-bottom: 12px; text-align: right;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A817A; font-weight: 600;">
                            Estimated Delivery:
                          </div>
                          <div style="font-size: 15px; font-weight: 700; color: #A34835; margin-top: 2px;">
                            ${estimatedDelivery}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 8px; border-top: 1px dashed #EFEAE1;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A817A; font-weight: 600;">
                            Consignment / AWB Tracking Number:
                          </div>
                          <div style="font-size: 18px; font-weight: 700; color: #1F1A17; font-family: monospace; letter-spacing: 0.05em; margin-top: 4px;">
                            ${trackingNumber}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-top: 22px;">
                      <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: #1F1A17; color: #FAF6EF; text-decoration: none; padding: 13px 32px; border-radius: 3px; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; box-shadow: 0 4px 12px rgba(31,26,23,0.2);">
                        Track Your Shipment &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Dispatch Note -->
              ${notes ? `
                <div style="background: #F4ECE1; border-left: 3px solid #C5A059; padding: 12px 16px; border-radius: 0 4px 4px 0; font-size: 12px; color: #5C524B; line-height: 1.5; margin-bottom: 24px;">
                  <strong style="color: #1F1A17;">Atelier Dispatch Note:</strong> ${notes}
                </div>
              ` : ''}

              <!-- Items in this shipment -->
              <div style="background: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 4px; padding: 16px 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; font-weight: 600; margin-bottom: 8px;">
                  Items In This Package (${(order.items || []).length}):
                </div>
                ${(order.items || []).map(it => `
                  <div style="font-size: 13px; color: #1F1A17; margin-bottom: 4px;">
                    • <strong>${it.name}</strong> (${it.selectedSize || 'Standard'}) x${it.quantity || 1}
                  </div>
                `).join('')}
                <div style="font-size: 12px; color: #7A726D; margin-top: 10px; padding-top: 8px; border-top: 1px solid #EFEAE1;">
                  Delivering to: ${order.shipping_address}, ${order.city}, ${order.state} — ${order.pincode}
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #F2ECE0; padding: 24px 32px; text-align: center; border-top: 1px solid #E5DDCF;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #4A423D; line-height: 1.5;">
                Have questions about your delivery? Message our team directly on WhatsApp at <strong style="color: #A34835;">+91 62676 64409</strong>.
              </p>
              <div style="margin-top: 14px; font-size: 11px; color: #8A817A;">
                © ${new Date().getFullYear()} Saak by Aprajita. Fluid Drapes &amp; Sculpted Statements.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send Order Confirmation Email
 * @param {Object} order
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.customer_email) {
    console.info('[EmailService] Order has no customer_email, skipping confirmation email.');
    return { success: false, reason: 'No recipient email' };
  }

  const subject = `✨ Your Saak by Aprajita Order is Confirmed (${order.id})`;
  const html = generateOrderConfirmationHtml(order);

  const emailPayload = {
    id: `email_${Date.now()}_conf`,
    type: 'order_confirmation',
    orderId: order.id,
    to: order.customer_email,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    subject,
    html,
    sentAt: new Date().toISOString(),
    status: 'delivered'
  };

  // 1. Deliver via Resend API if configured
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [order.customer_email],
          subject,
          html
        })
      });
      const data = await res.json();
      emailPayload.providerResponse = data;
    } catch (err) {
      console.warn('[EmailService] Resend API error:', err);
    }
  }

  // 2. Deliver via Webhook if configured
  if (EMAIL_WEBHOOK_URL) {
    try {
      await fetch(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn('[EmailService] Webhook error:', err);
    }
  }

  // 3. Record in Atelier Outbox (for local admin inspection & preview)
  recordOutboxEmail(emailPayload);
  console.info(`[EmailService] Order confirmation email dispatched to ${order.customer_email} for order ${order.id}`);

  return { success: true, payload: emailPayload };
}

/**
 * Send Dispatch & Tracking Notification Email
 * @param {Object} order
 * @param {Object} dispatchDetails
 */
export async function sendDispatchNotificationEmail(order, dispatchDetails) {
  if (!order || !order.customer_email) {
    console.info('[EmailService] Order has no customer_email, skipping dispatch email.');
    return { success: false, reason: 'No recipient email' };
  }

  const subject = `🚚 Dispatched: Your Saak by Aprajita Order ${order.id} is on the way!`;
  const html = generateDispatchNotificationHtml(order, dispatchDetails);

  const emailPayload = {
    id: `email_${Date.now()}_disp`,
    type: 'order_dispatched',
    orderId: order.id,
    to: order.customer_email,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    subject,
    html,
    courier: dispatchDetails.courier,
    trackingNumber: dispatchDetails.trackingNumber,
    sentAt: new Date().toISOString(),
    status: 'delivered'
  };

  // 1. Deliver via Resend API if configured
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [order.customer_email],
          subject,
          html
        })
      });
      const data = await res.json();
      emailPayload.providerResponse = data;
    } catch (err) {
      console.warn('[EmailService] Resend API error:', err);
    }
  }

  // 2. Deliver via Webhook if configured
  if (EMAIL_WEBHOOK_URL) {
    try {
      await fetch(EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn('[EmailService] Webhook error:', err);
    }
  }

  // 3. Record in Atelier Outbox
  recordOutboxEmail(emailPayload);
  console.info(`[EmailService] Dispatch tracking email sent to ${order.customer_email} with tracking ${dispatchDetails.trackingNumber}`);

  return { success: true, payload: emailPayload };
}

/**
 * Fetch all logged emails in the Atelier Outbox
 */
export function getOutboxEmails() {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record an email into the Outbox store
 */
function recordOutboxEmail(entry) {
  try {
    const existing = getOutboxEmails();
    existing.unshift(entry);
    // Keep last 50 emails
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to record email in outbox:', e);
  }
}
