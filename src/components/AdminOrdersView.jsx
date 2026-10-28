import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Check, X, Search, Filter, Eye, Copy, 
  MessageCircle, ExternalLink, Receipt, Truck, Download, 
  ShieldCheck, AlertCircle, Clock, PlusCircle, RefreshCw,
  Trash2, Sparkles, ChevronRight, CheckCheck, Printer,
  FileText, Banknote, PhoneCall, Mail, Send, CheckCircle
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { getOutboxEmails } from '../services/emailService';

export default function AdminOrdersView() {
  const { 
    orders = [], 
    updateOrderStatus, 
    confirmOrder,
    dispatchOrder,
    deliverOrder,
    deleteOrder, 
    resetOrders, 
    refreshOrders, 
    formatPrice,
    atelierUpiId 
  } = useShop();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, succeeded, pending_verification, failed, shipped
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_desc, amount_asc
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Copied feedback
  const [copiedUtr, setCopiedUtr] = useState(null);

  // Modals inside Admin Orders View
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [failModalOrder, setFailModalOrder] = useState(null);
  const [failReasonInput, setFailReasonInput] = useState('Invalid 12-digit UTR - Payment not credited to bank ledger');
  const [customFailReason, setCustomFailReason] = useState('');
  // Comprehensive Dispatch & Tracking Modal State
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const [courierPartner, setCourierPartner] = useState('BlueDart Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');
  const [estimatedDeliveryInput, setEstimatedDeliveryInput] = useState('');
  const [dispatchNotesInput, setDispatchNotesInput] = useState('Fall & pico inspected and hand-stitched. Packaged in signature keepsake box.');
  const [sendDispatchEmail, setSendDispatchEmail] = useState(true);
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchToast, setDispatchToast] = useState(null);

  // Email Outbox & Preview state
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [outboxEmails, setOutboxEmails] = useState(() => getOutboxEmails());

  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simData, setSimData] = useState({
    customerName: 'Kareena Kapoor',
    customerPhone: '+91 98200 11223',
    customerEmail: 'kareena@atelier.in',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    totalAmount: 4500,
    utrNumber: '592810482910',
    paymentStatus: 'pending_verification'
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setOutboxEmails(getOutboxEmails());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopyUtr = (utr, orderId) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(orderId);
    setTimeout(() => setCopiedUtr(null), 2200);
  };

  // Status transitions
  const handleMarkSucceeded = async (order) => {
    if (confirmOrder) {
      await confirmOrder(order.id, `Payment verified by admin on ${new Date().toLocaleDateString('en-IN')}`, true);
    } else {
      updateOrderStatus(order.id, {
        payment_status: 'succeeded',
        failure_reason: null,
        fulfillment_status: 'processing',
        verified_at: new Date().toISOString(),
        verified_by: 'Aprajita (Atelier Founder)',
        admin_notes: `Payment verified by admin on ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
      });
    }
    setOutboxEmails(getOutboxEmails());
    setDispatchToast({
      title: 'Order Confirmed!',
      msg: order.customer_email 
        ? `Payment verified & Order Confirmed email dispatched to ${order.customer_email}!` 
        : 'Payment verified and marked succeeded.'
    });
    setTimeout(() => setDispatchToast(null), 5000);
  };

  const handleMarkDelivered = async (order) => {
    if (deliverOrder) {
      await deliverOrder(order.id, true);
    } else {
      updateOrderStatus(order.id, {
        fulfillment_status: 'delivered',
        delivered_at: new Date().toISOString()
      });
    }
    setOutboxEmails(getOutboxEmails());
    setDispatchToast({
      title: 'Order Delivered!',
      msg: order.customer_email 
        ? `Order marked delivered & delivery celebration email dispatched to ${order.customer_email}!` 
        : 'Order marked delivered.'
    });
    setTimeout(() => setDispatchToast(null), 5000);
  };

  const handleConfirmFailed = () => {
    if (!failModalOrder) return;
    const finalReason = failReasonInput === 'custom' ? customFailReason : failReasonInput;
    updateOrderStatus(failModalOrder.id, {
      payment_status: 'failed',
      failure_reason: finalReason || 'Payment rejected by bank / UTR could not be verified',
      fulfillment_status: 'cancelled',
      verified_at: new Date().toISOString(),
      verified_by: 'Atelier Audit System',
      admin_notes: `Marked failed by admin: ${finalReason}`
    });
    setFailModalOrder(null);
    setCustomFailReason('');
  };

  // Dispatch helpers
  const handleOpenShipModal = (order) => {
    setShipModalOrder(order);
    const existing = order.dispatch_details || {};
    const defaultCourier = existing.courier || 'BlueDart Express';
    const defaultAwb = existing.trackingNumber || (order.tracking_number ? order.tracking_number.split('#')[1]?.trim() : `BD-${Math.floor(100000 + Math.random() * 900000)}`);
    setCourierPartner(defaultCourier);
    setTrackingNumberInput(defaultAwb);
    setTrackingUrlInput(existing.trackingUrl || `https://www.bluedart.com/tracking?trackNumber=${defaultAwb}`);
    
    const inThreeDays = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    setEstimatedDeliveryInput(existing.estimatedDelivery || inThreeDays);
    setDispatchNotesInput(existing.notes || 'Inspected by Aprajita. Handcrafted fall & pico finished. Packaged in luxury gold box.');
    setSendDispatchEmail(Boolean(order.customer_email));
  };

  const handleCourierChange = (newCourier) => {
    setCourierPartner(newCourier);
    const awb = trackingNumberInput || '12345678';
    if (newCourier.includes('BlueDart')) {
      setTrackingUrlInput(`https://www.bluedart.com/tracking?trackNumber=${awb}`);
    } else if (newCourier.includes('Delhivery')) {
      setTrackingUrlInput(`https://www.delhivery.com/track/package/${awb}`);
    } else if (newCourier.includes('DTDC')) {
      setTrackingUrlInput(`https://www.dtdc.in/tracking.asp?strCNNo=${awb}`);
    } else if (newCourier.includes('Speed Post') || newCourier.includes('India Post')) {
      setTrackingUrlInput(`https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`);
    } else {
      setTrackingUrlInput(`https://www.google.com/search?q=${encodeURIComponent(newCourier + ' tracking ' + awb)}`);
    }
  };

  const handleGenerateAwb = () => {
    let prefix = 'BD';
    if (courierPartner.includes('Delhivery')) prefix = 'DEL';
    else if (courierPartner.includes('DTDC')) prefix = 'DTDC';
    else if (courierPartner.includes('India Post')) prefix = 'SP';
    const newAwb = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTrackingNumberInput(newAwb);
    handleCourierChange(courierPartner);
  };

  const setQuickDays = (days) => {
    const d = new Date(Date.now() + days * 86400000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    setEstimatedDeliveryInput(d);
  };

  const handleConfirmShipped = async () => {
    if (!shipModalOrder) return;
    setIsSubmittingDispatch(true);

    const awb = trackingNumberInput || (`BD-${Math.floor(100000 + Math.random() * 900000)}`);
    const dispatchDetails = {
      courier: courierPartner,
      trackingNumber: awb,
      trackingUrl: trackingUrlInput || `https://www.bluedart.com/tracking?trackNumber=${awb}`,
      estimatedDelivery: estimatedDeliveryInput || '3-5 Business Days',
      notes: dispatchNotesInput,
      dispatchedAt: new Date().toISOString()
    };

    try {
      await dispatchOrder(shipModalOrder.id, dispatchDetails, sendDispatchEmail);
      setOutboxEmails(getOutboxEmails());
      setDispatchToast({
        title: 'Order Dispatched Successfully!',
        msg: sendDispatchEmail && shipModalOrder.customer_email 
          ? `Dispatched via ${courierPartner} (AWB: ${awb}). Tracking notification email delivered to ${shipModalOrder.customer_email}!`
          : `Dispatched via ${courierPartner} (AWB: ${awb}). Live tracking updated in patron UI.`
      });
      setTimeout(() => setDispatchToast(null), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDispatch(false);
      setShipModalOrder(null);
    }
  };

  const handleSimulateOrder = () => {
    const newSimOrder = {
      orderId: `SAAK-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName: simData.customerName,
      phone: simData.customerPhone,
      email: simData.customerEmail,
      address: '7th Floor, Signature Heights, Bandra West',
      city: simData.city,
      state: simData.state,
      pincode: simData.pincode,
      stylingNotes: 'Test order created via Atelier Admin Console simulator.',
      items: [
        {
          id: 'saak-01',
          name: 'Sunset Copper Tissue Saree',
          category: 'sarees',
          price: Number(simData.totalAmount),
          selectedSize: 'One Size (6.5m)',
          quantity: 1,
          images: {
            modelView: '/assets/muse_sunset_tissue.jpg',
            flatlayView: '/assets/saak_folded_copper_tissue.jpg'
          }
        }
      ],
      totalAmount: Number(simData.totalAmount),
      utrNumber: simData.utrNumber,
      paymentMethod: 'Dynamic UPI QR',
      paymentScreenshotUrl: '/assets/muse_copper_tissue.jpg',
      paymentStatus: simData.paymentStatus,
      failureReason: simData.paymentStatus === 'failed' ? 'Simulated bank decline / invalid UTR reference' : null,
      fulfillmentStatus: simData.paymentStatus === 'succeeded' ? 'processing' : (simData.paymentStatus === 'failed' ? 'cancelled' : 'unfulfilled'),
      verifiedAt: simData.paymentStatus === 'succeeded' ? new Date().toISOString() : null,
      verifiedBy: simData.paymentStatus === 'succeeded' ? 'Aprajita (Atelier Founder)' : null,
      adminNotes: 'Generated via Admin Simulator for testing transaction states.'
    };

    updateOrderStatus(newSimOrder.orderId, newSimOrder);
    setShowSimulateModal(false);
  };

  // WhatsApp formatted message link
  const getWhatsAppLink = (order) => {
    const phoneClean = order.customer_phone?.replace(/[^0-9]/g, '') || '';
    let msg = '';

    if (order.payment_method?.includes('COD')) {
      msg = `✨ *SAAK ATELIER • CASH ON DELIVERY CONFIRMATION*\n\n` +
        `Namaste ${order.customer_name},\n\n` +
        `We have received your Cash on Delivery order *#${order.id}* for *₹${Number(order.total_amount).toLocaleString('en-IN')}*.\n\n` +
        `Our team is reaching out to confirm your delivery address in ${order.city} and saree fall & pico preferences before dispatch.\n\n` +
        `*Amount Payable upon Arrival:* ₹${Number(order.total_amount).toLocaleString('en-IN')}\n\n` +
        `Warm regards,\nAprajita | Saak Atelier`;
    } else if (order.payment_status === 'succeeded') {
      msg = `✨ *SAAK ATELIER • PAYMENT VERIFIED*\n\n` +
        `Namaste ${order.customer_name},\n\n` +
        `We are delighted to confirm that your payment of *₹${Number(order.total_amount).toLocaleString('en-IN')}* for Order *#${order.id}* has been successfully verified by our atelier.\n\n` +
        `*UTR Reference:* ${order.utr_number}\n` +
        `*Status:* Confirmed & In Handcrafting\n\n` +
        `Our artisans are preparing your drape with utmost care. You will receive dispatch tracking once dispatched.\n\n` +
        `Warm regards,\nAprajita | Saak Atelier`;
    } else if (order.payment_status === 'failed') {
      msg = `⚠️ *SAAK ATELIER • PAYMENT STATUS UPDATE*\n\n` +
        `Namaste ${order.customer_name},\n\n` +
        `Regarding your Order *#${order.id}* (Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}):\n\n` +
        `Our bank reconciliation system was unable to verify the UPI transaction reference: *${order.utr_number}*.\n` +
        `*Reason:* ${order.failure_reason || 'Payment not credited or declined by issuing bank'}.\n\n` +
        `Kindly reply to this message with your payment screenshot or UPI bank confirmation slip so our team can assist you immediately.\n\n` +
        `Warm regards,\nSaak Customer Support`;
    } else {
      msg = `⏳ *SAAK ATELIER • ORDER ACKNOWLEDGEMENT*\n\n` +
        `Namaste ${order.customer_name},\n\n` +
        `Thank you for your order *#${order.id}* with Saak by Aprajita (Total: ₹${Number(order.total_amount).toLocaleString('en-IN')}).\n\n` +
        `We have received your UPI reference: *${order.utr_number}* and our team is currently verifying the bank ledger. You will receive an official confirmation shortly.\n\n` +
        `Warm regards,\nAprajita | Saak Atelier`;
    }

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
  };

  // Filtered and Sorted Orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter === 'succeeded' && order.payment_status !== 'succeeded') return false;
    if (statusFilter === 'pending_verification' && order.payment_status !== 'pending_verification') return false;
    if (statusFilter === 'failed' && order.payment_status !== 'failed') return false;
    if (statusFilter === 'shipped' && order.fulfillment_status !== 'shipped') return false;
    if (statusFilter === 'cod' && !(order.payment_method?.includes('COD') || order.payment_status?.startsWith('cod_'))) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(q);
      const matchName = order.customer_name?.toLowerCase().includes(q);
      const matchPhone = order.customer_phone?.toLowerCase().includes(q);
      const matchEmail = order.customer_email?.toLowerCase().includes(q);
      const matchUtr = order.utr_number?.toLowerCase().includes(q);
      const matchCity = order.city?.toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchEmail || matchUtr || matchCity;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (sortBy === 'amount_desc') return (b.total_amount || 0) - (a.total_amount || 0);
    if (sortBy === 'amount_asc') return (a.total_amount || 0) - (b.total_amount || 0);
    return 0;
  });

  // KPI calculations
  const totalCount = orders.length;
  const succeededOrders = orders.filter(o => o.payment_status === 'succeeded');
  const succeededCount = succeededOrders.length;
  const succeededRevenue = succeededOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const pendingOrders = orders.filter(o => o.payment_status === 'pending_verification');
  const pendingCount = pendingOrders.length;
  const pendingValue = pendingOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const failedOrders = orders.filter(o => o.payment_status === 'failed');
  const failedCount = failedOrders.length;
  const failedValue = failedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const codOrders = orders.filter(o => o.payment_method?.includes('COD') || o.payment_status?.startsWith('cod_'));
  const codCount = codOrders.length;
  const codPendingCount = orders.filter(o => o.payment_status === 'cod_pending').length;

  return (
    <div className="orders-admin-container">
      {/* Toast Alert for Dispatches */}
      {dispatchToast && (
        <div className="dispatch-toast">
          <div className="dispatch-toast-icon">
            <Check size={18} />
          </div>
          <div className="dispatch-toast-content">
            <h4>{dispatchToast.title}</h4>
            <p>{dispatchToast.msg}</p>
          </div>
          <button 
            className="dispatch-toast-close"
            onClick={() => setDispatchToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 1. ATELIER KPI DASHBOARD SUMMARY */}
      <div className="orders-kpi-grid">
        <div className="kpi-card total">
          <div className="kpi-label">
            <Receipt size={14} className="text-gold" />
            <span>Total Orders Logged</span>
          </div>
          <div className="kpi-value">{totalCount}</div>
          <div className="kpi-sub">
            Gross Volume: <strong>₹{(succeededRevenue + pendingValue).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="kpi-card succeeded">
          <div className="kpi-label text-green">
            <ShieldCheck size={15} />
            <span>Transactions Succeeded</span>
          </div>
          <div className="kpi-value text-green">{succeededCount}</div>
          <div className="kpi-sub">
            Verified Revenue: <strong>₹{succeededRevenue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="kpi-card pending">
          <div className="kpi-label text-amber">
            <Clock size={15} />
            <span>Pending Verification</span>
          </div>
          <div className="kpi-value text-amber">{pendingCount}</div>
          <div className="kpi-sub">
            Awaiting Review: <strong>₹{pendingValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="kpi-card failed">
          <div className="kpi-label text-crimson">
            <AlertCircle size={15} />
            <span>Failed / Declined</span>
          </div>
          <div className="kpi-value text-crimson">{failedCount}</div>
          <div className="kpi-sub">
            Disputed Value: <strong>₹{failedValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      {/* ATELIER ACTIVE UPI RECONCILIATION STRIP */}
      <div className="orders-upi-config-strip">
        <div className="upi-strip-left">
          <Sparkles size={14} className="text-gold" />
          <span>Active Atelier Receiving UPI VPA:</span>
          <code className="active-vpa-pill">{atelierUpiId}</code>
          <span className="vpa-status-badge">● Live on Dynamic QR &amp; Direct UPI Intent</span>
        </div>
        <div className="upi-strip-right">
          <span>Customer payments route directly to Aprajita's UPI account with zero gateway commissions.</span>
        </div>
      </div>

      {/* 2. TOOLBAR: FILTERS, SEARCH, REFRESH, SIMULATE */}
      <div className="orders-toolbar">
        <div className="orders-search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Client, Phone, or UTR number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orders-search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="orders-toolbar-actions">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="orders-sort-select"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>

          <button 
            className="btn btn-outline toolbar-btn"
            onClick={handleRefresh}
            title="Reload latest orders from database"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn btn-outline toolbar-btn outbox-btn"
            onClick={() => {
              setOutboxEmails(getOutboxEmails());
              setShowOutboxModal(true);
            }}
            title="Inspect transactional emails sent to patrons"
          >
            <Mail size={13} />
            <span>Email Outbox ({outboxEmails.length})</span>
          </button>

          <button 
            className="btn btn-outline toolbar-btn"
            onClick={() => setShowSimulateModal(true)}
            title="Create a test transaction to test Succeeded or Failed flow"
          >
            <PlusCircle size={13} />
            <span>Test Order</span>
          </button>

          <button 
            className="btn btn-outline toolbar-btn reset-btn"
            onClick={() => {
              if (window.confirm('Reset orders to sample showcase orders (Succeeded, Pending, and Failed)?')) {
                resetOrders();
              }
            }}
            title="Reset sample orders for demonstration"
          >
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 3. STATUS FILTER CHIPS */}
      <div className="status-chips-bar">
        <button 
          className={`status-chip ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Orders ({totalCount})
        </button>
        <button 
          className={`status-chip green ${statusFilter === 'succeeded' ? 'active' : ''}`}
          onClick={() => setStatusFilter('succeeded')}
        >
          <ShieldCheck size={13} />
          <span>Succeeded ({succeededCount})</span>
        </button>
        <button 
          className={`status-chip amber ${statusFilter === 'pending_verification' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending_verification')}
        >
          <Clock size={13} />
          <span>Pending Review ({pendingCount})</span>
        </button>
        <button 
          className={`status-chip crimson ${statusFilter === 'failed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('failed')}
        >
          <AlertCircle size={13} />
          <span>Failed / Rejected ({failedCount})</span>
        </button>
        <button 
          className={`status-chip brown ${statusFilter === 'cod' ? 'active' : ''}`}
          onClick={() => setStatusFilter('cod')}
        >
          <Banknote size={13} />
          <span>Cash on Delivery ({codCount})</span>
        </button>
        <button 
          className={`status-chip blue ${statusFilter === 'shipped' ? 'active' : ''}`}
          onClick={() => setStatusFilter('shipped')}
        >
          <Truck size={13} />
          <span>Dispatched ({orders.filter(o => o.fulfillment_status === 'shipped').length})</span>
        </button>
      </div>

      {/* 4. ORDERS CARDS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders-state">
          <AlertCircle size={36} className="text-muted" />
          <h3>No Orders Found</h3>
          <p>
            {searchQuery 
              ? `No transactions matching "${searchQuery}". Try clearing filters.` 
              : 'There are currently no orders in this category.'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
          >
            View All Orders
          </button>
        </div>
      ) : (
        <div className="orders-cards-grid">
          {filteredOrders.map(order => {
            const isSucceeded = order.payment_status === 'succeeded';
            const isPending = order.payment_status === 'pending_verification';
            const isFailed = order.payment_status === 'failed';
            const isShipped = order.fulfillment_status === 'shipped';

            return (
              <div 
                key={order.id} 
                className={`order-card status-${order.payment_status}`}
              >
                {/* Header row */}
                <div className="order-card-header">
                  <div className="order-card-header-left">
                    <span className="order-id-badge">#{order.id}</span>
                    <span className="order-date-text">
                      {order.created_at ? new Date(order.created_at).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent'}
                    </span>
                  </div>

                  <div className="order-card-header-right">
                    {/* Status Badge */}
                    {order.payment_status === 'cod_pending' && (
                      <span className="status-badge badge-cod">
                        <Banknote size={14} />
                        <span>COD • Pay on Delivery</span>
                      </span>
                    )}
                    {order.payment_status === 'cod_confirmed' && (
                      <span className="status-badge badge-cod-confirmed">
                        <PhoneCall size={14} />
                        <span>COD Confirmed</span>
                      </span>
                    )}
                    {isSucceeded && (
                      <span className="status-badge badge-succeeded">
                        <ShieldCheck size={14} />
                        <span>{order.payment_method?.includes('COD') ? 'COD Paid & Settled' : 'Payment Succeeded'}</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="status-badge badge-pending">
                        <Clock size={14} />
                        <span>Awaiting Verification</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="status-badge badge-failed">
                        <AlertCircle size={14} />
                        <span>Transaction Failed</span>
                      </span>
                    )}
                    {isShipped && (
                      <span className="status-badge badge-shipped">
                        <Truck size={14} />
                        <span>Dispatched</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Panel Main Content */}
                <div className="order-card-body">
                  {/* Panel 1: Customer Info */}
                  <div className="order-panel customer-panel">
                    <div className="panel-title">Customer &amp; Shipping</div>
                    <div className="customer-info-box">
                      <div className="customer-name-row">
                        <strong>{order.customer_name}</strong>
                      </div>
                      <div className="customer-contact-row">
                        <span className="contact-item">📞 {order.customer_phone}</span>
                        {order.customer_email && (
                          <span className="contact-item">✉️ {order.customer_email}</span>
                        )}
                      </div>
                      <div className="customer-address-box">
                        <span className="address-icon">📍</span>
                        <span className="address-text">
                          {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
                        </span>
                      </div>

                      {order.styling_notes && (
                        <div className="styling-notes-callout">
                          <span className="notes-tag">Bespoke Atelier Note:</span>
                          <p className="notes-body">"{order.styling_notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel 2: Items Preview */}
                  <div className="order-panel items-panel">
                    <div className="panel-title">
                      Ordered Creations ({order.items?.length || 1})
                    </div>
                    <div className="order-items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <img 
                            src={item.images?.modelView || item.images?.flatlayView || '/assets/muse_sunset_tissue.jpg'} 
                            alt={item.name} 
                            className="order-item-thumb"
                          />
                          <div className="order-item-details">
                            <h5 className="order-item-name">{item.name}</h5>
                            <div className="order-item-meta">
                              <span className="meta-size">Size: {item.selectedSize || 'Standard'}</span>
                              {item.customColor && (
                                <span className="meta-color-chip">
                                  <span 
                                    className="meta-color-dot" 
                                    style={{ background: item.customColor.hex || '#A34835' }}
                                  />
                                  <span>{item.customColor.name || 'Custom Shade'}</span>
                                </span>
                              )}
                              <span className="meta-qty">Qty: {item.quantity || 1}</span>
                            </div>
                            <span className="order-item-price">
                              {formatPrice(item.price * (item.quantity || 1))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 3: Financial & UPI Transaction Ledger */}
                  <div className="order-panel transaction-panel">
                    <div className="panel-title">Payment &amp; Bank Audit</div>
                    <div className="transaction-audit-box">
                      <div className="total-amount-row">
                        <span className="amount-label">Amount Payable:</span>
                        <span className="amount-value">
                          ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="audit-detail-row">
                        <span className="audit-label">Channel:</span>
                        <span className="audit-value">{order.payment_method || 'Dynamic UPI QR'}</span>
                      </div>

                      <div className="audit-detail-row utr-row">
                        <span className="audit-label">UPI UTR / Ref:</span>
                        <div className="utr-code-wrapper">
                          <code className="utr-code">{order.utr_number || 'N/A'}</code>
                          {order.utr_number && (
                            <button 
                              className="copy-utr-btn"
                              onClick={() => handleCopyUtr(order.utr_number, order.id)}
                              title="Copy 12-digit UTR to clipboard"
                            >
                              {copiedUtr === order.id ? <CheckCheck size={13} className="text-green" /> : <Copy size={13} />}
                              <span>{copiedUtr === order.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Payment Screenshot Proof */}
                      <div className="audit-detail-row screenshot-row">
                        <span className="audit-label">Receipt Proof:</span>
                        {order.payment_screenshot_url ? (
                          <button 
                            className="btn btn-outline receipt-preview-btn"
                            onClick={() => setSelectedReceiptUrl(order.payment_screenshot_url)}
                          >
                            <Eye size={12} />
                            <span>View Bank Screenshot</span>
                          </button>
                        ) : (
                          <span className="no-receipt-text">No image uploaded</span>
                        )}
                      </div>

                      {/* Status Specific Details */}
                      {isSucceeded && (
                        <div className="audit-verified-banner">
                          <Check size={13} className="text-green" />
                          <span>
                            Verified by {order.verified_by || 'Aprajita'}{' '}
                            {order.verified_at ? `on ${new Date(order.verified_at).toLocaleDateString('en-IN')}` : ''}
                          </span>
                        </div>
                      )}

                      {isFailed && (
                        <div className="audit-failed-banner">
                          <AlertCircle size={13} className="text-crimson" />
                          <div>
                            <strong>Transaction Declined:</strong>
                            <p>{order.failure_reason || 'Bank reconciliation failed / invalid reference number.'}</p>
                          </div>
                        </div>
                      )}

                      {(order.tracking_number || order.dispatch_details) && (
                        <div className="audit-tracking-banner">
                          <Truck size={14} className="text-blue" />
                          <div className="tracking-banner-info">
                            <div className="tracking-main-line">
                              <span><strong>{order.dispatch_details?.courier || (order.tracking_number ? order.tracking_number.split('#')[0].trim() : 'Courier')}</strong></span>
                              <span className="meta-dot">•</span>
                              <span className="tracking-awb-tag">AWB: {order.dispatch_details?.trackingNumber || (order.tracking_number ? order.tracking_number.split('#')[1]?.trim() : 'N/A')}</span>
                            </div>
                            {order.dispatch_details?.estimatedDelivery && (
                              <div className="tracking-eta-line">
                                <span>ETA: {order.dispatch_details.estimatedDelivery}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Toolbar */}
                <div className="order-card-footer">
                  <div className="footer-status-controls">
                    {/* COD Specific Controls */}
                    {order.payment_status === 'cod_pending' && (
                      <button 
                        className="btn btn-outline confirm-cod-btn"
                        onClick={() => {
                          updateOrderStatus(order.id, {
                            payment_status: 'cod_confirmed',
                            admin_notes: `Order phone confirmation completed on ${new Date().toLocaleDateString('en-IN')}. Ready for handcrafting fall & pico.`
                          });
                        }}
                        title="Mark phone call confirmation completed with client"
                      >
                        <PhoneCall size={14} />
                        <span>Confirm via Call</span>
                      </button>
                    )}

                    {/* Mark Succeeded / Collected button */}
                    {!isSucceeded && (
                      <button 
                        className="btn btn-primary approve-btn"
                        onClick={() => handleMarkSucceeded(order)}
                        title="Confirm payment received (UPI or Courier Cash Collection)"
                      >
                        <ShieldCheck size={14} />
                        <span>{order.payment_method?.includes('COD') ? 'Mark COD Cash Collected' : 'Verify & Mark Succeeded'}</span>
                      </button>
                    )}

                    {/* Mark Failed button */}
                    {!isFailed && (
                      <button 
                        className="btn btn-outline reject-btn"
                        onClick={() => {
                          setFailModalOrder(order);
                          setFailReasonInput(order.payment_method?.includes('COD') ? 'Customer requested cancellation of order before payment' : 'Invalid 12-digit UTR - Payment not credited to bank ledger');
                        }}
                        title="Mark order as cancelled or rejected"
                      >
                        <AlertCircle size={14} />
                        <span>{order.payment_method?.includes('COD') ? 'Cancel COD Order' : 'Mark as Failed / Reject'}</span>
                      </button>
                    )}

                    {/* Dispatch button */}
                    {!isShipped ? (
                      <button 
                        className="btn btn-outline ship-btn"
                        onClick={() => handleOpenShipModal(order)}
                        title="Add courier tracking and dispatch details"
                      >
                        <Truck size={14} />
                        <span>Dispatch / Add Tracking</span>
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline ship-btn-active"
                        onClick={() => handleOpenShipModal(order)}
                        title="Update courier tracking details or resend dispatch email"
                      >
                        <Truck size={14} />
                        <span>Update Tracking</span>
                      </button>
                    )}

                    {/* Mark Delivered button (when dispatched but not yet delivered) */}
                    {isShipped && order.fulfillment_status !== 'delivered' && (
                      <button 
                        className="btn btn-outline deliver-btn"
                        onClick={() => handleMarkDelivered(order)}
                        title="Mark order as delivered and send delivery celebration email"
                        style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                      >
                        <CheckCircle size={14} />
                        <span>Mark Delivered</span>
                      </button>
                    )}

                    {order.fulfillment_status === 'delivered' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, background: '#E8F5E9', color: '#2E7D32', borderRadius: '4px' }}>
                        <CheckCheck size={14} /> Delivered
                      </span>
                    )}
                  </div>

                  <div className="footer-utility-controls">
                    {/* WhatsApp notification trigger */}
                    {order.customer_phone && (
                      <a 
                        href={getWhatsAppLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline whatsapp-btn"
                        title="Send pre-formatted WhatsApp status update to customer"
                      >
                        <MessageCircle size={14} className="text-green" />
                        <span>WhatsApp Client</span>
                      </a>
                    )}

                    {/* Invoice view */}
                    <button 
                      className="btn btn-outline invoice-btn"
                      onClick={() => setInvoiceOrder(order)}
                      title="View printable invoice slip"
                    >
                      <FileText size={14} />
                      <span>Invoice Slip</span>
                    </button>

                    {/* Delete order */}
                    <button 
                      className="btn btn-outline delete-btn"
                      onClick={() => {
                        if (window.confirm(`Delete order #${order.id} permanently?`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      title="Delete test order"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: RECEIPT LIGHTBOX */}
      {selectedReceiptUrl && (
        <div className="lightbox-overlay" onClick={() => setSelectedReceiptUrl(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <h4>Bank Transaction Proof / Screenshot</h4>
              <button 
                className="lightbox-close-btn"
                onClick={() => setSelectedReceiptUrl(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-body">
              <img 
                src={selectedReceiptUrl} 
                alt="Payment Receipt" 
                className="lightbox-img" 
              />
            </div>
            <div className="lightbox-footer">
              <a 
                href={selectedReceiptUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <ExternalLink size={13} />
                <span>Open in New Tab</span>
              </a>
              <button 
                className="btn btn-primary"
                onClick={() => setSelectedReceiptUrl(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK AS FAILED MODAL */}
      {failModalOrder && (
        <div className="lightbox-overlay" onClick={() => setFailModalOrder(null)}>
          <div className="lightbox-modal mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="danger-modal-title">
                <AlertCircle size={18} className="text-crimson" />
                <h4>Mark Transaction as Failed / Rejected</h4>
              </div>
              <button className="lightbox-close-btn" onClick={() => setFailModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-body-form">
              <p className="form-subtext">
                Specify why payment for Order <strong>#{failModalOrder.id}</strong> (Client: {failModalOrder.customer_name}) could not be verified. This will be recorded on the audit log.
              </p>

              <div className="form-group">
                <label className="form-label">Select Failure Reason:</label>
                <select 
                  value={failReasonInput} 
                  onChange={(e) => setFailReasonInput(e.target.value)}
                  className="form-select"
                >
                  <option value="Invalid 12-digit UTR - Payment not credited to bank ledger">
                    Invalid 12-digit UTR - Payment not credited to bank ledger
                  </option>
                  <option value="Amount mismatch - Credited amount does not match invoice total">
                    Amount mismatch - Credited amount does not match invoice total
                  </option>
                  <option value="Transaction declined or reversed by issuing bank">
                    Transaction declined or reversed by issuing bank
                  </option>
                  <option value="Duplicate transaction reference already claimed by another order">
                    Duplicate transaction reference already claimed
                  </option>
                  <option value="Customer requested cancellation of order before payment">
                    Customer requested cancellation
                  </option>
                  <option value="custom">Other / Custom Reason...</option>
                </select>
              </div>

              {failReasonInput === 'custom' && (
                <div className="form-group">
                  <label className="form-label">Custom Reason / Notes:</label>
                  <input 
                    type="text" 
                    placeholder="Enter specific explanation..." 
                    value={customFailReason}
                    onChange={(e) => setCustomFailReason(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}
            </div>

            <div className="lightbox-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setFailModalOrder(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleConfirmFailed}
              >
                Confirm Rejection &amp; Mark Failed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPREHENSIVE DISPATCH & TRACKING CONSOLE */}
      {shipModalOrder && (
        <div className="lightbox-overlay" onClick={() => !isSubmittingDispatch && setShipModalOrder(null)}>
          <div className="lightbox-modal dispatch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="ship-modal-title">
                <Truck size={20} className="text-terracotta" />
                <div>
                  <h4>Dispatch &amp; Assign Courier Tracking</h4>
                  <span className="modal-subtitle">Order #{shipModalOrder.id} • {shipModalOrder.customer_name}</span>
                </div>
              </div>
              <button 
                className="lightbox-close-btn" 
                onClick={() => !isSubmittingDispatch && setShipModalOrder(null)}
                disabled={isSubmittingDispatch}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-body-form dispatch-form">
              {/* Recipient summary strip */}
              <div className="dispatch-destination-card">
                <div className="dest-left">
                  <div className="dest-name">{shipModalOrder.customer_name}</div>
                  <div className="dest-address">
                    📍 {shipModalOrder.shipping_address}, {shipModalOrder.city}, {shipModalOrder.state} - {shipModalOrder.pincode}
                  </div>
                  <div className="dest-contact">
                    <span>📞 {shipModalOrder.customer_phone}</span>
                    {shipModalOrder.customer_email && (
                      <span className="dest-email">✉️ {shipModalOrder.customer_email}</span>
                    )}
                  </div>
                </div>
                <div className="dest-right">
                  <div className="order-items-count">
                    {shipModalOrder.items?.length || 1} item(s) • ₹{Number(shipModalOrder.total_amount).toLocaleString('en-IN')}
                  </div>
                  <div className="order-status-tag">
                    Current: {shipModalOrder.fulfillment_status === 'dispatched' ? 'Already Dispatched' : 'In Process (Tailoring)'}
                  </div>
                </div>
              </div>

              {/* Form grid */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    <span>Courier Partner:</span>
                  </label>
                  <select 
                    value={courierPartner} 
                    onChange={(e) => handleCourierChange(e.target.value)}
                    className="form-select"
                  >
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="DTDC Premium">DTDC Premium</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="Shadowfax Express">Shadowfax Express</option>
                    <option value="DHL Express International">DHL Express International</option>
                    <option value="Bespoke Studio Delivery">Bespoke Studio Delivery</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="label-with-action">
                    <label className="form-label">AWB / Tracking Number:</label>
                    <button 
                      type="button" 
                      onClick={handleGenerateAwb} 
                      className="generate-awb-btn"
                      title="Generate a randomized test AWB"
                    >
                      🎲 Generate AWB
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. BD-89214710" 
                    value={trackingNumberInput}
                    onChange={(e) => {
                      setTrackingNumberInput(e.target.value);
                      handleCourierChange(courierPartner);
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Live Public Tracking URL:</label>
                <div className="input-with-icon">
                  <ExternalLink size={14} className="field-icon" />
                  <input 
                    type="url" 
                    placeholder="https://www.bluedart.com/tracking?trackNumber=..." 
                    value={trackingUrlInput}
                    onChange={(e) => setTrackingUrlInput(e.target.value)}
                    className="form-input"
                  />
                </div>
                <span className="field-hint">The patron can click directly into this link from their profile to track package transit.</span>
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label className="form-label">Estimated Delivery Timeline:</label>
                  <div className="quick-presets">
                    <button type="button" onClick={() => setQuickDays(2)} className="preset-pill">+2 Days (Express)</button>
                    <button type="button" onClick={() => setQuickDays(4)} className="preset-pill">+4 Days (Standard)</button>
                    <button type="button" onClick={() => setQuickDays(7)} className="preset-pill">+7 Days</button>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. 29 Oct 2026 or 3-5 Business Days" 
                  value={estimatedDeliveryInput}
                  onChange={(e) => setEstimatedDeliveryInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Atelier Inspection &amp; Packaging Notes:</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Saree inspected by Aprajita. Fall & pico hand-stitched. Packaged in luxury gold box."
                  value={dispatchNotesInput}
                  onChange={(e) => setDispatchNotesInput(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Email Notification Option */}
              <div className="dispatch-email-card">
                <label className="email-toggle-label">
                  <input 
                    type="checkbox" 
                    checked={sendDispatchEmail}
                    onChange={(e) => setSendDispatchEmail(e.target.checked)}
                    disabled={!shipModalOrder.customer_email}
                  />
                  <div>
                    <div className="email-toggle-title">
                      <Mail size={14} className="text-terracotta" />
                      <span>Send Automated Dispatch &amp; Tracking Email to Patron</span>
                    </div>
                    <div className="email-toggle-desc">
                      {shipModalOrder.customer_email ? (
                        <>Delivers luxury HTML dispatch notification with AWB tracking link to <strong>{shipModalOrder.customer_email}</strong>.</>
                      ) : (
                        <span className="text-muted">No email registered on this order (notification will be recorded in Atelier Outbox).</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="lightbox-footer">
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => setShipModalOrder(null)}
                disabled={isSubmittingDispatch}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary dispatch-submit-btn"
                onClick={handleConfirmShipped}
                disabled={isSubmittingDispatch}
              >
                {isSubmittingDispatch ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>Dispatching &amp; Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Confirm Dispatch &amp; Notify Patron</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INVOICE SLIP MODAL */}
      {invoiceOrder && (
        <div className="lightbox-overlay" onClick={() => setInvoiceOrder(null)}>
          <div className="lightbox-modal invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header-strip">
              <div className="invoice-brand">
                <span className="brand-title">Saak by Aprajita</span>
                <span className="brand-tag">Atelier Order Slip • Official Tax &amp; Delivery Summary</span>
              </div>
              <button className="lightbox-close-btn" onClick={() => setInvoiceOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="invoice-content-printable" id="printable-invoice">
              <div className="invoice-meta-grid">
                <div>
                  <span className="meta-sub">ORDER REFERENCE</span>
                  <h3 className="meta-main">#{invoiceOrder.id}</h3>
                  <p className="meta-date">
                    Date: {invoiceOrder.created_at ? new Date(invoiceOrder.created_at).toLocaleString('en-IN') : 'Recent'}
                  </p>
                </div>
                <div>
                  <span className="meta-sub">PAYMENT AUDIT STATUS</span>
                  <div className={`invoice-status-pill status-${invoiceOrder.payment_status}`}>
                    {invoiceOrder.payment_status.toUpperCase()}
                  </div>
                  <p className="meta-utr">UTR: {invoiceOrder.utr_number || 'N/A'}</p>
                </div>
              </div>

              <div className="invoice-parties-grid">
                <div className="party-box">
                  <span className="party-title">ATELIER DISPATCH FROM:</span>
                  <strong>Saak by Aprajita</strong>
                  <p>Hauz Khas Enclave / DLF Phase 5</p>
                  <p>New Delhi / Gurugram, India</p>
                  <p>UPI VPA: {atelierUpiId}</p>
                </div>
                <div className="party-box">
                  <span className="party-title">BILLED &amp; SHIPPED TO:</span>
                  <strong>{invoiceOrder.customer_name}</strong>
                  <p>{invoiceOrder.shipping_address}</p>
                  <p>{invoiceOrder.city}, {invoiceOrder.state} - {invoiceOrder.pincode}</p>
                  <p>Phone: {invoiceOrder.customer_phone}</p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Size / Details</th>
                    <th>Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{it.name}</strong>
                        {it.customColor && <div className="text-muted">Custom Shade: {it.customColor.name}</div>}
                      </td>
                      <td>{it.selectedSize || 'One Size'}</td>
                      <td>{it.quantity || 1}</td>
                      <td className="text-right">₹{Number(it.price).toLocaleString('en-IN')}</td>
                      <td className="text-right">₹{(Number(it.price) * (it.quantity || 1)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-right"><strong>Total Amount (incl. all taxes):</strong></td>
                    <td className="text-right"><strong>₹{Number(invoiceOrder.total_amount).toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tfoot>
              </table>

              {invoiceOrder.styling_notes && (
                <div className="invoice-notes-box">
                  <strong>Client Styling Instruction:</strong>
                  <p>{invoiceOrder.styling_notes}</p>
                </div>
              )}

              <div className="invoice-footer-seal">
                <p>Authentic Handcrafted Creation by Aprajita • Saak Atelier Official Record</p>
              </div>
            </div>

            <div className="lightbox-footer">
              <button 
                className="btn btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setInvoiceOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SIMULATE TEST ORDER MODAL */}
      {showSimulateModal && (
        <div className="lightbox-overlay" onClick={() => setShowSimulateModal(false)}>
          <div className="lightbox-modal mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="ship-modal-title">
                <Sparkles size={16} className="text-gold" />
                <h4>Simulate New Customer Transaction</h4>
              </div>
              <button className="lightbox-close-btn" onClick={() => setShowSimulateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-body-form">
              <div className="form-group">
                <label className="form-label">Client Name:</label>
                <input 
                  type="text" 
                  value={simData.customerName}
                  onChange={(e) => setSimData({ ...simData, customerName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Amount (₹):</label>
                  <input 
                    type="number" 
                    value={simData.totalAmount}
                    onChange={(e) => setSimData({ ...simData, totalAmount: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Status to Test:</label>
                  <select 
                    value={simData.paymentStatus}
                    onChange={(e) => setSimData({ ...simData, paymentStatus: e.target.value })}
                    className="form-select"
                  >
                    <option value="pending_verification">Pending Verification</option>
                    <option value="succeeded">Succeeded / Verified</option>
                    <option value="failed">Failed / Declined</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">12-Digit UPI UTR Reference:</label>
                <input 
                  type="text" 
                  value={simData.utrNumber}
                  onChange={(e) => setSimData({ ...simData, utrNumber: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="lightbox-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowSimulateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSimulateOrder}
              >
                Create Test Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ATELIER EMAIL OUTBOX & PREVIEW MODAL */}
      {showOutboxModal && (
        <div className="lightbox-overlay" onClick={() => setShowOutboxModal(false)}>
          <div className="lightbox-modal outbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="ship-modal-title">
                <Mail size={18} className="text-terracotta" />
                <div>
                  <h4>Atelier Email Notification Outbox</h4>
                  <span className="modal-subtitle">Sent Order Confirmations &amp; Dispatch Tracking Logs ({outboxEmails.length})</span>
                </div>
              </div>
              <button className="lightbox-close-btn" onClick={() => setShowOutboxModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-body-outbox">
              {outboxEmails.length === 0 ? (
                <div className="empty-outbox-state">
                  <Mail size={32} className="text-muted" />
                  <h4>No Emails in Outbox Yet</h4>
                  <p>When customers place orders or you dispatch shipments, transactional emails will be logged and can be previewed here.</p>
                </div>
              ) : (
                <div className="outbox-list">
                  {outboxEmails.map((item, idx) => (
                    <div key={idx} className="outbox-item-card">
                      <div className="outbox-item-top">
                        <span className={`outbox-badge type-${item.type}`}>
                          {item.type === 'dispatch_notification' ? '🚚 Dispatch Tracking' : '✨ Order Confirmation'}
                        </span>
                        <span className="outbox-time">
                          {new Date(item.sentAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="outbox-subject">
                        <strong>{item.subject}</strong>
                      </div>
                      <div className="outbox-details-row">
                        <span>Recipient: <code>{item.to}</code></span>
                        <span>Order: <strong>#{item.orderId}</strong></span>
                        <span className="outbox-method-tag">Method: {item.deliveryMethod}</span>
                      </div>
                      <div className="outbox-item-actions">
                        <button 
                          className="btn btn-sm btn-outline preview-email-btn"
                          onClick={() => setPreviewEmail(item)}
                        >
                          <Eye size={12} />
                          <span>Preview Rendered Email</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lightbox-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  if (window.confirm('Clear all sent email records from outbox?')) {
                    localStorage.removeItem('saak_outbox_emails');
                    setOutboxEmails([]);
                  }
                }}
              >
                <Trash2 size={13} />
                <span>Clear Outbox</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowOutboxModal(false)}
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: FULL EMAIL HTML PREVIEW LIGHTBOX */}
      {previewEmail && (
        <div className="lightbox-overlay" onClick={() => setPreviewEmail(null)}>
          <div className="lightbox-modal email-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="preview-meta">
                <h4>Preview: {previewEmail.subject}</h4>
                <span className="modal-subtitle">To: {previewEmail.to} • Sent: {new Date(previewEmail.sentAt).toLocaleString('en-IN')}</span>
              </div>
              <button className="lightbox-close-btn" onClick={() => setPreviewEmail(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="email-preview-frame-container">
              <iframe 
                title="Email Preview"
                srcDoc={previewEmail.html}
                className="email-preview-iframe"
              />
            </div>
            <div className="lightbox-footer">
              <button className="btn btn-primary" onClick={() => setPreviewEmail(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT STYLES */}
      <style>{`
        .orders-admin-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* KPI Dashboard Grid */
        .orders-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .kpi-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: var(--transition);
        }
        .kpi-card:hover {
          border-color: var(--accent-terracotta);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .kpi-card.succeeded {
          border-left: 3px solid #2E7D32;
        }
        .kpi-card.pending {
          border-left: 3px solid #E65100;
        }
        .kpi-card.failed {
          border-left: 3px solid #C62828;
        }
        .kpi-card.total {
          border-left: 3px solid var(--accent-gold);
        }
        .kpi-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .kpi-value {
          font-size: 26px;
          font-family: var(--font-serif);
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .kpi-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        .kpi-sub strong {
          color: var(--text-primary);
        }

        .text-green { color: #2E7D32 !important; }
        .text-amber { color: #E65100 !important; }
        .text-crimson { color: #C62828 !important; }
        .text-blue { color: #1565C0 !important; }

        /* Atelier Active UPI Config Strip */
        .orders-upi-config-strip {
          background: #FAF7F2;
          border: 1px solid var(--border-light);
          border-left: 3px solid var(--accent-gold);
          border-radius: 4px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .upi-strip-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .active-vpa-pill {
          background: #3E2723;
          color: #FAF6EF;
          padding: 3px 8px;
          border-radius: 3px;
          font-family: monospace;
          font-weight: 600;
          font-size: 12px;
        }
        .vpa-status-badge {
          color: #2E7D32;
          font-size: 11px;
          font-weight: 600;
        }
        .upi-strip-right {
          color: var(--text-muted);
          font-size: 11px;
        }

        /* Toolbar */
        .orders-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .orders-search-wrapper {
          flex: 1;
          min-width: 280px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .orders-search-input {
          width: 100%;
          padding: 10px 34px 10px 36px;
          font-size: 13px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          background: #FFFFFF;
          outline: none;
          transition: var(--transition);
        }
        .orders-search-input:focus {
          border-color: var(--accent-terracotta);
          box-shadow: 0 0 0 2px rgba(163, 72, 53, 0.1);
        }
        .search-clear-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .orders-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .orders-sort-select {
          padding: 8px 12px;
          font-size: 12px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          background: #FFFFFF;
          outline: none;
          cursor: pointer;
        }
        .toolbar-btn {
          font-size: 12px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .reset-btn {
          color: var(--text-muted);
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Status Filter Chips */
        .status-chips-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .status-chips-bar::-webkit-scrollbar {
          display: none;
        }
        .status-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border: 1px solid var(--border-light);
          background: #FFFFFF;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }
        .status-chip:hover {
          border-color: var(--accent-terracotta);
          color: var(--accent-terracotta);
        }
        .status-chip.active {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }
        .status-chip.green.active {
          background: #2E7D32;
          border-color: #2E7D32;
        }
        .status-chip.amber.active {
          background: #E65100;
          border-color: #E65100;
        }
        .status-chip.crimson.active {
          background: #C62828;
          border-color: #C62828;
        }
        .status-chip.brown.active {
          background: #795548;
          border-color: #795548;
        }
        .status-chip.blue.active {
          background: #1565C0;
          border-color: #1565C0;
        }

        /* Order Cards Grid */
        .orders-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-card {
          background: #FFFFFF;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          transition: var(--transition);
        }
        .order-card:hover {
          border-color: rgba(163, 72, 53, 0.4);
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        }
        .order-card.status-succeeded {
          border-left: 4px solid #2E7D32;
        }
        .order-card.status-pending_verification {
          border-left: 4px solid #E65100;
        }
        .order-card.status-failed {
          border-left: 4px solid #C62828;
        }

        /* Card Header */
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #FAF7F2;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
          gap: 8px;
        }
        .order-card-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .order-id-badge {
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-terracotta);
          background: rgba(163, 72, 53, 0.08);
          padding: 3px 8px;
          border-radius: 3px;
        }
        .order-date-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-succeeded {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #A5D6A7;
        }
        .badge-pending {
          background: #FFF3E0;
          color: #E65100;
          border: 1px solid #FFCC80;
        }
        .badge-cod {
          background: #EFEBE9;
          color: #5D4037;
          border: 1px solid #D7CCC8;
        }
        .badge-cod-confirmed {
          background: #FFF8E1;
          color: #E65100;
          border: 1px solid #FFE082;
        }
        .confirm-cod-btn {
          color: #E65100;
          border-color: #FFCC80;
          font-size: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .confirm-cod-btn:hover {
          background: #FFF8E1;
          border-color: #E65100;
        }
        .badge-failed {
          background: #FFEBEE;
          color: #C62828;
          border: 1px solid #FFCDD2;
        }
        .badge-shipped {
          background: #E3F2FD;
          color: #1565C0;
          border: 1px solid #90CAF9;
        }

        /* Card Body (3 Panels) */
        .order-card-body {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1.2fr;
          gap: 16px;
          padding: 18px;
        }
        .order-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .panel-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px dashed var(--border-light);
          padding-bottom: 4px;
        }

        /* Customer Panel */
        .customer-info-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }
        .customer-name-row strong {
          font-size: 14px;
          color: var(--text-primary);
        }
        .customer-contact-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: var(--text-muted);
        }
        .customer-address-box {
          display: flex;
          gap: 6px;
          color: var(--text-secondary);
          line-height: 1.4;
          background: rgba(0,0,0,0.02);
          padding: 8px 10px;
          border-radius: 3px;
        }
        .styling-notes-callout {
          background: #FFFDF9;
          border-left: 2px solid var(--accent-gold);
          padding: 8px 10px;
          border-radius: 0 3px 3px 0;
          font-size: 11px;
        }
        .notes-tag {
          font-weight: 600;
          color: var(--accent-terracotta);
          display: block;
          margin-bottom: 2px;
        }
        .notes-body {
          font-style: italic;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Items Panel */
        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .order-item-row {
          display: flex;
          gap: 10px;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .order-item-thumb {
          width: 44px;
          height: 56px;
          object-fit: cover;
          border-radius: 3px;
          border: 1px solid var(--border-light);
        }
        .order-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .order-item-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .order-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .meta-color-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .meta-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .order-item-price {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-terracotta);
        }

        /* Transaction Panel */
        .transaction-audit-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
        }
        .total-amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-light);
        }
        .amount-label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .amount-value {
          font-size: 18px;
          font-family: var(--font-serif);
          font-weight: 600;
          color: var(--text-primary);
        }
        .audit-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .audit-label {
          color: var(--text-muted);
          font-size: 11px;
        }
        .audit-value {
          font-weight: 500;
          color: var(--text-primary);
        }
        .utr-code-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .utr-code {
          font-family: monospace;
          background: #F4EFE6;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          color: #3E2723;
        }
        .copy-utr-btn {
          display: flex;
          align-items: center;
          gap: 3px;
          background: none;
          border: 1px solid var(--border-light);
          border-radius: 3px;
          padding: 2px 6px;
          font-size: 10px;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .copy-utr-btn:hover {
          border-color: var(--accent-terracotta);
          color: var(--accent-terracotta);
        }
        .receipt-preview-btn {
          font-size: 11px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .no-receipt-text {
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
        }

        .audit-verified-banner {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #E8F5E9;
          color: #2E7D32;
          padding: 6px 10px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }
        .audit-failed-banner {
          display: flex;
          gap: 6px;
          background: #FFEBEE;
          color: #C62828;
          padding: 8px 10px;
          border-radius: 3px;
          font-size: 11px;
        }
        .audit-failed-banner p {
          margin: 2px 0 0;
          font-size: 11px;
          line-height: 1.3;
        }
        .audit-tracking-banner {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #E3F2FD;
          color: #1565C0;
          padding: 6px 10px;
          border-radius: 3px;
          font-size: 11px;
        }

        /* Card Footer */
        .order-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #FAF8F5;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
          gap: 10px;
        }
        .footer-status-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .approve-btn {
          background: #2E7D32;
          color: #FFFFFF;
          border-color: #2E7D32;
          font-size: 12px;
          padding: 7px 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .approve-btn:hover {
          background: #1B5E20;
        }
        .reject-btn {
          color: #C62828;
          border-color: #FFCDD2;
          font-size: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .reject-btn:hover {
          background: #FFEBEE;
          border-color: #C62828;
        }
        .ship-btn {
          color: #1565C0;
          border-color: #90CAF9;
          font-size: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ship-btn:hover {
          background: #E3F2FD;
          border-color: #1565C0;
        }

        .footer-utility-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .whatsapp-btn {
          font-size: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
        }
        .invoice-btn {
          font-size: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .delete-btn {
          padding: 7px 10px;
          color: var(--text-muted);
        }
        .delete-btn:hover {
          color: #C62828;
          border-color: #C62828;
        }

        /* Empty State */
        .no-orders-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #FFFFFF;
          border: 1px dashed var(--border-light);
          border-radius: 6px;
          text-align: center;
          gap: 12px;
        }
        .no-orders-state h3 {
          font-family: var(--font-serif);
          font-size: 20px;
          margin: 0;
        }
        .no-orders-state p {
          color: var(--text-muted);
          font-size: 13px;
          max-width: 400px;
          margin: 0;
        }

        /* LIGHTBOX & SUB-MODALS */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .lightbox-modal {
          background: #FFFFFF;
          border-radius: 6px;
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .lightbox-modal.mini-modal {
          max-width: 480px;
        }
        .lightbox-modal.invoice-modal {
          max-width: 720px;
        }
        .lightbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: #FAF8F5;
          border-bottom: 1px solid var(--border-light);
        }
        .lightbox-header h4 {
          margin: 0;
          font-size: 15px;
          font-family: var(--font-serif);
        }
        .danger-modal-title, .ship-modal-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lightbox-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }
        .lightbox-body {
          padding: 20px;
          display: flex;
          justify-content: center;
          overflow-y: auto;
          background: #F5F5F5;
        }
        .lightbox-img {
          max-height: 60vh;
          max-width: 100%;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .lightbox-body-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-subtext {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .form-select, .form-input {
          padding: 9px 12px;
          font-size: 13px;
          font-family: inherit;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          background: #FFFFFF;
          outline: none;
        }
        .lightbox-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          background: #FAF8F5;
          border-top: 1px solid var(--border-light);
        }
        .btn-danger {
          background: #C62828;
          color: #FFFFFF;
          border: 1px solid #C62828;
          padding: 8px 16px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-danger:hover {
          background: #B71C1C;
        }

        /* Invoice Modal Specifics */
        .invoice-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #3E2723;
          color: #FAF6EF;
        }
        .invoice-brand {
          display: flex;
          flex-direction: column;
        }
        .brand-title {
          font-family: var(--font-serif);
          font-size: 20px;
          letter-spacing: 1px;
        }
        .brand-tag {
          font-size: 11px;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .invoice-content-printable {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: #FFFFFF;
        }
        .invoice-meta-grid {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 14px;
        }
        .meta-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .meta-main {
          font-family: monospace;
          margin: 4px 0 2px;
          font-size: 18px;
          color: var(--accent-terracotta);
        }
        .meta-date, .meta-utr {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 2px 0;
        }
        .invoice-status-pill {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          margin: 4px 0;
        }
        .invoice-status-pill.status-succeeded { background: #E8F5E9; color: #2E7D32; }
        .invoice-status-pill.status-pending_verification { background: #FFF3E0; color: #E65100; }
        .invoice-status-pill.status-failed { background: #FFEBEE; color: #C62828; }

        .invoice-parties-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 12px 16px;
          background: #FAF8F5;
          border-radius: 4px;
          font-size: 12px;
        }
        .party-box p {
          margin: 2px 0;
          color: var(--text-secondary);
        }
        .party-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
        }
        .invoice-items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .invoice-items-table th {
          background: #F4EFE6;
          padding: 8px 10px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .invoice-items-table td {
          padding: 10px;
          border-bottom: 1px solid var(--border-light);
        }
        .invoice-items-table tfoot td {
          padding: 12px 10px;
          font-size: 13px;
          border-bottom: none;
        }
        .text-right { text-align: right !important; }
        .invoice-notes-box {
          background: #FFFDF9;
          border-left: 3px solid var(--accent-gold);
          padding: 10px 14px;
          font-size: 12px;
        }
        .invoice-footer-seal {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          border-top: 1px dashed var(--border-light);
          padding-top: 14px;
          font-style: italic;
        }

        /* DISPATCH TOAST */
        .dispatch-toast {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #FAF6EF;
          border: 1px solid #C5A059;
          border-left: 4px solid #2E7D32;
          padding: 14px 18px;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(46, 125, 50, 0.12);
          animation: slideDownToast 0.3s ease-out;
        }
        @keyframes slideDownToast {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dispatch-toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E8F5E9;
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dispatch-toast-content {
          flex: 1;
        }
        .dispatch-toast-content h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          color: #1F1A17;
          font-weight: 600;
        }
        .dispatch-toast-content p {
          margin: 0;
          font-size: 12px;
          color: #5C524B;
        }
        .dispatch-toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #8A817A;
          padding: 4px;
          border-radius: 4px;
        }
        .dispatch-toast-close:hover {
          color: #1F1A17;
          background: #EFEAE1;
        }

        /* DISPATCH MODAL & CONSOLE */
        .dispatch-modal {
          max-width: 680px;
          width: 100%;
        }
        .modal-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: normal;
        }
        .dispatch-destination-card {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 8px;
        }
        .dest-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-dark);
          margin-bottom: 2px;
        }
        .dest-address {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .dest-contact {
          font-size: 11px;
          color: var(--accent-terracotta);
          display: flex;
          gap: 10px;
        }
        .dest-right {
          text-align: right;
          flex-shrink: 0;
        }
        .order-items-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dark);
        }
        .order-status-tag {
          font-size: 11px;
          color: var(--accent-gold);
          margin-top: 2px;
        }
        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .generate-awb-btn {
          background: none;
          border: 1px solid var(--border-gold);
          color: var(--accent-terracotta);
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 3px;
          cursor: pointer;
          transition: var(--transition);
        }
        .generate-awb-btn:hover {
          background: var(--bg-cream-tint);
        }
        .quick-presets {
          display: flex;
          gap: 4px;
        }
        .preset-pill {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .preset-pill:hover {
          background: var(--accent-terracotta);
          color: #FFFFFF;
          border-color: var(--accent-terracotta);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon .field-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-with-icon .form-input {
          padding-left: 32px;
        }
        .field-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }
        .dispatch-email-card {
          background: #FFFDF9;
          border: 1px solid #E2CA9B;
          border-radius: 4px;
          padding: 12px 14px;
          margin-top: 6px;
        }
        .email-toggle-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }
        .email-toggle-label input[type="checkbox"] {
          margin-top: 3px;
          accent-color: var(--accent-terracotta);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .email-toggle-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dark);
        }
        .email-toggle-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
          line-height: 1.4;
        }
        .dispatch-submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* AUDIT TRACKING BANNER IN CARD */
        .audit-tracking-banner {
          background: #EBF3FC;
          border: 1px solid #B8D5F8;
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: #1E4F8A;
          margin-top: 6px;
        }
        .tracking-banner-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tracking-main-line {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .meta-dot {
          color: #8BA8CC;
        }
        .tracking-awb-tag {
          font-family: monospace;
          background: #FFFFFF;
          padding: 1px 5px;
          border-radius: 2px;
          font-size: 11px;
          border: 1px solid #D2E3F8;
        }
        .tracking-eta-line {
          font-size: 11px;
          color: #386497;
        }
        .ship-btn-active {
          border-color: #2E7D32 !important;
          color: #2E7D32 !important;
        }
        .ship-btn-active:hover {
          background: #E8F5E9 !important;
        }

        /* OUTBOX MODAL & PREVIEW */
        .outbox-modal {
          max-width: 720px;
          width: 100%;
        }
        .lightbox-body-outbox {
          max-height: 60vh;
          overflow-y: auto;
          padding: 16px 24px;
        }
        .empty-outbox-state {
          text-align: center;
          padding: 40px 20px;
        }
        .empty-outbox-state h4 {
          margin: 12px 0 6px 0;
          color: var(--text-dark);
        }
        .empty-outbox-state p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .outbox-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .outbox-item-card {
          background: #FAF6EF;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: var(--transition);
        }
        .outbox-item-card:hover {
          border-color: var(--accent-terracotta);
          background: #FFFFFF;
        }
        .outbox-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .outbox-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 3px;
        }
        .outbox-badge.type-dispatch_notification {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .outbox-badge.type-order_confirmation {
          background: #FFF3E0;
          color: #E65100;
        }
        .outbox-time {
          font-size: 11px;
          color: var(--text-muted);
        }
        .outbox-subject {
          font-size: 13px;
          color: var(--text-dark);
        }
        .outbox-details-row {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 11px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .outbox-method-tag {
          background: #EDE6D8;
          padding: 1px 6px;
          border-radius: 2px;
          color: var(--text-dark);
        }
        .outbox-item-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }
        .preview-email-btn {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
        }
        .email-preview-modal {
          max-width: 780px;
          width: 100%;
        }
        .email-preview-frame-container {
          padding: 12px 24px;
          background: #F7F3EC;
        }
        .email-preview-iframe {
          width: 100%;
          height: 65vh;
          border: 1px solid #E5DDCF;
          border-radius: 4px;
          background: #FAF6EF;
        }

        /* RESPONSIVE ADAPTATIONS */
        @media (max-width: 900px) {
          .orders-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .order-card-body {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }

        @media (max-width: 600px) {
          .orders-kpi-grid {
            grid-template-columns: 1fr;
          }
          .orders-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .orders-toolbar-actions {
            justify-content: stretch;
          }
          .orders-sort-select {
            flex: 1;
          }
          .order-card-footer {
            flex-direction: column;
            align-items: stretch;
          }
          .footer-status-controls, .footer-utility-controls {
            flex-direction: column;
            width: 100%;
          }
          .footer-status-controls button, .footer-utility-controls a, .footer-utility-controls button {
            width: 100%;
            justify-content: center;
          }
          .invoice-parties-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
