import React from 'react';
import LeaveForm from '../components/LeaveForm';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

function MyLeavesPage() {
  const { holidays, leaves, handleApplyLeave } = useData();
  const { userProfile } = useAuth();

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📋 내 출타 신청 및 관리</h2>
      <LeaveForm 
        onApply={handleApplyLeave} 
        holidays={holidays} 
        leaves={leaves} 
        userProfile={userProfile}
      />
    </div>
  );
}

export default MyLeavesPage;