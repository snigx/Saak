-- =============================================================================
-- SAAK BY APRAJITA — SUPABASE DATABASE & BLOB STORAGE SCHEMA
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  sub_category text not null,
  price numeric not null,
  original_price numeric,
  tag text,
  tag_color text default '#A34835',
  description text,
  fabric text,
  drape_style text,
  drape_weight text,
  zari_work text,
  is_custom_color_available boolean default false,
  available_custom_colors jsonb default '[]'::jsonb,
  size_options jsonb default '["Standard 6-Yard"]'::jsonb,
  model_photos jsonb default '[]'::jsonb,
  flatlay_photos jsonb default '[]'::jsonb,
  gallery jsonb default '[]'::jsonb,
  model_view text,
  flatlay_view text,
  swatch_zoom text,
  recommended_pairings jsonb default '[]'::jsonb,
  bundle_discount_percent integer default 10,
  in_stock boolean default true,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;

-- Policy: Everyone can view products (Public Read)
create policy "Allow public read access on products"
  on public.products for select
  using (true);

-- Policy: Allow inserts and updates (In production, restrict to authenticated admin)
create policy "Allow public insert and update on products"
  on public.products for all
  using (true)
  with check (true);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  styling_notes text,
  items jsonb not null,
  total_amount numeric not null,
  utr_number text not null,
  payment_screenshot_url text,
  payment_status text default 'pending_verification',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Orders
alter table public.orders enable row level security;

-- Policy: Anyone can insert an order during checkout
create policy "Allow public insert on orders"
  on public.orders for insert
  with check (true);

-- Policy: Allow public read of their own orders (or admin read)
create policy "Allow read on orders"
  on public.orders for select
  using (true);

-- 3. STORAGE BUCKET FOR PRODUCT BLOBS & IMAGES
-- Create public storage bucket 'saak-media'
insert into storage.buckets (id, name, public)
values ('saak-media', 'saak-media', true)
on conflict (id) do nothing;

-- Set up storage policies for 'saak-media' bucket
create policy "Public Access on saak-media"
  on storage.objects for select
  using (bucket_id = 'saak-media');

create policy "Public Upload to saak-media"
  on storage.objects for insert
  with check (bucket_id = 'saak-media');

create policy "Public Delete from saak-media"
  on storage.objects for delete
  using (bucket_id = 'saak-media');

