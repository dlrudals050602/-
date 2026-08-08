import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import VerifyOtpForm from './VerifyOtpForm';

function AuthView({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'verify_otp'
  const [pendingEmail, setPendingEmail] = useState('');

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
      {authMode === 'verify_otp' ? (
        <VerifyOtpForm 
          pendingEmail={pendingEmail} 
          onSuccess={onLoginSuccess}
          onBackToLogin={() => setAuthMode('login')}
        />
      ) : authMode === 'signup' ? (
        <SignupForm 
          onSignUpSuccess={(email) => {
            setPendingEmail(email);
            setAuthMode('verify_otp');
          }}
          onBackToLogin={() => setAuthMode('login')}
        />
      ) : (
        <LoginForm 
          onLoginSuccess={onLoginSuccess}
          onRequireVerify={(email) => {
            setPendingEmail(email);
            setAuthMode('verify_otp');
          }}
          onGoToSignup={() => setAuthMode('signup')}
        />
      )}
    </div>
  );
}

export default AuthView;