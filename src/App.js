import React, { useState } from 'react';
import CalendarView from './components/CalendarView';

function App() {
  const [date, setDate] = useState(new Date());

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>나만의 캘린더 앱</h1>
      <CalendarView date={date} onDateChange={setDate} />
      <div style={{ marginTop: '20px' }}>
        <h3>선택한 날짜: {date.toLocaleDateString()}</h3>
      </div>
    </div>
  );
}

export default App;