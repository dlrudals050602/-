import React, { useState } from 'react';
import './LeaveForm.css'; // 디자인 파일 임포트

function LeaveForm({ onApply }) {
  const [formData, setFormData] = useState({
    name: '',
    rank: '이병',
    leaveType: '정기휴가',
    startDate: '',
    endDate: ''
  });

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
    onApply(formData);
    setFormData({ name: '', rank: '이병', leaveType: '정기휴가', startDate: '', endDate: '' });
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
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label>계급</label>
          <select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})}>
            <option value="이병">이병</option>
            <option value="일병">일병</option>
            <option value="상병">상병</option>
            <option value="병장">병장</option>
          </select>
        </div>

        <div className="form-group">
          <label>출타 종류</label>
          <select value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}>
            <option value="정기휴가">정기휴가</option>
            <option value="포상휴가">포상휴가</option>
            <option value="외출">외출</option>
            <option value="외박">외박</option>
          </select>
        </div>

        <div className="form-group">
          <label>출타 시작일</label>
          <input 
            type="date" 
            value={formData.startDate} 
            onChange={e => setFormData({...formData, startDate: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>출타 종료일</label>
          <input 
            type="date" 
            value={formData.endDate} 
            onChange={e => setFormData({...formData, endDate: e.target.value})} 
          />
        </div>

        <button type="submit" className="submit-btn">신청하기</button>
      </form>
    </div>
  );
}

export default LeaveForm;