/**
 * SAAK BY APRAJITA — BESPOKE EMAIL NOTIFICATION SERVICE
 * Handles luxury transactional emails across the full customer lifecycle:
 * 1. Order Placed ("Your booking is received, payment verification in progress")
 * 2. Order Confirmed ("Your payment is verified and ensemble is in handcrafting")
 * 3. Order Dispatched & Tracking ("Dispatched from studio with courier & AWB tracking")
 * 4. Order Delivered ("Your bespoke parcel has arrived, styling & care notes")
 * 
 * Delivers via /api/send-email (Gmail SMTP with App Password) with built-in Email Outbox preview.
 */

const OUTBOX_STORAGE_KEY = 'saak_outbox_emails';

// Sender configuration
export const SENDER_EMAIL = 'Saakbyaprajita@gmail.com';
export const SENDER_NAME = 'Saak by Aprajita';

/**
 * Common HTML email header wrapper
 */
function renderEmailHeader(subtitle, title, refText) {
  return `
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1F1A17 0%, #2A221E 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #C5A059;">
        <div style="color: #C5A059; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">
          ${subtitle}
        </div>
        <h1 style="color: #FAF6EF; font-family: Georgia, serif; font-size: 28px; margin: 0 0 6px 0; font-weight: 400; letter-spacing: 0.04em;">
          Saak by Aprajita
        </h1>
        <div style="color: #D6CBC0; font-size: 12px; font-style: italic;">
          Fluid Drapes &amp; Sculpted Statements
        </div>
        ${refText ? `<div style="color: #E2CA9B; font-size: 11px; margin-top: 10px; font-family: monospace; letter-spacing: 0.08em;">${refText}</div>` : ''}
      </td>
    </tr>
  `;
}

/**
 * Common HTML email footer wrapper
 */
function renderEmailFooter() {
  return `
    <!-- Footer / Concierge -->
    <tr>
      <td style="background: #F2ECE0; padding: 24px 32px; text-align: center; border-top: 1px solid #E5DDCF;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #4A423D; line-height: 1.5;">
          Need bespoke styling assistance or drape adjustments?<br />
          Our concierge is available on WhatsApp at <strong style="color: #A34835;">+91 62676 64409</strong> or via email at <strong style="color: #A34835;">Saakbyaprajita@gmail.com</strong>.
        </p>
        <div style="margin-top: 14px; font-size: 11px; color: #8A817A;">
          © ${new Date().getFullYear()} Saak by Aprajita. Fluid Drapes &amp; Sculpted Statements.
        </div>
      </td>
    </tr>
  `;
}

/**
 * Items list table rows HTML
 */
