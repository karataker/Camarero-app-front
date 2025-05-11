import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/empleadoFacturacionView.css';

const EmpleadoFacturacionView = () => {
  const { barId } = useParams();
  const [facturas, setFacturas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoy');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false);

  useEffect(() => {
    cargarFacturas();
  }, [barId, filtroPeriodo]);

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      // TODO: Replace with actual API call
      const mockFacturas = [
        {
          id: 1,
          numero: 'F2024-001',
          fecha: '2024-05-10',
          cliente: 'Cliente General',
          items: [
            { nombre: 'Menú del día', cantidad: 2, precio: 12.50 },
            { nombre: 'Refresco', cantidad: 2, precio: 2.50 }
          ],
          subtotal: 30.00,
          iva: 6.30,
          total: 36.30,
          estado: 'pagada',
          metodoPago: 'tarjeta'
        },
        // Add more mock data...
      ];
      setFacturas(mockFacturas);
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleNuevaFactura = (factura) => {
    setFacturas(prev => [factura, ...prev]);
    setMostrarNuevaFactura(false);
  };

  const facturasFiltradas = facturas.filter(factura => 
    (filtroEstado === 'todas' || factura.estado === filtroEstado)
  );

  const totalFacturado = facturasFiltradas
    .filter(f => f.estado === 'pagada')
    .reduce((sum, f) => sum + f.total, 0);

  if (cargando) return <div className="facturas-loading">Cargando facturas...</div>;
  if (error) return <div className="facturas-error">{error}</div>;

  return (
    <div className="empleado-facturacion-view">
      <div className="empleado-breadcrumb">
        <Link to="/admin/home">Panel</Link>
        <span>/</span>
        <Link to={`/admin/bar/${barId}`}>Bar</Link>
        <span>/</span>
        <span>Facturación</span>
      </div>

      <div className="facturacion-header">
        <h1>Gestión de Facturación</h1>
        <button 
          className="btn-nueva-factura"
          onClick={() => setMostrarNuevaFactura(true)}
        >
          <i className="fas fa-plus"></i> Nueva Factura
        </button>
      </div>

      <div className="facturacion-stats">
        <div className="stat-card">
          <span className="stat-title">Total Facturado ({filtroPeriodo})</span>
          <span className="stat-value">{totalFacturado.toFixed(2)}€</span>
        </div>
        {/* Add more stats as needed */}
      </div>

      <div className="filtros-facturacion">
        <select 
          value={filtroPeriodo} 
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="filtro-periodo"
        >
          <option value="hoy">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="año">Este año</option>
        </select>

        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-estado"
        >
          <option value="todas">Todas las facturas</option>
          <option value="pagada">Pagadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      <div className="facturas-grid">
        {facturasFiltradas.map(factura => (
          <div key={factura.id} className={`factura-card estado-${factura.estado}`}>
            <div className="factura-header">
              <div>
                <h3>Factura #{factura.numero}</h3>
                <span className="factura-fecha">{factura.fecha}</span>
              </div>
              <span className={`factura-estado ${factura.estado}`}>
                {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
              </span>
            </div>

            <div className="factura-cliente">
              <i className="fas fa-user"></i> {factura.cliente}
            </div>

            <div className="factura-items">
              {factura.items.map((item, index) => (
                <div key={index} className="factura-item">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span>{(item.cantidad * item.precio).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="factura-totales">
              <div className="subtotal">
                <span>Subtotal:</span>
                <span>{factura.subtotal.toFixed(2)}€</span>
              </div>
              <div className="iva">
                <span>IVA (21%):</span>
                <span>{factura.iva.toFixed(2)}€</span>
              </div>
              <div className="total">
                <span>Total:</span>
                <span>{factura.total.toFixed(2)}€</span>
              </div>
            </div>

            <div className="factura-footer">
              <span className="metodo-pago">
                <i className={`fas fa-${factura.metodoPago === 'tarjeta' ? 'credit-card' : 'money-bill'}`}></i>
                {factura.metodoPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
              </span>
              <div className="factura-acciones">
                <button className="btn-imprimir">
                  <i className="fas fa-print"></i> Imprimir
                </button>
                <button className="btn-descargar">
                  <i className="fas fa-download"></i> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoFacturacionView;