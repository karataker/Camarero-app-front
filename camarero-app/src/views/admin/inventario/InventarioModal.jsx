import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import CrearCategoriaModal from "./CrearCategoriaModal";
import {
  createProductoInventario,
  updateProductoInventario,
  getCategoriasByBar,
  getProveedoresByBar,
} from "../../../services/inventarioService";
import "../../../styles/admin/inventario/inventarioModal.css";

const InventarioModal = ({ isOpen, onClose, onSuccess, producto, barId }) => {
  const isEdit = !!producto;

  const [form, setForm] = useState({
    nombre: "",
    unidad: "",
    stockActual: 0,
    stockMinimo: 0,
    proveedorId: "",
    categoriaId: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setForm({
        nombre: producto.nombre || "",
        unidad: producto.unidad || "",
        stockActual: producto.stockActual || 0,
        stockMinimo: producto.stockMinimo || 0,
        proveedorId: producto.proveedor?.id || "",
        categoriaId: producto.categoria?.id || "",
      });
    }

    if (barId) {
      getCategoriasByBar(barId).then(setCategorias);
      getProveedoresByBar(barId).then(setProveedores);
    }
  }, [producto, barId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        barId,
        categoria: form.categoriaId ? { id: parseInt(form.categoriaId) } : null,
        proveedor: form.proveedorId ? { id: parseInt(form.proveedorId) } : null,
      };

      delete payload.categoriaId;
      delete payload.proveedorId;
      if (isEdit) {
        await updateProductoInventario(producto.id, payload);
      } else {
        await createProductoInventario(payload);
      }
      onSuccess();
      onClose();
    } catch {
      alert("Error al guardar");
    }
  };

  const handleCategoriaCreada = (nuevaCategoria) => {
    setCategorias((prev) => [...prev, nuevaCategoria]);
    setForm((prev) => ({ ...prev, categoriaId: nuevaCategoria.id }));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit} className="modal-form">
          <h2>{isEdit ? "Editar" : "Nuevo"} Producto</h2>

          <label>Nombre:
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>

          <label>Unidad:
            <input name="unidad" value={form.unidad} onChange={handleChange} required />
          </label>

          <label>Stock actual:
            <input type="number" name="stockActual" value={form.stockActual} onChange={handleChange} />
          </label>

          <label>Stock mínimo:
            <input type="number" name="stockMinimo" value={form.stockMinimo} onChange={handleChange} />
          </label>

          <label>Categoría:
            <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required>
              <option value="">Selecciona categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          <button type="button" className="inline-button" onClick={() => setShowCategoriaModal(true)}>
            + Nueva categoría
          </button>

          <label>Proveedor:
            <select name="proveedorId" value={form.proveedorId} onChange={handleChange}>
              <option value="">Selecciona proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </Modal>

      {showCategoriaModal && (
        <CrearCategoriaModal
          isOpen={showCategoriaModal}
          onClose={() => setShowCategoriaModal(false)}
          barId={barId}
          onCategoriaCreada={handleCategoriaCreada}
        />
      )}
    </>
  );
};

export default InventarioModal;
