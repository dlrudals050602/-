import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function VerifyOtpForm({ pendingEmail, onSuccess, onBackToLogin }) {
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 미인증 계정 삭제 함수
  const deletePendingAccount = async () => {
    if (pendingEmail) {
      await supabase.rpc('delete_unconfirmed_user_by_email', {
        target_email: pendingEmail,
      });
    }
  };

  // 인증 확인 처리
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');

    const trimmedCode = otpCode.trim();

    if (!trimmedCode) {
      setMessage('인증 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: trimmedCode,
      type: 'signup',
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        setMessage('인증 코드가 만료되었거나 올바르지 않습니다. [취소하고 돌아가기]를 누른 후 다시 회원가입을 시도해 주세요.');
      } else {
        setMessage('인증 실패: ' + error.message);
      }
      return;
    }

    if (data?.user) {
      onSuccess(data.user);
    }
  };

  // 사용자가 취소하고 로그인 화면으로 돌아갈 때만 삭제
  const handleCancel = async () => {
    setIsLoading(true);
    await deletePendingAccount();
    setIsLoading(false);
    onBackToLogin();
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>이메일 인증</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
        <strong>{pendingEmail}</strong>(으)로 발송된 인증 코드를 입력해주세요.
      </p>

      <form onSubmit={handleVerifyOtp}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>인증 코드 (8자리 숫자)</label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="12345678"
            required
            maxLength={8}
            style={{ 
              width: '100%', 
              padding: '12px', 
              marginTop: '6px', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db', 
              boxSizing: 'border-box', 
              textAlign: 'center', 
              fontSize: '18px', 
              letterSpacing: '3px' 
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: isLoading ? '#9ca3af' : '#16a34a', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: isLoading ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold', 
            fontSize: '15px' 
          }}
        >
          {isLoading ? '처리 중...' : '인증 확인'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        <button 
          onClick={handleCancel}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
        >
          취소하고 돌아가기
        </button>
      </div>
    </div>
  );
}

export default VerifyOtpForm;