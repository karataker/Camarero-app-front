import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import AdminNavigation from '../../../components/AdminNavigation';
import '../../../styles/admin/analiticas/adminAnaliticasView.css';

const AdminAnaliticasView = () => {
  const [filtroAnoActual, setFiltroAnoActual] = useState('2025'); // Año de análisis
  const [filtroAnoComparacion, setFiltroAnoComparacion] = useState('2024'); // Año de comparación
  const [acumulado, setAcumulado] = useState(false); // Switch para importes acumulados
  const [filtroCategoria, setFiltroCategoria] = useState('todas'); // Filtro por categoría

  const [datosVentas, setDatosVentas] = useState([]);
  const [datosReservas, setDatosReservas] = useState([]);
  const [datosPedidos, setDatosPedidos] = useState([]);
  const [datosCarritoMedio, setDatosCarritoMedio] = useState([]);
  const [datosProductos, setDatosProductos] = useState([]);

  // Colores para el gráfico de pastel
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

  useEffect(() => {
    // Simulación de datos obtenidos del backend
    const datosPorAno = {
      '2025': {
        ventas: [
          { periodo: 'Enero', valor: 5000 },
          { periodo: 'Febrero', valor: 6000 },
          { periodo: 'Marzo', valor: 7000 },
        ],
        reservas: [
          { periodo: 'Enero', valor: 200 },
          { periodo: 'Febrero', valor: 250 },
          { periodo: 'Marzo', valor: 300 },
        ],
        pedidos: [
          { periodo: 'Enero', valor: 400 },
          { periodo: 'Febrero', valor: 450 },
          { periodo: 'Marzo', valor: 500 },
        ],
        carritoMedio: [
          { periodo: 'Enero', valor: 25.5 }, 
          { periodo: 'Febrero', valor: 27.8 },
          { periodo: 'Marzo', valor: 30.2 },
        ],
        productos: {
          todas: [
            { nombre: 'Pizza Margarita', ventas: 150, categoria: 'Pizzas' },
            { nombre: 'Hamburguesa Clásica', ventas: 120, categoria: 'Hamburguesas' },
            { nombre: 'Pasta Carbonara', ventas: 100, categoria: 'Pastas' },
            { nombre: 'Ensalada César', ventas: 80, categoria: 'Ensaladas' },
            { nombre: 'Pizza Pepperoni', ventas: 75, categoria: 'Pizzas' },
          ],
          Pizzas: [
            { nombre: 'Pizza Margarita', ventas: 150, categoria: 'Pizzas' },
            { nombre: 'Pizza Pepperoni', ventas: 75, categoria: 'Pizzas' },
            { nombre: 'Pizza Hawaiana', ventas: 60, categoria: 'Pizzas' },
            { nombre: 'Pizza 4 Quesos', ventas: 45, categoria: 'Pizzas' },
          ],
          Hamburguesas: [
            { nombre: 'Hamburguesa Clásica', ventas: 120, categoria: 'Hamburguesas' },
            { nombre: 'Hamburguesa BBQ', ventas: 90, categoria: 'Hamburguesas' },
            { nombre: 'Hamburguesa Vegana', ventas: 50, categoria: 'Hamburguesas' },
          ],
          Pastas: [
            { nombre: 'Pasta Carbonara', ventas: 100, categoria: 'Pastas' },
            { nombre: 'Pasta Boloñesa', ventas: 85, categoria: 'Pastas' },
            { nombre: 'Pasta Alfredo', ventas: 70, categoria: 'Pastas' },
          ],
          Ensaladas: [
            { nombre: 'Ensalada César', ventas: 80, categoria: 'Ensaladas' },
            { nombre: 'Ensalada Mixta', ventas: 65, categoria: 'Ensaladas' },
            { nombre: 'Ensalada Griega', ventas: 40, categoria: 'Ensaladas' },
          ],
        },
      },
      '2024': {
        ventas: [
          { periodo: 'Enero', valor: 4800 },
          { periodo: 'Febrero', valor: 5900 },
          { periodo: 'Marzo', valor: 6800 },
        ],
        reservas: [
          { periodo: 'Enero', valor: 190 },
          { periodo: 'Febrero', valor: 240 },
          { periodo: 'Marzo', valor: 290 },
        ],
        pedidos: [
          { periodo: 'Enero', valor: 380 },
          { periodo: 'Febrero', valor: 430 },
          { periodo: 'Marzo', valor: 480 },
        ],
        carritoMedio: [
          { periodo: 'Enero', valor: 24.5 },
          { periodo: 'Febrero', valor: 26.8 },
          { periodo: 'Marzo', valor: 29.0 },
        ],
        productos: {
          todas: [
            { nombre: 'Pizza Margarita', ventas: 140, categoria: 'Pizzas' },
            { nombre: 'Hamburguesa Clásica', ventas: 110, categoria: 'Hamburguesas' },
            { nombre: 'Pasta Carbonara', ventas: 95, categoria: 'Pastas' },
            { nombre: 'Ensalada César', ventas: 75, categoria: 'Ensaladas' },
            { nombre: 'Pizza Pepperoni', ventas: 70, categoria: 'Pizzas' },
          ],
          Pizzas: [
            { nombre: 'Pizza Margarita', ventas: 140, categoria: 'Pizzas' },
            { nombre: 'Pizza Pepperoni', ventas: 70, categoria: 'Pizzas' },
            { nombre: 'Pizza Hawaiana', ventas: 55, categoria: 'Pizzas' },
            { nombre: 'Pizza 4 Quesos', ventas: 40, categoria: 'Pizzas' },
          ],
          Hamburguesas: [
            { nombre: 'Hamburguesa Clásica', ventas: 110, categoria: 'Hamburguesas' },
            { nombre: 'Hamburguesa BBQ', ventas: 80, categoria: 'Hamburguesas' },
            { nombre: 'Hamburguesa Vegana', ventas: 45, categoria: 'Hamburguesas' },
          ],
          Pastas: [
            { nombre: 'Pasta Carbonara', ventas: 95, categoria: 'Pastas' },
            { nombre: 'Pasta Boloñesa', ventas: 80, categoria: 'Pastas' },
            { nombre: 'Pasta Alfredo', ventas: 65, categoria: 'Pastas' },
          ],
          Ensaladas: [
            { nombre: 'Ensalada César', ventas: 75, categoria: 'Ensaladas' },
            { nombre: 'Ensalada Mixta', ventas: 60, categoria: 'Ensaladas' },
            { nombre: 'Ensalada Griega', ventas: 35, categoria: 'Ensaladas' },
          ],
        },
      },
    };

    const calcularAcumulado = (datos) => {
      let acumuladoActual = 0;
      return datos.map(item => {
        acumuladoActual += item.actual;
        return {
          ...item,
          actual: acumuladoActual
        };
      });
    };

    const calcularAcumuladoComparacion = (datos) => {
      let acumuladoAnterior = 0;
      return datos.map(item => {
        acumuladoAnterior += item.anterior;
        return {
          ...item,
          anterior: acumuladoAnterior
        };
      });
    };

    const procesarDatos = (tipoAnalisis) => {
      const datosActuales = datosPorAno[filtroAnoActual]?.[tipoAnalisis] || [];
      const datosComparacion = datosPorAno[filtroAnoComparacion]?.[tipoAnalisis] || [];

      let datosProcesados = datosActuales.map((itemActual, index) => {
        const itemComparacion = datosComparacion[index];
        return {
          periodo: itemActual.periodo,
          actual: itemActual.valor,
          anterior: itemComparacion ? itemComparacion.valor : 0,
        };
      });

      // Aplicar acumulado solo para ventas, reservas y pedidos
      if (acumulado && ['ventas', 'reservas', 'pedidos'].includes(tipoAnalisis)) {
        datosProcesados = calcularAcumulado(datosProcesados);
        datosProcesados = calcularAcumuladoComparacion(datosProcesados);
      }

      return datosProcesados;
    };

    const procesarDatosProductos = () => {
      const productosActuales = datosPorAno[filtroAnoActual]?.productos?.[filtroCategoria] || [];
      const productosComparacion = datosPorAno[filtroAnoComparacion]?.productos?.[filtroCategoria] || [];

      return productosActuales.map((producto, index) => {
        const productoComparacion = productosComparacion.find(p => p.nombre === producto.nombre);
        return {
          nombre: producto.nombre,
          actual: producto.ventas,
          anterior: productoComparacion ? productoComparacion.ventas : 0,
          categoria: producto.categoria,
        };
      });
    };

    setDatosVentas(procesarDatos('ventas'));
    setDatosReservas(procesarDatos('reservas'));
    setDatosPedidos(procesarDatos('pedidos'));
    setDatosCarritoMedio(procesarDatos('carritoMedio'));
    setDatosProductos(procesarDatosProductos());

  }, [filtroAnoActual, filtroAnoComparacion, acumulado, filtroCategoria]);

  const renderBarChart = (titulo, datos, dataKeyActual, dataKeyAnterior) => (
    <div className="grafico-analisis">
      <h2>{titulo} ({filtroAnoActual} vs {filtroAnoComparacion}) {acumulado ? '- Acumulado' : ''}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKeyActual} fill="#8884d8" name={`Actual (${filtroAnoActual})`}>
            <LabelList dataKey={dataKeyActual} position="top" />
          </Bar>
          <Bar dataKey={dataKeyAnterior} fill="#82ca9d" name={`Anterior (${filtroAnoComparacion})`}>
            <LabelList dataKey={dataKeyAnterior} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = (titulo, datos, dataKeyActual, dataKeyAnterior) => (
    <div className="grafico-analisis">
      <h2>{titulo} ({filtroAnoActual} vs {filtroAnoComparacion})</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKeyActual} stroke="#8884d8" name={`Actual (${filtroAnoActual})`} />
          <Line type="monotone" dataKey={dataKeyAnterior} stroke="#82ca9d" name={`Anterior (${filtroAnoComparacion})`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderProductosChart = () => (
    <div className="grafico-analisis">
      <h2>Productos Más Vendidos ({filtroAnoActual} vs {filtroAnoComparacion}) - {filtroCategoria === 'todas' ? 'Todas las Categorías' : filtroCategoria}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datosProductos}>
          <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name={`Actual (${filtroAnoActual})`}>
            <LabelList dataKey="actual" position="top" />
          </Bar>
          <Bar dataKey="anterior" fill="#82ca9d" name={`Anterior (${filtroAnoComparacion})`}>
            <LabelList dataKey="anterior" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="admin-analiticas-view">
      {/* Añadir navegación de admin */}
      <AdminNavigation />
      
      <div className="analiticas-header">
        <h1>Vista de Analíticas</h1>
      </div>

      <div className="filtros">
        <div className="filtro-ano">
          <label htmlFor="filtroAnoActual">
            <i className="fas fa-calendar-alt"></i>
            Año de análisis:
          </label>
          <select id="filtroAnoActual" value={filtroAnoActual} onChange={(e) => setFiltroAnoActual(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="filtro-ano">
          <label htmlFor="filtroAnoComparacion">
            <i className="fas fa-calendar-check"></i>
            Año de comparación:
          </label>
          <select id="filtroAnoComparacion" value={filtroAnoComparacion} onChange={(e) => setFiltroAnoComparacion(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="filtro-acumulado">
          <label htmlFor="switchAcumulado">
            <i className="fas fa-chart-line"></i>
            Importes acumulados:
          </label>
          <input
            type="checkbox"
            id="switchAcumulado"
            checked={acumulado}
            onChange={(e) => setAcumulado(e.target.checked)}
            className="switch-acumulado"
          />
        </div>
        <div className="filtro-categoria">
          <label htmlFor="filtroCategoria">
            <i className="fas fa-tags"></i>
            Categoría de productos:
          </label>
          <select id="filtroCategoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="todas">Todas las Categorías</option>
            <option value="Pizzas">Pizzas</option>
            <option value="Hamburguesas">Hamburguesas</option>
            <option value="Pastas">Pastas</option>
            <option value="Ensaladas">Ensaladas</option>
          </select>
        </div>
      </div>

      <div className="graficos-container">
        {renderBarChart("Gráfico de Ventas", datosVentas, "actual", "anterior")}
        {renderBarChart("Gráfico de Reservas", datosReservas, "actual", "anterior")}
        {renderBarChart("Gráfico de Pedidos", datosPedidos, "actual", "anterior")}
        {renderLineChart("Gráfico de Carrito Medio", datosCarritoMedio, "actual", "anterior")}
        {renderProductosChart()}
      </div>
    </div>
  );
};

export default AdminAnaliticasView;