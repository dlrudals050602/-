import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function ResetPasswordForm({ onComplete }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    // 1. 비밀번호 일치 여부 검증
    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    // 2. 비밀번호 최소 자릿수 검증
    if (newPassword.length < 6) {
      setMessage('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    // 3. Supabase에 로그인된 인증 세션 기반으로 비밀번호 변경 API 호출
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setMessage(`비밀번호 변경 실패: ${error.message}`);
    } else {
      setIsSuccess(true);
      setMessage('비밀번호가 성공적으로 변경되었습니다!');
      
      // 1.5초 후 완료 콜백 실행 (App.js에서 지정한 로그인/메인 화면 이동 로직 동작)
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>새 비밀번호 설정</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
        새롭게 사용할 비밀번호를 입력해 주세요.
      </p>

      {!isSuccess ? (
        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 입력 (6자리 이상)"
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
          >
            {loading ? '변경 중...' : '비밀번호 변경 완료'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#15803d', fontSize: '14px', marginBottom: '12px' }}>
            {message}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>잠시 후 화면이 이동합니다...</p>
        </div>
      )}

      {message && !isSuccess && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ResetPasswordForm;