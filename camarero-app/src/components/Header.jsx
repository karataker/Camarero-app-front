import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link } from 'react-router-dom';
import logo from '../img/CamareroIcon.png';
import Bell from './Bell';
import InfoModal from './InfoModal';
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario } = useUser();
  const { notificaciones } = useNotificaciones();
  const { bares, cargarBares } = useBares();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (usuario?.tipo === 'empleado' || usuario?.tipo === 'admin') {
      cargarBares();
    }
  }, [usuario, cargarBares]);

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
            {usuario.tipo === 'admin' && (
              <div className="bar-selector-header">
                <label htmlFor="barSelect">Bar:</label>
                <select
                  id="barSelect"
                  value={barSeleccionado || ''}
                  onChange={(e) => setBarSeleccionado(parseInt(e.target.value))}
                >
                  <option value="">-- Selecciona un bar --</option>
                  {bares.map(bar => (
                    <option key={bar.id} value={bar.id}>{bar.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {usuario.tipo === 'admin' && barSeleccionado && (
              <Link 
                to={`/admin/bar/${barSeleccionado}/carta`}
                className="header-icon admin-carta-icon"
                title="Administrar Carta Digital"
              >
                <i className="fas fa-utensils"></i>
              </Link>
            )}

            {usuario?.tipo === 'admin' && (
              <Link to="/admin/home" className="header-link home-link">
                <i className="fas fa-home"></i>
              </Link>
            )}

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