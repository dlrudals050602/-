import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function LoginForm({ onLoginSuccess, onRequireVerify, onGoToSignup, onGoToForgotPassword }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // [아이디 찾기] 관련 상태값
  const [isFindIdModalOpen, setIsFindIdModalOpen] = useState(false);
  const [findEmail, setFindEmail] = useState('');
  const [findIdResult, setFindIdResult] = useState('');
  const [isFindingId, setIsFindingId] = useState(false);

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

    if (!userEmail) {
      setMessage('로그인 실패: 존재하지 않는 계정입니다.');
      setIsLoading(false);
      return;
    }

    // 비밀번호로 로그인 시도
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

  // [아이디 찾기] 실행 함수
  const handleFindId = async (e) => {
    e.preventDefault();
    setFindIdResult('');
    setIsFindingId(true);

    const targetEmail = findEmail.trim();

    // Supabase RPC 함수 호출 (이메일로 아이디 조회)
    const { data: username, error } = await supabase.rpc('get_username_by_email', {
      p_email: targetEmail,
    });

    setIsFindingId(false);

    if (error) {
      setFindIdResult(`오류가 발생했습니다: ${error.message}`);
      return;
    }

    if (!username) {
      setFindIdResult('해당 이메일로 가입된 아이디를 찾을 수 없습니다.');
    } else {
      setFindIdResult(`회원님의 아이디는 [ ${username} ] 입니다.`);
    }
  };

  const closeFindIdModal = () => {
    setIsFindIdModalOpen(false);
    setFindEmail('');
    setFindIdResult('');
  };

  return (
    <div style={{ position: 'relative' }}>
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

          {/* ▼▼▼ 아이디 찾기 및 비밀번호 찾기 (세로 배치) ▼▼▼ */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsFindIdModalOpen(true)}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
          {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
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

      {/* 아이디 찾기 모달 팝업 */}
      {isFindIdModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '400px', boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>아이디 찾기</h3>
            <form onSubmit={handleFindId}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  가입 시 등록한 이메일 주소를 입력해 주세요.
                </label>
                <input
                  type="email"
                  value={findEmail}
                  onChange={(e) => setFindEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={isFindingId}
                style={{ width: '100%', padding: '10px', backgroundColor: isFindingId ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isFindingId ? '조회 중...' : '아이디 조회'}
              </button>
            </form>

            {findIdResult && (
              <p style={{ marginTop: '15px', fontSize: '14px', textAlign: 'center', color: findIdResult.includes('회원님의 아이디') ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                {findIdResult}
              </p>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={closeFindIdModal}
                style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;