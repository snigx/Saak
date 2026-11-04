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
    fullName: rawUser.user_metadata?.full_name || rawUser.fullName || rawUser.name || rawUser.email?.split('@')[0] || 'Patron',
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
      // 1. Check active session (which exchanges OAuth PKCE code from URL if returning from Google)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && session?.user) {
        if (typeof window !== 'undefined' && (window.location.search.includes('code=') || window.location.hash.includes('access_token='))) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        return mapUser(session.user);
      }

      // 2. Fall back to getUser
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!userError && user) {
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
 * Request 6-digit OTP sent to patron's email
 */
export async function requestEmailOtp(email, fullName = '', type = 'signup', password = '', confirmPassword = '') {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (type === 'signup') {
    if (password && confirmPassword && password !== confirmPassword) {
      throw new Error('Passwords do not match. Please ensure both passwords are identical.');
    }
    if (password && password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Try Vite dev middleware first (/api/auth/send-otp), then /api/auth-otp
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, fullName, type, password, confirmPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch verification code.');
    }
    return data;
  } catch (err) {
    // Try serverless fallback
    try {
      const resFallback = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: normalizedEmail, fullName, type, password, confirmPassword })
      });
      const dataFallback = await resFallback.json();
      if (!resFallback.ok) {
        throw new Error(dataFallback.error || err.message);
      }
      return dataFallback;
    } catch (fallbackErr) {
      throw new Error(fallbackErr.message || err.message || 'Failed to send OTP.');
    }
  }
}

/**
 * Verify 6-digit OTP and authenticate patron
 */
export async function verifyEmailOtp(email, otp, fullName = '', password = '', confirmPassword = '') {
  if (!email || !otp) {
    throw new Error('Please enter both email and the 6-digit verification code.');
  }

  if (password && confirmPassword && password !== confirmPassword) {
    throw new Error('Passwords do not match. Please ensure both passwords are identical.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanPass = (password || '').trim();
  let authenticatedUser = null;

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, otp: otp.trim(), fullName, password: cleanPass, confirmPassword: (confirmPassword || '').trim() })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed. Please check the code.');
    }
    authenticatedUser = data.user;
  } catch (err) {
    // Try fallback
    try {
      const resFallback = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: normalizedEmail, otp: otp.trim(), fullName, password: cleanPass, confirmPassword: (confirmPassword || '').trim() })
      });
      const dataFallback = await resFallback.json();
      if (!resFallback.ok) {
        throw new Error(dataFallback.error || err.message);
      }
      authenticatedUser = dataFallback.user;
    } catch (fallbackErr) {
      throw new Error(fallbackErr.message || err.message);
    }
  }

  if (!authenticatedUser) {
    throw new Error('Verification failed. Please try again.');
  }

  // Format and persist user
  const cleanUser = mapUser(authenticatedUser);
  localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));

  // Save/update password in local db if provided so password login also works
  const users = getLocalUsersDb();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
  if (existingIdx >= 0) {
    users[existingIdx].fullName = cleanUser.fullName;
    if (cleanPass) users[existingIdx].password = cleanPass;
  } else {
    users.push({
      id: cleanUser.id,
      email: normalizedEmail,
      fullName: cleanUser.fullName,
      password: cleanPass || undefined,
      provider: 'email',
      createdAt: cleanUser.createdAt
    });
  }
  saveLocalUsersDb(users);

  window.dispatchEvent(new Event('saak-auth-change'));
  return cleanUser;
}

/**
 * Sign up initiation with Email, Password, Retype Password, and Full Name
 * Dispatches 6-digit OTP code to the patron's email instead of broken confirmation links.
 */
export async function signUpWithEmail(email, password, confirmPassword, fullName) {
  if (!email || !password) throw new Error('Please enter both email and password.');
  if (!confirmPassword) throw new Error('Please retype your password to confirm.');
  if (password !== confirmPassword) throw new Error('Passwords do not match. Please ensure both passwords are identical.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

  // Send 6-digit OTP to patron's email via verified Gmail SMTP
  await requestEmailOtp(email, fullName, 'signup', password, confirmPassword);
  return { requiresOtp: true, email, fullName, password, confirmPassword };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (!email || !password) throw new Error('Please enter both email and password.');

  const normalizedEmail = email.trim().toLowerCase();
  const enteredPass = password.trim();

  // 1. Try local verified users database first
  const users = getLocalUsersDb();
  const found = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (found && found.password) {
    const storedPass = (found.password || '').trim();
    if (found.password === password || storedPass === enteredPass) {
      const cleanUser = mapUser(found);
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));
      window.dispatchEvent(new Event('saak-auth-change'));
      return cleanUser;
    }
  }

  // 2. Try server patrons database (via /api/auth/login)
  try {
    const serverRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: enteredPass })
    });
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData.user) {
        const cleanUser = mapUser(serverData.user);
        // Sync into local db
        const uDb = getLocalUsersDb();
        const idx = uDb.findIndex(u => u.email.toLowerCase() === normalizedEmail);
        if (idx >= 0) {
          uDb[idx].password = enteredPass;
          uDb[idx].fullName = cleanUser.fullName;
        } else {
          uDb.push({ ...cleanUser, password: enteredPass });
        }
        saveLocalUsersDb(uDb);
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));
        window.dispatchEvent(new Event('saak-auth-change'));
        return cleanUser;
      }
    }
  } catch (err) {
    // Ignore server error and continue to other providers
  }

  // 3. Try Supabase Auth if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: enteredPass
      });

      if (!error && data?.user) {
        return mapUser(data.user);
      }
    } catch (err) {
      console.warn('Supabase password sign in error:', err.message);
    }
  }

  // If user exists locally or on server with a password, but entered password did not match:
  if (found && found.password) {
    throw new Error('Invalid password. Please check your credentials or sign in with an OTP code.');
  }

  // 4. Fallback: If user exists in local database without password (e.g. Google or OTP signup)
  if (found) {
    const cleanUser = mapUser(found);
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(cleanUser));
    window.dispatchEvent(new Event('saak-auth-change'));
    return cleanUser;
  }

  // If no user found, invite user to create account or sign in with OTP
  throw new Error('No account found with this email. Please click "Create an account" to join Saak.');
}

/**
 * Sign in with Google (OAuth)
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        if (
          error.message?.includes('provider is not enabled') ||
          error.message?.includes('Unsupported provider') ||
          error.message?.includes('validation_failed') ||
          error.status === 400
        ) {
          throw new Error('GOOGLE_PROVIDER_NOT_ENABLED');
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (err.message === 'GOOGLE_PROVIDER_NOT_ENABLED') {
        throw err;
      }
      if (
        err.message?.includes('provider is not enabled') ||
        err.message?.includes('Unsupported provider') ||
        err.status === 400
      ) {
        throw new Error('GOOGLE_PROVIDER_NOT_ENABLED');
      }
      throw err;
    }
  }

  // Local Fallback Mock
  return signInWithDemoPatron();
}

/**
 * Instant Patron One-Click Login (useful when Google OAuth is pending cloud setup)
 */
export async function signInWithDemoPatron() {
  const googleUser = {
    id: `patron_${Date.now()}`,
    email: 'patron.muse@gmail.com',
    fullName: 'Patron',
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
