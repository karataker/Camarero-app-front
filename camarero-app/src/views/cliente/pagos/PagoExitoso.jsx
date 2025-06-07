import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/cliente/pagos/clientePagoExitoso.css";

const PagoExitoso = () => {
  const navigate = useNavigate();

  const barId = sessionStorage.getItem("barId");
  const mesaId = sessionStorage.getItem("mesaId");

  useEffect(() => {
    // Aquí puedes disparar llamadas a:
    // - /pedidos/crear
    // - /inventario/restar
    // etc.
    console.log(`Pago exitoso para bar ${barId}, mesa ${mesaId}`);
  }, [barId, mesaId]);

  const irAComandas = () => {
    navigate(`/cliente/${barId}/${mesaId}/comandas`);
  };

  return (
    <div className="pago-exitoso-view">
      <div className="check-container">
        <i className="fas fa-check-circle check-icon"></i>
        <h2>¡Pago efectuado correctamente!</h2>
        <p>Tu pedido ha sido registrado y comenzará su preparación.</p>
        <button className="btn-principal" onClick={irAComandas}>
          Ver el estado de mis comandas
        </button>
      </div>
    </div>
  );
};

export default PagoExitoso;