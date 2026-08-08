// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './api/supabaseClient';
import AuthView from './components/auth/AuthView';
import MainView from './components/main/MainView';
import CalendarView from './components/CalendarView';
import LeaveForm from './components/LeaveForm';
import { fetchLeaves, applyLeave } from './services/leaveService';
import { fetchHolidays } from './services/holidayService';

function App() {
  // 1. 회원가입/로그인 및 프로필 상태 (내 코드)
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // 2. 출타/휴가 현황판 상태 (상대방 코드)
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // 내 프로필 정보 불러오기
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  };

  // 로그인 상태 감지 (Supabase Auth)
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

  // 3. 출타 데이터 로드 함수 (상대방 코드)
  const selectedYear = date.getFullYear();

  const loadData = useCallback(async () => {
    try {
      const [leaveData, holidayData] = await Promise.all([
        fetchLeaves(),
        fetchHolidays(selectedYear)
      ]);
      setLeaves(leaveData);
      setHolidays(holidayData);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // 로그인되었을 때만 출타 데이터 로드
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // 출타 신청 핸들러 (상대방 코드)
  const handleApplyLeave = async (newLeave) => {
    try {
      const res = await applyLeave(newLeave, leaves, holidays);

      if (res.status === 'full') {
        const confirmPending = window.confirm(
          `${res.reason}\n대기자(Pending) 명단으로 등록하시겠습니까?`
        );
        if (confirmPending) {
          await applyLeave(newLeave, leaves, holidays, false, true);
          alert('📥 대기 명단에 등록되었습니다.');
          await loadData();
        }
        return;
      }

      if (res.status === 'REQUIRES_CONFIRM') {
        const userConfirmed = window.confirm(res.reason);
        if (userConfirmed) {
          await applyLeave(newLeave, leaves, holidays, true);
          alert(`🎉 ${newLeave.name}님의 휴가가 승인되었으며, 기존 외출자 1명이 대기 전환되었습니다.`);
          await loadData();
        }
        return;
      }

      if (res.status === 'active') {
        alert(`🎉 ${newLeave.name}님의 출타 등록 완료!`);
        await loadData();
      }
    } catch (error) {
      alert('⚠️ 에러 발생: ' + error.message);
    }
  };

  // [화면 1] 로그인하지 않은 경우 -> 로그인/회원가입 화면
  if (!user) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>나만의 캘린더 앱</h1>
        <AuthView 
          onLoginSuccess={async (loggedInUser) => {
            setUser(loggedInUser);
            const profile = await fetchUserProfile(loggedInUser.id);
            setUserProfile(profile);
          }} 
        />
      </div>
    );
  }

  // [화면 2] 로그인된 경우 -> 내 정보 설정 + 출타 현황판 통합 화면
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* 1. 상단 내 정보 관리 및 로그아웃 헤더 (내 코드) */}
      <MainView 
        user={user} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
        onSignOut={handleSignOut} 
      />

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>🎖️ 실시간 출타 현황판 데이터를 불러오는 중...</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
          <div>
            <CalendarView 
              leaves={leaves} 
              holidays={holidays} 
              date={date} 
              onDateChange={setDate} 
            />
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h3>선택한 날짜: {date.toLocaleDateString()}</h3>
            </div>
          </div>


{/* 2. 출타 신청서 (상대방 코드의 leaves 속성 포함하여 깔끔하게 통합) */}
          <div>
            <LeaveForm 
              onApply={handleApplyLeave} 
              holidays={holidays} 
              leaves={leaves} 
            />
=======
          </div>
        </div>
      )}
    </div>
  );
}

export default App;