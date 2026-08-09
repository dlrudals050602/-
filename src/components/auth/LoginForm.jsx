import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function LoginForm({ onLoginSuccess, onGoToSignup, onGoToForgotPassword }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    const targetId = loginId.trim();

    // 1. 이메일 인증이 완료된 계정만 모여있는 profiles 테이블에서 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', targetId)
      .maybeSingle();

    if (profileError) {
      setMessage(`로그인 오류가 발생했습니다: ${profileError.message}`);
      return;
    }

    // 미인증 유저는 profiles에 존재하지 않으므로 바로 "없는 계정" 처리
    if (!profile || !profile.email) {
      setMessage(`로그인 실패: 존재하지 않는 계정입니다.`);
      return;
    }

    // 2. 비밀번호로 로그인 시도
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    });

    if (loginError) {
      // 미인증 상태이거나 비밀번호가 틀린 경우 모두 존재하지 않거나 비밀번호 오류 처리
      if (loginError.message.includes('Email not confirmed')) {
        setMessage('로그인 실패: 존재하지 않는 계정입니다.');
        return;
      }
      setMessage('로그인 실패: 비밀번호가 올바르지 않습니다.');
      return;
    }

    // 3. 최종 인증 확인
    if (!authData?.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setMessage('로그인 실패: 존재하지 않는 계정입니다.');
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

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
        >
          로그인
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