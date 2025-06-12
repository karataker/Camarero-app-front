import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BellDropdown from './BellDropdown';
import logo from '../img/CamareroApp.png';
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario, loadingUser } = useUser();
  const { bares, cargarBares } = useBares();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (usuario && (usuario.tipo === 'ADMIN' || usuario.tipo === 'CAMARERO') && location.pathname.startsWith('/admin/')) {
      cargarBares();
    }
  }, [usuario, cargarBares, location.pathname]);

  const handleLogout = () => {
    setUsuario(null);
    setBarSeleccionado(null);
    navigate('/');
  };

  const handleChangeBar = (e) => {
    const nuevoId = e.target.value ? parseInt(e.target.value) : null;
    setBarSeleccionado(nuevoId);

    const currentPath = location.pathname;
    let nuevaRuta = currentPath;

    if (nuevoId) {
      if (currentPath.includes('/admin/bar/')) {
        nuevaRuta = currentPath.replace(/\/admin\/bar\/\d+/, `/admin/bar/${nuevoId}`);
      } else if (currentPath === '/admin/home') {
        nuevaRuta = `/admin/bar/${nuevoId}/panel`;
      }
    } else {
      if (currentPath.includes('/admin/bar/')) {
        nuevaRuta = '/admin/home';
      }
    }

    if (nuevaRuta !== currentPath && nuevaRuta) {
      navigate(nuevaRuta, { replace: true });
    }
  };

  const esRutaAdmin = location.pathname.startsWith('/admin/');
  const mostrarComponentesAdmin = usuario?.tipo === 'ADMIN' && esRutaAdmin;

  if (loadingUser && esRutaAdmin) {
    return <header className="header"><div>Cargando...</div></header>;
  }

  return (
    <header className="header">
      <div className="header-section header-left">
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <img src={logo} alt="Logo Camarero App" className="logo" />
            <h1>CAMARERO APP</h1>
          </div>
        </Link>
      </div>

      <div className="header-section header-center">
        {mostrarComponentesAdmin && (
          <div className="bar-selector-header">
            <label htmlFor="barSelect">Bar:</label>
            <select
              id="barSelect"
              value={barSeleccionado || ''}
              onChange={handleChangeBar}
              disabled={!bares.length}
            >
              <option value="">-- Selecciona un bar --</option>
              {bares.map(bar => (
                <option key={bar.id} value={bar.id}>{bar.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="header-section header-right">
        <nav className="nav">
          {!usuario && location.pathname !== '/login-empleado' && (
            <Link to="/login-empleado" className="empleado-icon" title="Login empleado">
              <i className="fas fa-sign-in-alt"></i>
            </Link>
          )}

          {usuario?.tipo && (
            <>
              {mostrarComponentesAdmin && barSeleccionado && (
                <BellDropdown barId={barSeleccionado} />
              )}

              {mostrarComponentesAdmin && (
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
  );
};

export default Header;
