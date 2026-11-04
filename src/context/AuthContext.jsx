import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  signInWithEmail, 
  signUpWithEmail, 
  requestEmailOtp,
  verifyEmailOtp,
  signInWithGoogle, 
  signInWithDemoPatron,
  changePassword, 
  signOut, 
  updateUserProfile,
  subscribeToAuth 
} from '../services/authService';
import { checkIsAdminFromDb } from '../services/adminService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('signin'); // 'signin' | 'signup' | 'otp'
  const [pendingOtpData, setPendingOtpData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Synchronize admin status with database whenever user changes
  useEffect(() => {
    let mounted = true;

    async function syncAdminStatus() {
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      try {
        const adminStatus = await checkIsAdminFromDb(user);
        if (mounted) {
          setIsAdmin(Boolean(adminStatus));
        }
      } catch (err) {
        if (mounted) setIsAdmin(false);
      }
    }

    syncAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

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
    await requestEmailOtp(email, fullName, 'signup');
    setPendingOtpData({ email, fullName, password, type: 'signup' });
    setAuthModalView('otp');
    return { requiresOtp: true, email };
  };

  const sendOtp = async (email, fullName, type = 'signup') => {
    return await requestEmailOtp(email, fullName, type);
  };

  const verifyOtp = async (email, otp, fullName, password) => {
    const verifiedUser = await verifyEmailOtp(email, otp, fullName, password);
    setUser(verifiedUser);
    setPendingOtpData(null);
    setIsAuthModalOpen(false);
    return verifiedUser;
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
    loading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    setAuthModalView,
    pendingOtpData,
    setPendingOtpData,
    openAuthModal,
    closeAuthModal,
    isProfileOpen,
    setIsProfileOpen,
    openProfile,
    closeProfile,
    loginWithEmail,
    registerWithEmail,
    sendOtp,
    verifyOtp,
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
