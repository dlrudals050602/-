import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';
import { groupLeavesByDate, getLeaveColor } from '../services/leaveService';
import { getStartOfLastWeek } from '../utils/dateUtils';

// 날짜 객체를 "YYYY-MM-DD" 문자열로 변환하는 헬퍼
const formatDateStr = (targetDate) => {
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CalendarView({ leaves = [], holidays = [], date, onDateChange }) {
  const leavesByDateMap = useMemo(() => {
    return groupLeavesByDate(leaves);
  }, [leaves]);

  // 과거 1주일(지난주 월요일) 이전 날짜 제한 기준점
  const lastWeekMonday = useMemo(() => getStartOfLastWeek(new Date()), []);

  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 현재 달력을 조회 중인지, 과거 달로 이동했는지 판별
  const isCurrentOrFutureView = useMemo(() => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const activeMonthStart = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1);

    return activeMonthStart >= currentMonthStart;
  }, [activeStartDate]);

  const getTileClassName = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(tileDate);
      const todayStr = formatDateStr(new Date());

      const minVisibleStr = formatDateStr(lastWeekMonday);

      // 현재 화면을 보는 중일 때는 지난주 월요일 이전 일자를 레이아웃에서 완전 제거 (위로 땡겨옴)
      if (isCurrentOrFutureView && dateStr < minVisibleStr) {
        return 'hidden-tile';
      }

      const isPast = dateStr < todayStr;
      const classNames = [];
      if (isPast) classNames.push('past-tile');

      const dayOfWeek = tileDate.getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isHoliday = holidays.some((h) => h.date === dateStr);

      if (isSunday || isHoliday) {
        classNames.push('holiday-tile');
      } else if (isSaturday) {
        classNames.push('saturday-tile');
      }

      return classNames.join(' ');
    }
    return null;
  };

  const renderTileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dateStr = formatDateStr(tileDate);
      const todayStr = formatDateStr(new Date());
      const minVisibleStr = formatDateStr(lastWeekMonday);

      if(isCurrentOrFutureView && dateStr < minVisibleStr) return null;

      const isPast = dateStr < todayStr;

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
          {/* 과거 일자 삐뚤빼뚤 아날로그 X자 오버레이 */}
          {isPast && (
            <svg className="hand-drawn-x" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 18,15 Q 48,53 82,85"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              <path
                d="M 85,18 Q 42,48 15,82"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
            </svg>
          )}

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
      <Calendar
        onChange={onDateChange}
        value={date}
        locale="ko-KR"
        calendarType="iso8601"
        /* minDate={minDate} 속성을 제거하여 과거 버튼(<) 잠금을 해제합니다 */
        showNeighboringMonth={true}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate: newDate }) => setActiveStartDate(newDate)}
        tileClassName={getTileClassName}
        tileContent={renderTileContent}
        prev2Label={null}
        next2Label={null}
      />
    </div>
  );
}

export default CalendarView;