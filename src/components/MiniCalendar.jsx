// src/components/MiniCalendar.jsx
import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MiniCalendar.css'; // 팝업 전용 소형 디자인
import { groupLeavesByDate } from '../services/leaveService';

const formatDateStr = (targetDate) => {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MiniCalendar({ leaves = [], holidays = [], date, onDateChange }) {
  const leavesByDateMap = useMemo(() => {
    return groupLeavesByDate(leaves);
  }, [leaves]);

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(date);
      const dayOfWeek = date.getDay();
      
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6; 
      const isHoliday = holidays.some((h) => h.date === dateStr);

      if (isSunday || isHoliday) return 'mini-holiday-tile';
      if (isSaturday) return 'mini-saturday-tile';
    }
    return null;
  };

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(date);
      const activeLeaves = leavesByDateMap[dateStr] || [];
      const activeCount = activeLeaves.filter(leave => leave.status === 'active').length;

      // 5칸 중 몇 칸이 찼는지 작은 글씨나 점으로 표시
      return (
        <div className="mini-tile-content">
          <div className={`slot-badge ${activeCount >= 5 ? 'full' : activeCount > 0 ? 'some' : 'empty'}`}>
            {activeCount}/5
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mini-calendar-container">
      <Calendar 
        onChange={onDateChange} 
        value={date} 
        locale="ko-KR" 
        tileClassName={getTileClassName}
        tileContent={renderTileContent}
        calendarType="gregory" // 일요일부터 시작하도록 설정
      />
    </div>
  );
}

export default MiniCalendar;