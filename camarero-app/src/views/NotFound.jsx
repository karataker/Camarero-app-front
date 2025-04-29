import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/login.css'; // Reutilizamos estilos básicos

const NotFound = () => {
  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>404</h2>
        <p>Página no encontrada</p>
        <Link to="/login">
          <button>Volver al inicio</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;