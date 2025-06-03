import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import {
  getProveedoresByBar,
  getInventarioByBar,
  createPedidoConDetalles
} from "../../../services/inventarioService";
import "../../../styles/admin/compras/crearPedidoModal.css";

const CrearPedidoModal = ({ barId, onClose, onPedidoCreado }) => {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState({
  proveedorId: "",
  fecha: new Date().toISOString().split("T")[0],
  detalles: [],
  barId: barId,  
})

  useEffect(() => {
    getProveedoresByBar(barId).then(setProveedores);
    getInventarioByBar(barId).then(setProductos);
  }, [barId]);

  const handleAgregarDetalle = () => {
    setPedido((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { productoId: "", cantidad: "", precio: "" }],
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...pedido.detalles];
    nuevosDetalles[index][field] = field === "cantidad" || field === "precio" ? parseFloat(value) : value;
    setPedido((prev) => ({ ...prev, detalles: nuevosDetalles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPedidoConDetalles(pedido);
      onPedidoCreado();
      onClose();
    } catch {
      alert("Error al crear el pedido");
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} className="modal-form">
        <h2>Nuevo Pedido</h2>

        <label>Proveedor:
          <select
            required
            value={pedido.proveedorId}
            onChange={(e) => setPedido({ ...pedido, proveedorId: parseInt(e.target.value) })}
          >
            <option value="">Selecciona proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </label>

        <label>Fecha:
          <input
            type="date"
            value={pedido.fecha}
            onChange={(e) => setPedido({ ...pedido, fecha: e.target.value })}
          />
        </label>

        <h4>Detalles</h4>
       {pedido.detalles.map((detalle, idx) => (
        <div key={idx} className="detalle-item">
            <select
            value={detalle.productoId}
            onChange={(e) => handleDetalleChange(idx, "productoId", e.target.value)}
            required
            >
            <option value="">Producto</option>
            {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
            </select>
            <input
            type="number"
            value={detalle.cantidad}
            onChange={(e) => handleDetalleChange(idx, "cantidad", e.target.value)}
            placeholder="Cantidad de producto"
            min="0"
            required
            />
            <input
            type="number"
            step="any"
            inputMode="decimal"
            value={detalle.precio}
            onChange={(e) => handleDetalleChange(idx, "precio", e.target.value)}
            placeholder="Precio Unidad"
            min="0"
            required
            />
            <button
            type="button"
            className="btn-eliminar-detalle"
            onClick={() => {
                const nuevos = [...pedido.detalles];
                nuevos.splice(idx, 1);
                setPedido(prev => ({ ...prev, detalles: nuevos }));
            }}
            title="Eliminar producto"
            >
            &times;
            </button>
        </div>
        ))}


        <button type="button" onClick={handleAgregarDetalle}>+ Añadir producto</button>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar Pedido</button>
        </div>
      </form>
    </Modal>
  );
};

export default CrearPedidoModal;