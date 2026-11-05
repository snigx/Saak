import React, { useEffect, useMemo, useState } from 'react';
import { Tag, Layers, Pause, Play, Trash2, Copy, Check, ExternalLink, RefreshCw, Loader2, AlertCircle, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { checkOffersSetup } from '../services/settingsService';
import {
  DEFAULT_OFFER,
  MAX_PERCENT,
  applyOffer,
  describeOfferValue,
  formatOfferDate,
  getOfferStatus,
  normalizeOffer,
  dateInputToIso,
  isoToDateInput
} from '../utils/offers';
import offersMigrationSql from '../../supabase/migrations/20261105_offers.sql?raw';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sarees', label: 'Sarees' },
  { key: 'blouses', label: 'Blouses' },
  { key: 'sets', label: 'Duo sets' },
  { key: 'on-offer', label: 'With an offer' }
];

const LABEL_SUGGESTIONS = ['Festive offer', 'Diwali offer', 'Wedding season', 'Launch offer'];
const PERCENT_CHIPS = [5, 10, 15, 20, 25];
const AMOUNT_CHIPS = [250, 500, 1000];

const supabaseProjectRef = (() => {
  try {
    return new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0];
  } catch {
    return null;
  }
})();

// ---------------------------------------------------------------------------
// Status chip: "Live · 10% off · ends 12 Nov", "Starts 14 Nov", "Paused"…
// ---------------------------------------------------------------------------
function OfferStatus({ offer }) {
  const status = getOfferStatus(offer);
  if (status === 'none') return <span className="ofr-status is-none">No offer</span>;
  const value = describeOfferValue(offer);
  const text = {
    live: `Live · ${value}${offer.endsAt ? ` · ends ${formatOfferDate(offer.endsAt)}` : ''}`,
    scheduled: `Starts ${formatOfferDate(offer.startsAt)} · ${value}`,
    paused: `Paused · ${value}`,
    ended: `Ended ${formatOfferDate(offer.endsAt)} · ${value}`
  }[status];
  return <span className={`ofr-status is-${status}`}>{text}</span>;
}

