import React from 'react';
import '../styles/login.css'; // Reutilizamos estilos básicos

const NotFound = () => {
  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>404</h2>
        <p>Página no encontrada</p>
        <button onClick={() => window.history.back()}>Volver a la página anterior</button>
      </div>
    </div>
  );
};

export default NotFound;