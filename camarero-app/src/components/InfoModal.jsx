import React from 'react';
import '../styles/infoModal.css';

const InfoModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Sobre nosotros</h2>
        <p>
          <strong>Camarero App</strong> es una solución digital para bares pequeños. Ofrecemos:
        </p>
        <ul>
          <li>Pedidos en mesa o barra desde el móvil del cliente</li>
          <li>Gestión de comandas para el personal</li>
          <li>Organización del almacén</li>
        </ul>
        <p>Hecho con el cora usando React y Spring Boot.</p>
      </div>
    </div>
  );
};

export default InfoModal;