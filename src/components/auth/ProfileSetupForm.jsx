import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';

function ProfileSetupForm({ user, userProfile, onSaved, onCancel }) {
  const [fullName, setFullName] = useState('');
  const [enlistmentDate, setEnlistmentDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [vacationDays, setVacationDays] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 기존 프로필 정보 불러오기 (수정 모드일 때)
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setEnlistmentDate(userProfile.military_enlistment_date || '');
      setDischargeDate(userProfile.military_discharge_date || '');
      setVacationDays(userProfile.vacation_days || 0);
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!fullName.trim()) {
      setMessage('실명을 입력해 주세요.');
      return;
    }

    if (!enlistmentDate || !dischargeDate) {
      setMessage('입대 날짜와 전역 날짜를 모두 입력해 주세요.');
      return;
    }

    if (new Date(enlistmentDate) >= new Date(dischargeDate)) {
      setMessage('전역 날짜는 입대 날짜보다 이후여야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        military_enlistment_date: enlistmentDate,
        military_discharge_date: dischargeDate,
        vacation_days: parseInt(vacationDays, 10) || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select()
        .single();

      if (error) {
        setMessage(`저장 실패: ${error.message}`);
      } else {
        onSaved(data);
      }
    } catch (err) {
      setMessage('알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>내 정보 설정</h3>

      <form onSubmit={handleSubmit}>
        {/* 실명 입력 칸 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>실명 (이름)</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="예: 홍길동"
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 입대일 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>입대 날짜</label>
          <input
            type="date"
            value={enlistmentDate}
            onChange={(e) => setEnlistmentDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 전역일 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>전역 날짜</label>
          <input
            type="date"
            value={dischargeDate}
            onChange={(e) => setDischargeDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 보유 휴가일수 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>총 휴가 일수 (일)</label>
          <input
            type="number"
            min="0"
            value={vacationDays}
            onChange={(e) => setVacationDays(e.target.value)}
            placeholder="0"
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '15px',
            marginBottom: '10px',
          }}
        >
          {isLoading ? '저장 중...' : '저장하기'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            취소
          </button>
        )}
      </form>

      {message && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ProfileSetupForm;