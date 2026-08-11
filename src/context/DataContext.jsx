import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchLeaves, applyLeave, deleteLeave } from '../services/leaveService';
import { fetchHolidays } from '../services/holidayService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user, refreshProfile } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const selectedYear = date.getFullYear();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveData, holidayData] = await Promise.all([
        fetchLeaves(),
        fetchHolidays(selectedYear)
      ]);
      setLeaves(leaveData);
      setHolidays(holidayData);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleApplyLeave = async (newLeave) => {
    try {
      const res = await applyLeave(newLeave, leaves, holidays);

      if (res.status === 'full') {
        const confirmPending = window.confirm(`${res.reason}\n대기자(Pending) 명단으로 등록하시겠습니까?`);
        if (confirmPending) {
          await applyLeave(newLeave, leaves, holidays, false, true);
          alert('📥 대기 명단에 등록되었습니다.');
          await loadData();
        }
        return;
      }

      if (res.status === 'REQUIRES_CONFIRM') {
        const userConfirmed = window.confirm(res.reason);
        if (userConfirmed) {
          await applyLeave(newLeave, leaves, holidays, true);
          alert(`🎉 ${newLeave.name}님의 휴가가 승인되었으며, 기존 외출자 1명이 대기 전환되었습니다.`);
          await loadData();
        }
        return;
      }

      if (res.status === 'active') {
        alert(`🎉 ${newLeave.name}님의 출타 등록 완료!`);
        await loadData();
        await refreshProfile();
      }
    } catch (error) {
      alert('⚠️ 에러 발생: ' + error.message);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if(!window.confirm('해당 출타 신청을 삭제하시겠습니까?')) return;
    try{
      await deleteLeave(leaveId);
      alert('출타가 삭제되었습니다.');
      await loadData();
      await refreshProfile();
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <DataContext.Provider value={{ leaves, holidays, date, setDate, loading, loadData, handleApplyLeave, handleDeleteLeave }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);