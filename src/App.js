import React, { useState, useEffect, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import LeaveForm from './components/LeaveForm';
import { fetchLeaves, applyLeave } from './services/leaveService';
import { fetchHolidays } from './services/holidayService';

function App() {
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // 📌 선택된 캘린더 날짜의 연도 추출
  const selectedYear = date.getFullYear();

  // 📌 데이터 로드 함수 (연도 변경 시 해당 연도 공휴일 동적 조회)
  const loadData = useCallback(async () => {
    try {
      const [leaveData, holidayData] = await Promise.all([
        fetchLeaves(),
        fetchHolidays(selectedYear) // 바뀐 holidayService의 fetchHolidays(year) 호출
      ]);
      setLeaves(leaveData);
      setHolidays(holidayData);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // 📌 최초 마운트 및 캘린더 연도(selectedYear) 변경 시 자동 실행
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyLeave = async (newLeave) => {
    try {
      // 1. leaveService로 1차 신청
      const res = await applyLeave(newLeave, leaves, holidays);

      // A. 정원 초과로 신청이 차단된 경우
      if (res.status === 'full') {
        const confirmPending = window.confirm(
          `${res.reason}\n대기자(Pending) 명단으로 등록하시겠습니까?`
        );
        if (confirmPending) {
          await applyLeave(newLeave, leaves, holidays, false, true); // forcePending = true
          alert('📥 대기 명단에 등록되었습니다.');
          await loadData();
        }
        return;
      }

      // B. 총원 5명 초과로 기존 외출자 대기 전환 컨펌이 필요한 경우
      if (res.status === 'REQUIRES_CONFIRM') {
        const userConfirmed = window.confirm(res.reason);
        if (userConfirmed) {
          await applyLeave(newLeave, leaves, holidays, true); // userConfirmed = true
          alert(`🎉 ${newLeave.name}님의 휴가가 승인되었으며, 기존 외출자 1명이 대기 전환되었습니다.`);
          await loadData();
        }
        return;
      }

      // C. 정상 승인된 경우
      if (res.status === 'active') {
        alert(`🎉 ${newLeave.name}님의 출타 등록 완료!`);
        await loadData();
      }
    } catch (error) {
      alert('⚠️ 에러 발생: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h3>🎖️ 실시간 출타 현황판 데이터를 불러오는 중...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🎖️ 실시간 군 출타 현황판</h1>
      
      {/* 👇 수정한 부분: flex-direction을 column으로 변경하여 위아래 배치 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
        
        {/* 1. 달력 (메인, 상단 배치) */}
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

        {/* 2. 출타 신청서 (달력 바로 아래 배치) */}
        <div>
          <LeaveForm 
            onApply={handleApplyLeave} 
            holidays={holidays} 
            leaves={leaves}
          />

        </div>

      </div>
    </div>
  );
}

export default App;