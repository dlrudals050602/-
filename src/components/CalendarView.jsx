// src/components/CalendarView.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

function CalendarView({ date, onDateChange }) {
  

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      return (
        <div className="day-split-container">
          <div className="sub-cell cell-1"></div>
          <div className="sub-cell cell-2"></div>
          <div className="sub-cell cell-3"></div>
          <div className="sub-cell cell-4"></div>
          <div className="sub-cell cell-5"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <h2>달력 화면</h2>
      <Calendar 
        onChange={onDateChange} 
        value={date} 
        locale="ko-KR" 
        tileContent={renderTileContent} // 여기에 tileContent 주입!
      />
    </div>
  );
}

export default CalendarView;