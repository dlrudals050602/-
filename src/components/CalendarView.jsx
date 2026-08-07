// src/components/CalendarView.jsx
import React, { useMemo } from 'react';
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

function CalendarView({ leaves = [], date, onDateChange }) {

  const leavesByDateMap = useMemo(() => {
    return groupLeavesByDate(leaves);
  }, [leaves]);

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(date);
      const activeLeaves = leavesByDateMap[dateStr] || [];

      // 수직 적층 규칙: '휴가'가 항상 바닥(낮은 인덱스)에 배치되도록 정렬
      const sortedActiveLeaves = [...activeLeaves]
        .filter(leave => leave.status === 'active')
        .sort((a, b) => {
          const isVacationA = a.leaveType === '휴가';
          const isVacationB = b.leaveType === '휴가';

          // 1. 휴가를 아래쪽(낮은 인덱스)으로 정렬
          if (isVacationA && !isVacationB) return -1;
          if (!isVacationA && isVacationB) return 1;

          // 2. 동일 종목 내에서는 신청 일시 순 정렬
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          return a.name.localeCompare(b.name, 'ko');
        });

      return (
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