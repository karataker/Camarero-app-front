import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/adminNavigation.css';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const { barId } = useParams();

  // Orden de las vistas según aparecen en HomeEmpleado
  const adminViews = [
    { id: 'carta', nombre: 'Carta Digital', ruta: `/admin/bar/${barId}/carta`, icono: 'fa-utensils' },
    { id: 'reservas', nombre: 'Reservas', ruta: `/admin/bar/${barId}/reservas`, icono: 'fa-calendar-check' },
    { id: 'panel', nombre: 'Mapa de Mesas', ruta: `/admin/bar/${barId}/panel`, icono: 'fa-table' },
    { id: 'pedidos', nombre: 'Pedidos', ruta: `/admin/bar/${barId}/pedidos`, icono: 'fa-receipt' },
    { id: 'cocina', nombre: 'Cocina', ruta: `/admin/bar/${barId}/cocina`, icono: 'fa-spoon' },
    { id: 'inventario', nombre: 'Inventario', ruta: `/admin/bar/${barId}/inventario`, icono: 'fa-boxes' },
    { id: 'facturacion', nombre: 'Facturación', ruta: `/admin/bar/${barId}/facturacion`, icono: 'fa-file-invoice-dollar' },
    { id: 'compras', nombre: 'Compras', ruta: `/admin/bar/${barId}/compras`, icono: 'fa-shopping-cart' },
    { id: 'analiticas', nombre: 'Analíticas', ruta: `/admin/bar/${barId}/analiticas`, icono: 'fa-chart-line' },
    { id: 'usuarios', nombre: 'Usuarios', ruta: `/admin/bar/${barId}/usuarios`, icono: 'fa-users' }
  ];

  // Detectar la vista actual basándose en la URL
  const currentPath = window.location.pathname;
  const currentViewIndex = adminViews.findIndex(view => currentPath.includes(view.id));

  if (currentViewIndex === -1) return null; // No mostrar navegación si no estamos en una vista conocida

  const previousView = currentViewIndex > 0 ? adminViews[currentViewIndex - 1] : null;
  const nextView = currentViewIndex < adminViews.length - 1 ? adminViews[currentViewIndex + 1] : null;
  const currentView = adminViews[currentViewIndex];

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

        {/* Indicador central con texto */}
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

      {/* Indicadores de progreso (puntos) */}
      <div className="nav-indicators">
        {adminViews.map((view, index) => (
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