import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useNotificaciones } from '../hooks/useNotificaciones';
import Bell from './Bell';
import logo from '../img/CamareroIcon.png';
import '../styles/header.css';
import InfoModal from './InfoModal';

const Header = () => {
  const { usuario, setUsuario } = useUser();
  const { notificaciones } = useNotificaciones();
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleLogout = () => {
    setUsuario(null);
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Logo Camarero App" className="logo" />
        <h1>CAMARERO APP</h1>
      </div>

      <nav className="nav">
        {!usuario && (
          <>
            <a href="/login-empleado" className="empleado-icon" title="Login empleado">
              <i className="fas fa-sign-in-alt"></i>
            </a>
            <button className="about-link" onClick={() => setMostrarModal(true)}>
              Sobre nosotros
            </button>
          </>
        )}

        {usuario?.tipo && (
          <>
            <Bell notificaciones={notificaciones} />
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </>
        )}
      </nav>

      {mostrarModal && <InfoModal onClose={() => setMostrarModal(false)} />}
    </header>
  );
};

export default Header;