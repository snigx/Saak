-- =============================================================================
-- SAAK — Orders fulfilment columns (run once in Supabase → SQL Editor)
--
-- The live `orders` table was created before section 5 of supabase_schema.sql
-- was added, so dispatch / delivery / admin-note updates from the Admin
-- Console currently fail with "column does not exist" and only persist in the
-- admin's browser. This migration is idempotent and safe to re-run.
-- =============================================================================

alter table public.orders add column if not exists payment_method     text default 'Dynamic UPI QR';
alter table public.orders add column if not exists fulfillment_status text default 'processing';
alter table public.orders add column if not exists tracking_number    text;
alter table public.orders add column if not exists dispatch_details   jsonb;
alter table public.orders add column if not exists verified_at        timestamp with time zone;
alter table public.orders add column if not exists verified_by        text;
alter table public.orders add column if not exists failure_reason     text;
alter table public.orders add column if not exists admin_notes        text;
alter table public.orders add column if not exists delivered_at       timestamp with time zone;
alter table public.orders add column if not exists cancelled_at       timestamp with time zone;

-- Refresh PostgREST's schema cache so the API sees the new columns immediately
notify pgrst, 'reload schema';

-- NOTE: deliberately NOT adding a public DELETE policy on orders, and NOT
-- loosening any other policy. Access control (admin-only updates, customers
-- reading only their own orders) should be tightened together with moving
-- sign-in to Supabase Auth — see the security notes in the review.
