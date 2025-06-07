import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/cliente/pagos/clientePagoExitoso.css";

const PagoCancelado = () => {
  const navigate = useNavigate();


  const barId = sessionStorage.getItem("barId");
  const mesaId = sessionStorage.getItem("mesaId");    

  const volverACarta = () => {
    navigate(`/cliente/${barId}/${mesaId}`);
  };

  return (
    <div className="pago-exitoso-view">
      <div className="check-container cancelado">
        <i className="fas fa-times-circle check-icon cancelado"></i>
        <h2>Pago cancelado</h2>
        <p>Tu pago fue cancelado o no se completó.</p>
        <button className="btn-principal" onClick={volverACarta}>
          Volver a la carta
        </button>
      </div>
    </div>
  );
};

export default PagoCancelado;