import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../../styles/cliente/carta/clienteCartaDigital.css';
import { getProductosByBar, getCategoriasByBar, getRacionesDisponibles } from '../../../services/menuService';
import { obtenerBarPorId } from '../../../services/barService';

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
  frutos_secos: FrutoSeco,
  huevo: Huevo
};

const nombresTooltip = {
  gluten: "Contiene gluten",
  lacteos: "Contiene lácteos",
  sulfitos: "Contiene sulfitos",
  frutos_secos: "Contiene frutos secos",
  huevo: "Contiene huevo"
};

const iconosCategoria = {
  Bebidas: "fa-martini-glass",
  Tapas: "fa-cheese",
  "Platos principales": "fa-utensils",
  Postres: "fa-ice-cream",
  Todos: "fa-th"
};

const VerCartaSoloLecturaView = () => {
  const [nombreBar, setNombreBar] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const { barId } = useParams();

  useEffect(() => {
    const cargarCartaYBar = async () => {
      if (!barId) {
        setError("No se ha especificado un bar.");
        setCargando(false);
        return;
      }
      setCargando(true);
      setError(null);
      try {
        const [barData, categoriasData, productosData] = await Promise.all([
            obtenerBarPorId(barId),
            getCategoriasByBar(barId),
            getProductosByBar(barId)
        ]);

        if (barData && barData.nombre) {
            setNombreBar(barData.nombre);
        } else {
            setNombreBar(`Bar ${barId}`);
            console.warn(`VerCartaSoloLecturaView: Nombre del bar no encontrado para barId: ${barId}`);
        }
        
        setCategorias(categoriasData || []);

        const productosConRaciones = await Promise.all(
          (productosData || []).map(async (p) => {
            try {
              const raciones = await getRacionesDisponibles(p.id);
              return { ...p, disponible: raciones > 0, raciones };
            } catch (e) {
              console.error(`Error al obtener raciones para producto ${p.id}:`, e);
              return { ...p, disponible: false, raciones: 0 };
            }
          })
        );
        setProductos(productosConRaciones);
      } catch (err) {
        console.error("Error al cargar la carta y el bar:", err);
        setError("No se ha podido cargar la información. Inténtalo de nuevo más tarde.");
        setNombreBar(`Bar ${barId}`);
      } finally {
        setCargando(false);
      }
    };

    cargarCartaYBar();
  }, [barId]);

  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === 'all' || (producto.categoria && producto.categoria.id === parseInt(categoriaSeleccionada));
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  const renderAlergenos = (producto) => (
    <div className="producto-alergenos">
      {Object.entries(iconosAlergenos).map(([key, icon]) =>
        producto[key] ? (
          <div className="tooltip-wrapper" key={key}>
            <img src={icon} alt={key} className="alergeno-icono" />
            <span className="tooltip-text">{nombresTooltip[key]}</span>
          </div>
        ) : null
      )}
    </div>
  );
  
  if (cargando) return <div className="carta-cargando"><i className="fas fa-spinner fa-spin"></i> Cargando carta...</div>;
  if (error) return <div className="carta-error"><i className="fas fa-exclamation-triangle"></i> {error}</div>;

  return (
    <>

      <div className="carta-header">
        <h2>Carta Digital{nombreBar && ` - ${nombreBar}`}</h2>
        <div className="carta-busqueda">
          <input
            type="text"
            placeholder="Buscar plato o bebida..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
      </div>

      <div className="carta-digital">
        <div className="categorias-tabs">
          <button className={`categoria-tab ${categoriaSeleccionada === 'all' ? 'activa' : ''}`} onClick={() => setCategoriaSeleccionada('all')}>
            <i className={`fas ${iconosCategoria['Todos']}`}></i> Todos
          </button>
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              className={`categoria-tab ${categoriaSeleccionada === categoria.id.toString() ? 'activa' : ''}`}
              onClick={() => setCategoriaSeleccionada(categoria.id.toString())}
            >
              <i className={`fas ${iconosCategoria[categoria.nombre] || 'fa-tag'}`}></i> {categoria.nombre}
            </button>
          ))}
        </div>

        <div className="productos-grid">
          {productosFiltrados.length === 0 ? (
            <div className="no-productos">
              <i className="fas fa-search"></i>
              <p>No se encontraron productos que coincidan con tu búsqueda o filtro.</p>
            </div>
          ) : (
            productosFiltrados.map(producto => (
              <div key={producto.id} className="producto-card">
                <div className="producto-imagen">
                  <img src={producto.imagen || Plato} alt={producto.nombre} />
                  {!producto.disponible && (
                    <div className="producto-no-disponible">
                      <span>No disponible</span>
                    </div>
                  )}
                </div>
                <div className="producto-info">
                  <h3>{producto.nombre}</h3>
                  <p className="producto-descripcion">{producto.descripcion}</p>
                  <div className="producto-footer">
                    <div className="producto-precio">
                      {producto.precio.toFixed(2)} €
                    </div>
                    {renderAlergenos(producto)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default VerCartaSoloLecturaView;