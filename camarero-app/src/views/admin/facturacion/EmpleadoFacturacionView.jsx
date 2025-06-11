import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getFacturasPorBar,
  crearSesionPago
} from '../../../services/facturacionService';
import AdminNavigation from '../../../components/AdminNavigation';
import '../../../styles/admin/facturacion/empleadoFacturacionView.css';

const EmpleadoFacturacionView = () => {
  const { barId } = useParams();
  const [facturas, setFacturas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoy');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (barId) cargarFacturas();
  }, [barId]);

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getFacturasPorBar(barId);
      setFacturas(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar facturas: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handlePagar = async (factura) => {
    try {
      const { id: sessionId } = await crearSesionPago(factura);
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (err) {
      console.error(err);
      setError('Error al iniciar pago: ' + err.message);
    }
  };

  // Filtrar facturas
  const facturasFiltradas = facturas.filter(f => {
    if (filtroEstado !== 'todas' && f.estado !== filtroEstado) return false;
    const fecha = new Date(f.fecha);
    const ahora = new Date();
    if (filtroPeriodo === 'hoy') return fecha.toDateString() === ahora.toDateString();
    if (filtroPeriodo === 'semana') {
      const inicio = new Date(); inicio.setDate(ahora.getDate() - 7);
      return fecha >= inicio;
    }
    if (filtroPeriodo === 'mes') return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    if (filtroPeriodo === 'año') return fecha.getFullYear() === ahora.getFullYear();
    return true;
  });

  const totalFacturado = facturasFiltradas
    .filter(f => f.estado === 'pagada')
    .reduce((sum, f) => sum + (f.total || 0), 0);

  if (cargando) return <div className="facturas-loading">Cargando facturas...</div>;
  if (error) return <div className="facturas-error">{error}</div>;

  return (
    <div className="empleado-facturacion-view">
      {/* Añadir navegación de admin */}
      <AdminNavigation />

      <div className="facturacion-header">
        <h1>Gestión de Facturación</h1>
      </div>

      <div className="facturacion-stats">
        <div className="stat-card">
          <span className="stat-title">Total Facturado ({filtroPeriodo})</span>
          <span className="stat-value">{totalFacturado.toFixed(2)}€</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Facturas Totales</span>
          <span className="stat-value">{facturasFiltradas.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Facturas Pagadas</span>
          <span className="stat-value">{facturasFiltradas.filter(f => f.estado === 'pagada').length}</span>
        </div>
      </div>

      <div className="filtros-facturacion">
        <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} className="filtro-periodo">
          <option value="hoy">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="año">Este año</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="filtro-estado">
          <option value="todas">Todas</option>
          <option value="pagada">Pagadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      <div className="facturas-tabla">
        <div className="tabla-header">
          <div className="header-item">Nº Factura</div>
          <div className="header-item">Fecha</div>
          <div className="header-item">Cliente</div>
          <div className="header-item">Estado</div>
          <div className="header-item">Items</div>
          <div className="header-item">Total</div>
          <div className="header-item">Acciones</div>
        </div>

        {facturasFiltradas.length === 0 ? (
          <div className="tabla-vacia">
            No hay facturas para mostrar
          </div>
        ) : (
          facturasFiltradas.map(f => (
            <div key={f.id} className={`tabla-fila estado-${f.estado}`}>
              <div className="fila-item numero-factura">
                #{f.numeroFactura}
              </div>
              
              <div className="fila-item fecha">
                {new Date(f.fecha).toLocaleDateString('es-ES')}
              </div>
              
              <div className="fila-item cliente">
                {f.cliente || 'Cliente anónimo'}
              </div>
              
              <div className="fila-item estado">
                <span className={`estado-badge ${f.estado}`}>
                  {f.estado.charAt(0).toUpperCase() + f.estado.slice(1)}
                </span>
              </div>
              
              <div className="fila-item items">
                <div className="items-lista">
                  {f.lineas.slice(0, 2).map((l, i) => (
                    <div key={i} className="item-resumen">
                      {l.cantidad}x {l.nombre}
                    </div>
                  ))}
                  {f.lineas.length > 2 && (
                    <div className="items-mas">
                      +{f.lineas.length - 2} más
                    </div>
                  )}
                </div>
              </div>
              
              <div className="fila-item total">
                <strong>{f.total.toFixed(2)}€</strong>
              </div>
              
              <div className="fila-item acciones">
                {f.estado !== 'pagada' && <button onClick={() => handlePagar(f)} className="btn-pagar">Pagar</button>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmpleadoFacturacionView;
