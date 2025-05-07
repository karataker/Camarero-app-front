import React from 'react';
import '../styles/reservaModal.css';

const ReservaModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <i className="fas fa-check-circle icono-exito"></i>
        <h3>¡Reserva completada!</h3>
        <p>Se ha descargado la carta del día en PDF.</p>
        <button onClick={onClose}>
          <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
          Volver
        </button>
      </div>
    </div>
  );
};

export default ReservaModal;