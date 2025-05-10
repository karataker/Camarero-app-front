import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/empleadoPedidosView.css';
import { obtenerComandasDelBar } from '../mocks/comandasMocks';
import Reloj from '../components/Reloj';
import { MdOutlinePendingActions, MdOutlineDeliveryDining, MdDoneAll } from 'react-icons/md';
import { GiCook } from 'react-icons/gi';

const EmpleadoPedidosView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenHora, setOrdenHora] = useState('asc'); // NUEVO estado para el orden
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setCargando(true);
        const comandasData = obtenerComandasDelBar(barId);
        setPedidos(comandasData);
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [barId]);

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      setPedidos(prevPedidos =>
        prevPedidos.map(pedido => {
          if (pedido.id !== pedidoId) return pedido;
          const ahora = new Date();
          const horaActual = ahora.toTimeString().slice(0,5); // "HH:mm"
          if (nuevoEstado === 'preparacion' && !pedido.horaPreparacion) {
            return { ...pedido, estado: nuevoEstado, horaPreparacion: horaActual };
          }
          if (nuevoEstado === 'listo' && !pedido.horaListo) {
            return { ...pedido, estado: nuevoEstado, horaListo: horaActual };
          }
          if (nuevoEstado === 'entregado' && !pedido.horaEntregado) {
            return { ...pedido, estado: nuevoEstado, horaEntregado: horaActual };
          }
          return { ...pedido, estado: nuevoEstado };
        })
      );
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
    }
  };

  const tiempoEntre = (inicio, fin) => {
    if (!inicio || !fin) return '-';
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const t1 = h1 * 60 + m1;
    const t2 = h2 * 60 + m2;
    let diff = t2 - t1;
    if (diff < 0) diff += 24 * 60;
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    if (horas > 0) return `${horas}h ${minutos}min`;
    return `${minutos} min`;
  };

  const horaActual = new Date();
  const horaActualStr = horaActual.toTimeString().slice(0,5);

  // Devuelve un string tipo "12 min", "1h 5min", etc.
  const tiempoTranscurrido = (horaPedido) => {
    const ahora = new Date();
    const [h, m] = horaPedido.split(':').map(Number);
    const pedidoDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m, 0);
    let diffMs = ahora - pedidoDate;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Si el pedido es de antes de medianoche
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;
    if (horas > 0) return `${horas}h ${minutos}min`;
    return `${minutos} min`;
  };

  if (cargando) {
    return <div className="pedidos-loading">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="pedidos-error">{error}</div>;
  }

  // Filtrado y ordenación
  const pedidosFiltrados = pedidos
    .filter(pedido => filtroEstado === 'todos' || pedido.estado === filtroEstado)
    .sort((a, b) => {
      const horaA = a.hora || a.horaEntrada || '';
      const horaB = b.hora || b.horaEntrada || '';
      if (ordenHora === 'asc') {
        return horaA.localeCompare(horaB);
      } else {
        return horaB.localeCompare(horaA);
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
          <option value="preparacion">En preparación</option>
          <option value="listo">Listos</option>
          <option value="entregado">Entregados</option>
        </select>
        <select
          value={ordenHora}
          onChange={e => setOrdenHora(e.target.value)}
          className="filtro-orden-hora"
        >
          <option value="asc">Hora ascendente</option>
          <option value="desc">Hora descendente</option>
        </select>
      </div>

      <div className="pedidos-grid">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id} className={`pedido-card estado-${pedido.estado}`}>
            <div className="pedido-header">
              <div>
                <h3 style={{ margin: 0, display: 'inline-block', verticalAlign: 'middle' }}>
                  Mesa {pedido.mesa}
                </h3>
                <div style={{ fontSize: '0.85em', color: '#888' }}>
                  Código: <b>{pedido.codigo}</b>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.95em' }}>
                <div>
                  <span className="pedido-hora"><b>Entrada:</b> {pedido.horaEntrada || '-'}</span><br />
                  <span className="pedido-hora"><b>Preparación:</b> {pedido.horaPreparacion || '-'}</span><br />
                  <span className="pedido-hora"><b>Listo:</b> {pedido.horaListo || '-'}</span><br />
                  <span className="pedido-hora"><b>Entregado:</b> {pedido.horaEntregado || '-'}</span>
                </div>
              </div>
            </div>

            {/* Gráfico de barras con tiempos y total */}
            <div style={{ margin: '8px 0 0 0', display: 'flex', alignItems: 'center' }}>
              {(() => {
                const min = (a, b) => {
                  if (!a || !b) return 0;
                  const [h1, m1] = a.split(':').map(Number);
                  const [h2, m2] = b.split(':').map(Number);
                  let t1 = h1 * 60 + m1;
                  let t2 = h2 * 60 + m2;
                  let diff = t2 - t1;
                  if (diff < 0) diff += 24 * 60;
                  return diff;
                };
                const t1 = pedido.horaEntrada && pedido.horaPreparacion ? min(pedido.horaEntrada, pedido.horaPreparacion) : 0;
                const t2 = pedido.horaPreparacion && pedido.horaListo ? min(pedido.horaPreparacion, pedido.horaListo) : 0;
                const t3 = pedido.horaListo && pedido.horaEntregado ? min(pedido.horaListo, pedido.horaEntregado) : 0;
                const horaActualStr = new Date().toTimeString().slice(0,5);
                const tActual = {
                  pendiente: pedido.horaEntrada ? min(pedido.horaEntrada, horaActualStr) : 0,
                  preparacion: pedido.horaPreparacion ? min(pedido.horaPreparacion, horaActualStr) : 0,
                  listo: pedido.horaListo ? min(pedido.horaListo, horaActualStr) : 0,
                };
                const total = t1 + t2 + t3 + (
                  pedido.estado === 'pendiente' ? tActual.pendiente :
                  pedido.estado === 'preparacion' ? tActual.preparacion :
                  pedido.estado === 'listo' ? tActual.listo : 0
                ) || 1;

                // Helper para mostrar el tiempo en formato amigable
                const formatMin = min => min > 59 ? `${Math.floor(min/60)}h ${min%60}min` : `${min}min`;

                // Calcula el tiempo de la fase actual si está en curso
                let tPendiente = t1;
                let tPreparacion = t2;
                let tListo = t3;
                if (pedido.estado === 'pendiente') tPendiente += tActual.pendiente;
                if (pedido.estado === 'preparacion') tPreparacion += tActual.preparacion;
                if (pedido.estado === 'listo') tListo += tActual.listo;

                return (
                  <>
                    <div className="barra-tiempos-fases" style={{ height: 20, display: 'flex', borderRadius: 6, overflow: 'hidden', background: '#eee', flex: 1, minWidth: 0 }}>
                      {/* Entrada → Preparación */}
                      <div style={{
                        width: `${(tPendiente/total)*100}%`,
                        background: '#ffb3b3',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        fontWeight: 500,
                        fontSize: '0.95em',
                        color: '#a94442',
                        whiteSpace: 'nowrap',
                        minWidth: tPendiente > 0 ? 40 : 0
                      }}>
                        {tPendiente > 0 && <span>{formatMin(tPendiente)}</span>}
                      </div>
                      {/* Preparación → Listo */}
                      <div style={{
                        width: `${(tPreparacion/total)*100}%`,
                        background: '#ffe082',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        fontWeight: 500,
                        fontSize: '0.95em',
                        color: '#b8860b',
                        whiteSpace: 'nowrap',
                        minWidth: tPreparacion > 0 ? 40 : 0
                      }}>
                        {tPreparacion > 0 && <span>{formatMin(tPreparacion)}</span>}
                      </div>
                      {/* Listo → Entregado */}
                      <div style={{
                        width: `${(tListo/total)*100}%`,
                        background: '#b9f6ca',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        fontWeight: 500,
                        fontSize: '0.95em',
                        color: '#218838',
                        whiteSpace: 'nowrap',
                        minWidth: tListo > 0 ? 40 : 0
                      }}>
                        {tListo > 0 && <span>{formatMin(tListo)}</span>}
                      </div>
                    </div>
                    <span style={{ marginLeft: 10, fontWeight: 600, fontSize: '1em', color: '#333', minWidth: 60, textAlign: 'right' }}>
                      {formatMin(total)}
                    </span>
                  </>
                );
              })()}
            </div>

            <div className="pedido-items">
              {pedido.items.map((item, index) => {
                const fases = [
                  { key: 'pendiente', label: 'Pendiente' },
                  { key: 'preparacion', label: 'En preparación' },
                  { key: 'listo', label: 'Listo' },
                  { key: 'entregado', label: 'Entregado' }
                ];
                // Determina la fase actual alcanzada
                const faseActual = fases.findIndex(f => f.key === item.estado);

                return (
                  <div key={index} className="pedido-item" style={{ alignItems: 'center' }}>
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

            <div className="pedido-footer">
              <span className="pedido-total">{pedido.total.toFixed(2)} €</span>
              <span
                className="pedido-pago"
                style={{
                  marginLeft: 12,
                  fontWeight: 500,
                  color: pedido.pagado ? '#2ecc71' : '#e74c3c'
                }}
              >
                {pedido.pagado ? 'Pagado' : 'Pendiente de pago'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoPedidosView;