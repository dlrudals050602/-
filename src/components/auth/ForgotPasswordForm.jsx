import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function ForgotPasswordForm({ onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const targetUsername = username.trim();
    const targetEmail = email.trim();

    // 1. profiles 테이블에서 아이디와 이메일이 동시에 일치하는 유저 조회
    const { data: isValid, error: profileError } = await supabase.rpc('verify_username_and_email', {
      p_username: targetUsername,
      p_email: targetEmail,
    });

    if (profileError) {
      setMessage(`조회 중 오류가 발생했습니다: ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (!isValid) {
      setMessage('입력하신 아이디와 이메일 정보가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 2. 비밀번호 재설정 이메일 발송
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: window.location.origin, // 이메일 링크 클릭 시 이동할 URL
    });

    setLoading(false);

    if (resetError) {
      setMessage(`이메일 발송 실패: ${resetError.message}`);
    } else {
      setIsSuccess(true);
      setMessage('비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해 주세요!');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>비밀번호 찾기</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
        가입 시 등록한 아이디와 이메일을 입력해 주세요.
      </p>

      {!isSuccess ? (
        <form onSubmit={handleSendResetEmail}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디 입력"
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
          >
            {loading ? '확인 중...' : '재설정 이메일 받기'}
          </button>
        </form>
      ) : (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#15803d', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {message && !isSuccess && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          type="button"
          onClick={onBackToLogin}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;