import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  changePassword, 
  signOut, 
  updateUserProfile,
  subscribeToAuth 
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('signin'); // 'signin' | 'signup'
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
