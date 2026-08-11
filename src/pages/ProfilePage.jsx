import React from 'react';
import MainView from '../components/main/MainView';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, userProfile, setUserProfile, handleSignOut } = useAuth();

  return (
    <div>
      <MainView 
        user={user} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
        onSignOut={handleSignOut} 
      />
    </div>
  );
}

export default ProfilePage;