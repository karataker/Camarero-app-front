import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/cliente/pagos/clientePagoExitoso.css";
import { confirmarComanda } from "../../../services/facturacionService";
import { useCarrito } from "../../../context/carritoContext";


const PagoExitoso = () => {
  const navigate = useNavigate();
  const barId = sessionStorage.getItem("barId");
  const mesaId = sessionStorage.getItem("mesaId");

  useEffect(() => {
    const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];

    if (!barId || !mesaId || carrito.length === 0) return;

    const comandaPayload = {
      barId: parseInt(barId),
      mesaCodigo: mesaId, 
      items: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        productoId: item.id,
        precio: item.precio
      }))
    };

    confirmarComanda(comandaPayload)
      .then(() => {
        console.log("Comanda enviada correctamente");
        sessionStorage.removeItem("carrito");
      })
      .catch((err) => {
        console.error("Error al confirmar la comanda:", err);
      });
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