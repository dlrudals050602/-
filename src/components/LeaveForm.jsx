import React, { useState, useEffect } from 'react';
import { checkIsHoliday } from '../services/holidayService';
import './LeaveForm.css';

function LeaveForm({ onApply, holidays = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    rank: '이병',
    leaveType: '휴가',
    startDate: '',
    endDate: ''
  });

useEffect(() => {
    if (formData.leaveType === '외박' && formData.startDate) {
      const [year, month, day] = formData.startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      start.setDate(start.getDate() + 1);
      
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, '0');
      const d = String(start.getDate()).padStart(2, '0');
      
      setFormData(prev => ({ ...prev, endDate: `${y}-${m}-${d}` }));
    }
  }, [formData.leaveType, formData.startDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('모든 정보를 입력해주세요!');
      return;
    }

    if (formData.startDate > formData.endDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    if (formData.leaveType === '외박') {
      const [sYear, sMonth, sDay] = formData.startDate.split('-').map(Number);
      const [eYear, eMonth, eDay] = formData.endDate.split('-').map(Number);
      const start = new Date(sYear, sMonth - 1, sDay);
      const end = new Date(eYear, eMonth - 1, eDay);
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays !== 2) {
        alert('⚠️ 외박은 반드시 1박 2일(연속된 2일 기간)이어야 합니다.');
        return;
      }

      const isStartHoliday = checkIsHoliday(formData.startDate, holidays);
      const isEndHoliday = checkIsHoliday(formData.endDate, holidays);

      if (!isStartHoliday || !isEndHoliday) {
        alert('⚠️ 외박은 시작일과 종료일이 모두 주말 또는 공휴일이어야 신청 가능합니다.');
        return;
      }
    }

    onApply(formData);
    
    setFormData({
      name: '',
      rank: '이병',
      leaveType: '휴가',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="form-container">
      <h3 className="form-title">✍️ 출타 신청서</h3>
      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-group">
          <label>이름</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>계급</label>
          <select value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})}>
            <option value="이병">이병</option>
            <option value="일병">일병</option>
            <option value="상병">상병</option>
            <option value="병장">병장</option>
          </select>
        </div>
        <div className="form-group">
          <label>출타 종류</label>
          <select value={formData.leaveType} onChange={(e) => setFormData({...formData, leaveType: e.target.value})}>
            <option value="휴가">휴가</option>
            <option value="외출">외출</option>
            <option value="외박">외박</option>
          </select>
        </div>
        <div className="form-group">
          <label>출타 시작일</label>
          <input 
            type="date" 
            value={formData.startDate} 
            onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <label>출타 종료일</label>
          <input 
            type="date" 
            value={formData.endDate} 
            disabled={formData.leaveType === '외박'}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
          />
        </div>
        <button type="submit" className="submit-btn">신청하기</button>
      </form>
    </div>
  );
}

export default LeaveForm;