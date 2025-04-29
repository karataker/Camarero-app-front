import React from 'react';

const AlmacenAdmin = () => {
  return (
    <div>
      <h2>Gestión de Almacén</h2>
      <ul>
        <li>Pan - 30 unidades</li>
        <li>Cerveza - 50 botellas</li>
        <li>Queso - 10 bloques</li>
      </ul>
      <button onClick={() => alert('Funcionalidad futura para añadir stock')}>Añadir stock</button>
    </div>
  );
};

export default AlmacenAdmin;