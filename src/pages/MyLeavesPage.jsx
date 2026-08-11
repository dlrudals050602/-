import React, {useState} from 'react';
import LeaveForm from '../components/LeaveForm';
import MyCompactCalendar from '../components/MyCompactCalendar';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {saveWishLeave, promoteWishToActive} from '../services/leaveService';
import { getLeaveColor } from '../utils/colorUtils';

function MyLeavesPage() {
  const { holidays, leaves, handleApplyLeave, handleDeleteLeave, loadData } = useData();
  const { userProfile, refreshProfile } = useAuth();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [isPastOpen, setIsPastOpen] = useState(false); // 지난 기록 접기/펼치기

  // 오늘 날짜 기준 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().substring(0, 10);
  const myLeaves = leaves.filter((l) => l.userId === userProfile?.id);

  // 날짜/상태별 데이터 분류
  const upcomingLeaves = myLeaves.filter((l) => l.endDate >= todayStr && l.status !== 'wish');
  const wishLeaves = myLeaves.filter((l) => l.status === 'wish');
  const pastLeaves = myLeaves
    .filter((l) => l.endDate < todayStr)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const currentUserName = userProfile?.full_name || userProfile?.username || '';

  // 위시 저장 처리
  const handleSaveWish = async (wishData) => {
    try {
      await saveWishLeave(wishData);
      alert('⭐️ 위시리스트에 저장되었습니다.');
      await loadData();
    } catch (err) {
      alert('위시 저장 실패: ' + err.message);
    }
  };

  // 위시 -> 정식 출타 전환 처리
  const handlePromoteWish = async (wishLeave) => {
    try {
      const res = await promoteWishToActive(wishLeave, leaves);
      if (res.status === 'active') {
        alert('🚀 정식 출타로 신청되었습니다!');
        await loadData();
        await refreshProfile();
      } else if (res.status === 'full') {
        alert(`신청 불가: ${res.reason}`);
      } else if (res.status === 'REQUIRES_CONFIRM') {
        alert(`정원 안내: ${res.reason}`);
      }
    } catch (err) {
      alert('전환 실패: ' + err.message);
    }
  };

return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', margin: 0 }}>출타 신청 및 관리</h2>

      {/* [Card 1] 출타 신청 폼 */}
      <LeaveForm
        onApply={handleApplyLeave}
        onSaveWish={handleSaveWish}
        holidays={holidays}
        leaves={leaves}
        userProfile={userProfile}
      />

      {/* [Card 2] 예정된 출타 & 위시 일정 */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>예정된 출타 및 위시</h3>
          
          {/* 뷰 스위처 (리스트 vs 내 달력) */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                border: 'none',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0f172a' : '#64748b',
                fontWeight: viewMode === 'list' ? 'bold' : 'normal',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              📋 리스트
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                border: 'none',
                background: viewMode === 'calendar' ? '#ffffff' : 'transparent',
                color: viewMode === 'calendar' ? '#0f172a' : '#64748b',
                fontWeight: viewMode === 'calendar' ? 'bold' : 'normal',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              🗓️ 내 달력
            </button>
          </div>
        </div>

{viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingLeaves.map((leave) => {
              const leaveBg = getLeaveColor(leave.name || currentUserName, leave.leaveType);
              return (
                <div
                  key={leave.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: leaveBg,
                        display: 'inline-block'
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>[{leave.leaveType}]</strong>{' '}
                      <span style={{ fontSize: '13px' }}>{leave.startDate} ~ {leave.endDate}</span>
                      {leave.status === 'pending' && (
                        <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 'bold', marginLeft: '6px' }}>
                          (대기 중)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLeave(leave.id)}
                    style={{
                      border: 'none',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    삭제 ✕
                  </button>
                </div>
              );
            })}

            {wishLeaves.map((leave) => {
              // 위시 출타의 종류에 맞는 색상 추출
              const wishColor = getLeaveColor(leave.name || currentUserName, leave.leaveType);

              return (
                <div
                  key={leave.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1.5px dashed ${wishColor}`, // 출타 종류 색상의 점선 테두리
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: wishColor }}>
                      [⭐️ 위시 · {leave.leaveType}]
                    </strong>{' '}
                    <span style={{ fontSize: '13px' }}>{leave.startDate} ~ {leave.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handlePromoteWish(leave)}
                      style={{
                        border: 'none',
                        backgroundColor: wishColor,
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      신청 🚀
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLeave(leave.id)}
                      style={{
                        border: 'none',
                        backgroundColor: '#e2e8f0',
                        color: '#64748b',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            {upcomingLeaves.length === 0 && wishLeaves.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '16px 0' }}>
                예정된 출타나 위시 일정이 없습니다.
              </div>
            )}
          </div>
        ) : (
          <MyCompactCalendar 
            leaves={leaves} 
            userId={userProfile?.id} 
            userProfile={userProfile} 
            holidays={holidays} 
          />
        )}
      </div>

      {/* [Card 3] 지난 출타 기록 */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div
          onClick={() => setIsPastOpen(!isPastOpen)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <h3 style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>
            지난 출타 기록 ({pastLeaves.length}건)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
            {isPastOpen ? '접기 ▴' : '펼치기 ▾'}
          </span>
        </div>

        {isPastOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            {pastLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong>[{leave.leaveType}]</strong> {leave.startDate} ~ {leave.endDate}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>완료</span>
              </div>
            ))}
            {pastLeaves.length === 0 && (
              <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '12px', padding: '8px 0' }}>
                지난 기록이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLeavesPage;