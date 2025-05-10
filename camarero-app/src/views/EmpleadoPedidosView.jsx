import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/empleadoPedidosView.css';

const EmpleadoPedidosView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setCargando(true);
        // TODO: Implement API call
        const pedidosMock = [
          {
            id: 1,
            mesa: 'A1',
            estado: 'pendiente',
            hora: '14:30',
            items: [
              { nombre: 'Hamburguesa', cantidad: 2 },
              { nombre: 'Coca-Cola', cantidad: 2 }
            ],
            total: 25.80
          },
          // Add more mock orders as needed
        ];
        setPedidos(pedidosMock);
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
      // TODO: Implement API call to update order status
      setPedidos(prevPedidos =>
        prevPedidos.map(pedido =>
          pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
        )
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

  const pedidosFiltrados = pedidos.filter(pedido => 
    filtroEstado === 'todos' || pedido.estado === filtroEstado
  );

  return (
    <div className="empleado-pedidos-view">
      <div className="empleado-breadcrumb">
        <Link to="/empleado/panel">Panel</Link>
        <span>/</span>
        <Link to={`/empleado/bar/${barId}`}>Bar</Link>
        <span>/</span>
        <span>Pedidos</span>
      </div>
      
      <h1>Gestión de Pedidos</h1>

      <div className="filtros-pedidos">
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
      </div>

      <div className="pedidos-grid">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id} className={`pedido-card estado-${pedido.estado}`}>
            <div className="pedido-header">
              <h3>Mesa {pedido.mesa}</h3>
              <span className="pedido-hora">{pedido.hora}</span>
            </div>

            <div className="pedido-items">
              {pedido.items.map((item, index) => (
                <div key={index} className="pedido-item">
                  <span className="item-cantidad">{item.cantidad}x</span>
                  <span className="item-nombre">{item.nombre}</span>
                </div>
              ))}
            </div>

            <div className="pedido-footer">
              <span className="pedido-total">{pedido.total.toFixed(2)} €</span>
              <select
                value={pedido.estado}
                onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)}
                className="cambio-estado"
              >
                <option value="pendiente">Pendiente</option>
                <option value="preparacion">En preparación</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoPedidosView;