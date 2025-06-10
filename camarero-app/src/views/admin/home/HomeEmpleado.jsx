import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBar } from '../../../context/BarContext';
import { useBares } from '../../../hooks/useBares';
import { getNotificacionesPorTipoYBar } from '../../../services/notificacionService';
import '../../../styles/admin/home/homeEmpleado.css';

const HomeEmpleado = () => {
  const navigate = useNavigate();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const { bares, cargarBares } = useBares();
  const [noLeidasCocina, setNoLeidasCocina] = useState(0);
  const intervaloRef = useRef(null);

  useEffect(() => {
    cargarBares();
  }, [cargarBares]);

  useEffect(() => {
    if (bares && bares.length > 0 && !barSeleccionado) {
      setBarSeleccionado(bares[0].id);
    }
  }, [bares, barSeleccionado, setBarSeleccionado]);

  // Obtener solo notificaciones tipo "pedido" → van a cocina
  useEffect(() => {
    const cargarNotificacionesCocina = async () => {
      if (!barSeleccionado) return;
      try {
        const todas = await getNotificacionesPorTipoYBar('pedido', barSeleccionado);
        const sinLeer = todas.filter(n => !n.leida).length;
        setNoLeidasCocina(sinLeer);
      } catch (err) {
        console.error('Error al cargar notificaciones de cocina:', err);
      }
    };

    cargarNotificacionesCocina();
    clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(cargarNotificacionesCocina, 60000); // cada 60s

    return () => clearInterval(intervaloRef.current);
  }, [barSeleccionado]);

  const opciones = [
    {
      id: 'carta',
      nombre: 'Carta Digital',
      icono: 'fa-utensils',
      ruta: `/admin/bar/${barSeleccionado}/carta`,
      color: '#2EAD63',
    },
    {
      id: 'reservas',
      nombre: 'Reservas',
      icono: 'fa-calendar-check',
      ruta: `/admin/bar/${barSeleccionado}/reservas`,
      color: '#e67e22',
    },
    {
      id: 'mesas',
      nombre: 'Mapa de Mesas',
      icono: 'fa-table',
      ruta: `/admin/bar/${barSeleccionado}/panel`,
      color: '#3498db',
    },
    {
      id: 'pedidos',
      nombre: 'Comandas',
      icono: 'fa-receipt',
      ruta: `/admin/bar/${barSeleccionado}/pedidos`,
      color: '#e84393',
    },
    {
      id: 'cocina',
      nombre: 'Cocina y Barra',
      icono: 'fa-spoon',
      ruta: `/admin/bar/${barSeleccionado}/cocina`,
      color: '#FF6B6B',
      mostrarNotificacion: true
    },
    {
      id: 'inventario',
      nombre: 'Inventario',
      icono: 'fa-boxes',
      ruta: `/admin/bar/${barSeleccionado}/inventario`,
      color: '#f39c12',
    },
    {
      id: 'facturacion',
      nombre: 'Facturación',
      icono: 'fa-file-invoice-dollar',
      ruta: `/admin/bar/${barSeleccionado}/facturacion`,
      color: '#1abc9c',
    },
    {
      id: 'compras',
      nombre: 'Compras',
      icono: 'fa-shopping-cart',
      ruta: `/admin/bar/${barSeleccionado}/compras`,
      color: '#16a085',
    },
    {
      id: 'analiticas',
      nombre: 'Analíticas',
      icono: 'fa-chart-line',
      ruta: `/admin/bar/${barSeleccionado}/analiticas`,
      color: '#9b59b6',
    },
    {
      id: 'usuarios',
      nombre: 'Usuarios',
      icono: 'fa-users',
      ruta: `/admin/bar/${barSeleccionado}/usuarios`,
      color: '#e74c3c',
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
    if (!barSeleccionado && !ruta.includes('/admin/panel') && !ruta.includes('/admin/home')) {
      alert('Por favor, selecciona un bar primero');
      return;
    }
    if (ruta.includes(`/${null}/`) || ruta.includes(`/${undefined}/`)) {
      alert('Por favor, espera a que se seleccione un bar o selecciona uno manualmente.');
      return;
    }
    navigate(ruta);
  };

  return (
    <div className="home-empleado-container">
      <h1>Panel de Administración</h1>
      <p className="empleado-subtitle">Selecciona una opción para gestionar tu negocio</p>
      
      <div className="opciones-empleado-grid">
        {opciones.map(opcion => {
          const rutaDinamica = barSeleccionado
            ? `/admin/bar/${barSeleccionado}/${opcion.id === 'mesas' ? 'panel' : opcion.id}`
            : opcion.ruta;

          const notiCount = opcion.mostrarNotificacion ? noLeidasCocina : 0;

          return (
            <div
              key={opcion.id}
              className="opcion-empleado"
              onClick={() => handleNavigation(rutaDinamica)}
              style={{ backgroundColor: opcion.color }}
            >
              {notiCount > 0 && (
                <span className="notification-badge-homeempleado">
                  {notiCount > 99 ? '99+' : notiCount}
                </span>
              )}
              <div className="opcion-icono">
                <i className={`fas ${opcion.icono}`}></i>
              </div>
              <p>{opcion.nombre}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeEmpleado;
