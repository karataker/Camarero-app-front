import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPedidosByBarConDetalles,
  getProveedoresByBar
} from "../../../services/inventarioService";
import "../../../styles/admin/compras/compras.css";
import ProveedorCrud from "./ProveedorCrud";
import CrearPedidoModal from "./CrearPedidoModal";

const AdminComprasView = () => {
  const { barId } = useParams();
  const [pedidos, setPedidos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [totalHistorico, setTotalHistorico] = useState(0);
  const [totalUltimoMes, setTotalUltimoMes] = useState(0);
  const [mostrarCrearPedido, setMostrarCrearPedido] = useState(false);
  const [detallesExpandido, setDetallesExpandido] = useState({});

  useEffect(() => {
    if (!barId) return;

    getPedidosByBarConDetalles(barId).then(data => {
      setPedidos(data);
      calcularTotales(data);
    });

    getProveedoresByBar(barId).then(setProveedores);
  }, [barId]);

  const calcularTotales = (pedidos) => {
    const ahora = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(ahora.getMonth() - 1);

    let total = 0;
    let totalMes = 0;

    pedidos.forEach(p => {
      total += p.total;
      const fechaPedido = new Date(p.fecha);
      if (fechaPedido >= haceUnMes) {
        totalMes += p.total;
      }
    });

    setTotalHistorico(total);
    setTotalUltimoMes(totalMes);
  };

  const toggleExpandido = (pedidoId) => {
    setDetallesExpandido(prev => ({
      ...prev,
      [pedidoId]: !prev[pedidoId]
    }));
  };

  return (
    <div className="admin-compras-view">
      <h2>Compras</h2>

      <div className="resumen-cards">
        <div className="card resumen-card total-historico">
            <p>Total gastado</p>
            <h2>{totalHistorico.toFixed(2)} €</h2>
        </div>
        <div className="card resumen-card total-mes">
            <p>En el último mes</p>
            <h2>{totalUltimoMes.toFixed(2)} €</h2>
        </div>
    </div>
      <h3>Pedidos a proveedores</h3>
      <div className="crear-pedido-wrapper">
            <button className="btn btn-primary" onClick={() => setMostrarCrearPedido(true)}>
                + Nuevo Pedido
            </button>
      </div>
      <div className="tabla-wrapper">
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Total</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.fecha).toLocaleDateString()}</td>
                <td>{proveedores.find(pr => pr.id === p.proveedorId)?.nombre || '-'}</td>
                <td>{p.total.toFixed(2)} €</td>
                <td>
                  <ul className={`pedido-detalles ${detallesExpandido[p.id] ? "expandido" : ""}`}>
                    {p.detalles.slice(0, detallesExpandido[p.id] ? p.detalles.length : 3).map((d, idx) => (
                      <li key={idx}>{d.productoNombre || d.productoId}: {d.cantidad} x {d.precio.toFixed(2)} €</li>
                    ))}
                  </ul>
                  {p.detalles.length > 3 && (
                    <button onClick={() => toggleExpandido(p.id)} className="ver-mas">
                      {detallesExpandido[p.id] ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Gestión de proveedores</h3>
      <ProveedorCrud barId={parseInt(barId)} />

      {mostrarCrearPedido && (
        <CrearPedidoModal
          barId={parseInt(barId)}
          onClose={() => setMostrarCrearPedido(false)}
          onPedidoCreado={() => {
            getPedidosByBarConDetalles(barId).then(data => {
              setPedidos(data);
              calcularTotales(data);
              setMostrarCrearPedido(false);
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminComprasView;
