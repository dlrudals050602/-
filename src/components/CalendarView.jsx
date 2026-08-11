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

function CalendarView({ leaves = [], holidays = [], date, onDateChange }) {

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