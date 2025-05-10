import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link } from 'react-router-dom';
import logo from '../img/CamareroIcon.png';
import InfoModal from './InfoModal';
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario } = useUser();
  const { bares, cargarBares } = useBares();
  const { barSeleccionado, setBarSeleccionado } = useBar();

  useEffect(() => {
    if (usuario?.tipo === 'empleado' || usuario?.tipo === 'admin') {
      cargarBares();
    }
  }, [usuario, cargarBares]);

  const handleLogout = () => {
    setUsuario(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="header">
        {/* Sección Izquierda: Logo y Título */}
        <div className="header-section header-left">
          <Link to="/" className="logo-link">
            <div className="logo-container">
              <img src={logo} alt="Logo Camarero App" className="logo" />
              <h1>CAMARERO APP</h1>
            </div>
          </Link>
        </div>

        {/* Sección Central: Selector de Bar (solo para admin) */}
        <div className="header-section header-center">
          {usuario?.tipo === 'admin' && (
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
        </div>

        {/* Sección Derecha: Navegación */}
        <div className="header-section header-right">
          <nav className="nav">
            {!usuario && (
              <>
                <a href="/login-empleado" className="empleado-icon" title="Login empleado">
                  <i className="fas fa-sign-in-alt"></i>
                </a>
              </>
            )}

            {usuario?.tipo && (
              <>
                {usuario?.tipo === 'admin' && (
                  <Link to="/admin/home" className="header-link home-link" title="Inicio Admin">
                    <i className="fas fa-home"></i>
                  </Link>
                )}
      
                <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;