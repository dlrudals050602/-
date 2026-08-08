// src/components/CalendarView.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

function CalendarView({ date, onDateChange }) {
  // 1. 시작 날짜 / 종료 날짜 state 및 DB 데이터 state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dbData, setDbData] = useState({}); // 예: { '2026-08-05': { cell1: 'active', ... } }

  // 2. 시작일~종료일을 DB로 전송하는 함수
  const handleDbSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      return alert('시작 날짜와 종료 날짜를 모두 선택해주세요!');
    }

    if (startDate > endDate) {
      return alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
    }

    try {
      // 📤 시작일과 종료일을 포함하여 백엔드 API로 전송
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
        }),
      });

      // 📥 DB 처리 결과 수신
      const result = await response.json();

      // DB에서 넘어온 데이터로 state 업데이트 (기간 내 해당 날짜들에 반영)
      setDbData(result);

      // 선택한 시작 날짜로 메인 달력 이동
      const [year, month, day] = startDate.split('-');
      onDateChange(new Date(Number(year), Number(month) - 1, Number(day)));

      alert('기간 데이터 전송 및 달력 업데이트 완료!');
    } catch (error) {
      console.error('DB 통신 중 오류 발생:', error);
    }
  };

  // 3. 달력의 각 날짜(tile)마다 DB 데이터를 기반으로 sub-cell 렌더링
  const renderTileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      // YYYY-MM-DD 형태로 로컬 기준 날짜 포맷 변환
      const year = tileDate.getFullYear();
      const month = String(tileDate.getMonth() + 1).padStart(2, '0');
      const day = String(tileDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const dayData = dbData[dateKey] || {};

      return (
        <div className="day-split-container">
          <div className={`sub-cell cell-1 ${dayData.cell1 || ''}`}></div>
          <div className={`sub-cell cell-2 ${dayData.cell2 || ''}`}></div>
          <div className={`sub-cell cell-3 ${dayData.cell3 || ''}`}></div>
          <div className={`sub-cell cell-4 ${dayData.cell4 || ''}`}></div>
          <div className={`sub-cell cell-5 ${dayData.cell5 || ''}`}></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
      {/* ──────────────────────────────────────────────────
          [A] 시작일 & 종료일 입력 폼
         ────────────────────────────────────────────────── */}
      <form onSubmit={handleDbSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '5px', fontSize: '14px' }}>시작:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ marginRight: '5px', fontSize: '14px' }}>종료:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" style={{ padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>
          DB 전송
        </button>
      </form>

      {/* ──────────────────────────────────────────────────
          [B] react-calendar 달력
         ────────────────────────────────────────────────── */}
      <Calendar 
        onChange={onDateChange} 
        value={date} 
        locale="ko-KR" 
        tileContent={renderTileContent} 
      />
    </div>
  );
}

export default CalendarView;