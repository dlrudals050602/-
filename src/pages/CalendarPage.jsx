import React from 'react';
import CalendarView from '../components/CalendarView';
import { useData } from '../context/DataContext';

function CalendarPage() {
  const { leaves, holidays, date, setDate, loading } = useData();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>🎖️ 실시간 출타 현황판 데이터를 불러오는 중...</h3>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>📅 출타 현황 달력</h2>
      <CalendarView 
        leaves={leaves} 
        holidays={holidays} 
        date={date} 
        onDateChange={setDate} 
      />
      <div style={{ marginTop: '16px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>
        선택한 날짜: <strong>{date.toLocaleDateString('ko-KR')}</strong>
      </div>
    </div>
  );
}

export default CalendarPage;