// ---------------------------------------------------------------------------
// Editor used for one product, several products, or the pair offer
// ---------------------------------------------------------------------------
function OfferEditor({ initial, basePrice, previewNote, saveLabel, onSave, onCancel, busy, error }) {
  const start = normalizeOffer(initial) || DEFAULT_OFFER;
  const [type, setType] = useState(start.type);
  const [value, setValue] = useState(String(start.value));
  const [label, setLabel] = useState(start.label);
  const [startDate, setStartDate] = useState(isoToDateInput(start.startsAt));
  const [endDate, setEndDate] = useState(isoToDateInput(start.endsAt));

  const numeric = Number(value);
  const today = isoToDateInput(new Date().toISOString());

  let problem = '';
  if (!value || !Number.isFinite(numeric) || numeric <= 0) problem = 'Enter how much to take off.';
  else if (type === 'percent' && numeric > MAX_PERCENT) problem = `Keep it at ${MAX_PERCENT}% or less.`;
  else if (type === 'amount' && basePrice && numeric >= basePrice) problem = 'The amount off must be less than the price.';
  else if (endDate && endDate < today) problem = 'The end date has already passed.';
  else if (startDate && endDate && endDate < startDate) problem = 'The offer ends before it starts.';

  const draft = {
    type,
    value: numeric,
    label,
    startsAt: startDate && startDate > today ? dateInputToIso(startDate) : null,
    endsAt: dateInputToIso(endDate, true),
    enabled: true
  };

  const previewPrice = basePrice ? applyOffer(basePrice, draft) : null;
  const whenText = draft.startsAt
    ? `Goes live on ${formatOfferDate(draft.startsAt)}${draft.endsAt ? `, ends ${formatOfferDate(draft.endsAt)}` : ''}.`
    : draft.endsAt
      ? `Goes live as soon as you save and ends on ${formatOfferDate(draft.endsAt)}.`
      : 'Goes live as soon as you save and runs until you pause or remove it.';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problem || busy) return;
    onSave(draft);
  };

  return (
    <form className="ofr-editor" onSubmit={handleSubmit}>
      <div className="ofr-editor-grid">
        <div className="form-group">
          <span className="form-label">Discount</span>
          <div className="ofr-segment" role="radiogroup" aria-label="Discount type">
            <button
              type="button"
              role="radio"
              aria-checked={type === 'percent'}
              className={type === 'percent' ? 'active' : ''}
              onClick={() => { setType('percent'); setValue('10'); }}
            >
              % off
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={type === 'amount'}
              className={type === 'amount' ? 'active' : ''}
              onClick={() => { setType('amount'); setValue('500'); }}
            >
              ₹ off
            </button>
          </div>
          <div className="ofr-value-row">
            <span className="ofr-affix">{type === 'amount' ? '₹' : ''}</span>
            <input
              type="number"
              min="1"
              max={type === 'percent' ? MAX_PERCENT : undefined}
              inputMode="numeric"
              className="form-input ofr-value-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label={type === 'percent' ? 'Percent off' : 'Rupees off'}
            />
            <span className="ofr-affix">{type === 'percent' ? '% off' : 'off'}</span>
          </div>
          <div className="ofr-chips">
            {(type === 'percent' ? PERCENT_CHIPS : AMOUNT_CHIPS).map(v => (
              <button
                type="button"
                key={v}
                className={`ofr-chip ${numeric === v ? 'active' : ''}`}
                onClick={() => setValue(String(v))}
              >
                {type === 'percent' ? `${v}%` : `₹${v.toLocaleString('en-IN')}`}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ofr-label">Name shown to customers <span className="ofr-optional">(optional)</span></label>
          <input
            id="ofr-label"
            type="text"
            maxLength={28}
            placeholder="e.g. Diwali offer"
            className="form-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="ofr-chips">
            {LABEL_SUGGESTIONS.map(s => (
              <button type="button" key={s} className={`ofr-chip ${label === s ? 'active' : ''}`} onClick={() => setLabel(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <span className="form-label">When</span>
          <div className="ofr-dates">
            <label>
              <span>Starts</span>
              <input type="date" className="form-input" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <span>Ends</span>
              <input type="date" className="form-input" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
          <span className="form-hint">Leave both empty to start now and run until you stop it.</span>
        </div>
      </div>

      <div className="ofr-preview">
        <span className="ofr-preview-label">Customers will see</span>
        <div className="ofr-preview-body">
          <span className="saak-tag is-offer">{label.trim() ? `${label.trim()} · ${describeOfferValue(draft) || '—'}` : (describeOfferValue(draft) || '—')}</span>
          {previewPrice != null && !problem && (
            <span className="offer-price">
              <span className="price-now on-offer">₹{previewPrice.toLocaleString('en-IN')}</span>
              <s className="price-was">₹{Number(basePrice).toLocaleString('en-IN')}</s>
            </span>
          )}
        </div>
        {previewNote && <span className="ofr-preview-note">{previewNote}</span>}
        <span className="ofr-preview-note">{whenText}</span>
      </div>

      {(problem || error) && (
        <p className="ofr-error"><AlertCircle size={14} /> {problem || error}</p>
      )}

      <div className="ofr-editor-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={Boolean(problem) || busy}>
          {busy ? <Loader2 size={14} className="ofr-spin" /> : <Check size={14} />}
          <span>{saveLabel}</span>
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// One-time database update
// ---------------------------------------------------------------------------
function SetupCard({ onRecheck, checking }) {
  const [copied, setCopied] = useState(false);
  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(offersMigrationSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="ofr-setup">
      <h3>One-time setup before offers can go live</h3>
      <p>
        Offers are saved in your Supabase database, which needs one small update first. It adds a place to
        store offers and changes nothing else.
      </p>
      <ol>
        <li>Copy the update.</li>
        <li>Open the Supabase SQL editor, paste it and press <strong>Run</strong>.</li>
        <li>Come back here and press <strong>Check again</strong>.</li>
      </ol>
      <div className="ofr-setup-actions">
        <button type="button" className="btn btn-primary" onClick={copySql}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy the update'}</span>
        </button>
        {supabaseProjectRef && (
          <a
            className="btn btn-outline"
            href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/sql/new`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={14} />
            <span>Open SQL editor</span>
          </a>
        )}
        <button type="button" className="btn btn-outline" onClick={onRecheck} disabled={checking}>
          {checking ? <Loader2 size={14} className="ofr-spin" /> : <RefreshCw size={14} />}
          <span>Check again</span>
        </button>
      </div>
      <span className="form-hint">The same update is in supabase/migrations/20261105_offers.sql.</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offers tab
// ---------------------------------------------------------------------------
export default function AdminOffersView() {
  const { products, pairOffer, setProductOffer, updatePairOffer, formatPrice } = useShop();

  const [setup, setSetup] = useState({ ready: null, checking: true });
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  // What's open: null | 'pair' | 'bulk' | <product id>
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const runSetupCheck = async () => {
    setSetup(prev => ({ ...prev, checking: true }));
    const result = await checkOffersSetup();
    setSetup({ ready: result.ready, checking: false });
  };

  useEffect(() => {
    let alive = true;
    checkOffersSetup().then(result => {
      if (alive) setSetup({ ready: result.ready, checking: false });
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const visible = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'on-offer') return products.filter(p => getOfferStatus(p.discount) !== 'none');
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  const counts = useMemo(() => {
    const all = [...products.map(p => p.discount), pairOffer];
    return {
      live: all.filter(o => getOfferStatus(o) === 'live').length,
      scheduled: all.filter(o => getOfferStatus(o) === 'scheduled').length
    };
  }, [products, pairOffer]);

  // A sample pair for the pair-offer preview
  const samplePair = useMemo(() => {
    const saree = products.find(p => p.category === 'sarees');
    const blouse = products.find(p => p.category === 'blouses');
    return saree && blouse ? { saree, blouse, total: saree.basePrice + blouse.basePrice } : null;
  }, [products]);

  const openEditor = (key) => {
    setError('');
    setEditing(prev => (prev === key ? null : key));
  };

  const finish = (message) => {
    setBusy(false);
    setEditing(null);
    setError('');
    setToast(message);
  };

  const saveForProducts = async (ids, offer, message) => {
    setBusy(true);
    setError('');
    const results = await Promise.all(ids.map(id => setProductOffer(id, offer)));
    const failed = results.find(r => !r.ok);
    if (failed) {
      setBusy(false);
      setError(failed.error || 'Could not save. Please try again.');
      return false;
    }
    finish(message);
    return true;
  };

  const savePair = async (offer, message) => {
    setBusy(true);
    setError('');
    const result = await updatePairOffer(offer);
    if (!result.ok) {
      setBusy(false);
      setError(result.error || 'Could not save. Please try again.');
      return;
    }
    finish(message);
  };

  const togglePause = (product) => {
    const offer = normalizeOffer(product.discount);
    if (!offer) return;
    saveForProducts([product.id], { ...offer, enabled: !offer.enabled }, offer.enabled ? 'Offer paused' : 'Offer resumed');
  };

  const pauseAll = async () => {
    const active = products.filter(p => ['live', 'scheduled'].includes(getOfferStatus(p.discount)));
    setBusy(true);
    await Promise.all(active.map(p => setProductOffer(p.id, { ...normalizeOffer(p.discount), enabled: false })));
    if (['live', 'scheduled'].includes(getOfferStatus(pairOffer))) {
      await updatePairOffer({ ...pairOffer, enabled: false });
    }
    finish('All offers paused');
  };

  const toggleSelected = (id) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };
  const allVisibleSelected = visible.length > 0 && visible.every(p => selected.includes(p.id));
  const toggleAllVisible = () => {
    setSelected(prev => (allVisibleSelected
      ? prev.filter(id => !visible.some(p => p.id === id))
      : [...new Set([...prev, ...visible.map(p => p.id)])]));
  };

  if (setup.ready === null) {
    return (
      <div className="ofr-view ofr-loading">
        <Loader2 size={18} className="ofr-spin" /> Checking offers…
        <style>{OFFERS_CSS}</style>
      </div>
    );
  }

  const locked = !setup.ready;
  const pairStatus = getOfferStatus(pairOffer);

  return (
    <div className="ofr-view">
      {locked && <SetupCard onRecheck={runSetupCheck} checking={setup.checking} />}

      <div className={`ofr-body ${locked ? 'is-locked' : ''}`} aria-disabled={locked}>
        {/* Summary */}
        <div className="ofr-summary">
          <p>
            {counts.live === 0 && counts.scheduled === 0
              ? 'No offers running. Every piece sells at its regular price.'
              : `${counts.live} ${counts.live === 1 ? 'offer' : 'offers'} live${counts.scheduled ? ` · ${counts.scheduled} scheduled` : ''}`}
            <span className="ofr-rule">Offers never stack: a customer always gets the single best price.</span>
          </p>
          {(counts.live > 0 || counts.scheduled > 0) && (
            <button type="button" className="btn btn-outline ofr-small-btn" onClick={pauseAll} disabled={busy || locked}>
              <Pause size={13} />
              <span>Pause all offers</span>
            </button>
          )}
        </div>

        {/* Mix & Match pair offer */}
        <section className="ofr-card">
          <div className="ofr-card-head">
            <div className="ofr-card-icon"><Layers size={18} /></div>
            <div className="ofr-card-text">
              <h3>Mix &amp; Match pairs</h3>
              <p>Applies when a customer adds any saree with any blouse or corset from Mix &amp; Match.</p>
              <OfferStatus offer={pairOffer} />
            </div>
            <div className="ofr-row-actions">
              {pairStatus !== 'none' && (
                <>
                  <button
                    type="button"
                    className="ofr-icon-btn"
                    title={pairOffer.enabled ? 'Pause' : 'Resume'}
                    aria-label={pairOffer.enabled ? 'Pause pair offer' : 'Resume pair offer'}
                    onClick={() => savePair({ ...pairOffer, enabled: !pairOffer.enabled }, pairOffer.enabled ? 'Pair offer paused' : 'Pair offer resumed')}
                    disabled={busy || locked}
                  >
                    {pairOffer.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    type="button"
                    className="ofr-icon-btn"
                    title="Remove"
                    aria-label="Remove pair offer"
                    onClick={() => savePair(null, 'Pair offer removed')}
                    disabled={busy || locked}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button type="button" className="btn btn-outline ofr-small-btn" onClick={() => openEditor('pair')} disabled={locked}>
                <Tag size={13} />
                <span>{pairStatus === 'none' ? 'Add offer' : 'Edit'}</span>
              </button>
            </div>
          </div>
          {editing === 'pair' && (
            <OfferEditor
              initial={pairOffer}
              basePrice={samplePair?.total}
              previewNote={samplePair ? `Example: ${samplePair.saree.name} + ${samplePair.blouse.name}` : ''}
              saveLabel="Save pair offer"
              onSave={(offer) => savePair(offer, 'Pair offer saved')}
              onCancel={() => setEditing(null)}
              busy={busy}
              error={error}
            />
          )}
        </section>

        {/* Product offers */}
        <section className="ofr-card">
          <div className="ofr-list-head">
            <h3>Products and duo sets</h3>
            <div className="ofr-filters" role="tablist">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`ofr-chip ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ofr-bulk-bar">
            <label className="ofr-check">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} disabled={locked || visible.length === 0} />
              <span>{selected.length > 0 ? `${selected.length} selected` : 'Select all shown'}</span>
            </label>
            {selected.length > 0 && (
              <div className="ofr-bulk-actions">
                <button type="button" className="btn btn-primary ofr-small-btn" onClick={() => openEditor('bulk')} disabled={locked}>
                  <Tag size={13} />
                  <span>Offer on {selected.length}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline ofr-small-btn"
                  disabled={busy || locked}
                  onClick={async () => {
                    if (await saveForProducts(selected, null, `Offers removed from ${selected.length} pieces`)) setSelected([]);
                  }}
                >
                  <span>Remove offers</span>
                </button>
                <button type="button" className="ofr-icon-btn" aria-label="Clear selection" onClick={() => setSelected([])}>
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {editing === 'bulk' && selected.length > 0 && (
            <OfferEditor
              initial={null}
              basePrice={products.find(p => p.id === selected[0])?.basePrice}
              previewNote={selected.length > 1 ? `Price shown for ${products.find(p => p.id === selected[0])?.name}. The same offer applies to all ${selected.length}.` : ''}
              saveLabel={`Apply to ${selected.length} piece${selected.length > 1 ? 's' : ''}`}
              onSave={async (offer) => {
                if (await saveForProducts(selected, offer, `Offer applied to ${selected.length} piece${selected.length > 1 ? 's' : ''}`)) setSelected([]);
              }}
              onCancel={() => setEditing(null)}
              busy={busy}
              error={error}
            />
          )}

          <ul className="ofr-list">
            {visible.length === 0 && <li className="ofr-empty">Nothing here yet.</li>}
            {visible.map(product => {
              const status = getOfferStatus(product.discount);
              return (
                <li key={product.id} className={`ofr-row ${editing === product.id ? 'is-open' : ''}`}>
                  <div className="ofr-row-main">
                    <input
                      type="checkbox"
                      className="ofr-row-check"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      aria-label={`Select ${product.name}`}
                      disabled={locked}
                    />
                    <img src={product.images?.modelView || product.images?.flatlayView} alt="" className="ofr-thumb" />
                    <div className="ofr-row-info">
                      <span className="ofr-row-name">{product.name}</span>
                      <span className="ofr-row-price">
                        {product.offer ? (
                          <span className="offer-price">
                            <span className="price-now on-offer">{formatPrice(product.price)}</span>
                            <s className="price-was">{formatPrice(product.basePrice)}</s>
                          </span>
                        ) : formatPrice(product.basePrice)}
                      </span>
                      <OfferStatus offer={product.discount} />
                    </div>
                    <div className="ofr-row-actions">
                      {status !== 'none' && (
                        <>
                          <button
                            type="button"
                            className="ofr-icon-btn"
                            title={product.discount.enabled ? 'Pause' : 'Resume'}
                            aria-label={`${product.discount.enabled ? 'Pause' : 'Resume'} offer on ${product.name}`}
                            onClick={() => togglePause(product)}
                            disabled={busy || locked}
                          >
                            {product.discount.enabled ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            type="button"
                            className="ofr-icon-btn"
                            title="Remove"
                            aria-label={`Remove offer on ${product.name}`}
                            onClick={() => saveForProducts([product.id], null, 'Offer removed')}
                            disabled={busy || locked}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      <button type="button" className="btn btn-outline ofr-small-btn" onClick={() => openEditor(product.id)} disabled={locked}>
                        <Tag size={13} />
                        <span>{status === 'none' ? 'Add offer' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                  {editing === product.id && (
                    <OfferEditor
                      initial={product.discount}
                      basePrice={product.basePrice}
                      saveLabel="Save offer"
                      onSave={(offer) => saveForProducts([product.id], offer, 'Offer saved')}
                      onCancel={() => setEditing(null)}
                      busy={busy}
                      error={error}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {toast && <div className="ofr-toast" role="status"><Check size={14} /> {toast}</div>}

      <style>{OFFERS_CSS}</style>
    </div>
  );
}

const OFFERS_CSS = `
  .ofr-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
  }
  .ofr-loading {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 32px 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
  .ofr-spin { animation: ofr-spin 0.9s linear infinite; }
  @keyframes ofr-spin { to { transform: rotate(360deg); } }

  .ofr-body { display: flex; flex-direction: column; gap: 16px; }
  .ofr-body.is-locked { opacity: 0.45; pointer-events: none; user-select: none; }

  /* Setup */
  .ofr-setup {
    background: #FDF8F0;
    border: 1px solid var(--border-gold);
    border-left: 4px solid var(--accent-gold);
    border-radius: 4px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ofr-setup h3 { font-size: var(--text-lg); color: var(--text-primary); }
  .ofr-setup p, .ofr-setup ol { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
  .ofr-setup ol { padding-left: 20px; }
  .ofr-setup-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .ofr-setup-actions .btn { font-size: var(--text-xs); padding: 9px 14px; text-decoration: none; }

  /* Summary */
  .ofr-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .ofr-summary p {
    font-size: var(--text-sm);
    color: var(--text-primary);
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ofr-rule { font-weight: 400; color: var(--text-muted); font-size: var(--text-xs); }

  /* Cards */
  .ofr-card {
    border: 1px solid var(--border-light);
    border-radius: 4px;
    padding: 16px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ofr-card h3 { font-size: var(--text-lg); color: var(--text-primary); }
  .ofr-card-head { display: flex; align-items: flex-start; gap: 14px; }
  .ofr-card-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-gold);
    border-radius: 50%;
    color: var(--accent-terracotta);
  }
  .ofr-card-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .ofr-card-text p { font-size: var(--text-sm); color: var(--text-secondary); }

  /* Status */
  .ofr-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    width: fit-content;
  }
  .ofr-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .ofr-status.is-none { color: var(--text-muted); background: transparent; padding-left: 0; font-weight: 500; }
  .ofr-status.is-none::before { display: none; }
  .ofr-status.is-live { color: var(--accent-terracotta); background: rgba(163, 72, 53, 0.08); }
  .ofr-status.is-scheduled { color: #8A6A2B; background: rgba(197, 160, 89, 0.16); }
  .ofr-status.is-paused, .ofr-status.is-ended { color: var(--text-muted); background: rgba(0, 0, 0, 0.05); }

  /* List */
  .ofr-list-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .ofr-filters { display: flex; flex-wrap: wrap; gap: 6px; }
  .ofr-bulk-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 8px 10px;
    background: var(--bg-primary);
    border-radius: 3px;
    min-height: 44px;
  }
  .ofr-check { display: inline-flex; align-items: center; gap: 8px; font-size: var(--text-xs); color: var(--text-secondary); cursor: pointer; }
  .ofr-check input, .ofr-row-check { width: 16px; height: 16px; accent-color: var(--accent-terracotta); cursor: pointer; }
  .ofr-bulk-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .ofr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .ofr-empty { padding: 20px 0; font-size: var(--text-sm); color: var(--text-muted); text-align: center; }
  .ofr-row { border-bottom: 1px solid var(--border-light); padding: 10px 0; }
  .ofr-row:last-child { border-bottom: none; }
  .ofr-row.is-open { background: #FFFCF7; }
  .ofr-row-main { display: flex; align-items: center; gap: 12px; }
  .ofr-thumb { width: 44px; height: 58px; object-fit: cover; border-radius: 2px; flex-shrink: 0; background: #EAE3D6; }
  .ofr-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
  .ofr-row-name {
    font-family: var(--font-serif);
    font-size: var(--text-base);
    color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .ofr-row-price { font-size: var(--text-sm); color: var(--text-secondary); font-weight: 600; }
  .ofr-row-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  .ofr-small-btn { font-size: var(--text-xs); padding: 7px 12px; gap: 6px; }
  .ofr-icon-btn {
    width: 32px; height: 32px;
    display: inline-flex; align-items: center; justify-content: center;
    background: none;
    border: 1px solid var(--border-light);
    border-radius: 2px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
  }
  .ofr-icon-btn:hover:not(:disabled) { border-color: var(--accent-terracotta); color: var(--accent-terracotta); }
  .ofr-icon-btn:disabled { opacity: 0.5; cursor: default; }

  .ofr-chip {
    background: #FFFFFF;
    border: 1px solid var(--border-light);
    border-radius: 14px;
    padding: 4px 11px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
  }
  .ofr-chip:hover { border-color: var(--accent-gold); color: var(--text-primary); }
  .ofr-chip.active { background: var(--text-primary); border-color: var(--text-primary); color: #FFFFFF; }

  /* Editor */
  .ofr-editor {
    margin-top: 12px;
    border: 1px solid var(--border-gold);
    border-radius: 4px;
    background: #FFFFFF;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ofr-editor-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .ofr-editor-grid > * { min-width: 0; }
  .ofr-optional { font-weight: 400; color: var(--text-muted); }
  .ofr-segment { display: inline-flex; border: 1px solid var(--border-light); border-radius: 3px; overflow: hidden; width: fit-content; }
  .ofr-segment button {
    background: #FFFFFF; border: none; padding: 7px 14px;
    font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); cursor: pointer;
  }
  .ofr-segment button + button { border-left: 1px solid var(--border-light); }
  .ofr-segment button.active { background: var(--accent-terracotta); color: #FFFFFF; }
  .ofr-value-row { display: flex; align-items: center; gap: 8px; }
  .ofr-value-input { width: 96px; font-size: var(--text-lg) !important; font-weight: 600; }
  .ofr-affix { font-size: var(--text-sm); color: var(--text-secondary); }
  .ofr-affix:empty { display: none; }
  .ofr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .ofr-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ofr-dates label { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--text-secondary); }
  .ofr-dates .form-input { width: 100%; min-width: 0; padding: 8px 10px; }

  .ofr-preview {
    background: var(--bg-primary);
    border-radius: 3px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ofr-preview-label { font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
  .ofr-preview-body { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: var(--text-lg); font-weight: 600; }
  .ofr-preview-note { font-size: var(--text-xs); color: var(--text-secondary); }

  .ofr-error {
    display: flex; align-items: center; gap: 6px;
    font-size: var(--text-sm); color: #B3261E;
  }
  .ofr-editor-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .ofr-editor-actions .btn { font-size: var(--text-xs); padding: 9px 16px; gap: 6px; }

  .ofr-toast {
    position: sticky;
    bottom: 0;
    align-self: center;
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--text-primary);
    color: #FFFFFF;
    font-size: var(--text-sm);
    padding: 10px 16px;
    border-radius: 3px;
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 760px) {
    .ofr-editor-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .ofr-card { padding: 12px; }
    .ofr-card-head { flex-wrap: wrap; }
    .ofr-card-head .ofr-row-actions { width: 100%; justify-content: flex-end; }
    .ofr-row-main { flex-wrap: wrap; }
    .ofr-row-info { flex-basis: calc(100% - 92px); }
    .ofr-row-actions { width: 100%; justify-content: flex-end; }
    .ofr-editor { padding: 12px; }
    .ofr-dates { grid-template-columns: 1fr; }
    .ofr-editor-actions .btn { flex: 1; justify-content: center; white-space: nowrap; padding: 10px 8px; }
  }
`;
