import React from 'react';

const Bell = ({ notificaciones = 0 }) => {
  return (
    <div style={{ position: 'relative', marginLeft: '1rem', fontSize: '1.2rem' }}>
      🔔
      {notificaciones > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-10px',
          backgroundColor: 'red',
          color: 'white',
          borderRadius: '50%',
          padding: '2px 6px',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          {notificaciones}
        </span>
      )}
    </div>
  );
};

export default Bell;