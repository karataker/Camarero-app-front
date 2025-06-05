import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../img/CamareroApp.png';
// import InfoModal from './InfoModal'; // Comentado ya que no se usa
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario, loadingUser } = useUser(); // Asumiendo que useUser ahora provee loadingUser
  const { bares, cargarBares } = useBares();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (usuario && (usuario.tipo === 'ADMIN' || usuario.tipo === 'CAMARERO')) {
      cargarBares();
    }
  }, [usuario, cargarBares]);

  const handleLogout = () => {
    setUsuario(null);
    // setBarSeleccionado(null); // También resetea el bar seleccionado si es necesario
    // localStorage.removeItem('barSeleccionado'); // Si lo persistes manualmente y no desde el context
    window.location.href = '/';
  };

  const handleChangeBar = (e) => {
    const nuevoId = e.target.value ? parseInt(e.target.value) : null;
    setBarSeleccionado(nuevoId);

    const currentPath = location.pathname;
    let nuevaRuta = currentPath;

    if (nuevoId) {
      if (currentPath.includes('/admin/bar/')) {
        nuevaRuta = currentPath.replace(/\/admin\/bar\/\d+/, `/admin\/bar\/${nuevoId}`);
      } else if (currentPath.startsWith('/admin/')) {
        // Si estamos en una ruta admin general (ej /admin/home) y se selecciona un bar,
        // redirigimos a la home de ese bar.
        // O podrías querer mantener la subruta actual si es genérica (ej /admin/usuarios)
        // y solo añadir el barId si la ruta lo soporta.
        // Por ahora, si estamos en /admin/home y seleccionamos bar, vamos a /admin/bar/ID/home (o panel)
        // Esto requiere que tus rutas /admin/bar/:barId/... estén definidas.
        // Si la ruta actual NO es /admin/home, y es otra ruta admin que no incluye /bar/ID,
        // podríamos decidir no cambiar la ruta o redirigir a una vista por defecto del bar.
        // Ejemplo: si estamos en /admin/home, redirigir a /admin/bar/ID_NUEVO/home (o panel)
        if (currentPath === '/admin/home') {
             nuevaRuta = `/admin/bar/${nuevoId}/panel`; // O a la vista por defecto del bar
        } else {
            // Para otras rutas admin que no son /admin/bar/:barId/*,
            // podrías decidir no cambiar la URL o navegar a una ruta por defecto del bar.
            // Por simplicidad, si no es /admin/bar/ y no es /admin/home, no cambiamos la ruta aquí.
        }
      }
    } else {
        // Si se deselecciona el bar (se elige "-- Selecciona un bar --")
        // y estamos en una ruta específica de bar, redirigir a /admin/home
        if (currentPath.includes('/admin/bar/')) {
            nuevaRuta = '/admin/home';
        }
    }
    
    if (nuevaRuta !== currentPath) {
      navigate(nuevaRuta, { replace: true });
    }
  };
  
  // Si loadingUser es true desde useUser, podrías mostrar un loader aquí
  // o un header simplificado.
  if (loadingUser && location.pathname !== '/') { // No mostrar loader en la home pública mientras carga
     return <header className="header"><div>Cargando...</div></header>;
  }

  const esHomeCliente = location.pathname === '/';
  const esAdmin = usuario?.tipo === 'ADMIN';

  return (
    <>
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
          {/* Mostrar selector de bar solo si es Admin y NO está en HomeCliente */}
          {esAdmin && !esHomeCliente && (
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
            {!usuario && (
              <Link to="/login-empleado" className="empleado-icon" title="Login empleado">
                <i className="fas fa-sign-in-alt"></i>
              </Link>
            )}

            {usuario?.tipo && (
              <>
                {/* Mostrar icono de home admin solo si es Admin y NO está en HomeCliente */}
                {esAdmin && !esHomeCliente && (
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
