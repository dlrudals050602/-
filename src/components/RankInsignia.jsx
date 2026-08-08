import React from 'react';

const RankInsignia = ({ rank }) => {
  const stripeCount = {
    '이병': 1,
    '일병': 2,
    '상병': 3,
    '병장': 4
  }[rank] || 1;

  return (
    <div style={{
      width: '28px',
      height: '28px',
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '2px',
      backgroundColor: '#1e293b',
      borderRadius: '4px',
      border: '1px solid #0f172a',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '2px'
    }}>
      {Array.from({ length: stripeCount }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '18px',
            height: '3px',
            backgroundColor: '#ffff',
            borderRadius: '1px'
          }}
        />
      ))}
    </div>
  );
};

export default RankInsignia;