-- 4. SEED INITIAL PRODUCTS DATA
insert into public.products (
  id, name, category, sub_category, price, original_price, tag, tag_color,
  description, fabric, drape_style, drape_weight, zari_work,
  is_custom_color_available, available_custom_colors, size_options,
  model_photos, flatlay_photos, gallery, model_view, flatlay_view, swatch_zoom,
  recommended_pairings, bundle_discount_percent, in_stock, featured
) values
(
  'the-gold-corset',
  'The Sculpted Antique Gold Corset',
  'blouses',
  'corset',
  5450,
  6200,
  'Hero Statement Corset',
  '#C5A059',
  'A masterpiece of modern Indian corsetry. Structured boned bodice with dense antique gold zardozi, micro-sequins, and intricate threadwork. Features a sculpted sweetheart plunge neckline and slender straps.',
  'Raw Silk Base with Dense Hand Zardozi Embroidery',
  'Structured Boned Corset Bustier',
  'Architectural & Secure',
  'Handcrafted Antique Gold Zari & Cut-dana Work',
  false,
  '[]'::jsonb,
  '["XS (Bust 32)", "S (Bust 34)", "M (Bust 36)", "L (Bust 38)", "XL (Bust 40)", "Custom Bespoke"]'::jsonb,
  '["/assets/saak_muse_black_saree_gold_corset.jpg", "/assets/saak_muse_black_corset_side.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg"]'::jsonb,
  '["/assets/saak_muse_black_saree_gold_corset.jpg", "/assets/saak_muse_black_corset_side.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg"]'::jsonb,
  '/assets/saak_muse_black_saree_gold_corset.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg',
  '/assets/saak_muse_black_corset_side.jpg',
  '["sunset-orange-tissue", "olive-bloom-tissue", "burnt-copper-tissue"]'::jsonb,
  10,
  true,
  true
),
(
  'sunset-orange-tissue',
  'Sunset Orange Shimmer Tissue Saree',
  'sarees',
  'tissue',
  4850,
  5500,
  'Custom Shade Available',
  '#A34835',
  'Sunset orange tissue saree with a subtle golden sheen, perfect for festive occasions. The crushed metallic weave glints with dual-tone warmth under ambient light, bordered with an antique Banarasi zari weave.',
  'Crushed Metallic Shimmer Tissue Silk',
  'Classic 6-Yard (Optional Pre-Stitched Pleats)',
  'Ultra-Lightweight & Fluid',
  'Banarasi Antique Gold Zari Brocade Border',
  true,
  '[{"name":"Sunset Terracotta","hex":"#A34835"},{"name":"Olive Green","hex":"#5B664B"},{"name":"Champagne Gold","hex":"#E2CA9B"},{"name":"Lilac Lavender","hex":"#C6B2DC"},{"name":"Powder Sage","hex":"#9EB09E"},{"name":"Deep Crimson Wine","hex":"#6B2228"}]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["/assets/muse_sunset_tissue.jpg", "/assets/muse_sunset_tissue_2.jpg"]'::jsonb,
  '["/assets/saak_folded_copper_tissue.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '["/assets/muse_sunset_tissue.jpg", "/assets/muse_sunset_tissue_2.jpg", "/assets/saak_folded_copper_tissue.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '/assets/muse_sunset_tissue.jpg',
  '/assets/saak_folded_copper_tissue.jpg',
  '/assets/saak_flatlay_copper_green.jpg',
  '["the-gold-corset"]'::jsonb,
  10,
  true,
  true
),
(
  'olive-bloom-tissue',
  'Olive Bloom Shimmer Tissue Saree',
  'sarees',
  'tissue',
  4550,
  5200,
  'Bestselling Sheen',
  '#5B664B',
  'Leaf green crushed tissue saree illuminated with a delicate golden metallic sheen. Unfolds with airy grace and effortless volume, accented by an intricately woven antique zari border.',
  'Crushed Metallic Shimmer Tissue',
  'Classic 6-Yard (Fall & Pico Included)',
  'Featherlight & Luminous',
  'Banarasi Floral Zari Jaal Border',
  true,
  '[{"name":"Olive Leaf","hex":"#5B664B"},{"name":"Burnt Copper","hex":"#8C3B2B"},{"name":"Sand Gold","hex":"#C5A059"}]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["/assets/muse_olive_tissue.jpg"]'::jsonb,
  '["/assets/saak_green_tissue_drape.jpg", "/assets/saak_green_tissue_swirl.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '["/assets/muse_olive_tissue.jpg", "/assets/saak_green_tissue_drape.jpg", "/assets/saak_green_tissue_swirl.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '/assets/muse_olive_tissue.jpg',
  '/assets/saak_green_tissue_drape.jpg',
  '/assets/saak_green_tissue_swirl.jpg',
  '["the-gold-corset"]'::jsonb,
  10,
  true,
  true
),
(
  'signature-duo-black-gold',
  'The Iconic Signature Duo (Black Crepe + Gold Corset)',
  'sets',
  'curated-duo',
  8460,
  9400,
  'Save 10% as a Set',
  '#8C3B2B',
  'The definitive Saak by Aprajita look: our fluid Black Crepe Pre-Draped Saree paired with the showstopper Sculpted Antique Gold Corset. Minimalist effortless drape meets high-impact royal embellishment.',
  'Black Pure Crepe Saree + Raw Silk Gold Zardozi Corset',
  'Complete 60-Second Ensemble',
  'Sculpted Silhouette',
  'Full Hand-Embroidered Zardozi Bodice',
  false,
  '[]'::jsonb,
  '["Waist 26 + Bust 32", "Waist 28 + Bust 34", "Waist 30 + Bust 36", "Waist 32 + Bust 38", "Custom Measurements"]'::jsonb,
  '["/assets/saak_muse_black_saree_gold_corset.jpg", "/assets/saak_muse_black_corset_side.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg"]'::jsonb,
  '["/assets/saak_muse_black_saree_gold_corset.jpg", "/assets/saak_muse_black_corset_side.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg"]'::jsonb,
  '/assets/saak_muse_black_saree_gold_corset.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/flatlays/black_crepe_gold_corset_flatlay.jpg',
  '/assets/saak_muse_black_corset_side.jpg',
  '[]'::jsonb,
  10,
  true,
  true
),
(
  'burnt-copper-tissue',
  'Burnt Copper Metallic Tissue Saree',
  'sarees',
  'tissue',
  4900,
  5600,
  'Festive Classic',
  '#8C3B2B',
  'Warm burnt copper and rust crushed tissue that catches golden hour light with unmatched luxury. Framed with an antique silver-gold zari border that drapes like liquid metal.',
  'Dual-Tone Crushed Metallic Tissue',
  'Classic 6-Yard',
  'Light & Fluid',
  'Dual-Tone Antique Border',
  true,
  '[{"name":"Burnt Copper","hex":"#8C3B2B"},{"name":"Olive Green","hex":"#5B664B"},{"name":"Ivory Shimmer","hex":"#FAF6EF"}]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["/assets/muse_copper_tissue.jpg"]'::jsonb,
  '["/assets/saak_folded_copper_tissue.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '["/assets/muse_copper_tissue.jpg", "/assets/saak_folded_copper_tissue.jpg", "/assets/saak_flatlay_copper_green.jpg"]'::jsonb,
  '/assets/muse_copper_tissue.jpg',
  '/assets/saak_folded_copper_tissue.jpg',
  '/assets/saak_flatlay_copper_green.jpg',
  '["the-gold-corset"]'::jsonb,
  10,
  true,
  false
)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  model_photos = excluded.model_photos,
  flatlay_photos = excluded.flatlay_photos,
  gallery = excluded.gallery;

-- =============================================================================
-- 5. ORDER DISPATCH & TRACKING PIPELINE MIGRATIONS
-- Run these statements in Supabase SQL editor to ensure all dispatch columns exist
-- =============================================================================
alter table public.orders add column if not exists payment_method text default 'Dynamic UPI QR';
alter table public.orders add column if not exists fulfillment_status text default 'processing';
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists dispatch_details jsonb;
alter table public.orders add column if not exists verified_at timestamp with time zone;
alter table public.orders add column if not exists verified_by text;
alter table public.orders add column if not exists failure_reason text;
alter table public.orders add column if not exists admin_notes text;

-- Policy: Allow updates on orders (for admin verification and dispatch updates)
create policy "Allow public update on orders"
  on public.orders for update
  using (true)
  with check (true);

