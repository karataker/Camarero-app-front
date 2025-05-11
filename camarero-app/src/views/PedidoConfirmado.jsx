import React from 'react';
import { useParams, Link } from 'react-router-dom';

const PedidoConfirmado = () => {
  const { barId, mesaId } = useParams();
  
  return (
    <div className="pedido-confirmado">
      <div className="confirmacion-box">
        <i className="fas fa-check-circle confirmacion-icon"></i>
        <h2>¡Pedido confirmado!</h2>
        <p>Tu pedido para la mesa {mesaId} ha sido enviado correctamente.</p>
        <p>En breve un camarero lo procesará.</p>
        
        <Link to={`/cliente/bar/${barId}/mesa/${mesaId}`} className="volver-carta-btn">
          Volver a la carta
        </Link>
      </div>
    </div>
  );
};

export default PedidoConfirmado;