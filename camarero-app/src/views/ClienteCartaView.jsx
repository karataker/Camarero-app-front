import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartaDigital from '../components/CartaDigital';
import '../styles/clienteCartaView.css';
import { useComandas } from '../context/useComandas';

const ClienteCartaView = () => {
  const [pedidoActual, setPedidoActual] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comensalesInput, setComensalesInput] = useState('');

  const { agregarComanda, comensales, setComensales } = useComandas();
  const { mesaId, barId } = useParams();
  const navigate = useNavigate();

  const handleAddToOrder = (producto) => {
    setPedidoActual(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const confirmarComanda = () => {
    const nuevaComanda = {
      id: `CMD${Date.now()}`,
      fecha: new Date().toLocaleString(),
      estado: 'en_preparacion',
      estimado: '15 minutos',
      items: pedidoActual.map(p => {
        const rand = Math.random();
        return {
          nombre: p.nombre,
          cantidad: p.cantidad,
          disponible: rand > 0.3,
          recogido: rand > 0.75
        };
      })
    };

    agregarComanda(nuevaComanda);
    navigate(`/cliente/${barId}/${mesaId}/comandas`);
  };

  const total = pedidoActual.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleComensalesSubmit = (e) => {
    e.preventDefault();
    const numero = parseInt(comensalesInput);
    if (!isNaN(numero) && numero > 0) {
      setComensales(numero);
    }
  };

  if (!comensales) {
    return (
      <div className="cliente-carta-view cliente-inicial">
        <form className="comensales-form" onSubmit={handleComensalesSubmit}>
          <label htmlFor="comensales">¿Cuántos comensales sois?</label>
          <input
            id="comensales"
            type="number"
            min="1"
            max="20"
            value={comensalesInput}
            onChange={(e) => setComensalesInput(e.target.value)}
            required
          />
          <button type="submit">
            <i className="fas fa-arrow-right" style={{ marginRight: 6 }}></i> Confirmar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="cliente-carta-view">
      <div className="cliente-info-bar">
        <h2>Mesa {mesaId}</h2>
        <div className="pedido-resumen">
          <button className="carrito-toggle" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
            <i className="fas fa-shopping-cart"></i> {pedidoActual.length}
          </button>
          <button
            onClick={() => setMostrarModal(true)}
            disabled={pedidoActual.length === 0}
            className="confirmar-pedido-btn"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>

      <CartaDigital onAddToOrder={handleAddToOrder} />

      {mostrarCarrito && (
        <div className="pedido-flotante">
          <h3>Tu pedido</h3>
          <ul>
            {pedidoActual.map(item => (
              <li key={item.id}>
                {item.nombre} x{item.cantidad} - {(item.precio * item.cantidad).toFixed(2)}€
              </li>
            ))}
          </ul>
          <div className="pedido-total">
            Total: {total.toFixed(2)}€
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>¿Confirmar pedido?</h2>
            <p>Una vez confirmado, la comanda se enviará a cocina y no podrá modificarse.</p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setMostrarModal(false)}>Seguir pidiendo</button>
              <button className="btn-confirmar" onClick={confirmarComanda}>Enviar a cocina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteCartaView;
