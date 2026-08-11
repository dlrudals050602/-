// src/pages/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthView from '../components/auth/AuthView';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 16px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>나만의 캘린더 앱</h1>
      <AuthView onLoginSuccess={() => navigate('/calendar', { replace: true })} />
    </div>
  );
}

export default LoginPage;