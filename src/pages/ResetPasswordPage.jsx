// src/pages/ResetPasswordPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { supabase } from '../api/supabaseClient';

function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
      <ResetPasswordForm 
        onComplete={async () => {
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
        }} 
      />
    </div>
  );
}

export default ResetPasswordPage;