function renderItemsListRows(items = []) {
  return items.map(item => `
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
}

// =============================================================================
// 1. ORDER PLACED EMAIL TEMPLATE
// =============================================================================
export function generateOrderPlacedHtml(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Placed — Saak by Aprajita</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 600px; width: 100%;">
          
          ${renderEmailHeader('Bespoke Festive Collection', 'Saak by Aprajita', `Order Reference: ${order.id}`)}

          <!-- Status Notice Callout -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4ECE1; border: 1px solid #E2CA9B; border-left: 4px solid #C5A059; border-radius: 4px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="color: #A34835; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">
                      ✨ ORDER RECEIVED
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #1F1A17; margin-bottom: 6px; font-family: Georgia, serif;">
                      Thank you for placing your order with Saak by Aprajita
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #5C524B;">
                      Dear ${order.customer_name || 'Patron'}, we have received your booking. Our studio team is currently reviewing your payment details. You will receive an official confirmation email as soon as our artisans begin hand-finishing your ensemble.
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
                    <span style="font-size: 13px; color: #1F1A17; margin-left: 6px;">${order.payment_method || 'Dynamic UPI'}</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A;">UTR / Reference:</span>
                    <span style="font-size: 12px; color: #A34835; font-family: monospace; margin-left: 6px;">${order.utr_number || 'Pending'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 12px 32px 0 32px;">
              <h3 style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 12px 0; color: #1F1A17; font-weight: 400; border-bottom: 1px solid #E5DDCF; padding-bottom: 8px;">
                Your Order Selection
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
                  ${renderItemsListRows(order.items)}
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
                  📦 Delivery Destination
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

          ${renderEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// =============================================================================
// 2. ORDER CONFIRMED EMAIL TEMPLATE
// =============================================================================
export function generateOrderConfirmedHtml(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmed & In Handcrafting — Saak by Aprajita</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 600px; width: 100%;">
          
          ${renderEmailHeader('Handcrafting Confirmation', 'Saak by Aprajita', `Order Reference: ${order.id}`)}

          <!-- Status Callout -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #F4ECE1; border: 1px solid #E2CA9B; border-left: 4px solid #A34835; border-radius: 4px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="color: #A34835; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">
                      💛 PAYMENT VERIFIED • ORDER CONFIRMED
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: #1F1A17; margin-bottom: 6px; font-family: Georgia, serif;">
                      Your bespoke ensemble is now in handcrafting
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #5C524B;">
                      Dear ${order.customer_name || 'Patron'}, your payment of <strong>₹${Number(order.total_amount).toLocaleString('en-IN')}</strong> has been successfully verified by Aprajita. Our master artisans are now inspecting your fabrics, preparing the hand-stitched fall &amp; pico, and hand-packing your luxury keepsake box.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Overview -->
          <tr>
            <td style="padding: 16px 32px 0 32px;">
              <h3 style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 12px 0; color: #1F1A17; font-weight: 400; border-bottom: 1px solid #E5DDCF; padding-bottom: 8px;">
                Confirmed Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tbody>
                  ${renderItemsListRows(order.items)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Next Steps Timeline Box -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 4px; padding: 18px 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; font-weight: 600; margin-bottom: 10px;">
                  🗓️ What Happens Next?
                </div>
                <div style="font-size: 13px; color: #4A423D; line-height: 1.6;">
                  1. <strong>Handcrafting:</strong> 24-48 hours for hand-finishing fall &amp; pico.<br />
                  2. <strong>Dispatch:</strong> Shipped via premium insured air courier with live tracking.<br />
                  3. <strong>Notification:</strong> You will receive an SMS and email with courier AWB tracking as soon as it leaves our studio.
                </div>
              </div>
            </td>
          </tr>

          ${renderEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// =============================================================================
// 3. ORDER DISPATCHED EMAIL TEMPLATE
// =============================================================================
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
          
          ${renderEmailHeader('Shipment Notification', 'Saak by Aprajita', `Order Reference: ${order.id}`)}

          <!-- Announcement -->
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
                  <strong style="color: #1F1A17;">Dispatch Note:</strong> ${notes}
                </div>
              ` : ''}

              <!-- Items in this shipment -->
              <div style="background: #FFFFFF; border: 1px solid #EDE5D8; border-radius: 4px; padding: 16px 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A817A; font-weight: 600; margin-bottom: 8px;">
                  Delivering To:
                </div>
                <div style="font-size: 13px; color: #1F1A17; line-height: 1.5;">
                  <strong>${order.customer_name}</strong><br />
                  ${order.shipping_address}, ${order.city}, ${order.state} — ${order.pincode}
                </div>
              </div>
            </td>
          </tr>

          ${renderEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// =============================================================================
// 4. ORDER DELIVERED EMAIL TEMPLATE
// =============================================================================
export function generateOrderDeliveredHtml(order) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak by Aprajita Parcel Has Arrived!</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 600px; width: 100%;">
          
          ${renderEmailHeader('Delivery Celebration', 'Saak by Aprajita', `Order Reference: ${order.id}`)}

          <!-- Announcement -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 34px; margin-bottom: 8px;">🌸✨</div>
                <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1F1A17; margin: 0 0 8px 0; font-weight: 400;">
                  Your Ensemble Has Arrived
                </h2>
                <p style="font-size: 14px; line-height: 1.6; color: #5C524B; margin: 0; max-width: 480px; display: inline-block;">
                  Dear ${order.customer_name || 'Patron'}, our courier partner indicates that your Saak by Aprajita bespoke package has been safely delivered to your doorstep.
                </p>
              </div>

              <!-- Care & Styling Guide Box -->
              <div style="background: #FFFFFF; border: 1px solid #E2CA9B; border-radius: 6px; padding: 22px; margin-bottom: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #A34835; font-weight: 700; margin-bottom: 8px;">
                  🌿 Care &amp; Styling Guide
                </div>
                <div style="font-size: 13px; color: #4A423D; line-height: 1.6;">
                  • <strong>Tissue &amp; Raw Silk Care:</strong> Dry clean only to preserve the delicate metallic sheen and zardozi embroidery.<br />
                  • <strong>Storage:</strong> Store wrapped in a breathable muslin or cotton cloth away from direct sunlight.<br />
                  • <strong>Steaming:</strong> Use a low-heat garment steamer on the reverse side of the drape.<br />
                </div>
              </div>

              <!-- Tag Us / Review Callout -->
              <div style="background: #F4ECE1; border-left: 3px solid #C5A059; padding: 14px 18px; border-radius: 0 4px 4px 0; font-size: 13px; color: #5C524B; line-height: 1.5;">
                We would be honored to see how you style your drape! Tag us on Instagram <strong style="color: #1F1A17;">@saakbyaprajita</strong> or message Aprajita directly on WhatsApp for draping suggestions.
              </div>
            </td>
          </tr>

          ${renderEmailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// =============================================================================
// UNIFIED EMAIL DELIVERY DISPATCHER
// =============================================================================
async function deliverEmail({ to, cc, subject, html, text, type, orderId, metadata = {} }) {
  const emailPayload = {
    id: `email_${Date.now()}_${type}`,
    type,
    orderId,
    to,
    cc: cc || undefined,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    subject,
    html,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    ...metadata
  };

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        cc: cc || undefined,
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        subject,
        html,
        text
      })
    });

    const data = await res.json();
    emailPayload.providerResponse = data;
    if (res.ok) {
      console.info(`[EmailService] Delivered ${type} email to ${to}${cc ? ` (CC: ${cc})` : ''} (MessageId: ${data.messageId})`);
    } else {
      console.warn(`[EmailService] API send error for ${type}:`, data.error);
      emailPayload.status = 'failed';
      emailPayload.error = data.error;
    }
  } catch (err) {
    console.warn(`[EmailService] Network error sending ${type}:`, err.message);
    emailPayload.status = 'local_logged';
    emailPayload.error = err.message;
  }

  // Always log in Email Outbox so admin can inspect and preview
  recordOutboxEmail(emailPayload);
  return { success: emailPayload.status === 'delivered', payload: emailPayload };
}

