import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/adminNavigation.css';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const { barId } = useParams();
  const { usuario } = useUser();
  const rol = usuario?.tipo;

  const adminViews = [
    { id: 'carta', nombre: 'Carta Digital', ruta: `/admin/bar/${barId}/carta`, icono: 'fa-utensils', roles: ['CAMARERO', 'COCINERO', 'ADMIN'] },
    { id: 'reservas', nombre: 'Reservas', ruta: `/admin/bar/${barId}/reservas`, icono: 'fa-calendar-check', roles: ['CAMARERO', 'ADMIN'] },
    { id: 'panel', nombre: 'Mapa de Mesas', ruta: `/admin/bar/${barId}/panel`, icono: 'fa-table', roles: ['CAMARERO', 'COCINERO', 'ADMIN'] },
    { id: 'pedidos', nombre: 'Pedidos', ruta: `/admin/bar/${barId}/pedidos`, icono: 'fa-receipt', roles: ['CAMARERO', 'ADMIN'] },
    { id: 'cocina', nombre: 'Cocina', ruta: `/admin/bar/${barId}/cocina`, icono: 'fa-spoon', roles: ['COCINERO', 'ADMIN'] },
    { id: 'inventario', nombre: 'Inventario', ruta: `/admin/bar/${barId}/inventario`, icono: 'fa-boxes', roles: ['COCINERO', 'ADMIN'] },
    { id: 'facturacion', nombre: 'Facturación', ruta: `/admin/bar/${barId}/facturacion`, icono: 'fa-file-invoice-dollar', roles: ['ADMIN'] },
    { id: 'compras', nombre: 'Compras', ruta: `/admin/bar/${barId}/compras`, icono: 'fa-shopping-cart', roles: ['ADMIN'] },
    { id: 'analiticas', nombre: 'Analíticas', ruta: `/admin/bar/${barId}/analiticas`, icono: 'fa-chart-line', roles: ['ADMIN'] },
    { id: 'usuarios', nombre: 'Usuarios', ruta: `/admin/bar/${barId}/usuarios`, icono: 'fa-users', roles: ['ADMIN'] }
  ];

  const viewsDisponibles = adminViews.filter(view => view.roles.includes(rol));
  const currentPath = window.location.pathname;
  const currentViewIndex = viewsDisponibles.findIndex(view => currentPath.includes(view.id));

  if (currentViewIndex === -1) return null;

  const previousView = currentViewIndex > 0 ? viewsDisponibles[currentViewIndex - 1] : null;
  const nextView = currentViewIndex < viewsDisponibles.length - 1 ? viewsDisponibles[currentViewIndex + 1] : null;
  const currentView = viewsDisponibles[currentViewIndex];

  const handleNavigation = (ruta) => {
    if (!barId) {
      alert('Error: Bar no seleccionado');
      return;
    }
    navigate(ruta);
  };

  return (
    <div className="admin-navigation">
      <div className="admin-nav-container">
        {/* Botón anterior */}
        <div className="nav-button-container">
          {previousView ? (
            <button 
              className="nav-button nav-previous"
              onClick={() => handleNavigation(previousView.ruta)}
              title={`Anterior: ${previousView.nombre}`}
            >
              <i className="fas fa-chevron-left"></i>
              <span className="nav-text">
                <i className={`fas ${previousView.icono}`}></i>
                {previousView.nombre}
              </span>
            </button>
          ) : (
            <div className="nav-placeholder"></div>
          )}
        </div>

        {/* Vista actual */}
        <div className="nav-current-text">
          <span className="current-view-name">{currentView.nombre}</span>
        </div>

        {/* Botón siguiente */}
        <div className="nav-button-container">
          {nextView ? (
            <button 
              className="nav-button nav-next"
              onClick={() => handleNavigation(nextView.ruta)}
              title={`Siguiente: ${nextView.nombre}`}
            >
              <span className="nav-text">
                <i className={`fas ${nextView.icono}`}></i>
                {nextView.nombre}
              </span>
              <i className="fas fa-chevron-right"></i>
            </button>
          ) : (
            <div className="nav-placeholder"></div>
          )}
        </div>
      </div>

      {/* Puntos indicadores */}
      <div className="nav-indicators">
        {viewsDisponibles.map((view, index) => (
          <button
            key={view.id}
            className={`nav-indicator ${index === currentViewIndex ? 'active' : ''}`}
            onClick={() => handleNavigation(view.ruta)}
            title={view.nombre}
          >
            <i className={`fas ${view.icono}`}></i>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminNavigation;
