import React, { useState, useEffect } from 'react';
import '../styles/cartaDigitalAdmin.css';

const CartaDigitalAdmin = ({ barId }) => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    stock: '',
    alergenos: []
  });

  // Cargar datos
  useEffect(() => {
    const cargarCarta = async () => {
      setCargando(true);
      try {
        // Código similar al de CartaDigital pero con información de stock
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const categoriasEjemplo = [
          { id: 1, nombre: 'Bebidas', icono: 'fa-glass-martini-alt', productos: [] },
          { id: 2, nombre: 'Tapas', icono: 'fa-cheese', productos: [] },
          { id: 3, nombre: 'Platos principales', icono: 'fa-utensils', productos: [] },
          { id: 4, nombre: 'Postres', icono: 'fa-ice-cream', productos: [] }
        ];
        
        const productosEjemplo = [
          { id: 101, nombre: 'Cerveza', descripcion: 'Caña de cerveza', precio: 2.50, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: ['gluten'], stock: 24 },
          { id: 102, nombre: 'Vino tinto', descripcion: 'Copa de vino tinto', precio: 3.50, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: ['sulfitos'], stock: 12 },
          { id: 103, nombre: 'Refresco', descripcion: 'Coca-Cola, Fanta, etc.', precio: 2.20, categoria: 1, imagen: 'https://via.placeholder.com/100', alergenos: [], stock: 0 },
          // Otros productos...
        ];
        
        categoriasEjemplo.forEach(categoria => {
          categoria.productos = productosEjemplo.filter(producto => producto.categoria === categoria.id);
        });
        
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

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));
  };

  // Manejar selección de alérgenos
  const handleAlergenoChange = (alergeno) => {
    setNuevoProducto(prev => {
      const alergenos = [...prev.alergenos];
      if (alergenos.includes(alergeno)) {
        return { ...prev, alergenos: alergenos.filter(a => a !== alergeno) };
      } else {
        return { ...prev, alergenos: [...alergenos, alergeno] };
      }
    });
  };

  // Guardar nuevo producto
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    try {
      // Aquí iría la lógica para guardar el producto en la API
      console.log('Guardando producto:', nuevoProducto);
      
      // Simulamos un guardado exitoso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Añadimos el producto a la lista local (en un caso real, refrescaríamos desde la API)
      const nuevoId = Math.max(...productos.map(p => p.id)) + 1;
      const nuevoProductoConId = { 
        ...nuevoProducto,
        id: nuevoId,
        categoria: parseInt(nuevoProducto.categoria),
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock),
        imagen: 'https://via.placeholder.com/100'
      };
      setProductos(prev => [...prev, nuevoProductoConId]);
      setCategorias(prev => prev.map(categoria => 
        categoria.id === nuevoProductoConId.categoria 
          ? { ...categoria, productos: [...categoria.productos, nuevoProductoConId] } 
          : categoria
      ));
      
      // Reset del formulario
      setNuevoProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        stock: '',
        alergenos: []
      });
      setMostrarFormulario(false);
    } catch (err) {
      console.error('Error al guardar el producto:', err);
    }
  };

  const productosFiltrados = productos
    .filter(producto => {
      // Filter by category if one is selected
      if (categoriaSeleccionada !== 'all') {
        if (producto.categoria.toString() !== categoriaSeleccionada) {
          return false;
        }
      }
      
      // Filter by search term if present
      if (busqueda) {
        const searchTerm = busqueda.toLowerCase();
        return (
          producto.nombre.toLowerCase().includes(searchTerm) ||
          producto.descripcion.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });

  if (cargando) {
    return <div className="carta-cargando"><i className="fas fa-spinner fa-spin"></i> Cargando productos...</div>;
  }

  if (error) {
    return <div className="carta-error"><i className="fas fa-exclamation-triangle"></i> {error}</div>;
  }

  return (
    <div className="carta-digital-admin">
      <div className="carta-header">
        <h2>Gestión de Productos</h2>
        
        <div className="carta-acciones">
          <div className="carta-busqueda">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          
          <button 
            className="btn-nuevo-producto"
            onClick={() => setMostrarFormulario(true)}
          >
            <i className="fas fa-plus"></i> Nuevo Producto
          </button>
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
      
      {/* Grid de productos con información de inventario */}
      <div className="productos-grid">
        {productosFiltrados.map(producto => (
          <div key={producto.id} className="producto-card">
            <div className="producto-imagen">
              <img src={producto.imagen} alt={producto.nombre} />
            </div>
            
            <div className="producto-info">
              <h3>{producto.nombre}</h3>
              <p className="producto-descripcion">{producto.descripcion}</p>
              
              <div className="producto-footer">
                <span className="producto-precio">{producto.precio.toFixed(2)} €</span>
                <div className={`stock-indicator ${producto.stock <= 0 ? 'sin-stock' : producto.stock < 5 ? 'bajo-stock' : 'stock-normal'}`}>
                  <i className="fas fa-box"></i>
                  <span>Stock: {producto.stock}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal de nuevo producto */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-nuevo-producto">
            <button className="modal-close" onClick={() => setMostrarFormulario(false)}>×</button>
            <h3>Nuevo Producto</h3>
            
            <form onSubmit={handleGuardarProducto}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="descripcion">Descripción:</label>
                <textarea 
                  id="descripcion" 
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="precio">Precio (€):</label>
                  <input 
                    type="number" 
                    id="precio" 
                    name="precio" 
                    step="0.01"
                    min="0"
                    value={nuevoProducto.precio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="stock">Stock inicial:</label>
                  <input 
                    type="number" 
                    id="stock" 
                    name="stock"
                    min="0"
                    value={nuevoProducto.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="categoria">Categoría:</label>
                <select 
                  id="categoria" 
                  name="categoria"
                  value={nuevoProducto.categoria}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona categoría --</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Alérgenos:</label>
                <div className="alergenos-checkboxes">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={nuevoProducto.alergenos.includes('gluten')}
                      onChange={() => handleAlergenoChange('gluten')}
                    />
                    Gluten
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={nuevoProducto.alergenos.includes('lacteos')}
                      onChange={() => handleAlergenoChange('lacteos')}
                    />
                    Lácteos
                  </label>
                  {/* Más alérgenos... */}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartaDigitalAdmin;