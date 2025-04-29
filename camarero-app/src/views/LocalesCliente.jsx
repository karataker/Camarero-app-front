import React from 'react';
import { useNavigate } from 'react-router-dom';

const LocalesCliente = () => {
  const navigate = useNavigate();

  const handleSeleccionLocal = (opcion) => {
    if (opcion === 'mesa') {
      const codigoMesa = prompt('Introduce el código de la mesa:');
      if (codigoMesa) {
        navigate('/cliente/comanda');
      }
    } else {
      navigate('/cliente/comanda');
    }
  };

  return (
    <div>
      <h2>Selecciona un local</h2>
      <ul>
        <li>Bar Don Pepe</li>
        <li>Taberna La Esquinita</li>
        <li>Chiringuito Sol y Sombra</li>
      </ul>
      <div>
        <button onClick={() => handleSeleccionLocal('barra')}>Comer en barra</button>
        <button onClick={() => handleSeleccionLocal('mesa')}>Comer en mesa</button>
      </div>
    </div>
  );
};

export default LocalesCliente;