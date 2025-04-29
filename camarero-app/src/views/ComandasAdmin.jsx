import React, { useState, useEffect } from 'react';

const ComandasAdmin = () => {
  const [comandas, setComandas] = useState([]);

  useEffect(() => {
    // Simulación de "nuevas comandas"
    const intervalo = setInterval(() => {
      const nueva = {
        id: Date.now(),
        mesa: Math.ceil(Math.random() * 10),
        pedido: ['Pizza', 'Hamburguesa']
      };
      setComandas((prev) => [...prev, nueva]);
    }, 10000); // cada 10 segundos llega una comanda

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div>
      <h2>Comandas recibidas</h2>
      {comandas.map((c) => (
        <div key={c.id}>
          <h4>Mesa {c.mesa}</h4>
          <ul>
            {c.pedido.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ComandasAdmin;