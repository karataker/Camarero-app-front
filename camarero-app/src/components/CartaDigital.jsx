import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/cartaDigital.css';

const CartaDigital = ({ onAddToOrder, readOnly = false }) => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const { barId } = useParams();

  useEffect(() => {
    const cargarCarta = async () => {
      setCargando(true);
      try {
        // En un entorno real, aquí harías una llamada a tu API
        // Por ejemplo: const response = await fetch(`/api/bares/${barId}/carta`);
        
        // Simulo datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular carga
        
        const categoriasEjemplo = [
          { id: 1, nombre: 'Bebidas', icono: 'fa-glass-martini-alt' },
          { id: 2, nombre: 'Tapas', icono: 'fa-cheese' },
          { id: 3, nombre: 'Platos principales', icono: 'fa-utensils' },
          { id: 4, nombre: 'Postres', icono: 'fa-ice-cream' }
        ];
        
        const productosEjemplo = [
          { id: 101, nombre: 'Cerveza', descripcion: 'Caña de cerveza', precio: 2.50, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: ['gluten'] },
          { id: 102, nombre: 'Vino tinto', descripcion: 'Copa de vino tinto', precio: 3.50, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: ['sulfitos'] },
          { id: 103, nombre: 'Refresco', descripcion: 'Coca-Cola, Fanta, etc.', precio: 2.20, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: [] },
          
          { id: 201, nombre: 'Patatas bravas', descripcion: 'Patatas fritas con salsa brava', precio: 5.00, categoria: 2, imagen: 'https://via.placeholder.com/100', alergenos: [] },
          { id: 202, nombre: 'Croquetas', descripcion: 'Croquetas caseras de jamón', precio: 6.50, categoria: 2, imagen: 'https://via.placeholder.com/100', alergenos: ['gluten', 'lacteos'] },
          { id: 203, nombre: 'Tortilla', descripcion: 'Tortilla española de patata', precio: 4.50, categoria: 2, imagen: 'https://via.placeholder.com/100', alergenos: ['huevo'] },
          
          { id: 301, nombre: 'Paella', descripcion: 'Paella valenciana', precio: 14.00, categoria: 3, imagen: 'https://via.placeholder.com/100', alergenos: ['mariscos'] },
          { id: 302, nombre: 'Entrecot', descripcion: 'Entrecot a la brasa', precio: 18.50, categoria: 3, imagen: 'https://via.placeholder.com/100', alergenos: [] },
          
          { id: 401, nombre: 'Tarta de queso', descripcion: 'Tarta de queso casera', precio: 5.50, categoria: 4, imagen: 'https://via.placeholder.com/100', alergenos: ['lacteos', 'huevo'] },
          { id: 402, nombre: 'Flan', descripcion: 'Flan de huevo casero', precio: 4.00, categoria: 4, imagen: 'https://via.placeholder.com/100', alergenos: ['huevo', 'lacteos'] }
        ];
        
        setCategorias(categoriasEjemplo);
        setProductos(productosEjemplo);
      } catch (err) {
        console.error('Error al cargar la carta:', err);
        setError('No se ha podido cargar la carta. Inténtalo de nuevo más tarde.');
      } finally {
        setCargando(false);
      }
    };
    
    cargarCarta();
  }, [barId]);

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === 'all' || producto.categoria === parseInt(categoriaSeleccionada);
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Renderizar iconos de alérgenos
  const renderAlergenos = (alergenos) => {
    if (!alergenos || alergenos.length === 0) return null;
    
    const iconosAlergenos = {
      'gluten': 'fa-bread-slice',
      'lacteos': 'fa-cheese',
      'huevo': 'fa-egg',
      'frutos_secos': 'fa-seedling',
      'mariscos': 'fa-fish',
      'sulfitos': 'fa-wine-bottle'
    };
    
    return (
      <div className="producto-alergenos">
        {alergenos.map(alergeno => (
          <span key={alergeno} className="alergeno-icon" title={`Contiene ${alergeno}`}>
            <i className={`fas ${iconosAlergenos[alergeno] || 'fa-exclamation-circle'}`}></i>
          </span>
        ))}
      </div>
    );
  };

  if (cargando) {
    return <div className="carta-cargando"><i className="fas fa-spinner fa-spin"></i> Cargando carta...</div>;
  }

  if (error) {
    return <div className="carta-error"><i className="fas fa-exclamation-triangle"></i> {error}</div>;
  }

  return (
    <div className="carta-digital">
      <div className="carta-header">
        <h2>Carta Digital</h2>
        
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
      
      <div className="categorias-tabs">
        <button 
          className={`categoria-tab ${categoriaSeleccionada === 'all' ? 'activa' : ''}`}
          onClick={() => setCategoriaSeleccionada('all')}
        >
          <i className="fas fa-th"></i> Todos
        </button>
        
        {categorias.map(categoria => (
          <button 
            key={categoria.id}
            className={`categoria-tab ${categoriaSeleccionada === categoria.id.toString() ? 'activa' : ''}`}
            onClick={() => setCategoriaSeleccionada(categoria.id.toString())}
          >
            <i className={`fas ${categoria.icono}`}></i> {categoria.nombre}
          </button>
        ))}
      </div>
      
      <div className="productos-grid">
        {productosFiltrados.length === 0 ? (
          <div className="no-productos">
            <i className="fas fa-search"></i>
            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          productosFiltrados.map(producto => (
            <div key={producto.id} className="producto-card">
              <div className="producto-imagen">
                <img src={producto.imagen} alt={producto.nombre} />
              </div>
              
              <div className="producto-info">
                <h3>{producto.nombre}</h3>
                <p className="producto-descripcion">{producto.descripcion}</p>
                <div className="producto-footer">
                  <span className="producto-precio">{producto.precio.toFixed(2)} €</span>
                  {renderAlergenos(producto.alergenos)}
                  
                  {!readOnly && (
                    <button 
                      className="add-to-order"
                      onClick={() => onAddToOrder(producto)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartaDigital;