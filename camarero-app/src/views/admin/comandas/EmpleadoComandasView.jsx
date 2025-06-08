import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/admin/comandas/empleadoComandasView.css'; 

import { getComandasPorBar } from '../../../services/comandasService'; 

import { MdOutlinePendingActions, MdOutlineDeliveryDining, MdDoneAll } from 'react-icons/md';
import { GiCook } from 'react-icons/gi';
import Reloj from '../../../components/Reloj'; 

const EmpleadoComandasView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'pendiente', 'en_preparacion', 'listo', 'entregado'
  const [ordenHora, setOrdenHora] = useState('asc'); 
  const [filtroMesa, setFiltroMesa] = useState('todas'); 
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
    const cargarPedidos = async () => {
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
    };

    if (barId) {
        cargarPedidos();
    } else {
        setError('No se ha especificado un bar.');
        setCargando(false);
        setPedidos([]);
    }
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

  if (cargando) {
    return <div className="pedidos-loading">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="pedidos-error">{error}</div>;
  }

  const mesasUnicas = Array.from(new Set(pedidos.map(p => p.mesaCodigo))).sort();

  const pedidosFiltrados = pedidos
    .filter(pedido => {
      const estadoPedidoNormalizado = pedido.estado ? pedido.estado.toLowerCase() : '';
      return (filtroEstado === 'todos' || estadoPedidoNormalizado === filtroEstado) &&
             (filtroMesa === 'todas' || pedido.mesaCodigo === filtroMesa);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Pedidos</h1>
        <Reloj formato="HH:mm:ss" />
      </div>

      <div className="filtros-pedidos" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-estado"
        >
          <option value="todos">Todos los pedidos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_preparacion">En preparación</option>
          <option value="listo">Listos</option>
          <option value="entregado">Entregados</option>
        </select>
        <select
          value={ordenHora}
          onChange={e => setOrdenHora(e.target.value)}
          className="filtro-orden-hora"
        >
          <option value="asc">Más antiguos primero</option>
          <option value="desc">Más recientes primero</option>
        </select>
        <select
          value={filtroMesa}
          onChange={e => setFiltroMesa(e.target.value)}
          className="filtro-mesa"
        >
          <option value="todas">Todas las mesas</option>
          {mesasUnicas.map(mesa => (
            <option key={mesa} value={mesa}>{mesa}</option>
          ))}
        </select>
      </div>

      <div className="pedidos-grid">
        {pedidosFiltrados.map(pedido => {
          const estadoPedidoClase = pedido.estado ? pedido.estado.toLowerCase() : 'desconocido';
          const esAbierto = estadoPedidoClase !== 'entregado' && estadoPedidoClase !== 'cancelado'; 
          const esCerrado = estadoPedidoClase === 'entregado'; 

          return (
            <div
              key={pedido.id} 
              className={`pedido-card estado-${estadoPedidoClase} ${esAbierto ? 'abierto' : ''} ${esCerrado ? 'cerrado' : ''}`}
            >
              <div className="pedido-header">
                <div>
                  <h3 style={{ margin: 0, display: 'inline-block', verticalAlign: 'middle' }}>
                    Mesa {pedido.mesaCodigo} 
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
                {/* Usamos pedido.items para los detalles del plato */}
                {pedido.items && pedido.items.map((item, index) => { 
                  const fases = [
                    { key: 'pendiente', label: 'Pendiente' },
                    { key: 'en_preparacion', label: 'En preparación' }, 
                    { key: 'listo', label: 'Listo' },
                    { key: 'entregado', label: 'Entregado' }
                  ];
                  // Antes: const itemEstadoNormalizado = item.estado ? item.estado.toLowerCase() : '';
                  // Después: usa el estado de la comanda (pedido)
                  const itemEstadoNormalizado = pedido.estado ? pedido.estado.toLowerCase() : '';
                  const faseActual = fases.findIndex(f => f.key === itemEstadoNormalizado);

                  // --- INICIO: Depuración Temporal ---
                  // Se puede mantener o quitar el console.log según necesidad
                  console.log(`Pedido ID: ${pedido.id}, Item: ${item.nombre}, Estado Pedido API: ${pedido.estado}, Estado Normalizado para Item: ${itemEstadoNormalizado}, Fase Actual Index: ${faseActual}`);
                  // --- FIN: Depuración Temporal ---

                  return (
                    // Usar item.id si está disponible y es único, sino el index como fallback.
                    <div key={item.id || `item-${pedido.id}-${index}`} className="pedido-item" style={{ alignItems: 'center' }}> 
                      <span className="item-cantidad">{item.cantidad}x</span> 
                      {/* Usamos item.nombre para el nombre del plato */}
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

              <div className="pedido-footer" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* Información de facturación comentada */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmpleadoComandasView;