import React, { useEffect, useState } from "react";
import {
  getProveedoresByBar,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../../../services/inventarioService";
import "../../../styles/admin/compras/proveedorCrud.css";

const ProveedorCrud = ({ barId }) => {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", id: null });
  const [modoEditar, setModoEditar] = useState(false);

  useEffect(() => {
    cargarProveedores();
  }, [barId]);

  const cargarProveedores = async () => {
    const data = await getProveedoresByBar(barId);
    setProveedores(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEditar) {
        await updateProveedor(form.id, form);
      } else {
        await createProveedor({ ...form, barId });
      }
      setForm({ nombre: "", telefono: "", email: "", id: null });
      setModoEditar(false);
      cargarProveedores();
    } catch {
      alert("Error al guardar proveedor");
    }
  };

  const handleEditar = (prov) => {
    setForm(prov);
    setModoEditar(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar proveedor?")) {
      await deleteProveedor(id);
      cargarProveedores();
    }
  };

  return (
    <div className="proveedor-crud">
      <h3>Proveedores</h3>
      <form onSubmit={handleSubmit} className="proveedor-form">
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Teléfono"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit">{modoEditar ? "Actualizar" : "Crear"}</button>
        {modoEditar && <button type="button" onClick={() => {
          setForm({ nombre: "", telefono: "", email: "", id: null });
          setModoEditar(false);
        }}>Cancelar</button>}
      </form>

      <table className="proveedor-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.telefono || "-"}</td>
              <td>{p.email || "-"}</td>
              <td>
                <button onClick={() => handleEditar(p)}>Editar</button>
                <button onClick={() => handleEliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProveedorCrud;
