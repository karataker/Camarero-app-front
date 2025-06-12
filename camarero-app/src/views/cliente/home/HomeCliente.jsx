import React from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services//apiClient';
import '../../../styles/cliente/home/homeCliente.css';
import imgReservarMesa from '../../../img/reservar_mesa.png';
import imgCartaAutopedidos from '../../../img/carta_autopedidos.png';
import imgVerCarta from '../../../img/ver_carta.png';

const HomeCliente = () => {
  const navigate = useNavigate();

  const handleLoginAndNavigate = async (rutaDestino) => {
    try {
      await login("9999", "clientetfm"); 
      navigate(rutaDestino);
    } catch (error) {
      console.error("Error en login automático:", error);
      alert("No se pudo iniciar sesión como cliente para esta acción.");
    }
  };


  return (
    <div className="home-cliente-container">
      <h1>Bienvenido a nuestro bar digital</h1>
      <div className="opciones-home">
        <div className="opcion" onClick={() => handleLoginAndNavigate('/reservar')}>
          <img src={imgReservarMesa} alt="Reservar mesa" className="imagen-opcion" />
          <p>Reservar mesa</p>
        </div>
        <div className="opcion" onClick={() => handleLoginAndNavigate('/escanear')}>
          <img src={imgCartaAutopedidos} alt="Ver Carta para empezar a pedir" className="imagen-opcion" />
          <p>Ver Carta para empezar a pedir</p>
        </div>
        <div className="opcion" onClick={() => handleLoginAndNavigate('/escanear-ver-carta')}>
          <img src={imgVerCarta} alt="Ver Carta (Solo Lectura)" className="imagen-opcion" />
          <p>Ver Carta (Solo Lectura)</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;