import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartaDigital from '../components/CartaDigital';
import '../styles/clienteCartaView.css';

const ClienteCartaView = () => {
  const [pedidoActual, setPedidoActual] = useState([]);
  const { mesaId, barId } = useParams();
  const navigate = useNavigate();

  const handleAddToOrder = (producto) => {
    setPedidoActual(prev => [...prev, {
      ...producto,
      cantidad: 1,
      id: Date.now() // ID temporal
    }]);
  };

  const handleConfirmarPedido = () => {
    // Aquí enviarías el pedido al backend
    console.log('Pedido confirmado:', pedidoActual);
    // Redireccionar a una página de confirmación
    navigate(`/cliente/${barId}/${mesaId}/pedido-confirmado`);
  };

  return (
    <div className="cliente-carta-view">
      <div className="cliente-info-bar">
        <h2>Mesa {mesaId}</h2>
        <div className="pedido-resumen">
          <span>{pedidoActual.length} productos</span>
          <button 
            onClick={handleConfirmarPedido}
            disabled={pedidoActual.length === 0}
            className="confirmar-pedido-btn"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>

      <CartaDigital onAddToOrder={handleAddToOrder} />

      {/* Resumen del pedido actual flotante */}
      {pedidoActual.length > 0 && (
        <div className="pedido-flotante">
          <h3>Tu pedido</h3>
          <ul>
            {pedidoActual.map(item => (
              <li key={item.id}>
                {item.nombre} - {item.precio.toFixed(2)}€
              </li>
            ))}
          </ul>
          <div className="pedido-total">
            Total: {pedidoActual.reduce((sum, item) => sum + item.precio, 0).toFixed(2)}€
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteCartaView;