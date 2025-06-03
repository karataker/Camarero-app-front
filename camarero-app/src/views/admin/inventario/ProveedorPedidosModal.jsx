import React, { useEffect, useState } from "react";
import { getPedidosByProveedor } from "../../../services/inventarioService";
import Modal from "../../../components/Modal";
import "../../../styles/admin/inventario/proveedorPedidosModal.css";

const ProveedorPedidosModal = ({ proveedorId, onClose }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (proveedorId) {
      getPedidosByProveedor(proveedorId)
        .then((data) => setPedidos(data))
        .catch((err) => setError("Error al cargar pedidos"))
        .finally(() => setLoading(false));
    }
  }, [proveedorId]);

  return (
    <Modal isOpen={true} onClose={onClose}>
    <div className="proveedor-pedidos-modal">
        <h3>Pedidos del proveedor</h3>

        {pedidos.length > 0 ? (
        <table className="tabla-pedidos-proveedor">
            <thead>
            <tr>
                <th>Fecha</th>
                <th>Total (€)</th>
            </tr>
            </thead>
            <tbody>
            {pedidos.map(pedido => (
                <tr key={pedido.id}>
                <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                <td>{pedido.total.toFixed(2)}</td>
                </tr>
            ))}
            </tbody>
        </table>
        ) : (
        <p className="pedidos-empty">Este proveedor no tiene pedidos registrados.</p>
        )}

        <div className="modal-actions">
        <button onClick={onClose}>Cerrar</button>
        </div>
    </div>
    </Modal>
  );
};

export default ProveedorPedidosModal;
