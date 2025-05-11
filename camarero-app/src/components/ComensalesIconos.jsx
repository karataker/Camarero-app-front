import React from 'react';
import '../styles/comensalesIconos.css';

const ComensalesIconos = ({ cantidad, maxIconos = 4 }) => {
  if (cantidad > maxIconos) {
    return (
      <div className="comensales-container">
        <i className="fas fa-users comensales-icon"></i>
        <span className="comensales-cantidad">x{cantidad}</span>
      </div>
    );
  }

  return (
    <div className="comensales-container">
      {[...Array(cantidad)].map((_, index) => (
        <i key={index} className="fas fa-user comensales-icon"></i>
      ))}
    </div>
  );
};

export default ComensalesIconos;
