import React, { useState } from "react";
import { useInventario } from "../../../hooks/useInventario";
import { useParams } from "react-router-dom";
import AjustarStockModal from "./AjustarStockModal";
import InventarioModal from "./InventarioModal";
import "../../../styles/admin/inventario/inventario.css";
import ProveedorPedidosModal from "./ProveedorPedidosModal";

const AdminInventarioView = () => {
  const { barId } = useParams();
  const {
    productos,
    cargando,
    error,
    eliminarProducto,
    cargarInventario,
    crearProducto,
    actualizarProducto,
  } = useInventario(barId);

  const [productoAjustar, setProductoAjustar] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [abrirModal, setAbrirModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriasVisibles, setCategoriasVisibles] = useState({});
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const handleCrearNuevo = () => {
    setProductoEditar(null);
    setAbrirModal(true);
  };

  const handleEditar = (prod) => {
    setProductoEditar(prod);
    setAbrirModal(true);
  };

  const toggleCategoria = (nombre) => {
    setCategoriasVisibles(prev => ({
      ...prev,
      [nombre]: !prev[nombre]
    }));
  };

  const handleVerPedidosProveedor = (proveedorId) => {
    setProveedorSeleccionado(proveedorId);
  };

  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosPorCategoria = productosFiltrados.reduce((acc, prod) => {
    const cat = prod.categoria?.nombre || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(prod);
    return acc;
  }, {});

  if (cargando) return <p>Cargando inventario...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="admin-inventario-view">
      <h2>Inventario</h2>

      <div className="inventario-header">
        <button onClick={handleCrearNuevo}>+ Añadir producto</button>
        <div className="buscador-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="buscador-input"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {Object.entries(productosPorCategoria).map(([categoria, items]) => (
        <div key={categoria} className="categoria-section">
          <h3 onClick={() => toggleCategoria(categoria)}>
            <span>{categoria}</span>
            <span className={`categoria-caret ${categoriasVisibles[categoria] ? "open" : ""}`}>
              ▼
            </span>
          </h3>
          {categoriasVisibles[categoria] && (
            <div className="tabla-wrapper">
              <table className="inventario-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Proveedor</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((prod) => (
                    <tr
                      key={prod.id}
                      className={prod.stockActual < prod.stockMinimo ? "bajo-stock" : ""}
                    >
                      <td>{prod.nombre}</td>
                      <td>{prod.unidad}</td>
                      <td>{prod.stockActual}</td>
                      <td>{prod.stockMinimo}</td>
                      <td>
                        {prod.proveedor ? (
                          <button
                            className="link-button"
                            onClick={() => handleVerPedidosProveedor(prod.proveedor.id)}
                          >
                            {prod.proveedor.nombre}
                          </button>
                        ) : "-"}
                      </td>
                      <td>
                        <button onClick={() => handleEditar(prod)}>Editar</button>
                        <button onClick={() => eliminarProducto(prod.id)}>Eliminar</button>
                        <button onClick={() => setProductoAjustar(prod)}>Ajustar Stock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {productoAjustar && (
        <AjustarStockModal
          producto={productoAjustar}
          onClose={() => setProductoAjustar(null)}
          onAjustado={cargarInventario}
        />
      )}

      {abrirModal && (
        <InventarioModal
          isOpen={abrirModal}
          onClose={() => setAbrirModal(false)}
          onSuccess={cargarInventario}
          barId={parseInt(barId)}
          producto={productoEditar}
        />
      )}
      {proveedorSeleccionado && (
        <ProveedorPedidosModal
          proveedorId={proveedorSeleccionado}
          onClose={() => setProveedorSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default AdminInventarioView;