// =============================================================================
// PUBLIC EMAIL TRIGGER FUNCTIONS
// =============================================================================

/**
 * 1. Send Order Placed Email
 */
export async function sendOrderPlacedEmail(order) {
  if (!order || !order.customer_email) return { success: false, reason: 'No recipient email' };
  const subject = `✨ Order Placed: Saak by Aprajita (Reference #${order.id})`;
  const html = generateOrderPlacedHtml(order);
  return deliverEmail({
    to: order.customer_email,
    subject,
    html,
    type: 'order_placed',
    orderId: order.id
  });
}

/**
 * 2. Send Order Confirmed Email (Payment verified / in handcrafting)
 * Delivers confirmation to customer with SaakByAprajita@gmail.com in CC
 */
export async function sendOrderConfirmedEmail(order) {
  if (!order || !order.customer_email) return { success: false, reason: 'No recipient email' };
  const subject = `💛 Order Confirmed & In Handcrafting: Saak by Aprajita (#${order.id})`;
  const html = generateOrderConfirmedHtml(order);
  return deliverEmail({
    to: order.customer_email,
    cc: 'SaakByAprajita@gmail.com',
    subject,
    html,
    type: 'order_confirmed',
    orderId: order.id
  });
}

/**
 * 3. Send Dispatch & Tracking Notification Email
 */
export async function sendDispatchNotificationEmail(order, dispatchDetails) {
  if (!order || !order.customer_email) return { success: false, reason: 'No recipient email' };
  const subject = `🚚 Dispatched: Your Saak by Aprajita Order #${order.id} is on the way!`;
  const html = generateDispatchNotificationHtml(order, dispatchDetails);
  return deliverEmail({
    to: order.customer_email,
    subject,
    html,
    type: 'order_dispatched',
    orderId: order.id,
    metadata: {
      courier: dispatchDetails.courier,
      trackingNumber: dispatchDetails.trackingNumber
    }
  });
}

