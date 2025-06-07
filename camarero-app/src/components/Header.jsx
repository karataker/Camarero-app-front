import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../img/CamareroApp.png';
// import InfoModal from './InfoModal'; // Comentado ya que no se usa
import '../styles/header.css';

const Header = () => {
  const { usuario, setUsuario, loadingUser } = useUser();
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
    // setBarSeleccionado(null); // Opcional: resetear bar al hacer logout
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
        if (currentPath === '/admin/home') {
             nuevaRuta = `/admin/bar/${nuevoId}/panel`; 
        }
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
  
  // Rutas o patrones de rutas públicas donde no se deben mostrar los elementos específicos de admin
  const patronesRutasPublicasSinElementosAdmin = [
    '/', // HomeCliente
    '/reservar', // ReservaCliente
    '/escanear', // EscanearQR
    '/cliente/' // Cualquier ruta que comience con /cliente/ (como ClienteCartaView, ClienteComandas)
  ];

  const ocultarElementosAdmin = patronesRutasPublicasSinElementosAdmin.some(patron => 
    location.pathname === patron || (patron.endsWith('/') && location.pathname.startsWith(patron))
  );

  if (loadingUser && !ocultarElementosAdmin) { 
     return <header className="header"><div>Cargando...</div></header>;
  }

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
          {/* Mostrar selector de bar solo si es Admin y NO está en una ruta pública designada */}
          {esAdmin && !ocultarElementosAdmin && (
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
                {/* Mostrar icono de home admin solo si es Admin y NO está en una ruta pública designada */}
                {esAdmin && !ocultarElementosAdmin && (
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
