import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/admin/cocina/empleadoCocinaView.css'; 

import { getComandasPorBar, actualizarEstadoItem } from '../../../services/comandaService';
import { obtenerMesas } from '../../../services/barService';
import AdminNavigation from '../../../components/AdminNavigation'; // <-- AÑADIR IMPORT

import { MdOutlinePendingActions, MdOutlineDeliveryDining, MdDoneAll } from 'react-icons/md';
import { GiCook } from 'react-icons/gi';
import Reloj from '../../../components/Reloj'; 

const EmpleadoCocinaView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState(['todos']);
  const [ordenHora, setOrdenHora] = useState('asc'); 
  const [filtroMesa, setFiltroMesa] = useState('todas'); 
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
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

  // Función para manejar cambios en los checkboxes de estado
  const handleToggleEstado = (estadoKey) => {
    if (estadoKey === 'todos') {
      // Si selecciona "Todos", deseleccionar todos los demás
      setFiltroEstado(['todos']);
    } else {
      setFiltroEstado(prevEstados => {
        // Quitar "todos" si está seleccionado
        const sinTodos = prevEstados.filter(e => e !== 'todos');
        
        if (sinTodos.includes(estadoKey)) {
          // Si ya está seleccionado, deseleccionarlo
          const nuevosEstados = sinTodos.filter(e => e !== estadoKey);
          // Si no queda ninguno seleccionado, seleccionar "todos"
          return nuevosEstados.length === 0 ? ['todos'] : nuevosEstados;
        } else {
          // Si no está seleccionado, agregarlo
          return [...sinTodos, estadoKey];
        }
      });
    }
  };

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

  const handleCambiarEstadoItem = async (pedidoId, itemId, nuevoEstado) => {
    try {
      const itemActualizado = await actualizarEstadoItem(itemId, nuevoEstado);

      setPedidos(prevPedidos =>
        prevPedidos.map(pedido => {
          if (pedido.id !== pedidoId) return pedido;

          const nuevosItems = pedido.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, estado: itemActualizado.estado };
          });

          return { ...pedido, items: nuevosItems };
        })
      );
    } catch (err) {
      console.error('Error al actualizar el estado del ítem:', err);
    }
  };

  // Función para calcular el estado general de la comanda
  const calcularEstadoComanda = (items) => {
    if (!items || items.length === 0) return 'pendiente';
    
    const estados = items.map(item => item.estado ? item.estado.toLowerCase() : 'pendiente');
    
    // Si todos están entregados
    if (estados.every(estado => estado === 'entregado')) {
      return 'entregado';
    }
    
    // Si todos están listos o entregados
    if (estados.every(estado => estado === 'listo' || estado === 'entregado')) {
      return 'listo';
    }
    
    // Si hay alguno en preparación
    if (estados.some(estado => estado === 'en_preparacion')) {
      return 'en_preparacion';
    }
    
    // Por defecto, pendiente
    return 'pendiente';
  };

  // Función para obtener el texto del estado
  const obtenerTextoEstado = (estado) => {
    const estadosTexto = {
      'pendiente': 'Pendiente',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo',
      'entregado': 'Entregado'
    };
    return estadosTexto[estado] || 'Desconocido';
  };

  if (cargando || cargandoMesas) {
    return <div className="pedidos-loading">Cargando datos...</div>;
  }

  if (error) {
    return <div className="pedidos-error">{error}</div>;
  }

  const pedidosFiltrados = pedidos
    .filter(pedido => {
      // Calcular el estado de la comanda para cada pedido
      const estadoComandaCalculado = calcularEstadoComanda(pedido.items);
      
      // Filtrar por estado calculado de la comanda (múltiples estados)
      const cumpleFiltroEstado = filtroEstado.includes('todos') || filtroEstado.includes(estadoComandaCalculado);
      
      // Filtrar por mesa
      const cumpleFiltroMesa = filtroMesa === 'todas' || pedido.mesaCodigo === filtroMesa;
      
      return cumpleFiltroEstado && cumpleFiltroMesa;
    })
    .sort((a, b) => {
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
      {/* Añadir navegación de admin */}
      <AdminNavigation />
      
      <div className="empleado-pedidos-header">
        <h1>Gestión de Comandas</h1>
        <Reloj formato="HH:mm:ss" />
      </div>

      <div className="filtros-pedidos">
        {/* Filtro de Estado con Checkboxes */}
        <div className="filtro-grupo">
          <span className="filtro-label">Estado:</span>
          <div className="filtro-estado-checkboxes">
            {estadosDisponibles.map(estado => (
              <label key={estado.key} className="checkbox-estado-item">
                <input
                  type="checkbox"
                  checked={filtroEstado.includes(estado.key)}
                  onChange={() => handleToggleEstado(estado.key)}
                  className="checkbox-estado-input"
                />
                <span className="checkbox-estado-label">{estado.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filtro-grupo">
          <span className="filtro-label">Mesa:</span>
          {errorMesas && <p className="error-texto-filtro">{errorMesas}</p>}
          {!errorMesas && !cargandoMesas && (
            <div className="filtro-mesas-minimapa">
              <button
                type="button"
                className={`mini-mesa-item ${filtroMesa === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroMesa('todas')}
              >
                Todas
              </button>
              {todasLasMesas.map(mesa => (
                <button
                  key={mesa.id || mesa.codigo}
                  type="button"
                  className={`mini-mesa-item ${filtroMesa === mesa.codigo ? 'activo' : ''}`}
                  onClick={() => setFiltroMesa(mesa.codigo)}
                  title={`Mesa ${mesa.codigo}${mesa.nombre ? ` (${mesa.nombre})` : ''}`}
                >
                  {mesa.codigo || mesa.nombre}
                </button>
              ))}
              {todasLasMesas.length === 0 && <p className="info-texto-filtro">No hay mesas configuradas para este bar.</p>}
            </div>
          )}
        </div>
        
        <div className="filtro-grupo filtro-grupo-auto">
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
          const estadoComandaCalculado = calcularEstadoComanda(pedido.items);
          const estadoPedidoClase = estadoComandaCalculado;
          
          const mesaDelPedido = todasLasMesas.find(m => m.codigo === pedido.mesaCodigo);
          
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
                  <h3>{nombreCompletoMesa}</h3>
                  <div className="pedido-codigo">
                    Código Comanda: <b>{pedido.id}</b>
                  </div>
                  <div className="estado-comanda">
                    <span className={`estado-badge estado-${estadoComandaCalculado}`}>
                      {obtenerTextoEstado(estadoComandaCalculado)}
                    </span>
                  </div>
                </div>
                <div className="pedido-hora-container">
                  <span className="pedido-hora">
                    <b>Hora Comanda:</b> {formatFecha(pedido.fecha)}
                  </span>
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

                  const itemEstadoNormalizado = item.estado ? item.estado.toLowerCase() : 'pendiente';
                  const faseActualIndex = fases.findIndex(f => f.key === itemEstadoNormalizado);
                  
                  return (
                    <div key={item.id || `item-${pedido.id}-${index}`} className="pedido-item"> 
                      <div className="item-info">
                        <span className="item-cantidad">{item.cantidad}x</span> 
                        <span className="item-nombre">{item.nombre}</span> 
                      </div>
                      
                      <div className="item-fases-container">
                        <div className="item-fases-buttons">
                          {fases.map((fase, i) => (
                            <button
                              key={fase.key}
                              title={`Marcar como ${fase.label}`}
                              className={
                                "item-fase-btn " +
                                (i === faseActualIndex ? "fase-activa" : "") +
                                (i < faseActualIndex ? "fase-completada" : "")
                              }
                              disabled={i <= faseActualIndex}
                              onClick={() => handleCambiarEstadoItem(pedido.id, item.id, fase.key)}
                            >
                              {fase.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmpleadoCocinaView;