import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBar } from '../context/BarContext';
import '../styles/homeAdmin.css';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const { barSeleccionado } = useBar();

  const opciones = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: 'fa-tachometer-alt',
      ruta: `/admin/bar/${barSeleccionado}/dashboard`,
      color: '#2c3e50'
    },
    {
      id: 'carta',
      nombre: 'Carta Digital',
      icono: 'fa-utensils',
      ruta: `/admin/bar/${barSeleccionado}/carta`,
      color: '#2EAD63'
    },
    {
      id: 'reservas',
      nombre: 'Reservas',
      icono: 'fa-calendar-check',
      ruta: `/admin/bar/${barSeleccionado}/reservas`,
      color: '#e67e22'
    },
    {
      id: 'mesas',
      nombre: 'Mapa de Mesas',
      icono: 'fa-table',
      ruta: `/admin/bar/${barSeleccionado}/panel`,
      color: '#3498db'
    },
    {
      id: 'pedidos',
      nombre: 'Pedidos',
      icono: 'fa-receipt',
      ruta: `/admin/bar/${barSeleccionado}/pedidos`,
      color: '#e84393'
    },
    {
      id: 'inventario',
      nombre: 'Inventario',
      icono: 'fa-boxes',
      ruta: `/admin/bar/${barSeleccionado}/inventario`,
      color: '#f39c12'
    },
    {
      id: 'facturacion',
      nombre: 'Facturación',
      icono: 'fa-file-invoice-dollar',
      ruta: `/admin/bar/${barSeleccionado}/facturacion`,
      color: '#1abc9c'
    },
    {
      id: 'compras',
      nombre: 'Compras',
      icono: 'fa-shopping-cart',
      ruta: `/admin/bar/${barSeleccionado}/compras`,
      color: '#16a085'
    },
    {
      id: 'analiticas',
      nombre: 'Analíticas',
      icono: 'fa-chart-line',
      ruta: `/admin/bar/${barSeleccionado}/analiticas`,
      color: '#9b59b6'
    },
    {
      id: 'usuarios',
      nombre: 'Usuarios',
      icono: 'fa-users',
      ruta: `/admin/bar/${barSeleccionado}/usuarios`,
      color: '#e74c3c'
    },
    {
      id: 'configuracion',
      nombre: 'Configuración',
      icono: 'fa-cog',
      ruta: `/admin/bar/${barSeleccionado}/configuracion`,
      color: '#34495e'
    }
  ];

  const handleNavigation = (ruta) => {
    if (!barSeleccionado) {
      alert('Por favor, selecciona un bar primero');
      return;
    }
    
    // Special case for panel route since it doesn't need barId in the URL
    if (ruta === '/admin/panel') {
      navigate(ruta);
      return;
    }

    // For all other routes that need barId
    const path = typeof ruta === 'function' ? ruta() : ruta;
    navigate(path);
  };

  return (
    <div className="home-admin-container">
      <h1>Panel de Administración</h1>
      <p className="admin-subtitle">Selecciona una opción para gestionar tu negocio</p>
      
      <div className="opciones-admin-grid">
        {opciones.map(opcion => (
          <div 
            key={opcion.id} 
            className="opcion-admin" 
            onClick={() => handleNavigation(opcion.ruta)}
            style={{ backgroundColor: opcion.color }}
          >
            <div className="opcion-icono">
              <i className={`fas ${opcion.icono}`}></i>
            </div>
            <p>{opcion.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeAdmin;