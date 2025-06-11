import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, LabelList
} from 'recharts';
import AdminNavigation from '../../../components/AdminNavigation';
import '../../../styles/admin/analiticas/adminAnaliticasView.css';
import { useBar } from '../../../context/BarContext';
import { getResumenAnalitico } from '../../../services/analiticasService';
import { getCategoriasByBar } from '../../../services/menuService';

const AdminAnaliticasView = () => {
  const { barSeleccionado } = useBar();

  const [filtroAnoActual, setFiltroAnoActual] = useState('2025');
  const [filtroAnoComparacion, setFiltroAnoComparacion] = useState('2024');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [categoriasMenu, setCategoriasMenu] = useState([]);

  const [datosVentas, setDatosVentas] = useState([]);
  const [ventasReales, setVentasReales] = useState([]);
  const [datosPedidos, setDatosPedidos] = useState([]);
  const [datosReservas, setDatosReservas] = useState([]);
  const [carritoEstimado, setCarritoEstimado] = useState([]);
  const [carritoReal, setCarritoReal] = useState([]);
  const [datosProductos, setDatosProductos] = useState([]);

  const formatearEuros = (v) => `€${v.toFixed(2)}`;
  const formatearUnidades = (v) => `${v} uds`;

  useEffect(() => {
    const cargarCategorias = async () => {
      if (!barSeleccionado) return;
      try {
        const categorias = await getCategoriasByBar(barSeleccionado);
        setCategoriasMenu([{ id: 'todas', nombre: 'Todas las Categorías' }, ...categorias]);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    cargarCategorias();
  }, [barSeleccionado]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!barSeleccionado) return;

      try {
        const actual = await getResumenAnalitico(barSeleccionado, filtroAnoActual);
        const comparacion = await getResumenAnalitico(barSeleccionado, filtroAnoComparacion);

        const combinarMeses = (a, b) => {
          const mapB = Object.fromEntries(b.map(d => [d.periodo, d.valor]));
          return a.map(d => ({
            periodo: d.periodo,
            actual: d.valor,
            anterior: mapB[d.periodo] ?? 0
          }));
        };

        const productosComparacion = Object.fromEntries(comparacion.productosTop.map(p => [p.nombre, p.cantidadVendida]));
        const productos = actual.productosTop.map(p => ({
          nombre: p.nombre,
          actual: p.cantidadVendida,
          anterior: productosComparacion[p.nombre] ?? 0,
          categoria: p.categoria
        }));

        setDatosVentas(combinarMeses(actual.ventasMensuales, comparacion.ventasMensuales));
        setVentasReales(combinarMeses(actual.ventasRealesMensuales, comparacion.ventasRealesMensuales));
        setDatosPedidos(combinarMeses(actual.pedidosMensuales, comparacion.pedidosMensuales));
        setDatosReservas(combinarMeses(actual.reservasMensuales, comparacion.reservasMensuales));
        setCarritoEstimado(combinarMeses(actual.carritoMedioEstimado, comparacion.carritoMedioEstimado));
        setCarritoReal(combinarMeses(actual.carritoMedioReal, comparacion.carritoMedioReal));

        setDatosProductos(
          filtroCategoria === 'todas' ? productos : productos.filter(p => p.categoria === filtroCategoria)
        );
      } catch (error) {
        console.error("Error cargando analíticas:", error);
      }
    };

    cargarDatos();
  }, [barSeleccionado, filtroAnoActual, filtroAnoComparacion, filtroCategoria]);

  const renderBarChart = (titulo, datos, keyA, keyB, formatter) => (
    <div className="grafico-analisis">
      <h2>{titulo}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
          <XAxis dataKey="periodo" />
          <YAxis tickFormatter={formatter} />
          <Tooltip formatter={(value) => formatter ? formatter(value) : value} />
          <Legend />
          <Bar dataKey={keyA} fill="#8884d8" name={`Actual (${filtroAnoActual})`}>
            <LabelList dataKey={keyA} position="top" formatter={formatter} />
          </Bar>
          <Bar dataKey={keyB} fill="#82ca9d" name={`Anterior (${filtroAnoComparacion})`}>
            <LabelList dataKey={keyB} position="top" formatter={formatter} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProductosChart = () => (
    <div className="grafico-analisis">
      <h2>Productos más vendidos ({filtroCategoria})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datosProductos}>
          <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
          <YAxis tickFormatter={formatearUnidades} />
          <Tooltip formatter={(v) => formatearUnidades(v)} />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name={`Actual (${filtroAnoActual})`}>
            <LabelList dataKey="actual" position="top" formatter={formatearUnidades} />
          </Bar>
          <Bar dataKey="anterior" fill="#82ca9d" name={`Anterior (${filtroAnoComparacion})`}>
            <LabelList dataKey="anterior" position="top" formatter={formatearUnidades} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="admin-analiticas-view">
      <AdminNavigation />
      <div className="analiticas-header">
        <h1>Vista de Analíticas</h1>
      </div>

      <div className="filtros">
        <div className="filtro-ano">
          <label>Año de análisis:
            <select value={filtroAnoActual} onChange={(e) => setFiltroAnoActual(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </label>
        </div>
        <div className="filtro-ano">
          <label>Año de comparación:
            <select value={filtroAnoComparacion} onChange={(e) => setFiltroAnoComparacion(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </label>
        </div>
        <div className="filtro-categoria">
          <label>Categoría productos:
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              {categoriasMenu.map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="graficos-container">
        {renderBarChart("Ventas Estimadas (Comandas)", datosVentas, "actual", "anterior", formatearEuros)}
        {renderBarChart("Ventas Reales (Facturación)", ventasReales, "actual", "anterior", formatearEuros)}
        {renderBarChart("Pedidos", datosPedidos, "actual", "anterior")}
        {renderBarChart("Reservas", datosReservas, "actual", "anterior")}
        {renderBarChart("Carrito Medio Estimado", carritoEstimado, "actual", "anterior", formatearEuros)}
        {renderBarChart("Carrito Medio Real", carritoReal, "actual", "anterior", formatearEuros)}
        {renderProductosChart()}
      </div>
    </div>
  );
};

export default AdminAnaliticasView;
