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
              <span style={{ marginRight: 8, fontSize: '1.5em', verticalAlign: 'middle' }}>
                {pedido.estado === 'pendiente' && <MdOutlinePendingActions color="#e74c3c" title="Pendiente" />}
                {pedido.estado === 'preparacion' && <GiCook color="#f39c12" title="En preparación" />}
                {pedido.estado === 'listo' && <MdOutlineDeliveryDining color="#2ecc71" title="Listo para servir" />}
                {pedido.estado === 'entregado' && <MdDoneAll color="#95a5a6" title="Entregado" />}
              </span>
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

            <div style={{ margin: '8px 0 0 0' }}>
              {/* Etiquetas de tiempos por estado */}
              {(() => {
                // Utilidades para minutos
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
                // Fases
                const t1 = pedido.horaEntrada && pedido.horaPreparacion ? min(pedido.horaEntrada, pedido.horaPreparacion) : 0;
                const t2 = pedido.horaPreparacion && pedido.horaListo ? min(pedido.horaPreparacion, pedido.horaListo) : 0;
                const t3 = pedido.horaListo && pedido.horaEntregado ? min(pedido.horaListo, pedido.horaEntregado) : 0;
                // Si el pedido está en una fase, calcula el tiempo hasta ahora
                const horaActualStr = new Date().toTimeString().slice(0,5);
                const tActual = {
                  pendiente: pedido.horaEntrada ? min(pedido.horaEntrada, horaActualStr) : 0,
                  preparacion: pedido.horaPreparacion ? min(pedido.horaPreparacion, horaActualStr) : 0,
                  listo: pedido.horaListo ? min(pedido.horaListo, horaActualStr) : 0,
                };
                // Suma total para proporciones
                const total = t1 + t2 + t3 + (
                  pedido.estado === 'pendiente' ? tActual.pendiente :
                  pedido.estado === 'preparacion' ? tActual.preparacion :
                  pedido.estado === 'listo' ? tActual.listo : 0
                ) || 1; // evitar división por cero

                // Etiquetas de tiempo por estado
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: 2 }}>
                      <span style={{ color: '#e74c3c' }}>
                        {t1 > 0 && `Pendiente: ${t1} min`}
                        {pedido.estado === 'pendiente' && `Pendiente: ${tActual.pendiente} min`}
                      </span>
                      <span style={{ color: '#f39c12' }}>
                        {t2 > 0 && `Preparación: ${t2} min`}
                        {pedido.estado === 'preparacion' && `Preparación: ${tActual.preparacion} min`}
                      </span>
                      <span style={{ color: '#2ecc71' }}>
                        {t3 > 0 && `Listo: ${t3} min`}
                        {pedido.estado === 'listo' && `Listo: ${tActual.listo} min`}
                      </span>
                      <span style={{ color: '#6c63ff' }}>
                        {pedido.estado === 'entregado' && t3 > 0 && `Entregado`}
                      </span>
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#333' }}>
                        Total: {total} min
                      </span>
                    </div>
                    <div className="barra-tiempos-fases" style={{ height: 12, display: 'flex', borderRadius: 6, overflow: 'hidden', background: '#eee' }}>
                      {/* Entrada → Preparación */}
                      <div style={{
                        width: `${(t1/total)*100}%`,
                        background: '#ffb3b3',
                        height: '100%',
                      }} title={`Pendiente: ${t1} min`} />
                      {/* Preparación → Listo */}
                      <div style={{
                        width: `${(t2/total)*100}%`,
                        background: '#ffe082',
                        height: '100%',
                      }} title={`Preparación: ${t2} min`} />
                      {/* Listo → Entregado */}
                      <div style={{
                        width: `${(t3/total)*100}%`,
                        background: '#b9f6ca',
                        height: '100%',
                      }} title={`Listo: ${t3} min`} />
                      {/* Fase actual (en curso) */}
                      {pedido.estado === 'pendiente' && (
                        <div style={{
                          width: `${(tActual.pendiente/total)*100}%`,
                          background: '#e74c3c',
                          height: '100%',
                          opacity: 0.7,
                        }} title={`Pendiente: ${tActual.pendiente} min (en curso)`} />
                      )}
                      {pedido.estado === 'preparacion' && (
                        <div style={{
                          width: `${(tActual.preparacion/total)*100}%`,
                          background: '#f39c12',
                          height: '100%',
                          opacity: 0.7,
                        }} title={`Preparación: ${tActual.preparacion} min (en curso)`} />
                      )}
                      {pedido.estado === 'listo' && (
                        <div style={{
                          width: `${(tActual.listo/total)*100}%`,
                          background: '#2ecc71',
                          height: '100%',
                          opacity: 0.7,
                        }} title={`Listo: ${tActual.listo} min (en curso)`} />
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="pedido-items">
              {pedido.items.map((item, index) => (
                <div key={index} className="pedido-item">
                  <span className="item-cantidad">{item.cantidad}x</span>
                  <span className="item-nombre">{item.nombre}</span>
                  <span className={`item-estado estado-${pedido.estado}`}>
                    {pedido.estado === 'pendiente' && 'Pendiente'}
                    {pedido.estado === 'preparacion' && 'En preparación'}
                    {pedido.estado === 'listo' && 'Listo'}
                    {pedido.estado === 'entregado' && 'Entregado'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pedido-footer">
              <span className="pedido-total">{pedido.total.toFixed(2)} €</span>
              <span className={`item-estado estado-${pedido.estado}`}>
                {pedido.estado === 'pendiente' && 'Pendiente'}
                {pedido.estado === 'preparacion' && 'En preparación'}
                {pedido.estado === 'listo' && 'Listo'}
                {pedido.estado === 'entregado' && 'Entregado'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoPedidosView;