// src/components/CalendarView.jsx
import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

// 날짜 객체를 "YYYY-MM-DD" 문자열로 변환하는 헬퍼
const formatDateStr = (targetDate) => {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CalendarView({ leaves = [], date, onDateChange }) {

  // 1. leaves 데이터 변경 시에만 날짜별 Map 전처리
  const leavesByDateMap = useMemo(() => {
    const map = {};

    leaves.forEach((leave) => {
      // YYYY-MM-DD 문자열을 안전하게 로컬 Date 객체로 파싱 (타임존 방지)
      const [sYear, sMonth, sDay] = leave.startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = leave.endDate.split('-').map(Number);

      let current = new Date(sYear, sMonth - 1, sDay);
      const end = new Date(eYear, eMonth - 1, eDay);

      while (current <= end) {
        const dateStr = formatDateStr(current);

        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(leave);

        current.setDate(current.getDate() + 1); // 하루씩 증가
      }
    });

    return map;
  }, [leaves]);

  // 2. 5칸 가로 트랙 타일 렌더링
  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(date);
      const activeLeaves = leavesByDateMap[dateStr] || [];

      return (
        <div className="day-split-container">
          {/* 5개 트랙(0~4)을 생성하도록 [0, 1, 2, 3, 4] 배열 사용 */}
          {[0, 1, 2, 3, 4].map((index) => {
            const leaveOnThisTrack = activeLeaves.find(leave => leave.trackIndex === index);

            return (
              <div
                key={index}
                className={`sub-cell cell-${index + 1} ${leaveOnThisTrack ? 'active' : ''}`}
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
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
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