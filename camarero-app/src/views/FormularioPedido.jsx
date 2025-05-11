import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/formularioPedido.css';

const FormularioPedido = () => {
  const { barId, mesaId } = useParams();
  const [comensales, setComensales] = useState('');
  const [pedidoIniciado, setPedidoIniciado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comensales || isNaN(comensales) || comensales < 1) {
      alert('Por favor, introduce un número válido de comensales.');
      return;
    }

    // En un futuro: enviar info al backend
    setPedidoIniciado(true);
  };

  return (
    <div className="pedido-container">
      <h2>Mesa {mesaId} - Bar {barId}</h2>

      {!pedidoIniciado ? (
        <form onSubmit={handleSubmit} className="pedido-form">
          <label htmlFor="comensales">Número de comensales:</label>
          <input
            type="number"
            id="comensales"
            value={comensales}
            onChange={(e) => setComensales(e.target.value)}
            min={1}
          />
          <button type="submit">Iniciar pedido</button>
        </form>
      ) : (
        <div className="pedido-confirmacion">
          <p>¡Pedido iniciado para {comensales} comensales!</p>
          <p>Ahora puedes continuar con la selección de la carta (pendiente de implementar).</p>
        </div>
      )}
    </div>
  );
};

export default FormularioPedido;