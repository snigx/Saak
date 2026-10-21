import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '%c[Saak Atelier Cloud Connection]%c Running in local/offline adapter mode. To connect live Supabase PostgreSQL and Blob Storage, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    'color: #A34835; font-weight: bold;',
    'color: #1F1A17;'
  );
}
