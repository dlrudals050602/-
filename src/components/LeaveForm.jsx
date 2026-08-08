// src/components/LeaveForm.jsx
import React, { useState, useEffect } from 'react';
import { checkIsHoliday } from '../services/holidayService';
import './LeaveForm.css';

// 1️⃣ 하드코딩 방지를 위한 초기 상태 및 상수 선언
const INITIAL_STATE = {
  name: '',
  rank: '이병',
  leaveType: '휴가',
  startDate: '',
  endDate: ''
};

const LEAVE_TYPE = {
  VACATION: '휴가',
  GO_OUT: '외출',
  STAY_OUT: '외박',
};

// 2️⃣ 날짜 유틸리티 함수 분리 (중복 제거)
const parseDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getDiffDays = (startStr, endStr) => {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const addDaysToDateString = (dateString, daysToAdd) => {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + daysToAdd);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function LeaveForm({ onApply, holidays = [] }) {
  const [formData, setFormData] = useState(INITIAL_STATE);

  // 🔄 UI 보조: 외출/외박 선택 시 종료일 자동 계산
  useEffect(() => {
    if (!formData.startDate) return;

    if (formData.leaveType === LEAVE_TYPE.GO_OUT) {
      setFormData(prev => ({ ...prev, endDate: formData.startDate }));
    } else if (formData.leaveType === LEAVE_TYPE.STAY_OUT) {
      setFormData(prev => ({ 
        ...prev, 
        endDate: addDaysToDateString(formData.startDate, 1) 
      }));
    }
  }, [formData.leaveType, formData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // required 속성 덕분에 빈 값은 여기서 잡히기 전 브라우저가 차단함
    
    const { startDate, endDate, leaveType } = formData;

    // 날짜 역전 방지
    if (startDate > endDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    const diffDays = getDiffDays(startDate, endDate);

    // 1. 🏖️ 휴가 15일 초과 체크
    if (leaveType.includes(LEAVE_TYPE.VACATION) && diffDays > 15) {
      if (!window.confirm(`⚠️ 휴가 기간이 15일을 초과했습니다 (신청 기간: ${diffDays}일).\n그래도 신청하시겠습니까?`)) {
        return;
      }
    }

    // 2. 🚗 외박 1박 2일 기간 검증
    if (leaveType === LEAVE_TYPE.STAY_OUT && diffDays !== 2) {
      alert('⚠️ 외박은 반드시 1박 2일(연속된 2일 기간)이어야 합니다.');
      return;
    }

    // 3. 평일 안내 팝업 (외박/외출)
    if (leaveType === LEAVE_TYPE.STAY_OUT || leaveType === LEAVE_TYPE.GO_OUT) {
      const isStartHoliday = checkIsHoliday(startDate, holidays);
      const isEndHoliday = checkIsHoliday(endDate, holidays);

      if (!isStartHoliday || !isEndHoliday) {
        if (!window.confirm('⚠️ 선택하신 날짜가 주말 또는 공휴일이 아닙니다. 그래도 신청하시겠습니까?')) {
          return;
        }
      }
    }

    // 실제 비즈니스 검증 및 신청 처리는 부모 컴포넌트로 위임
    onApply(formData);
    
    // 폼 초기화
    setFormData(INITIAL_STATE);
  };

  const isSingleDateLeave = formData.leaveType === LEAVE_TYPE.GO_OUT || formData.leaveType === LEAVE_TYPE.STAY_OUT;

  return (
    <div className="form-container">
      <h3 className="form-title">✍️ 출타 신청서</h3>
      <form onSubmit={handleSubmit} className="leave-form">
        
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input 
            id="name"
            name="name"
            type="text" 
            value={formData.name} 
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="rank">계급</label>
          <select id="rank" name="rank" value={formData.rank} onChange={handleChange}>
            <option value="이병">이병</option>
            <option value="일병">일병</option>
            <option value="상병">상병</option>
            <option value="병장">병장</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="leaveType">출타 종류</label>
          <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange}>
            <option value={LEAVE_TYPE.VACATION}>휴가</option>
            <option value={LEAVE_TYPE.GO_OUT}>외출</option>
            <option value={LEAVE_TYPE.STAY_OUT}>외박</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">출타 시작일</label>
          <input 
            id="startDate"
            name="startDate"
            type="date" 
            value={formData.startDate} 
            onChange={handleChange} 
            required
          />
        </div>

        {!isSingleDateLeave ? (
          <div className="form-group">
            <label htmlFor="endDate">출타 종료일</label>
            <input 
              id="endDate"
              name="endDate"
              type="date" 
              value={formData.endDate} 
              onChange={handleChange} 
              required
            />
          </div>
        ) : (
          formData.startDate && (
            <div className="automatic-date-tip">
              ℹ️ {formData.leaveType === LEAVE_TYPE.GO_OUT ? '외출 당일 복귀' : '외박 1박 2일'} 자동 적용: 
              <strong style={{ marginLeft: '5px', color: '#1a73e8' }}>{formData.endDate} 복귀</strong>
            </div>
          )
        )}

        <button type="submit" className="submit-btn">신청하기</button>
      </form>
    </div>
  );
}

export default LeaveForm;