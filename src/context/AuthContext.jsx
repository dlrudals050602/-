import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { loadAndSyncUserProfile } from '../services/profileService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 초기화 및 변경 감지
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setUser(session.user);
        const profile = await loadAndSyncUserProfile(session.user.id);
        setUserProfile(profile);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email_confirmed_at) {
        setUser(session.user);
        const profile = await loadAndSyncUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('로그아웃 중 오류:', error.message);
    } finally {
      setUser(null);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const updatedProfile = await loadAndSyncUserProfile(user.id);
      setUserProfile(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, setUser, setUserProfile, loading, handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);