// src/components/CalendarView.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarView({ date, onDateChange }) {
  return (
    <div className="calendar-container">
      <h2>달력 화면</h2>
      <Calendar onChange={onDateChange} value={date} locale="ko-KR" />
    </div>
  );
}

export default CalendarView;