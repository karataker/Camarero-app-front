import React from 'react';
import '../styles/bell.css';  

const Bell = ({ notificaciones = 0 }) => {
  return (
    <div className="bell-wrapper" title="Notificaciones">
      <i className="fas fa-bell"></i>
      {notificaciones > 0 && (
        <span className="bell-badge">{notificaciones}</span>
      )}
    </div>
  );
};

export default Bell;