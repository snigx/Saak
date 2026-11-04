import { supabase, isSupabaseConfigured } from './supabaseClient';

const ADMINS_TABLE = 'admin_users';
const LOCAL_STORAGE_ADMINS_KEY = 'saak_admin_users_db';

const DEFAULT_ADMIN_USERS = [
  { email: 'snigdh24@gmail.com', role: 'admin', created_at: '2026-10-01T00:00:00.000Z' },
  { email: 'khushirai6900@gmail.com', role: 'admin', created_at: '2026-10-01T00:00:00.000Z' },
  { email: 'saakbyaprajita@gmail.com', role: 'admin', created_at: '2026-11-04T00:00:00.000Z' }
];

/**
 * Access local admin users database (handles persistence and offline fallback)
 */
export function getLocalAdminUsersDb() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ADMINS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    for (const def of DEFAULT_ADMIN_USERS) {
      if (!parsed.some(p => p.email.toLowerCase() === def.email.toLowerCase())) {
        parsed.push(def);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_ADMIN_USERS;
  }
}

/**
 * Checks if a given user has admin privileges in the database.
 * Queries public.admin_users table in Supabase PostgreSQL, with local DB fallback.
 *
 * @param {Object} user - The authenticated user object containing an email.
 * @returns {Promise<boolean>} - True if the user is registered as an admin in DB.
 */
export async function checkIsAdminFromDb(user) {
  if (!user || !user.email) return false;

  const email = user.email.trim().toLowerCase();

  // 1. Direct role check from Supabase Auth metadata if present
  if (
    user.role === 'admin' || 
    user.user_metadata?.role === 'admin' || 
    user.app_metadata?.role === 'admin'
  ) {
    return true;
  }

  // 2. Query admin_users table in Supabase PostgreSQL
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(ADMINS_TABLE)
        .select('role')
        .ilike('email', email)
        .maybeSingle();

      if (!error && data) {
        return data.role === 'admin';
      }

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        console.warn('[AdminService] Error checking admin status in DB:', error.message);
      }
    } catch (err) {
      console.warn('[AdminService] Exception checking admin role in DB:', err);
    }
  }

  // 3. Check local database store (fallback when DB table is not yet migrated in Supabase Dashboard)
  const localAdmins = getLocalAdminUsersDb();
  const found = localAdmins.find(a => a.email.toLowerCase() === email && a.role === 'admin');
  return !!found;
}

/**
 * Fetch all registered admins from the database
 */
export async function fetchAdminUsersFromDb() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(ADMINS_TABLE)
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[AdminService] Failed to fetch admins from DB:', err);
    }
  }
  return getLocalAdminUsersDb();
}

/**
 * Register or update an admin user in the database
 */
export async function addAdminUser(email, role = 'admin') {
  if (!email || !email.includes('@')) throw new Error('Invalid email address');
  const normalizedEmail = email.trim().toLowerCase();

  const localAdmins = getLocalAdminUsersDb();
  const existingIdx = localAdmins.findIndex(a => a.email.toLowerCase() === normalizedEmail);
  if (existingIdx >= 0) {
    localAdmins[existingIdx].role = role;
  } else {
    localAdmins.push({ email: normalizedEmail, role, created_at: new Date().toISOString() });
  }
  localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(localAdmins));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(ADMINS_TABLE).upsert({ email: normalizedEmail, role }, { onConflict: 'email' });
    } catch (e) {
      console.warn('[AdminService] Could not sync admin to remote DB:', e);
    }
  }
  return true;
}
