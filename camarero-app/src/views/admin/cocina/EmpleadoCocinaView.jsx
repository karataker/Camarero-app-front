import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/admin/cocina/empleadoCocinaView.css';

import { getComandasPorBar, actualizarEstadoItem } from '../../../services/comandaService';
import AdminNavigation from '../../../components/AdminNavigation';
import Reloj from '../../../components/Reloj';

const EmpleadoCocinaView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState(['todos']);
  const [ordenHora, setOrdenHora] = useState('asc');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const estadosDisponibles = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'en_preparacion', label: 'En Preparación' },
    { key: 'listo', label: 'Listos' },
    { key: 'entregado', label: 'Entregados' }
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
      return fechaISO;
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (!barId) {
        setError('No se ha especificado un bar.');
        setPedidos([]);
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        const comandasData = await getComandasPorBar(barId);
        setPedidos(comandasData || []);
      } catch (err) {
        setError('Error al cargar las comandas');
        console.error("Error en getComandasPorBar:", err);
        setPedidos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [barId]);

  const handleCambiarEstadoItem = async (pedidoId, itemId, nuevoEstado) => {
    try {
      const itemActualizado = await actualizarEstadoItem(itemId, nuevoEstado);
      setPedidos(prev =>
        prev.map(pedido =>
          pedido.id !== pedidoId
            ? pedido
            : {
                ...pedido,
                items: pedido.items.map(item =>
                  item.id !== itemId ? item : { ...item, estado: itemActualizado.estado }
                )
              }
        )
      );
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const calcularEstadoComanda = (items) => {
    const estados = items?.map(i => (i.estado || 'pendiente').toLowerCase()) || [];
    const allAre = (estado) => estados.every(e => e === estado);
    const someAre = (estado) => estados.some(e => e === estado);
    const allIn = (grupo) => estados.every(e => grupo.includes(e));
    switch (true) {
      case allAre('terminado'): return 'terminado';
      case allAre('entregado'): return 'entregado';
      case allIn(['listo', 'entregado']): return 'listo';
      case someAre('en_preparacion'): return 'en_preparacion';
      default: return 'pendiente';
    }
  };

  const obtenerTextoEstado = (estado) => {
    const map = {
      pendiente: 'Pendiente',
      en_preparacion: 'En Preparación',
      listo: 'Listo',
      entregado: 'Entregado',
      terminado: 'Terminado'
    };
    return map[estado] || 'Desconocido';
  };

  const pedidosFiltrados = pedidos
    .filter(pedido => {
      const estado = calcularEstadoComanda(pedido.items);
      if (estado === 'terminado') return false;
      return filtroEstado.includes('todos') || filtroEstado.includes(estado);
    })
    .sort((a, b) => {
      const fa = new Date(a.fecha).getTime();
      const fb = new Date(b.fecha).getTime();
      return ordenHora === 'asc' ? fa - fb : fb - fa;
    });

  if (cargando) return <div className="pedidos-loading">Cargando...</div>;
  if (error) return <div className="pedidos-error">{error}</div>;

  return (
    <div className="empleado-pedidos-view">
      <AdminNavigation />
      <div className="empleado-pedidos-header">
        <h1>Gestión de Comandas</h1>
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
          const estado = calcularEstadoComanda(pedido.items);

          return (
            <div key={pedido.id} className={`pedido-card estado-${estado}`}>
              <div className="pedido-header">
                <div>
                  <h3>Mesa {pedido.mesaCodigo}</h3>
                  <div className="pedido-codigo">
                    Código Comanda: <b>{pedido.id}</b>
                  </div>
                  <div className="estado-comanda">
                    <span className={`estado-badge estado-${estado}`}>
                      {obtenerTextoEstado(estado)}
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
                {pedido.items?.map((item, index) => {
                  const fases = ['pendiente', 'en_preparacion', 'listo', 'entregado'];
                  const actual = fases.findIndex(f => f === item.estado?.toLowerCase());

                  return (
                    <div key={item.id || `item-${index}`} className="pedido-item">
                      <div className="item-info">
                        <span className="item-cantidad">{item.cantidad}x</span>
                        <span className="item-nombre">{item.nombre}</span>
                      </div>
                      <div className="item-fases-container">
                        <div className="item-fases-buttons">
                          {fases.map((fase, i) => (
                            <button
                              key={fase}
                              className={
                                "item-fase-btn " +
                                (i === actual ? "fase-activa" : "") +
                                (i < actual ? "fase-completada" : "")
                              }
                              disabled={i <= actual}
                              onClick={() => handleCambiarEstadoItem(pedido.id, item.id, fase)}
                            >
                              {fase.charAt(0).toUpperCase() + fase.slice(1).replace('_', ' ')}
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
