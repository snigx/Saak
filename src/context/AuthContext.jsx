import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInWithDemoPatron,
  changePassword, 
  signOut, 
  updateUserProfile,
  subscribeToAuth 
} from '../services/authService';

export const ADMIN_EMAILS = [
  'snigdh24@gmail.com',
  'khushirai6900@gmail.com'
];

export function checkIsAdmin(currentUser) {
  // Localhost always runs in admin mode per user requirement
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return true;
    }
  }

  if (!currentUser || !currentUser.email) return false;
  const userEmail = currentUser.email.trim().toLowerCase();
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === userEmail);
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('signin'); // 'signin' | 'signup'
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isAdmin = checkIsAdmin(user);

  useEffect(() => {
    let mounted = true;

    // Initial user fetch
    getCurrentUser().then((currentUser) => {
      if (mounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    // Subscribe to state transitions
    const unsubscribe = subscribeToAuth((updatedUser) => {
      if (mounted) {
        setUser(updatedUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const openAuthModal = (view = 'signin') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const loginWithEmail = async (email, password) => {
    const loggedUser = await signInWithEmail(email, password);
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    return loggedUser;
  };

  const registerWithEmail = async (email, password, fullName) => {
    const newUser = await signUpWithEmail(email, password, fullName);
    setUser(newUser);
    setIsAuthModalOpen(false);
    return newUser;
  };

  const loginWithGoogle = async () => {
    const resUser = await signInWithGoogle();
    if (resUser && resUser.email) {
      setUser(resUser);
      setIsAuthModalOpen(false);
    }
    return resUser;
  };

  const loginWithDemoPatron = async () => {
    const resUser = await signInWithDemoPatron();
    setUser(resUser);
    setIsAuthModalOpen(false);
    return resUser;
  };

  const updatePassword = async (newPassword) => {
    return await changePassword(newPassword);
  };

  const updateProfile = async (profileData) => {
    const updated = await updateUserProfile(profileData);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsProfileOpen(false);
  };

  const value = {
    user,
    isAdmin,
    ADMIN_EMAILS,
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    setAuthModalView,
    openAuthModal,
    closeAuthModal,
    isProfileOpen,
    setIsProfileOpen,
    openProfile,
    closeProfile,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithDemoPatron,
    updatePassword,
    updateProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
