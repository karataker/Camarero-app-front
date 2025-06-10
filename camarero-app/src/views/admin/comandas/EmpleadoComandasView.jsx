import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/admin/comandas/empleadoComandasView.css';

import { getComandasPorBar } from '../../../services/comandaService';
import { obtenerMesas, getMesaPorId } from '../../../services/barService';
import AdminNavigation from '../../../components/AdminNavigation';
import Reloj from '../../../components/Reloj';

const EmpleadoComandasView = () => {
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
    { key: 'terminado', label: 'Terminados' }
  ];

  const handleToggleEstado = (estadoKey) => {
    if (estadoKey === 'todos') {
      setFiltroEstado(['todos']);
    } else {
      setFiltroEstado(prevEstados => {
        const sinTodos = prevEstados.filter(e => e !== 'todos');
        if (sinTodos.includes(estadoKey)) {
          const nuevosEstados = sinTodos.filter(e => e !== estadoKey);
          return nuevosEstados.length === 0 ? ['todos'] : nuevosEstados;
        } else {
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
        const nombres = {};
        for (const pedido of comandasData) {
          if (pedido.mesaCodigo && !nombres[pedido.mesaCodigo]) {
            try {
              const mesa = await getMesaPorId(barId, pedido.mesaCodigo);
              nombres[pedido.mesaCodigo] = {
                codigo: mesa?.codigo || pedido.mesaCodigo,
                id: mesa?.id
              };
            } catch {
              nombres[pedido.mesaCodigo] = {
                codigo: pedido.mesaCodigo,
                id: pedido.mesaCodigo
              };
            }
          }
        }

        const pedidosConNombre = comandasData.map(p => ({
          ...p,
          nombreMesa: nombres[p.mesaCodigo]?.codigo || p.mesaCodigo,
          mesaId: nombres[p.mesaCodigo]?.id
        }));

        setPedidos(pedidosConNombre);
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

  const calcularEstadoComanda = (items) => {
    if (!items || items.length === 0) return 'pendiente';
    const estados = items.map(item => item.estado?.toLowerCase() || 'pendiente');

    if (estados.every(e => e === 'terminado')) return 'terminado';
    if (estados.every(e => e === 'entregado')) return 'entregado';
    if (estados.every(e => ['listo', 'entregado'].includes(e))) return 'listo';
    if (estados.some(e => e === 'en_preparacion')) return 'en_preparacion';
    return 'pendiente';
  };

  const obtenerTextoEstado = (estado) => {
    const estadosTexto = {
      'pendiente': 'Pendiente',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo',
      'entregado': 'Entregado',
      'terminado': 'Terminado'
    };
    return estadosTexto[estado] || 'Desconocido';
  };

  if (cargando || cargandoMesas) return <div className="pedidos-loading">Cargando datos...</div>;
  if (error) return <div className="pedidos-error">{error}</div>;

  const pedidosFiltrados = pedidos.filter(pedido => {
    const estado = calcularEstadoComanda(pedido.items);
    const cumpleEstado = filtroEstado.includes('todos') || filtroEstado.includes(estado);
    const cumpleMesa = filtroMesa === 'todas' || pedido.mesaId === filtroMesa;
    return cumpleEstado && cumpleMesa;
  }).sort((a, b) => ordenHora === 'asc' ? new Date(a.fecha) - new Date(b.fecha) : new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="empleado-pedidos-view">
      <AdminNavigation />

      <div className="empleado-pedidos-header">
        <h1>Resumen de Comandas</h1>
        <Reloj formato="HH:mm:ss" />
      </div>

      <div className="filtros-pedidos">
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
                  className={`mini-mesa-item ${filtroMesa === mesa.id ? 'activo' : ''}`}
                  onClick={() => setFiltroMesa(mesa.id)}
                  title={`Mesa ${mesa.codigo}${mesa.nombre ? ` (${mesa.nombre})` : ''}`}
                >
                  {mesa.codigo || mesa.nombre}
                </button>
              ))}
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
          const estadoComanda = calcularEstadoComanda(pedido.items);
          const nombreMesa = pedido.nombreMesa;

          return (
            <div key={pedido.id} className={`pedido-card estado-${estadoComanda}`}>
              <div className="pedido-header">
                <div>
                  <h3>{nombreMesa}</h3>
                  <div className="pedido-codigo">
                    Código Comanda: <b>{pedido.id}</b>
                  </div>
                  <div className="estado-comanda">
                    <span className={`estado-badge estado-${estadoComanda}`}>
                      {obtenerTextoEstado(estadoComanda)}
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
                {pedido.items.map((item, index) => (
                  <div key={item.id || `item-${pedido.id}-${index}`} className="pedido-item">
                    <div className="item-info">
                      <span className="item-cantidad">{item.cantidad}x</span>
                      <span className="item-nombre">{item.nombre}</span>
                    </div>
                    <div className="item-fases-container">
                      <div className="item-fases">
                        {['pendiente', 'en_preparacion', 'listo', 'entregado', 'terminado'].map((fase, i) => {
                          const itemEstado = item.estado?.toLowerCase() || 'pendiente';
                          const faseActual = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'terminado'].indexOf(itemEstado);
                          return (
                            <span
                              key={fase}
                              className={`item-fase fase-${fase} ${i === faseActual ? 'fase-activa' : ''} ${i < faseActual ? 'fase-completada' : ''}`}
                            >
                              {fase.charAt(0).toUpperCase() + fase.slice(1).replace('_', ' ')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pedido-footer">
                {(() => {
                  let importe = pedido.importeTotal;
                  if (importe === undefined && Array.isArray(pedido.items)) {
                    const valid = pedido.items.every(item => typeof item.cantidad === 'number' && typeof item.precio === 'number');
                    if (valid) {
                      importe = pedido.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
                    }
                  }
                  return (
                    <span className="pedido-importe-total">
                      <strong>Total:</strong> {importe != null ? importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '-'}
                    </span>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmpleadoComandasView;
