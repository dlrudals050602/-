// // src/components/LeaveDashboard.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import CalendarView from './CalendarView';
// import LeaveForm from './LeaveForm';
// import { fetchLeaves, applyLeave } from '../services/leaveService';
// import { fetchHolidays } from '../services/holidayService';

// function LeaveDashboard() {
//   const [leaves, setLeaves] = useState([]);
//   const [holidays, setHolidays] = useState([]);
//   const [date, setDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);

//   const selectedYear = date.getFullYear();

//   // 출타 데이터 및 공휴일 데이터 로드
//   const loadData = useCallback(async () => {
//     try {
//       const [leaveData, holidayData] = await Promise.all([
//         fetchLeaves(),
//         fetchHolidays(selectedYear)
//       ]);
//       setLeaves(leaveData);
//       setHolidays(holidayData);
//     } catch (error) {
//       console.error('데이터 불러오기 실패:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedYear]);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   // 출타 신청 처리 핸들러
//   const handleApplyLeave = async (newLeave) => {
//     try {
//       const res = await applyLeave(newLeave, leaves, holidays);

//       if (res.status === 'full') {
//         const confirmPending = window.confirm(
//           `${res.reason}\n대기자(Pending) 명단으로 등록하시겠습니까?`
//         );
//         if (confirmPending) {
//           await applyLeave(newLeave, leaves, holidays, false, true);
//           alert('📥 대기 명단에 등록되었습니다.');
//           await loadData();
//         }
//         return;
//       }

//       if (res.status === 'REQUIRES_CONFIRM') {
//         const userConfirmed = window.confirm(res.reason);
//         if (userConfirmed) {
//           await applyLeave(newLeave, leaves, holidays, true);
//           alert(`🎉 ${newLeave.name}님의 휴가가 승인되었으며, 기존 외출자 1명이 대기 전환되었습니다.`);
//           await loadData();
//         }
//         return;
//       }

//       if (res.status === 'active') {
//         alert(`🎉 ${newLeave.name}님의 출타 등록 완료!`);
//         await loadData();
//       }
//     } catch (error) {
//       alert('⚠️ 에러 발생: ' + error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '50px' }}>
//         <h3>🎖️ 실시간 출타 현황판 데이터를 불러오는 중...</h3>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h1 style={{ textAlign: 'center' }}>🎖️ 실시간 군 출타 현황판</h1>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
//         <div>
//           <CalendarView 
//             leaves={leaves} 
//             holidays={holidays} 
//             date={date} 
//             onDateChange={setDate} 
//           />
//           <div style={{ marginTop: '20px', textAlign: 'center' }}>
//             <h3>선택한 날짜: {date.toLocaleDateString()}</h3>
//           </div>
//         </div>

//         <div>
//           <LeaveForm onApply={handleApplyLeave} holidays={holidays} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LeaveDashboard;