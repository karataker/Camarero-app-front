import React, { useEffect } from 'react'; // Importar useEffect
import { useNavigate } from 'react-router-dom';
import { useBar } from '../../../context/BarContext'; 
import { useBares } from '../../../hooks/useBares'; // Importar useBares
import { getMockNotificationCount } from '../../../mocks/notificationMocks';
import '../../../styles/admin/home/homeEmpleado.css'; 

const HomeEmpleado = () => { 
  const navigate = useNavigate();
  const { barSeleccionado, setBarSeleccionado } = useBar();
  const { bares, cargarBares } = useBares(); // Obtener bares y la función para cargarlos

  // Cargar bares cuando el componente se monta.
  // El Header también podría hacerlo, pero esto asegura que estén disponibles aquí.
  useEffect(() => {
    cargarBares();
  }, [cargarBares]);

  // Efecto para seleccionar el primer bar por defecto si no hay ninguno seleccionado
  useEffect(() => {
    if (bares && bares.length > 0 && !barSeleccionado) {
      setBarSeleccionado(bares[0].id);
    }
  }, [bares, barSeleccionado, setBarSeleccionado]);

  // Mantén tus opciones actuales o modifícalas según sea necesario
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
      tipoNotificacion: 'nueva_reserva' 
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
      tipoNotificacion: 'nuevo_pedido' 
    },
    {
      id: 'cocina',
      nombre: 'Cocina y Barra',
      icono: 'fa-spoon',
      ruta: `/admin/bar/${barSeleccionado}/cocina`,
      color: '#FF6B6B',
      tipoNotificacion: 'pedido_listo_cocina' 
    },
    {
      id: 'inventario',
      nombre: 'Inventario',
      icono: 'fa-boxes',
      ruta: `/admin/bar/${barSeleccionado}/inventario`,
      color: '#f39c12',
      tipoNotificacion: 'bajo_stock' 
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

  // Resto de funciones sin cambios
  const getNotificationCountForOption = (tipoNotificacionOpcion) => {
    if (!tipoNotificacionOpcion) return 0;
    return getMockNotificationCount(tipoNotificacionOpcion);
  };

  const handleNavigation = (ruta) => {
    if (!barSeleccionado && !ruta.includes('/admin/panel') && !ruta.includes('/admin/home')) {
      alert('Por favor, selecciona un bar primero');
      return;
    }
    // Si barSeleccionado es null/undefined, las rutas en `opciones` podrían ser como `/admin/bar/null/carta`.
    // Aseguramos que la ruta sea válida antes de navegar si depende de barSeleccionado.
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
          const notificationCount = getNotificationCountForOption(opcion.tipoNotificacion);
          // Construir la ruta dinámicamente aquí también para asegurar que siempre esté actualizada
          const rutaDinamica = barSeleccionado ? `/admin/bar/${barSeleccionado}/${opcion.id === 'mesas' ? 'panel' : opcion.id}` : opcion.ruta;


          return (
            <div 
              key={opcion.id} 
              className="opcion-empleado" 
              onClick={() => handleNavigation(rutaDinamica)}
              style={{ backgroundColor: opcion.color }}
            >
              {notificationCount > 0 && (
                <span className="notification-badge-homeempleado">
                  {notificationCount > 99 ? '99+' : notificationCount}
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