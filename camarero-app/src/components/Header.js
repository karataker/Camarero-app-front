import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import Bell from './Bell';
import logo from '../img/CamareroIcon.png';
import '../styles/header.css';
import InfoModal from './InfoModal';

const Header = () => {
  const { usuario, setUsuario } = useUser();
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
          <button className="about-link" onClick={() => setMostrarModal(true)}>
            Sobre nosotros
          </button>
        )}
        {usuario?.tipo === 'admin' && (
          <>
            <a href="/admin/comandas">Comandas</a>
            <a href="/admin/almacen">Almacén</a>
            <Bell notificaciones={3} />
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </>
        )}
        {usuario?.tipo === 'cliente' && (
          <>
            <a href="/cliente/locales">Locales</a>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </>
        )}
      </nav>
      {mostrarModal && <InfoModal onClose={() => setMostrarModal(false)} />}
    </header>
  );
};

export default Header;