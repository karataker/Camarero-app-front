import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/empleadoCocinaView.css';

const EmpleadoCocinaView = () => {
  const { barId } = useParams();
  const [pedidosCocina, setPedidosCocina] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPedidosCocina();
  }, [barId]);

  const cargarPedidosCocina = async () => {
    try {
      // TODO: Replace with actual API call
      const mockPedidos = [
        {
          id: 1,
          mesa: 'A1',
          hora: '14:30',
          estado: 'pendiente',
          items: [
            { id: 1, nombre: 'Hamburguesa', cantidad: 2, notas: 'Sin cebolla' },
            { id: 2, nombre: 'Patatas Bravas', cantidad: 1 }
          ]
        }
      ];
      setPedidosCocina(mockPedidos);
    } catch (err) {
      setError('Error al cargar los pedidos de cocina');
      console.error(err);
    }
  };

  return (
    <div className="empleado-cocina-view">
      <h1>Panel de Cocina</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="pedidos-cocina-grid">
        {pedidosCocina.map(pedido => (
          <div key={pedido.id} className={`pedido-card ${pedido.estado}`}>
            <div className="pedido-header">
              <h3>Mesa {pedido.mesa}</h3>
              <span className="pedido-hora">{pedido.hora}</span>
            </div>
            <div className="pedido-items">
              {pedido.items.map(item => (
                <div key={item.id} className="pedido-item">
                  <span className="cantidad">{item.cantidad}x</span>
                  <span className="nombre">{item.nombre}</span>
                  {item.notas && <p className="notas">{item.notas}</p>}
                </div>
              ))}
            </div>
            <div className="pedido-actions">
              <button className="btn-listo">
                <i className="fas fa-check"></i> Listo
              </button>
              <button className="btn-cancelar">
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoCocinaView;