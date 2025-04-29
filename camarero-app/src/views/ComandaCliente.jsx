import React, { useState } from 'react';

const ComandaCliente = () => {
  const [pedido, setPedido] = useState([]);
  const [pagoRealizado, setPagoRealizado] = useState(false);

  const carta = [
    { id: 1, nombre: 'Hamburguesa', opciones: ['Poco hecha', 'Al punto', 'Muy hecha'] },
    { id: 2, nombre: 'Pizza', opciones: ['Extra queso', 'Sin cebolla', 'Picante'] },
  ];

  const añadirProducto = (producto, opcion) => {
    setPedido([...pedido, { producto, opcion }]);
  };

  const pagar = () => {
    setPagoRealizado(true);
    alert('Pago realizado (mock)');
  };

  const enviarComanda = () => {
    if (!pagoRealizado) {
      alert('Debes pagar antes de enviar la comanda');
      return;
    }
    console.log('Comanda enviada:', pedido);
    alert('Comanda enviada a cocina');
  };

  return (
    <div>
      <h2>Carta</h2>
      {carta.map((item) => (
        <div key={item.id}>
          <h4>{item.nombre}</h4>
          {item.opciones.map((op, i) => (
            <button key={i} onClick={() => añadirProducto(item.nombre, op)}>
              {op}
            </button>
          ))}
        </div>
      ))}
      <hr />
      <h3>Tu pedido:</h3>
      <ul>
        {pedido.map((p, i) => (
          <li key={i}>{p.producto} - {p.opcion}</li>
        ))}
      </ul>
      <button onClick={pagar}>Pagar</button>
      <button onClick={enviarComanda}>Enviar a cocina</button>
    </div>
  );
};

export default ComandaCliente;