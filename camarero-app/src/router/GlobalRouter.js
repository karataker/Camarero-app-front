import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login';
import Register from '../views/Register';
import HomeCliente from '../views/HomeCliente';
import ReservaCliente from '../views/ReservaCliente';
import EscanearQR from '../views/EscanearQR';
import FormularioPedido from '../views/FormularioPedido';
import LocalesCliente from '../views/LocalesCliente';
import LoginEmpleado from '../views/LoginEmpleado';
import PrivateRoute from '../components/PrivateRoute';
import NotFound from '../views/NotFound';
import ClienteCartaView from '../views/ClienteCartaView';
import ClienteComandas from '../views/ClienteComandasView';
import AdminCartaView from '../views/AdminCartaView';
import HomeEmpleado from '../views/HomeEmpleado';
import EmpleadoPedidosView from '../views/EmpleadoPedidosView';
import EmpleadoReservasView from '../views/EmpleadoReservasView';
import EmpleadoInventarioView from '../views/EmpleadoInventarioView';
import EmpleadoCocinaView from '../views/EmpleadoCocinaView';
import EmpleadoFacturacionView from '../views/EmpleadoFacturacionView';
import EmpleadoMapaView from '../views/EmpleadoMapaView';

const GlobalRouter = () => {
  const protectedRoute = (Component, tipo = 'admin') => (
    <PrivateRoute tipo={tipo}>
      <Component />
    </PrivateRoute>
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeCliente />} />
      <Route path="/reservar" element={<ReservaCliente />} />
      <Route path="/bar/:barId/mesa/:mesaId" element={<FormularioPedido />} />
      <Route path="/cliente/:barId/:mesaId" element={<ClienteCartaView />} />
      <Route path="/cliente/:barId/:mesaId/comandas" element={<ClienteComandas />} />
      <Route path="/escanear" element={<EscanearQR />} />
      <Route path="/login-empleado" element={<LoginEmpleado />} />
      <Route path="*" element={<NotFound />} />

      {/* Protected routes */}
      <Route path="/cliente/locales" element={protectedRoute(LocalesCliente, 'cliente')} />
      <Route path="/admin/home" element={<HomeEmpleado />} />
      <Route path="/admin/bar/:barId/carta" element={protectedRoute(AdminCartaView)} />
      <Route path="/admin/bar/:barId/panel" element={protectedRoute(EmpleadoMapaView)} />
      <Route path="/admin/bar/:barId/reservas" element={protectedRoute(EmpleadoReservasView)} />
      <Route path="/admin/bar/:barId/pedidos" element={protectedRoute(EmpleadoPedidosView)} />
      <Route path="/admin/bar/:barId/inventario" element={protectedRoute(EmpleadoInventarioView)} />
      <Route path="/admin/bar/:barId/cocina" element={protectedRoute(EmpleadoCocinaView)} />
      <Route path="/admin/bar/:barId/facturacion" element={protectedRoute(EmpleadoFacturacionView)} />
    </Routes>
  );
};

export default GlobalRouter;