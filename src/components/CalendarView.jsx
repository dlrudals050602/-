// src/components/CalendarView.jsx
import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import { groupLeavesByDate, getLeaveColor } from '../services/leaveService';

// 날짜 객체를 "YYYY-MM-DD" 문자열로 변환하는 헬퍼
const formatDateStr = (targetDate) => {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CalendarView({ leaves = [], holidays = [], date, onDateChange }) {
  // 1. 시작 날짜 / 종료 날짜 state 및 DB 데이터 state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dbData, setDbData] = useState({});

  // 상대방이 추가한 휴가 데이터 그룹화
  const leavesByDateMap = useMemo(() => {
    return groupLeavesByDate(leaves);
  }, [leaves]);

  // 토요일/일요일/공휴일 스타일 지정을 위한 클래스 생성
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(date);
      const dayOfWeek = date.getDay();

      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isHoliday = holidays.some((h) => h.date === dateStr);

      if (isSunday || isHoliday) {
        return 'holiday-tile';
      }

      if (isSaturday) {
        return 'saturday-tile';
      }
    }
    return null;
  };

  // 2. 시작일~종료일을 DB로 전송하는 함수 (내가 작성한 기능)
  const handleDbSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      return alert('시작 날짜와 종료 날짜를 모두 선택해주세요!');
    }

    if (startDate > endDate) {
      return alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
        }),
      });

      const result = await response.json();
      setDbData(result);

      const [year, month, day] = startDate.split('-');
      onDateChange(new Date(Number(year), Number(month) - 1, Number(day)));

      alert('기간 데이터 전송 및 달력 업데이트 완료!');
    } catch (error) {
      console.error('DB 통신 중 오류 발생:', error);
    }
  };

  // 3. 달력의 각 날짜(tile)마다 휴가/공휴일 렌더링 (상대방이 작성한 상세 로직 적용)
  const renderTileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(tileDate);
      const activeLeaves = leavesByDateMap[dateStr] || [];
      const holidayInfo = holidays.find((h) => h.date === dateStr);

      const sortedActiveLeaves = [...activeLeaves]
        .filter((leave) => leave.status === 'active')
        .sort((a, b) => {
          const isVacationA = a.leaveType === '휴가';
          const isVacationB = b.leaveType === '휴가';

          if (isVacationA && !isVacationB) return -1;
          if (!isVacationA && isVacationB) return 1;

          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a.name.localeCompare(b.name, 'ko');
        });

      return (
        <div className="tile-content-wrapper">
          {holidayInfo && (
            <div className="holiday-name-label">
              {holidayInfo.name}
            </div>
          )}

          <div className="day-split-container">
            {[0, 1, 2, 3, 4].map((index) => {
              const leaveOnThisTrack = sortedActiveLeaves[index];

              return (
                <div
                  key={index}
                  className={`sub-cell ${leaveOnThisTrack ? 'active' : ''}`}
                  style={leaveOnThisTrack ? { backgroundColor: getLeaveColor(leaveOnThisTrack.name, leaveOnThisTrack.leaveType) } : {}}
                  title={leaveOnThisTrack ? `${leaveOnThisTrack.rank} ${leaveOnThisTrack.name} (${leaveOnThisTrack.leaveType})` : ''}
                >
                  {leaveOnThisTrack && (
                    <span className="cell-text">
                      {leaveOnThisTrack.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
      {/* 내가 작성한 시작일/종료일 폼 영역 */}
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

      {/* 두 사람의 옵션이 모두 결합된 달력 컴포넌트 */}
      <Calendar 
        onChange={onDateChange} 
        value={date} 
        locale="ko-KR" 
        tileClassName={getTileClassName}
        tileContent={renderTileContent} 
      />
    </div>
  );
}

export default CalendarView;