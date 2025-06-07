import React from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services//apiClient';
import '../../../styles/cliente/home/homeCliente.css';

// Importar las imágenes
import imgReservarMesa from '../../../img/reservar_mesa.png';
import imgCartaAutopedidos from '../../../img/carta_autopedidos.png'; // Para "Ver Carta para empezar a pedir"
import imgVerCarta from '../../../img/ver_carta.png'; // Para "Ver Carta (Solo Lectura)"

const HomeCliente = () => {
  const navigate = useNavigate();

  const handleLoginAndNavigate = async (rutaDestino) => {
    try {
      // Este login es para las opciones que sí requieren interacción de cliente autenticado
      await login("9999", "clientetfm"); 
      navigate(rutaDestino);
    } catch (error) {
      console.error("Error en login automático:", error);
      alert("No se pudo iniciar sesión como cliente para esta acción.");
    }
  };

  // Función para la nueva opción de ver carta (solo lectura) mediante escaneo
  const handleEscanearParaVerCarta = () => {
    // Navega a una nueva ruta de escaneo específica para este flujo
    navigate('/escanear-ver-carta'); 
  };

  return (
    <div className="home-cliente-container">
      <h1>Bienvenido a Camarero App</h1>
      <div className="opciones-home">
        <div className="opcion" onClick={() => handleLoginAndNavigate('/reservar')}>
          {/* <i className="fas fa-chair icono-opcion"></i> */}
          <img src={imgReservarMesa} alt="Reservar mesa" className="imagen-opcion" />
          <p>Reservar mesa</p>
        </div>
        <div className="opcion" onClick={() => handleLoginAndNavigate('/escanear')}>
          {/* <i className="fas fa-qrcode icono-opcion"></i> */}
          <img src={imgCartaAutopedidos} alt="Ver Carta para empezar a pedir" className="imagen-opcion" />
          <p>Ver Carta para empezar a pedir</p>
        </div>
        <div className="opcion" onClick={handleEscanearParaVerCarta}>
          {/* <i className="fas fa-qrcode icono-opcion"></i>  */}
          <img src={imgVerCarta} alt="Ver Carta (Solo Lectura)" className="imagen-opcion" />
          <p>Ver Carta (Solo Lectura)</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCliente;