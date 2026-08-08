import React, { useState, useEffect } from 'react';
import { supabase } from './api/supabaseClient';
import AuthView from './components/auth/AuthView';
import MainView from './components/main/MainView';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email_confirmed_at) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>나만의 캘린더 앱</h1>

      {user ? (
        <MainView 
          user={user} 
          userProfile={userProfile} 
          setUserProfile={setUserProfile} 
          onSignOut={handleSignOut} 
        />
      ) : (
        <AuthView 
          onLoginSuccess={async (loggedInUser) => {
            setUser(loggedInUser);
            const profile = await fetchUserProfile(loggedInUser.id);
            setUserProfile(profile);
          }} 
        />
      )}
    </div>
  );
}

export default App;