/**
 * 4. Send Order Delivered Email
 */
export async function sendOrderDeliveredEmail(order) {
  if (!order || !order.customer_email) return { success: false, reason: 'No recipient email' };
  const subject = `🌸 Delivered: Your Saak by Aprajita Ensemble Has Arrived! (#${order.id})`;
  const html = generateOrderDeliveredHtml(order);
  return deliverEmail({
    to: order.customer_email,
    subject,
    html,
    type: 'order_delivered',
    orderId: order.id
  });
}

/**
 * 5. Generate Luxury OTP Email HTML
 */
export function generateOtpEmailHtml(otp, fullName = 'Patron', expiryMinutes = 10) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Saak Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1A17; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #FAF6EF; border: 1px solid #E5DDCF; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(31,26,23,0.06); max-width: 560px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1F1A17 0%, #2A221E 100%); padding: 36px 32px; text-align: center; border-bottom: 2px solid #C5A059;">
              <div style="color: #C5A059; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">
                SAAK AUTHENTICATION
              </div>
              <h1 style="color: #FAF6EF; font-family: Georgia, serif; font-size: 26px; margin: 0 0 6px 0; font-weight: 400; letter-spacing: 0.04em;">
                Saak by Aprajita
              </h1>
              <div style="color: #D6CBC0; font-size: 12px; font-style: italic;">
                Fluid Drapes &amp; Sculpted Statements
              </div>
            </td>
          </tr>

          <!-- OTP Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 12px;">✨🔑</div>
              <h2 style="font-family: Georgia, serif; font-size: 22px; color: #1F1A17; margin: 0 0 10px 0; font-weight: 400;">
                Your Verification Code
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #5C524B; margin: 0 auto 24px auto; max-width: 440px;">
                Dear ${fullName}, use the 6-digit one-time verification code below to complete your registration and join the Saak Patron circle.
              </p>

              <!-- Luxury OTP Display Box -->
              <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td style="background: #FFFFFF; border: 2px solid #C5A059; border-radius: 8px; padding: 18px 36px; text-align: center; box-shadow: 0 6px 20px rgba(197, 160, 89, 0.15);">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A817A; font-weight: 600; margin-bottom: 6px;">
                      ONE-TIME PASSCODE
                    </div>
                    <div style="font-size: 38px; font-weight: 700; color: #A34835; letter-spacing: 0.25em; font-family: monospace; line-height: 1.2;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <div style="background: #F4ECE1; border-left: 3px solid #C5A059; padding: 14px 18px; border-radius: 0 4px 4px 0; text-align: left; margin: 0 auto; max-width: 440px;">
                <div style="font-size: 12px; color: #1F1A17; font-weight: 600; margin-bottom: 3px;">
                  ⏳ Valid for ${expiryMinutes} minutes
                </div>
                <div style="font-size: 12px; color: #7A726D; line-height: 1.4;">
                  If you did not request this verification code, please ignore this email.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #F2ECE0; padding: 22px 32px; text-align: center; border-top: 1px solid #E5DDCF;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #4A423D; line-height: 1.5;">
                Need assistance? Contact our concierge at <strong style="color: #A34835;">Saakbyaprajita@gmail.com</strong>
              </p>
              <div style="font-size: 11px; color: #8A817A;">
                © ${new Date().getFullYear()} Saak by Aprajita. All rights reserved.
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
 * 6. Send OTP Authentication Email
 */
export async function sendAuthOtpEmail(email, otp, fullName = 'Patron') {
  if (!email || !otp) return { success: false, reason: 'Missing email or otp' };
  const subject = `✨ Your Saak Verification Code: ${otp}`;
  const html = generateOtpEmailHtml(otp, fullName);
  return deliverEmail({
    to: email,
    subject,
    html,
    type: 'auth_otp',
    metadata: { otp }
  });
}

// Backward compatibility alias for older calls
export const sendOrderConfirmationEmail = sendOrderPlacedEmail;

// =============================================================================
// EMAIL OUTBOX STORAGE (LOCAL INSPECTION & HTML PREVIEW)
// =============================================================================
export function getOutboxEmails() {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordOutboxEmail(entry) {
  try {
    const existing = getOutboxEmails();
    existing.unshift(entry);
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to record email in outbox:', e);
  }
}
