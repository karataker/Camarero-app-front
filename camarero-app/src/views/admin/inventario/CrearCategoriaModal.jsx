import React, { useState } from "react";
import Modal from "../../../components/Modal";
import { createCategoria } from "../../../services/inventarioService";
import "../../../styles/admin/inventario/categoriaModal.css";

const CrearCategoriaModal = ({ isOpen, onClose, barId, onCategoriaCreada }) => {
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nueva = await createCategoria({ nombre, barId });
      onCategoriaCreada(nueva);
      setNombre("");
      onClose();
    } catch {
      alert("Error al crear la categoría");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <h3>Crear nueva categoría</h3>
        <label>Nombre:
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Crear</button>
        </div>
      </form>
    </Modal>
  );
};

export default CrearCategoriaModal;