import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function LoginForm({ onLoginSuccess, onRequireVerify, onGoToSignup, onGoToForgotPassword }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // isLoading 및 setIsLoading 선언

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const targetId = loginId.trim();

    // RPC 함수를 사용하여 아이디로 이메일 조회
    const { data: userEmail, error: profileError } = await supabase.rpc('get_email_by_username', {
      p_username: targetId,
    });

    if (profileError) {
      setMessage(`로그인 오류가 발생했습니다: ${profileError.message}`);
      setIsLoading(false);
      return;
    }

    // profile -> userEmail 참조로 수정
    if (!userEmail) {
      setMessage('로그인 실패: 존재하지 않는 계정입니다.');
      setIsLoading(false);
      return;
    }

    // 비밀번호로 로그인 시도 (userEmail 사용)
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    setIsLoading(false);

    if (loginError) {
      if (loginError.message.includes('Email not confirmed')) {
        if (onRequireVerify) onRequireVerify(userEmail);
        return;
      }
      setMessage('로그인 실패: 비밀번호가 올바르지 않습니다.');
      return;
    }

    // 최종 인증 확인
    if (!authData?.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      if (onRequireVerify) {
        onRequireVerify(userEmail);
      } else {
        setMessage('로그인 실패: 존재하지 않거나 미인증된 계정입니다.');
      }
    } else {
      onLoginSuccess(authData.user);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>로그인</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>아이디</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디 입력"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ width: '100%', padding: '12px', backgroundColor: isLoading ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        계정이 없으신가요?{' '}
        <button 
          type="button"
          onClick={onGoToSignup}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default LoginForm;