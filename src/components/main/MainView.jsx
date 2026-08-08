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
      {/* [왼쪽] 달력 영역 */}
      {showCalendar && (
        <div style={{ flex: '1', minWidth: '320px', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>출타 캘린더</h2>
            <button onClick={() => setShowCalendar(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280' }}>
              ✕ 닫기
            </button>
          </div>
          <CalendarView date={date} onDateChange={setDate} />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h4>선택한 날짜: {date.toLocaleDateString()}</h4>
          </div>
        </div>
      )}

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