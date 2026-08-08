import React, { useState } from 'react';
import CalendarView from '../CalendarView';
import ProfileCard from './ProfileCard';
import ProfileSetupForm from '../auth/ProfileSetupForm';

function MainView({ user, userProfile, setUserProfile, onSignOut }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(new Date());

  const isProfileComplete = 
    userProfile && 
    userProfile.military_enlistment_date && 
    userProfile.military_discharge_date;

  return (
    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* [오른쪽] 프로필 / 정보 설정 영역 */}
      <div style={{ flex: '1', minWidth: '320px', maxWidth: '400px', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
        {isEditing ? (
          <ProfileSetupForm 
            user={user} 
            userProfile={userProfile} 
            onSaved={(updatedProfile) => {
              setUserProfile(updatedProfile);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileCard 
            userProfile={userProfile}
            isProfileComplete={isProfileComplete}
            onOpenCalendar={() => setShowCalendar(!showCalendar)}
            isCalendarOpen={showCalendar}
            onEditProfile={() => setIsEditing(true)}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </div>
  );
}

export default MainView;