import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';

function SignupForm({ onSignUpSuccess, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 아이디 변경 시 중복 확인 상태 리셋
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setIsUsernameChecked(false);
    setUsernameMessage('');
  };

  // 아이디 중복확인 함수
  const checkUsernameDuplicate = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setUsernameMessage('아이디를 입력해주세요.');
      return;
    }

    const { data: isExists, error } = await supabase.rpc('check_username_exists', {
      p_username: trimmedUsername,
    });

    if (error) {
      setUsernameMessage('중복 확인 중 오류가 발생했습니다.');
      return;
    }

    if (isExists) {
      setUsernameMessage('❌ 이미 사용 중인 아이디입니다.');
      setIsUsernameChecked(false);
    } else {
      setUsernameMessage('✅ 사용 가능한 아이디입니다.');
      setIsUsernameChecked(true);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isUsernameChecked) {
      setMessage('아이디 중복확인을 완료해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          setMessage('이미 가입된 이메일 주소입니다.');
        } else {
          setMessage(`회원가입 실패: ${signupError.message}`);
        }
        setIsLoading(false);
        return;
      }

      onSignUpSuccess(email.trim());
    } catch (err) {
      setMessage('알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>회원가입</h2>
      
      <form onSubmit={handleSignup}>
        {/* 아이디 + 중복확인 버튼 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>아이디</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="사용할 아이디 입력"
              required
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={checkUsernameDuplicate}
              style={{ padding: '10px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              중복확인
            </button>
          </div>
          {usernameMessage && (
            <p style={{ fontSize: '12px', marginTop: '4px', color: isUsernameChecked ? '#16a34a' : '#dc2626' }}>
              {usernameMessage}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            required
            minLength={6}
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        {/* 비밀번호 확인 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재입력"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
        </div>

        {/* 이메일 (맨 아래) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
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
            fontSize: '15px' 
          }}
        >
          {isLoading ? '처리 중...' : '회원가입하기'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', color: '#dc2626', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        이미 계정이 있으신가요?{' '}
        <button 
          onClick={onBackToLogin}
          style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          로그인
        </button>
      </div>
    </div>
  );
}

export default SignupForm;