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
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_side.jpg"]'::jsonb,
  '["/assets/gold_corset_flatlay.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_side.jpg", "/assets/gold_corset_flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_front.jpg',
  '/assets/gold_corset_flatlay.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-gold-corset/model_side.jpg',
  '["sunset-orange-tissue", "olive-bloom-tissue"]'::jsonb,
  10,
  true,
  true
),
(
  'the-ivory-raw-silk-blouse',
  'The Ivory Raw Silk Sculpted Blouse',
  'blouses',
  'blouse',
  3850,
  4400,
  'Essential Minimalist',
  '#C5A059',
  'A masterclass in understated elegance. Tailored from premium pure raw silk in warm champagne ivory, featuring a sculpted plunging V-neckline, broad comfortable straps, and neat under-bust darting. Designed as the ultimate versatile companion to contrast and elevate fluid metallic tissue sarees.',
  'Pure Raw Silk / Dupion with Subtle Slub Texture',
  'Sleeveless Tailored V-Neck Blouse',
  'Lightweight & Structured',
  'Minimalist Clean Edges with Gold Stitch Accents',
  true,
  '[{"name":"Champagne Ivory","hex":"#F7F3EA"},{"name":"Warm Sand","hex":"#E5DAC8"},{"name":"Midnight Black","hex":"#1F1A17"}]'::jsonb,
  '["XS (Bust 32)", "S (Bust 34)", "M (Bust 36)", "L (Bust 38)", "XL (Bust 40)", "Custom Bespoke"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg", "/assets/black_saree_ivory_blouse_model.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/flatlay.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg", "/assets/black_saree_ivory_blouse_model.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/model_front_muse.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-raw-silk-blouse/flatlay.jpg',
  '/assets/black_saree_ivory_blouse_model.jpg',
  '["sunset-orange-tissue", "olive-bloom-tissue"]'::jsonb,
  10,
  true,
  true
),
(
  'the-sunshine-marigold-blouse',
  'The Sunshine Marigold Silk Blouse',
  'blouses',
  'blouse',
  3950,
  4600,
  'Monochrome Haldi Statement',
  '#D49B00',
  'Tailored from pure chanderi raw silk in radiant sunshine marigold. Features an architectural high-neck collar with an artisanal statement bow-tie front and clean-cut sleeves. Perfectly matched in shade and weave with our Sunshine Marigold Saree.',
  'Pure Chanderi Raw Silk',
  'Structured Bow-Neck Blouse with Fitted Darting',
  'Lightweight & Structured',
  'Tonal Edge Stitching with Gold Button Accents',
  false,
  '[]'::jsonb,
  '["XS (Bust 32)", "S (Bust 34)", "M (Bust 36)", "L (Bust 38)", "XL (Bust 40)", "Custom Bespoke"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/model_front.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/flatlay.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/flatlay.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-sunshine-marigold-blouse/flatlay.jpg',
  '["sunshine-marigold-tissue"]'::jsonb,
  10,
  true,
  true
),
(
  'the-ivory-gold-striped-blouse',
  'The Ivory & Gold Striped Zari Blouse',
  'blouses',
  'blouse',
  3950,
  4650,
  'Original Runway Pairing',
  '#C5A059',
  'The authentic atelier pairing shown with our Pearl Ivory Architectural Zari Saree. Tailored from lustrous pure silk blend in soft ivory, embellished with fine horizontal metallic gold zari stripes. Features an elegant boat-round neckline, elbow-length sleeves, and precision tailored bust seams.',
  'Pure Silk & Woven Metallic Gold Zari',
  'Structured Boat-Neck Blouse with Elbow Sleeves',
  'Lightweight & Structured',
  'Fine Horizontal Woven Gold Zari Pinstripes',
  false,
  '[]'::jsonb,
  '["XS (Bust 32)", "S (Bust 34)", "M (Bust 36)", "L (Bust 38)", "XL (Bust 40)", "Custom Bespoke"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/model_front.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/flatlay.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/flatlay.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/blouses/the-ivory-gold-striped-blouse/flatlay.jpg',
  '["pearl-ivory-geometric-tissue"]'::jsonb,
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
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_drape.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_copper.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/swatch_texture.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_drape.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_copper.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/swatch_texture.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/flatlay_folded.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunset-orange-tissue/swatch_texture.jpg',
  '["the-gold-corset", "the-ivory-raw-silk-blouse"]'::jsonb,
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
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/model_front.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/flatlay_drape.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/swatch_swirl.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/flatlay_drape.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/swatch_swirl.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/flatlay_drape.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/olive-bloom-tissue/swatch_swirl.jpg',
  '["the-gold-corset", "the-ivory-raw-silk-blouse"]'::jsonb,
  10,
  true,
  true
),
(
  'seafoam-emerald-tissue',
  'Seafoam Emerald Shimmer Tissue Saree',
  'sarees',
  'tissue',
  4750,
  5400,
  'Festive Dual-Tone Weave',
  '#2E8B75',
  'Artisanal crushed metallic shimmer tissue saree in layered vertical ombre stripes of turquoise teal, vibrant emerald green, and mint seafoam. Embellished with delicate hand-embroidered gold zari butis and framed by an ornate antique Banarasi floral zari jaal border. Lightweight, luminous, and draped with effortless grace.',
  'Crushed Metallic Shimmer Tissue Silk',
  'Classic 6-Yard (Fall & Pico Included)',
  'Featherlight, Fluid & Radiant',
  'Banarasi Antique Gold Zari Floral Border & Buti Weave',
  false,
  '[]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/model_ivory.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/swatch_texture.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/model_ivory.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/swatch_texture.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/flatlay_folded.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/seafoam-emerald-tissue/swatch_texture.jpg',
  '["the-gold-corset", "the-ivory-raw-silk-blouse"]'::jsonb,
  10,
  true,
  true
),
(
  'sunshine-marigold-tissue',
  'Sunshine Marigold Striped Tissue Saree',
  'sarees',
  'tissue',
  4650,
  5200,
  'Festive Haldi Radiance',
  '#D49B00',
  'Radiant sunshine marigold saree handcrafted in fine metallic shimmer tissue and chanderi silk. Woven with subtle translucent alternating vertical and horizontal stripes, finished with delicate gold zari accents and hand-knotted pallu tassels. Luminous, airy, and celebratory.',
  'Chanderi Shimmer Tissue Silk with Alternating Sheer Stripes',
  'Classic 6-Yard (Fall & Pico Included)',
  'Featherlight, Crisp & Fluid',
  'Fine Gold Zari Accent Border with Hand-Tied Tassels',
  false,
  '[]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/model_gold.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/swatch_texture.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/model_gold.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/swatch_texture.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/flatlay_folded.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/sunshine-marigold-tissue/swatch_texture.jpg',
  '["the-sunshine-marigold-blouse", "the-gold-corset"]'::jsonb,
  10,
  true,
  true
),
(
  'pearl-ivory-geometric-tissue',
  'Pearl Ivory Architectural Zari Saree',
  'sarees',
  'tissue',
  4950,
  5600,
  'Sculpted Dual-Tone Border',
  '#C49A2C',
  'Ethereal translucent pearl ivory organza tissue saree illuminated by delicate handwoven silver and gold floral butis. Grounded by a statement architectural border in mustard yellow and antique gold zari featuring sculptural circular loop chain motifs. Featherlight, structured, and modern.',
  'Pure Translucent Organza Tissue Silk with Handwoven Butis',
  'Classic 6-Yard (Fall & Pico Included)',
  'Featherlight, Ethereal & Sculpted',
  'Mustard Yellow & Antique Gold Geometric Chain Border',
  false,
  '[]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/model_drape_muse.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/model_drape_muse.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/model_front_muse.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/flatlay_folded.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/pearl-ivory-geometric-tissue/swatch_texture.jpg',
  '["the-ivory-gold-striped-blouse", "the-gold-corset"]'::jsonb,
  10,
  true,
  true
),
(
  'midnight-black-crepe-saree',
  'Midnight Black Fluid Crepe Saree',
  'sarees',
  'crepe',
  3950,
  4500,
  'Pre-Draped Fluid Crepe',
  '#1A1614',
  'Sculpted from pure featherlight fluid crepe in deep obsidian black. Falls in effortless, liquid drapes with a modern, sensual minimalist silhouette. Designed to provide high-impact contrast with heavy statement corsets or tailored raw silk blouses.',
  'Pure Featherlight Fluid Crepe',
  'Classic 6-Yard (Optional Pre-Stitched Pleats)',
  'Ultra-Fluid, Sensual & Weightless',
  'Minimalist Clean Edges with Micro Gold Piping',
  false,
  '[]'::jsonb,
  '["Standard 6-Yard", "Pre-Pleated Fall & Pico (+₹450)"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/midnight-black-crepe-saree/model_front.jpg", "/assets/saak_muse_black_corset_side.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/midnight-black-crepe-saree/flatlay_folded.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/midnight-black-crepe-saree/model_front.jpg", "/assets/saak_muse_black_corset_side.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/midnight-black-crepe-saree/model_front.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sarees/midnight-black-crepe-saree/flatlay_folded.jpg',
  '/assets/saak_muse_black_corset_side.jpg',
  '["the-gold-corset", "the-ivory-raw-silk-blouse"]'::jsonb,
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
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_side.jpg"]'::jsonb,
  '["/assets/signature_duo_black_gold_flatlay.jpg"]'::jsonb,
  '["https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_front.jpg", "https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_side.jpg", "/assets/signature_duo_black_gold_flatlay.jpg"]'::jsonb,
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_front.jpg',
  '/assets/signature_duo_black_gold_flatlay.jpg',
  'https://xafmubfvqsavacqykfwm.supabase.co/storage/v1/object/public/saak-media/sets/signature-duo-black-gold/model_side.jpg',
  '[]'::jsonb,
  10,
  true,
  true
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

-- =============================================================================
-- 6. ADMIN ROLES & ACCESS CONTROL TABLE
-- =============================================================================
create table if not exists public.admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text default 'admin' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Policy: Allow read access to verify admin status
create policy "Allow read access on admin_users"
  on public.admin_users for select
  using (true);

-- Policy: Allow insert/update access
create policy "Allow management on admin_users"
  on public.admin_users for all
  using (true)
  with check (true);

-- Seed initial admin users in DB
insert into public.admin_users (email, role)
values 
  ('snigdh24@gmail.com', 'admin'),
  ('khushirai6900@gmail.com', 'admin'),
  ('saakbyaprajita@gmail.com', 'admin')
on conflict (email) do nothing;


