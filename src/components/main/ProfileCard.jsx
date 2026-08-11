import React, { useState } from 'react';
import RankInsignia from '../RankInsignia';
import { calculateRankAndDays } from '../../utils/military';
import AppSetupForm from '../auth/AppSetupForm.jsx'; // 별도 분리한 설정 컴포넌트 불러오기

function ProfileCard({ userProfile, isProfileComplete, onEditProfile, onSignOut }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { rank, daysServed, daysLeft, percentage } = isProfileComplete && userProfile
    ? calculateRankAndDays(userProfile.military_enlistment_date, userProfile.military_discharge_date)
    : { rank: '', daysServed: 0, daysLeft: 0, percentage: 0 };

  const displayName = userProfile?.full_name || userProfile?.name || userProfile?.username || '';

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '15px' }}>내 정보</h2>
      <p style={{ fontSize: '16px', marginBottom: '8px' }}>
        아이디: <strong>{userProfile?.username || '알 수 없음'}</strong>
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{userProfile?.email}</p>

      {isProfileComplete ? (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #dcfce7', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['이병', '일병', '상병', '병장'].includes(rank) && <RankInsignia rank={rank} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d' }}>
                  {rank}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>
                  {displayName}
                </span>
              </div>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>
              복무 {daysServed}일차
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginBottom: '4px', fontWeight: '600' }}>
              <span>복무율</span>
              <span>{percentage}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${percentage}%`, backgroundColor: '#16a34a', height: '100%' }}></div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>입대 날짜:</span><strong>{userProfile.military_enlistment_date}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>전역 날짜:</span><strong style={{ color: '#16a34a' }}>{userProfile.military_discharge_date}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>남은 복무일수:</span><strong style={{ color: '#dc2626' }}>D-{daysLeft}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #bbf7d0', marginTop: '6px' }}>
              <span>남은 휴가일수:</span><strong style={{ color: '#d97706', fontSize: '14px' }}>🏖️ {userProfile.vacation_days ?? 0}일</strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, fontWeight: 'bold' }}>
            입대 날짜 및 전역 날짜가 설정되지 않았습니다.
          </p>
        </div>
      )}

      {/* 1. 내 정보 설정/수정 버튼 */}
      <button 
        onClick={onEditProfile}
        style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
      >
        {isProfileComplete ? '내 정보 수정하기' : '내 정보 설정하기'}
      </button>

      {/* 2. 앱 설정하기 버튼 */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
      >
        ⚙️ 앱 설정하기
      </button>

      {/* 3. 로그아웃 버튼 */}
      <button 
        onClick={onSignOut}
        style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        로그아웃
      </button>

      {/* 분리된 앱 설정 모달 */}
      {isSettingsOpen && <AppSetupForm onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default ProfileCard;