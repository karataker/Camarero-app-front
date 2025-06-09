import React, { useState } from "react";
import { useInventario } from "../../../hooks/useInventario";
import { useParams } from "react-router-dom";
import AjustarStockModal from "./AjustarStockModal";
import InventarioModal from "./InventarioModal";
import AdminNavigation from "../../../components/AdminNavigation"; // <-- AÑADIR IMPORT
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
      {/* Añadir navegación de admin */}
      <AdminNavigation />
      
      <div className="inventario-header-main">
        <h2>Inventario</h2>
      </div>

      <div className="inventario-header">
        <button onClick={handleCrearNuevo} className="btn-crear-producto">
          <i className="fas fa-plus"></i> Añadir producto
        </button>
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
          <h3 onClick={() => toggleCategoria(categoria)} className="categoria-header">
            <span>{categoria}</span>
            <span className={`categoria-caret ${categoriasVisibles[categoria] ? "open" : ""}`}>
              <i className={`fas ${categoriasVisibles[categoria] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
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
                      <td>
                        <div className="producto-nombre">
                          {prod.stockActual < prod.stockMinimo && (
                            <i className="fas fa-exclamation-triangle stock-warning" title="Stock bajo"></i>
                          )}
                          {prod.nombre}
                        </div>
                      </td>
                      <td>{prod.unidad}</td>
                      <td>
                        <span className={prod.stockActual < prod.stockMinimo ? "stock-bajo" : "stock-ok"}>
                          {prod.stockActual}
                        </span>
                      </td>
                      <td>{prod.stockMinimo}</td>
                      <td>
                        {prod.proveedor ? (
                          <button
                            className="link-button"
                            onClick={() => handleVerPedidosProveedor(prod.proveedor.id)}
                            title={`Ver pedidos de ${prod.proveedor.nombre}`}
                          >
                            {prod.proveedor.nombre}
                          </button>
                        ) : (
                          <span className="sin-proveedor">Sin proveedor</span>
                        )}
                      </td>
                      <td>
                        <div className="acciones-inventario">
                          <button 
                            onClick={() => handleEditar(prod)} 
                            className="btn-accion btn-editar"
                            title="Editar producto"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => eliminarProducto(prod.id)} 
                            className="btn-accion btn-eliminar"
                            title="Eliminar producto"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button 
                            onClick={() => setProductoAjustar(prod)} 
                            className="btn-accion btn-ajustar"
                            title="Ajustar stock"
                          >
                            <i className="fas fa-boxes"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {Object.keys(productosPorCategoria).length === 0 && (
        <div className="inventario-vacio">
          <i className="fas fa-box-open"></i>
          <p>No hay productos en el inventario</p>
          <button onClick={handleCrearNuevo} className="btn-crear-primer-producto">
            Crear primer producto
          </button>
        </div>
      )}

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