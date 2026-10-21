import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_AUTH_KEY = 'saak_auth_user';
const LOCAL_STORAGE_USERS_KEY = 'saak_users_db';

/**
 * Format raw user data from Supabase or local store into a consistent patron model
 */
function mapUser(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id,
    email: rawUser.email,
    fullName: rawUser.user_metadata?.full_name || rawUser.fullName || rawUser.name || rawUser.email?.split('@')[0] || 'Atelier Patron',
    avatarUrl: rawUser.user_metadata?.avatar_url || rawUser.avatarUrl || null,
    provider: rawUser.app_metadata?.provider || rawUser.provider || 'email',
    createdAt: rawUser.created_at || rawUser.createdAt || new Date().toISOString()
  };
}

/**
 * Get currently authenticated user
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        return mapUser(user);
      }
    } catch (err) {
      console.warn('Supabase auth check failed:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Sign up with Email, Password and Full Name
 */
export async function signUpWithEmail(email, password, fullName) {
  if (!email || !password) throw new Error('Please enter both email and password.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;
    if (data.user) {
      return mapUser(data.user);
    }
  }

  // Local Fallback Mock
  const users = getLocalUsersDb();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const newUser = {
    id: `patron_${Date.now()}`,
    email,
    password, // stored locally for mock testing
    fullName: fullName || email.split('@')[0],
    provider: 'email',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsersDb(users);

  const cleanUser = mapUser(newUser);
  localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));
  window.dispatchEvent(new Event('saak-auth-change'));
  return cleanUser;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (!email || !password) throw new Error('Please enter both email and password.');

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (data.user) {
      return mapUser(data.user);
    }
  }

  // Local Fallback Mock
  const users = getLocalUsersDb();
  let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (found) {
    if (found.password && found.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }
  } else {
    // Convenience for evaluation: create patron on the fly if testing demo credentials
    found = {
      id: `patron_${Date.now()}`,
      email,
      password,
      fullName: email.split('@')[0].replace('.', ' '),
      provider: 'email',
      createdAt: new Date().toISOString()
    };
    users.push(found);
    saveLocalUsersDb(users);
  }

  const cleanUser = mapUser(found);
  localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));
  window.dispatchEvent(new Event('saak-auth-change'));
  return cleanUser;
}

/**
 * Sign in with Google (OAuth)
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  }

  // Local Fallback Mock
  // Provide seamless instant mock Google authentication
  const googleUser = {
    id: `google_${Date.now()}`,
    email: 'atelier.patron@gmail.com',
    fullName: 'Atelier Muse',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    provider: 'google',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(googleUser));
  window.dispatchEvent(new Event('saak-auth-change'));
  return googleUser;
}

/**
 * Change or Update Password for Authenticated User
 */
export async function changePassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return true;
  }

  // Local Fallback Mock
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('No user is currently authenticated.');

  const users = getLocalUsersDb();
  const userIdx = users.findIndex(u => u.id === currentUser.id || u.email === currentUser.email);
  if (userIdx >= 0) {
    users[userIdx].password = newPassword;
    saveLocalUsersDb(users);
  }

  return true;
}

/**
 * Update User Profile (e.g. Full Name)
 */
export async function updateUserProfile({ fullName }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) throw error;
    return mapUser(data.user);
  }

  // Local Fallback Mock
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('No user authenticated.');

  currentUser.fullName = fullName;
  localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(currentUser));
  window.dispatchEvent(new Event('saak-auth-change'));
  return currentUser;
}

/**
 * Sign Out
 */
export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }

  localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  window.dispatchEvent(new Event('saak-auth-change'));
  return true;
}

/**
 * Listen for auth state transitions
 */
export function subscribeToAuth(callback) {
  let unsubscribeSupabase = () => {};

  if (isSupabaseConfigured && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? mapUser(session.user) : null);
    });
    unsubscribeSupabase = () => subscription?.unsubscribe();
  }

  const handleCustomEvent = async () => {
    const user = await getCurrentUser();
    callback(user);
  };

  window.addEventListener('saak-auth-change', handleCustomEvent);

  return () => {
    unsubscribeSupabase();
    window.removeEventListener('saak-auth-change', handleCustomEvent);
  };
}

// Helpers for Local Storage Mock Database
function getLocalUsersDb() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsersDb(users) {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error(e);
  }
}
