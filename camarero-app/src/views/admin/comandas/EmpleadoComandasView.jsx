import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/admin/comandas/empleadoComandasView.css'; 

// Asumiendo que tienes un servicio para obtener todas las mesas de un bar
// similar al que se usa en EmpleadoReservasView.jsx o EmpleadoMapaView.jsx
import { getComandasPorBar } from '../../../services/comandasService'; 
import { obtenerMesas } from '../../../services/barService'; // <--- AÑADIR IMPORTACIÓN

import { MdOutlinePendingActions, MdOutlineDeliveryDining, MdDoneAll } from 'react-icons/md';
import { GiCook } from 'react-icons/gi';
import Reloj from '../../../components/Reloj'; 

const EmpleadoComandasView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenHora, setOrdenHora] = useState('asc'); 
  const [filtroMesa, setFiltroMesa] = useState('todas'); 
  const [cargando, setCargando] = useState(true); // Carga de pedidos
  const [error, setError] = useState(null); // Error de pedidos

  // Nuevos estados para las mesas del bar
  const [todasLasMesas, setTodasLasMesas] = useState([]);
  const [cargandoMesas, setCargandoMesas] = useState(true);
  const [errorMesas, setErrorMesas] = useState(null);

  const estadosDisponibles = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'listo', label: 'Listos' },
    { key: 'entregado', label: 'Entregados' },
  ];

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    try {
      const fechaObj = new Date(fechaISO);
      return fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formateando fecha:", fechaISO, e);
      return fechaISO; 
    }
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!barId) {
        setError('No se ha especificado un bar.');
        setCargando(false);
        setCargandoMesas(false);
        setPedidos([]);
        setTodasLasMesas([]);
        return;
      }

      // Cargar pedidos
      try {
        setCargando(true);
        const comandasData = await getComandasPorBar(barId); 
        setPedidos(comandasData || []); 
      } catch (err) {
        setError('Error al cargar los pedidos desde el servicio');
        console.error("Error en getComandasPorBar:", err);
        setPedidos([]); 
      } finally {
        setCargando(false);
      }

      // Cargar todas las mesas del bar
      try {
        setCargandoMesas(true);
        setErrorMesas(null);
        const mesasData = await obtenerMesas(barId);
        setTodasLasMesas(mesasData || []);
      } catch (err) {
        console.error("Error cargando todas las mesas:", err);
        setErrorMesas("Error al cargar la configuración de mesas.");
        setTodasLasMesas([]);
      } finally {
        setCargandoMesas(false);
      }
    };
    
    cargarDatosIniciales();
  }, [barId]);

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      // TODO: Implementar llamada al servicio para actualizar estado en backend
      setPedidos(prevPedidos =>
        prevPedidos.map(pedido => {
          if (pedido.id !== pedidoId) return pedido;
          return { ...pedido, estado: nuevoEstado }; 
        })
      );
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
    }
  };

  if (cargando || cargandoMesas) { // Comprobar ambas cargas
    return <div className="pedidos-loading">Cargando datos...</div>;
  }

  if (error) { // Priorizar error de pedidos si existe
    return <div className="pedidos-error">{error}</div>;
  }
  // No es necesario un error global para errorMesas aquí, se manejará en la sección del filtro

  // const mesasUnicas = Array.from(new Set(pedidos.map(p => p.mesaCodigo))).sort(); // Ya no se usa para el filtro

  const pedidosFiltrados = pedidos
    .filter(pedido => {
      const estadoPedidoNormalizado = pedido.estado ? pedido.estado.toLowerCase() : '';
      // filtroMesa ahora se comparará con pedido.mesaCodigo
      return (filtroEstado === 'todos' || estadoPedidoNormalizado === filtroEstado) &&
             (filtroMesa === 'todas' || pedido.mesaCodigo === filtroMesa);
    })
    .sort((a, b) => {
      // ... (código de ordenación existente) ...
      const fechaA = a.fecha || ''; 
      const fechaB = b.fecha || ''; 
      if (ordenHora === 'asc') {
        return new Date(fechaA).getTime() - new Date(fechaB).getTime();
      } else {
        return new Date(fechaB).getTime() - new Date(fechaA).getTime();
      }
    });

  return (
    <div className="empleado-pedidos-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Pedidos</h1>
        <Reloj formato="HH:mm:ss" />
      </div>

      <div className="filtros-pedidos">
        {/* Filtro de Estado con Facetas */}
        <div className="filtro-grupo">
          <span className="filtro-label">Estado:</span>
          <div className="filtro-estado-facetas">
            {estadosDisponibles.map(estado => (
              <button
                key={estado.key}
                type="button"
                className={`boton-faceta-estado ${filtroEstado === estado.key ? 'activo' : ''}`}
                onClick={() => setFiltroEstado(estado.key)}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Mesa con Minimapa/Facetas */}
        {/* Movido antes de "Ordenar por" para que "Ordenar por" quede al final a la derecha */}
        <div className="filtro-grupo">
          <span className="filtro-label">Mesa:</span>
          {errorMesas && <p className="error-texto-filtro">{errorMesas}</p>}
          {!errorMesas && !cargandoMesas && (
            <div className="filtro-mesas-minimapa"> {/* Contenedor para el minimapa */}
              <button
                type="button"
                className={`mini-mesa-item ${filtroMesa === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroMesa('todas')}
              >
                Todas
              </button>
              {todasLasMesas.map(mesa => (
                <button
                  key={mesa.id || mesa.codigo} // Usar id si existe, sino codigo
                  type="button"
                  className={`mini-mesa-item ${filtroMesa === mesa.codigo ? 'activo' : ''}`}
                  onClick={() => setFiltroMesa(mesa.codigo)} // Filtrar por mesa.codigo
                  title={`Mesa ${mesa.codigo}${mesa.nombre ? ` (${mesa.nombre})` : ''}`}
                >
                  {mesa.codigo || mesa.nombre} {/* Mostrar código o nombre */}
                </button>
              ))}
              {todasLasMesas.length === 0 && <p className="info-texto-filtro">No hay mesas configuradas para este bar.</p>}
            </div>
          )}
        </div>
        
        {/* Filtro de Orden de Hora - Ahora con margen izquierdo automático */}
        <div className="filtro-grupo" style={{ marginLeft: 'auto' }}>
          <span className="filtro-label">Ordenar por:</span>
          <select
            value={ordenHora}
            onChange={e => setOrdenHora(e.target.value)}
            className="filtro-select" 
          >
            <option value="asc">Más antiguos primero</option>
            <option value="desc">Más recientes primero</option>
          </select>
        </div>
      </div>

      <div className="pedidos-grid">
        {pedidosFiltrados.map(pedido => {
          const estadoPedidoClase = pedido.estado ? pedido.estado.toLowerCase() : 'desconocido';
          
          // Buscar la información de la mesa actual
          const mesaDelPedido = todasLasMesas.find(m => m.codigo === pedido.mesaCodigo);
          
          // Determinar el texto final a mostrar para la mesa:
          // Si la mesa se encuentra en todasLasMesas y tiene un 'nombre' válido y no vacío, usar ese 'nombre'.
          // De lo contrario, construir el texto como "Mesa " seguido del código de la mesa del pedido.
          const nombreCompletoMesa = 
            (mesaDelPedido && mesaDelPedido.nombre && mesaDelPedido.nombre.trim() !== '') 
            ? mesaDelPedido.nombre 
            : `Mesa ${pedido.mesaCodigo}`;

          return (
            <div
              key={pedido.id} 
              className={`pedido-card estado-${estadoPedidoClase}`}
            >
              <div className="pedido-header">
                <div>
                  <h3 style={{ margin: 0, display: 'inline-block', verticalAlign: 'middle' }}>
                    {/* Mostrar el nombre completo y final de la mesa */}
                    {nombreCompletoMesa} 
                  </h3>
                  <div style={{ fontSize: '0.85em', color: '#888' }}>
                    Código Pedido: <b>{pedido.id}</b> 
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.95em' }}>
                  <div>
                    <span className="pedido-hora"><b>Pedido:</b> {formatFecha(pedido.fecha)}</span> 
                  </div>
                </div>
              </div>

              <div className="pedido-items">
                {pedido.items && pedido.items.map((item, index) => { 
                  const fases = [
                    { key: 'pendiente', label: 'Pendiente' },
                    { key: 'en_preparacion', label: 'En preparación' }, 
                    { key: 'listo', label: 'Listo' },
                    { key: 'entregado', label: 'Entregado' }
                  ];
                  const itemEstadoNormalizado = pedido.estado ? pedido.estado.toLowerCase() : '';
                  const faseActual = fases.findIndex(f => f.key === itemEstadoNormalizado);
                  
                  return (
                    <div key={item.id || `item-${pedido.id}-${index}`} className="pedido-item" style={{ alignItems: 'center' }}> 
                      <span className="item-cantidad">{item.cantidad}x</span> 
                      <span className="item-nombre">{item.nombre}</span> 
                      <div className="item-fases">
                        {fases.map((fase, i) => (
                          <span
                            key={fase.key}
                            className={
                              "item-fase fase-" + fase.key +
                              (i === faseActual ? " fase-activa" : "") +
                              (i < faseActual ? " fase-completada" : "")
                            }
                          >
                            {fase.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calcular importe total si no viene directamente */}
              {(() => {
                let importeCalculado = 0;
                let esCalculable = false;
                if (pedido.items && Array.isArray(pedido.items)) {
                  esCalculable = pedido.items.every(item => typeof item.cantidad === 'number' && typeof item.precio === 'number'); // Asegúrate que 'precio' sea el nombre correcto
                  if (esCalculable) {
                    importeCalculado = pedido.items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
                  }
                }
                // Prioriza pedido.importeTotal si existe, sino usa el calculado
                const importeFinal = typeof pedido.importeTotal === 'number' ? pedido.importeTotal : (esCalculable ? importeCalculado : null);

                return (
                  <div className="pedido-footer" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid #eee'
                  }}>
                    {importeFinal !== null ? (
                      <span className="pedido-importe-total">
                        <strong>Total:</strong> {importeFinal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    ) : (
                      <span className="pedido-importe-total">
                        <strong>Total:</strong> -
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmpleadoComandasView;