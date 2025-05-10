import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/empleadoInventarioView.css';

const EmpleadoInventarioView = () => {
  const { barId } = useParams();
  const [productos, setProductos] = useState([]);
  const [categorias] = useState(['Bebidas', 'Alimentos', 'Utensilios', 'Limpieza']);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'Bebidas',
    stock: 0,
    stockMinimo: 0,
    unidad: 'unidades',
    precio: 0
  });

  useEffect(() => {
    cargarInventario();
  }, [barId]);

  const cargarInventario = async () => {
    // TODO: Replace with actual API call
    const mockInventario = [
      {
        id: 1,
        nombre: 'Coca-Cola',
        categoria: 'Bebidas',
        stock: 48,
        stockMinimo: 24,
        unidad: 'botellas',
        precio: 1.20
      },
      // Add more mock data...
    ];
    setProductos(mockInventario);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productoEditando) {
        // TODO: Update existing product
        setProductos(prev => prev.map(p => 
          p.id === productoEditando.id ? {...nuevoProducto, id: p.id} : p
        ));
      } else {
        // TODO: Create new product
        setProductos(prev => [...prev, {...nuevoProducto, id: Date.now()}]);
      }
      setMostrarFormulario(false);
      setProductoEditando(null);
      setNuevoProducto({
        nombre: '',
        categoria: 'Bebidas',
        stock: 0,
        stockMinimo: 0,
        unidad: 'unidades',
        precio: 0
      });
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  return (
    <div className="empleado-inventario-view">
      <div className="inventario-header">
        <h1>Gestión de Inventario</h1>
        <button 
          className="btn-nuevo-producto"
          onClick={() => setMostrarFormulario(true)}
        >
          <i className="fas fa-plus"></i> Nuevo Producto
        </button>
      </div>

      <div className="filtros-inventario">
        <select 
          value={filtroCategoria} 
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="productos-grid">
        {productos
          .filter(p => filtroCategoria === 'todos' || p.categoria === filtroCategoria)
          .map(producto => (
            <div key={producto.id} className="producto-card">
              <div className="producto-header">
                <h3>{producto.nombre}</h3>
                <span className={`stock-badge ${
                  producto.stock <= producto.stockMinimo ? 'bajo' : 'normal'
                }`}>
                  Stock: {producto.stock} {producto.unidad}
                </span>
              </div>
              
              <div className="producto-info">
                <p><strong>Categoría:</strong> {producto.categoria}</p>
                <p><strong>Stock Mínimo:</strong> {producto.stockMinimo} {producto.unidad}</p>
                <p><strong>Precio:</strong> {producto.precio.toFixed(2)}€</p>
              </div>

              <div className="producto-actions">
                <button 
                  className="btn-editar"
                  onClick={() => {
                    setProductoEditando(producto);
                    setNuevoProducto(producto);
                    setMostrarFormulario(true);
                  }}
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button 
                  className="btn-ajustar"
                  onClick={() => {/* TODO: Implement stock adjustment */}}
                >
                  <i className="fas fa-box"></i> Ajustar Stock
                </button>
              </div>
            </div>
          ))}
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-producto">
            <h2>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({
                    ...nuevoProducto,
                    nombre: e.target.value
                  })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría:</label>
                  <select
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({
                      ...nuevoProducto,
                      categoria: e.target.value
                    })}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unidad:</label>
                  <input
                    type="text"
                    value={nuevoProducto.unidad}
                    onChange={(e) => setNuevoProducto({
                      ...nuevoProducto,
                      unidad: e.target.value
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Actual:</label>
                  <input
                    type="number"
                    value={nuevoProducto.stock}
                    onChange={(e) => setNuevoProducto({
                      ...nuevoProducto,
                      stock: parseInt(e.target.value)
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Mínimo:</label>
                  <input
                    type="number"
                    value={nuevoProducto.stockMinimo}
                    onChange={(e) => setNuevoProducto({
                      ...nuevoProducto,
                      stockMinimo: parseInt(e.target.value)
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Precio:</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoProducto.precio}
                  onChange={(e) => setNuevoProducto({
                    ...nuevoProducto,
                    precio: parseFloat(e.target.value)
                  })}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProductoEditando(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {productoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadoInventarioView;