import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductosByBar,
  deleteProducto,
  getRacionesDisponibles,
  getCategoriasByBar
} from "../../../services/menuService";
import ProductoModal from "./ProductoModal";
import "../../../styles/admin/carta/carta.css";
import Plato from "../../../img/PlatoDefault.png";
import FrutoSeco from "../../../img/IconoAlergenoFrutosSecos.png";
import Sulfitos from "../../../img/IconoAlergenoDioxidoAzufre.png";
import Gluten from "../../../img/IconoAlergenoGluten.png";
import Lacteo from "../../../img/IconoAlergenoLacteos.png";
import Huevo from "../../../img/IconoAlergenoHuevo.png";

const iconosAlergenos = {
  gluten: Gluten,
  lacteos: Lacteo,
  sulfitos: Sulfitos,
  frutosSecos: FrutoSeco,
  huevo: Huevo
};

const nombresTooltip = {
  gluten: "Contiene gluten",
  lacteos: "Contiene lácteos",
  sulfitos: "Contiene sulfitos",
  frutosSecos: "Contiene frutos secos",
  huevo: "Contiene huevo"
};

const iconosCategoria = {
  Bebidas: "fa-martini-glass",
  Tapas: "fa-cheese",
  "Platos principales": "fa-utensils",
  Postres: "fa-ice-cream",
  Todos: "fa-table-cells"
};

const AdminCartaView = () => {
  const { barId } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats] = await Promise.all([
        getProductosByBar(barId),
        getCategoriasByBar(barId)
      ]);
      setCategorias(cats);

      const productosConRaciones = await Promise.all(
        prods.map(async (p) => {
          try {
            const raciones = await getRacionesDisponibles(p.id);
            return { ...p, raciones };
          } catch {
            return { ...p, raciones: null };
          }
        })
      );
      setProductos(productosConRaciones);
    } catch (err) {
      setError("Error al cargar productos");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteProducto(id);
      await cargarDatos();
    } catch {
      alert("No se pudo eliminar el producto");
    }
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setProductoEditando(null);
    setModalVisible(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [barId]);

  useEffect(() => {
    setBusqueda("");
  }, [categoriaSeleccionada]);

  const obtenerClaseRaciones = (raciones) => {
    if (raciones === null || raciones === undefined) return "raciones-desconocido";
    if (raciones === 0) return "raciones-sin";
    return "raciones-ok";
  };

  const productosFiltrados = productos
    .filter((p) => categoriaSeleccionada === "all" || p.categoria?.id === categoriaSeleccionada)
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="admin-carta-view">
      <div className="carta-header">
        <h2>Carta del Bar</h2>
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

      <div className="categorias-tabs">
        <button className={`categoria-tab ${categoriaSeleccionada === "all" ? "activa" : ""}`} onClick={() => setCategoriaSeleccionada("all")}>
          <i className="fas fa-th"></i> Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`categoria-tab ${categoriaSeleccionada === cat.id ? "activa" : ""}`}
            onClick={() => setCategoriaSeleccionada(cat.id)}
          >
            <i className={`fa-solid ${iconosCategoria[cat.nombre] || "fa-tag"}`}></i> {cat.nombre}
          </button>
        ))}
      </div>

      <div className="carta-grid">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="carta-item">
            <h4>{prod.nombre}</h4>
            <div className="card-image-container">
              <img src={prod.imagen || Plato} alt={prod.nombre} />
            </div>
            <p>{prod.descripcion}</p>
            <span className="precio">{prod.precio} €</span>
            <span className={`stock-tag ${obtenerClaseRaciones(prod.raciones)}`}>
              <i className="fas fa-box-open"></i>{" "}
              {prod.raciones === 0 ? "Sin Stock" : `Stock: ${prod.raciones}`}
            </span>
            <div className="producto-alergenos">
              {Object.entries(iconosAlergenos).map(([key, icon]) =>
                prod[key] ? (
                  <div className="tooltip-wrapper" key={key}>
                    <img src={icon} alt={key} className="alergeno-icono" />
                    <span className="tooltip-text">{nombresTooltip[key]}</span>
                  </div>
                ) : null
              )}
            </div>
            <div className="acciones">
              <button onClick={() => handleEditar(prod)}>Editar</button>
              <button onClick={() => handleEliminar(prod.id)}>Eliminar</button>
            </div>
          </div>
        ))}

        <div
          className="carta-item producto-add"
          role="button"
          tabIndex={0}
          onClick={() => setModalVisible(true)}
          onKeyDown={(e) => e.key === "Enter" && setModalVisible(true)}
        >
          <div className="producto-add-content">
            <i className="fas fa-plus fa-2x"></i>
            <span>Añadir Producto</span>
          </div>
        </div>
      </div>

      {modalVisible && (
        <ProductoModal
          barId={barId}
          isOpen={modalVisible}
          onClose={handleCerrarModal}
          onSave={cargarDatos}
          producto={productoEditando}
        />
      )}
    </div>
  );
};

export default AdminCartaView;
