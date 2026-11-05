-- Offers: per-product discounts and the Mix & Match pair offer.
-- Run once in the Supabase SQL editor. Safe to run again.

-- 1. Each product can carry one offer (null = sold at its regular price)
alter table public.products add column if not exists discount jsonb;

-- The old "original price" was a compare-at price; offers replace it
update public.products set original_price = null where original_price is not null;

-- Remove the old built-in duo discount: the Signature Duo goes back to the
-- full price of its two pieces (₹3,950 + ₹5,450). Only touches the old 10%-off value.
update public.products
  set price = 9400, tag = 'Styled by Aprajita'
  where id = 'signature-duo-black-gold' and price = 8460;

-- 2. Store-wide settings, e.g. the Mix & Match pair offer
create table if not exists public.store_settings (
  key text primary key,
  value jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.store_settings enable row level security;

drop policy if exists "Allow public read access on store_settings" on public.store_settings;
create policy "Allow public read access on store_settings"
  on public.store_settings for select
  using (true);

-- Same access model as the products table (tighten with Supabase Auth later)
drop policy if exists "Allow public write on store_settings" on public.store_settings;
create policy "Allow public write on store_settings"
  on public.store_settings for all
  using (true)
  with check (true);

-- Make the API see the new column and table right away
notify pgrst, 'reload schema';
