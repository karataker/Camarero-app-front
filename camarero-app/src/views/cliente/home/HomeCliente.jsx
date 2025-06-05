import React from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services//apiClient';
import '../../../styles/cliente/home/homeCliente.css';

const HomeCliente = () => {
  const navigate = useNavigate();


const handleLoginAndNavigate = async (rutaDestino) => {
  try {
    await login("9999", "clientetfm");
    navigate(rutaDestino);
  } catch (error) {
    console.error("Error en login automático:", error);
    alert("No se pudo iniciar sesión como cliente");
  }
};

  return (
    <div className="home-cliente-container">
      <h1>Bienvenido a Camarero App</h1>
      <div className="opciones-home">
        <div className="opcion" onClick={() => handleLoginAndNavigate('/reservar')}>
          <i className="fas fa-chair icono-opcion"></i>
          <p>Reservar mesa</p>
        </div>
        <div className="opcion" onClick={() => handleLoginAndNavigate('/escanear')}>
          <i className="fas fa-qrcode icono-opcion"></i>
          <p>Comer aquí y ahora / Escanear QR</p>
        </div>
        <div className="opcion" onClick={() => navigate('/cliente/carta')}>
          <i className="fas fa-utensils icono-opcion"></i>
          <p>Ver carta digital</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;