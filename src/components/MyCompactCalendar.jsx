// src/components/MyCompactCalendar.jsx
import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MyCompactCalendar.css';
// import { LEAVES_TYPES } from '../data/leave';
import {getLeaveColor} from '../utils/colorUtils';

const formatDateStr = (targetDate) => {
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function MyCompactCalendar({ leaves = [], userId, holidays = [] }) {
  // 1. 전체 부대원의 active/pending 출타 카운트 (그날 총 몇 명 나가는지 N/5)
  const dailyTotalCountMap = useMemo(() => {
    const map = {};
    leaves.forEach((leave) => {
      if (leave.status !== 'active' && leave.status !== 'pending') return;
      
      let curr = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      while (curr <= end) {
        const dateStr = formatDateStr(curr);
        if (!map[dateStr]) map[dateStr] = 0;
        map[dateStr] += 1;
        curr.setDate(curr.getDate() + 1);
      }
    });
    return map;
  }, [leaves]);

  // 2. 로그인한 '내' 출타 데이터만 추출 (색상 배경 하이라이트용)
  const myLeavesMap = useMemo(() => {
    const map = {};
    if (!userId) return map;

    leaves
      .filter((l) => l.userId === userId)
      .forEach((leave) => {
        let curr = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        while (curr <= end) {
          const dateStr = formatDateStr(curr);
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push(leave);
          curr.setDate(curr.getDate() + 1);
        }
      });
    return map;
  }, [leaves, userId]);

  // 3. 내 출타가 있는 날짜만 종류별 색상 타일 부여
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = formatDateStr(date);
    const myDayLeaves = myLeavesMap[dateStr] || [];

    const activeLeave = myDayLeaves.find((l) => l.status === 'active' || l.status === 'pending');
    const wishLeave = myDayLeaves.find((l) => l.status === 'wish');

    if (activeLeave) return 'compact-tile my-active-tile';
    if (wishLeave) return 'compact-tile my-wish';

    const dayOfWeek = date.getDay();
    const isHoliday = holidays.some((h) => h.date === dateStr);
    if (dayOfWeek === 0 || isHoliday) return 'compact-tile holiday';
    if (dayOfWeek === 6) return 'compact-tile saturday';

    return null;
  };

  // 4. 그 날짜에 '부대 전체에서 몇 명' 나가는지 하단 배지 표시 (N/5)
  const renderTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = formatDateStr(date);
    const totalActiveCount = dailyTotalCountMap[dateStr] || 0;
    const myDayLeaves = myLeavesMap[dateStr] || [];
    
    const activeLeave = myDayLeaves.find((l) => l.status === 'active' || l.status === 'pending');
    const wishLeave = myDayLeaves.find((l) => l.status === 'wish');

    let tileStyle = {};

    if (activeLeave) {
      // 확정/대기 출타: 해당 출타 종목 색상으로 바탕 채우기
      const bg = getLeaveColor(activeLeave.name, activeLeave.leaveType);
      tileStyle = { backgroundColor: bg, borderRadius: '6px', color: '#ffffff' };
    } else if (wishLeave) {
      // 위시 출타: 해당 출타 종목 색상의 점선 테두리
      const wishColor = getLeaveColor(wishLeave.name, wishLeave.leaveType);
      tileStyle = {
        border: `2px dashed ${wishColor}`,
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        boxSizing: 'border-box',
      };
    }

    return (
      <div className="compact-tile-content" style={tileStyle}>
        <div className={`compact-slot-badge ${totalActiveCount >= 5 ? 'full' : totalActiveCount > 0 ? 'some' : 'empty'}`}>
          {wishLeave && !activeLeave ? `⭐️ ${totalActiveCount}/5` : `${totalActiveCount}/5`}        </div>
      </div>
    );
  };

  return (
    <div className="my-compact-calendar-wrapper">
      <Calendar
        locale="ko-KR"
        calendarType="gregory"
        tileClassName={getTileClassName}
        tileContent={renderTileContent}
        prev2Label={null}
        next2Label={null}
      />

      {/* 하단 범례 */}
    <div className="compact-legend">
      <span className="legend-item"><span className="dot vacation"></span> 휴가</span>
      <span className="legend-item"><span className="dot outing"></span> 외출</span>
      <span className="legend-item"><span className="dot overnight"></span> 외박</span>
      <span className="legend-item" style={{ fontSize: '10px', color: '#64748b' }}>
        (점선 테두리 ⭐️ = 위시)
      </span>
    </div>
    </div>
  );
}

export default MyCompactCalendar;