import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../img/CamareroApp.png';
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario } = useUser(); // Asumiendo que useUser ahora provee loadingUser si lo necesitas
  const { bares, cargarBares } = useBares();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Solo cargar bares si el usuario está definido y es ADMIN o CAMARERO
    if (usuario && (usuario.tipo === 'ADMIN' || usuario.tipo === 'CAMARERO')) {
      cargarBares();
    }
  }, [usuario, cargarBares]);

  const handleLogout = () => {
    setUsuario(null); // Esto ahora también debería limpiar localStorage a través de setUsuario en useUser.js
    // No es necesario localStorage.removeItem aquí si setUsuario(null) lo maneja
    window.location.href = '/'; // O navigate('/'); si prefieres usar el enrutador de React
  };

  const handleChangeBar = (e) => {
    const nuevoId = parseInt(e.target.value);
    setBarSeleccionado(nuevoId); // Esto debería persistir en BarProvider

    const currentPath = location.pathname;
    let nuevaRuta = currentPath;

    // Reemplazar el ID del bar en la URL si ya existe
    if (currentPath.includes('/admin/bar/')) {
      nuevaRuta = currentPath.replace(/\/admin\/bar\/\d+/, `/admin/bar/${nuevoId}`);
    } else if (currentPath.startsWith('/admin/') && nuevoId) {
      // Si estamos en una ruta admin general y se selecciona un bar,
      // podríamos querer redirigir a una vista específica del bar,
      // o simplemente actualizar la URL si la vista actual puede manejarlo.
      // Por ahora, solo actualizamos si el patrón /admin/bar/ID existe.
      // Si no, podrías querer navegar a una ruta por defecto del bar, ej:
      // navigate(`/admin/bar/${nuevoId}/home`);
      // Esto depende de la estructura de tus rutas.
    }
    
    if (nuevaRuta !== currentPath) {
      navigate(nuevaRuta, { replace: true });
    }
  };
  
  // La variable mostrarIconoHome no se usa para el icono de home del admin,
  // este se controla por usuario?.tipo === 'ADMIN'
  // const mostrarIconoHome = location.pathname === '/admin' || location.pathname === '/'; 

  // Si loadingUser es true desde useUser, podrías mostrar un loader aquí
  // if (loadingUser) return <header className="header"><div>Cargando...</div></header>;

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
          {usuario?.tipo === 'ADMIN' && (
            <div className="bar-selector-header">
              <label htmlFor="barSelect">Bar:</label>
              <select
                id="barSelect"
                value={barSeleccionado || ''}
                onChange={handleChangeBar}
                disabled={!bares.length} // Deshabilitar si no hay bares cargados
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
              <a href="/login-empleado" className="empleado-icon" title="Login empleado">
                <i className="fas fa-sign-in-alt"></i>
              </a>
            )}

            {usuario?.tipo && (
              <>
                {usuario?.tipo === 'ADMIN' && (
                  <Link to="/admin/home" className="header-link home-link" title="Inicio Admin">
                    <i className="fas fa-home"></i>
                  </Link>
                )}
                {/* Podrías añadir un icono de home para CAMARERO si es diferente */}
                {/* {usuario?.tipo === 'CAMARERO' && (
                  <Link to="/empleado/home" className="header-link home-link" title="Inicio Empleado">
                    <i className="fas fa-home"></i>
                  </Link>
                )} */}

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
