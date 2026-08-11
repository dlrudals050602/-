import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

function BottomLayout() {
  return (
    <div style={{ paddingBottom: '70px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
      <main style={{ padding: '16px' }}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}

export default BottomLayout;