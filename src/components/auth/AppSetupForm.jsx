// import React from 'react';

// function AppSetupForm({ onClose }) {
//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       width: '100vw',
//       height: '100vh',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: '#ffffff',
//         color: '#111827',
//         padding: '24px',
//         borderRadius: '12px',
//         width: '90%',
//         maxWidth: '360px',
//         textAlign: 'left',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
//       }}>
//         <h3 style={{
//           margin: '0 0 16px 0',
//           fontSize: '18px',
//           borderBottom: '1px solid #e5e7eb',
//           paddingBottom: '8px'
//         }}>
//           ⚙️ 앱 설정
//         </h3>

//         {/* 앱 설정 항목 목록 예시 */}
//         <div style={{ marginBottom: '20px', fontSize: '14px', color: '#374151' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
//             <span>앱 버전</span>
//             <span style={{ color: '#6b7280', fontWeight: 'bold' }}>v1.0.0</span>
//           </div>
          
//           <div 
//             onClick={() => alert('서비스 이용약관 페이지 준비 중입니다.')}
//             style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
//           >
//             <span>서비스 이용약관</span>
//             <span style={{ color: '#9ca3af' }}>&gt;</span>
//           </div>

//           <div 
//             onClick={() => alert('개인정보 처리방침 페이지 준비 중입니다.')}
//             style={{ padding: '10px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
//           >
//             <span>개인정보 처리방침</span>
//             <span style={{ color: '#9ca3af' }}>&gt;</span>
//           </div>
//         </div>

//         <button 
//           onClick={onClose}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#2563eb',
//             color: '#ffffff',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             fontWeight: 'bold'
//           }}
//         >
//           닫기
//         </button>
//       </div>
//     </div>
//   );
// }

// export default AppSetupForm;