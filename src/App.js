import React, { useState, useEffect } from 'react';
import CalendarView from './components/CalendarView';
import LeaveForm from './components/LeaveForm';
import {fetchLeaves, applyLeave} from './services/leaveService';

function App() {
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  //DB 불러와서 상태 동기화
  const loadData = async () => {
    try{
      const data = await fetchLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('data loading fail:', error.message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ★ 신청 폼(LeaveForm) 제출 시 호출될 핸들러 함수 구현
  const handleApplyLeave = async (newLeave) => {
    try {
      // 1. leaveService를 통해 자동 배정 및 DB 저장 시도
      await applyLeave(newLeave, leaves);
      alert(`🎉 ${newLeave.name}님의 출타 등록 완료!`);
      // 2. 저장 성공 시 최신 DB 데이터를 다시 불러와 화면 갱신
      loadData(); 
    } catch (error) {
      alert('⚠️ ' + error.message);
    }
  };

  // ★ 로딩 중일 때 보여줄 임시 화면 처리
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h3>🎖️ 출타 현황판 데이터를 불러오는 중...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎖️ 실시간 군 출타 현황판</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', marginTop: '20px' }}>
        {/* ★ 신청 폼 컴포넌트 배치 및 핸들러 전달 */}
        <div>
          <LeaveForm onApply={handleApplyLeave} />
        </div>

        {/* ★ 달력 컴포넌트에 DB에서 가져온 leaves 데이터 전달 */}
        <div>
          <CalendarView 
            leaves={leaves} 
            date={date} 
            onDateChange={setDate} 
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3>선택한 날짜: {date.toLocaleDateString()}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;