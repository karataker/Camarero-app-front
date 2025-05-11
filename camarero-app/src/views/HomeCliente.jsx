import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homeCliente.css';

const HomeCliente = () => {
  const navigate = useNavigate();

  return (
    <div className="home-cliente-container">
      <h1>Bienvenido a Camarero App</h1>
      <div className="opciones-home">
        <div className="opcion" onClick={() => navigate('/reservar')}>
          <i className="fas fa-chair icono-opcion"></i>
          <p>Reservar mesa</p>
        </div>
        <div className="opcion" onClick={() => navigate('/escanear')}>
          <i className="fas fa-qrcode icono-opcion"></i>
          <p>Escanear QR</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;