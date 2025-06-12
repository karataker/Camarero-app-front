import React, { useState } from "react";
import {
  ajustarEntrada,
  ajustarSalida,
} from "../../../services/inventarioService";
import "../../../styles/admin/inventario/inventarioModal.css";

const AjustarStockModal = ({ producto, onClose, onAjustado }) => {
  const [modo, setModo] = useState("entrada");
  const [cantidad, setCantidad] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modo === "entrada") {
        await ajustarEntrada(producto.id, cantidad);
      } else {
        await ajustarSalida(producto.id, cantidad);
      }
      onAjustado();
      onClose();
    } catch (err) {
      alert("Error al ajustar stock");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="simple-modal-content">
        <form onSubmit={handleSubmit} className="modal-form">
          <h3>Ajustar stock de <strong>{producto.nombre}</strong></h3>

          <label>
            Modo:
            <select value={modo} onChange={(e) => setModo(e.target.value)}>
              <option value="entrada">Entrada (+)</option>
              <option value="salida">Salida (-)</option>
            </select>
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              min="0"
              value={cantidad}
              onChange={(e) => setCantidad(parseFloat(e.target.value))}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjustarStockModal;
