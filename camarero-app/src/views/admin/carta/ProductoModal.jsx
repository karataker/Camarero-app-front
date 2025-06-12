import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import {
  createProductoMenu,
  updateProductoMenu,
  getProductoMenu,
  getCategoriasByBar
} from "../../../services/menuService";
import { getInventarioByBar } from "../../../services/inventarioService";
import "../../../styles/admin/carta/productoModal.css";

const ProductoModal = ({ isOpen, onClose, producto, barId, onSave }) => {
  const isEdit = !!producto;

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    categoriaId: null,
    visible: true,
    inventarioIdDirecto: null,
    ingredientes: [],
    barId: parseInt(barId),
    gluten: false,
    lacteos: false,
    sulfitos: false,
    frutosSecos: false,
    huevo: false,
  });

  const [inventario, setInventario] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    getInventarioByBar(barId).then(setInventario);
    getCategoriasByBar(barId).then(setCategorias);

    if (isEdit) {
      getProductoMenu(producto.id).then((data) =>
        setForm((prev) => ({
          ...prev,
          ...data,
          categoriaId: data.categoria?.id || null,
        }))
      );
    }
  }, [barId, isEdit, producto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAgregarIngrediente = () => {
    setForm((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { productoInventarioId: "", cantidadPorRacion: 0 }],
    }));
  };

  const handleIngredienteChange = (i, field, value) => {
    const copia = [...form.ingredientes];
    copia[i][field] = field === "cantidadPorRacion" ? parseFloat(value) : parseInt(value);
    setForm({ ...form, ingredientes: copia });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      categoria: form.categoriaId ? { id: parseInt(form.categoriaId) } : null
    };

    if (isEdit) {
      await updateProductoMenu(producto.id, data);
    } else {
      await createProductoMenu(data);
    }
    onSave();
    onClose();
  };

// Filtrado inventario para productos simples e ingredientes
 const inventarioParaProductoSimple = inventario.filter(
  (item) =>
    item.categoria?.nombre !== "Limpieza" &&
    item.categoria?.nombre !== "Otros"
);

const inventarioParaIngredientes = inventario.filter(
  (item) => item.categoria?.nombre === "Ingredientes"
);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="carta-form">
        <h2>{isEdit ? "Editar" : "Nuevo"} Producto de Carta</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre:
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>

          <label>
            Descripción:
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
          </label>

          <label>
            Precio:
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Categoría:
            <select
              name="categoriaId"
              value={form.categoriaId || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona categoría --</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Producto Simple (Inventario):
            <select
              name="inventarioIdDirecto"
              value={form.inventarioIdDirecto || ""}
              onChange={handleChange}
            >
              <option value="">-- Ninguno --</option>
              {inventarioParaProductoSimple.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {p.unidad}
                </option>
              ))}
            </select>
          </label>

          <h4>Alérgenos</h4>
          <div className="alergenos-checkboxes">
            {["gluten", "lacteos", "sulfitos", "frutosSecos", "huevo"].map((al) => (
              <label key={al}>
                <input type="checkbox" name={al} checked={form[al]} onChange={handleChange} />
                {al.charAt(0).toUpperCase() + al.slice(1)}
              </label>
            ))}
          </div>

          <h4>Ingredientes (para platos compuestos)</h4>
          {form.ingredientes.map((ing, i) => (
            <div key={i} className="ingrediente-item">
              <select
                value={ing.productoInventarioId}
                onChange={(e) => handleIngredienteChange(i, "productoInventarioId", e.target.value)}
              >
                <option value="">-- Selecciona producto --</option>
                {inventarioParaIngredientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {p.unidad}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad por ración"
                value={ing.cantidadPorRacion}
                onChange={(e) => handleIngredienteChange(i, "cantidadPorRacion", e.target.value)}
              />
              <button
                type="button"
                className="btn-eliminar-ingrediente"
                onClick={() => {
                  const copia = form.ingredientes.filter((_, index) => index !== i);
                  setForm((prev) => ({ ...prev, ingredientes: copia }));
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAgregarIngrediente}>
            + Añadir Ingrediente
          </button>

          <div className="form-actions">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProductoModal;
