import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeCliente from '../views/HomeCliente';
import ReservaCliente from '../views/cliente/reservas/ReservaCliente';
import EscanearQR from '../views/EscanearQR';
import FormularioPedido from '../views/FormularioPedido';
import LocalesCliente from '../views/LocalesCliente';
import LoginEmpleado from '../views/LoginEmpleado';
import PrivateRoute from '../components/PrivateRoute';
import NotFound from '../views/NotFound';
import ClienteCartaView from '../views/ClienteCartaView';
import ClienteComandas from '../views/ClienteComandasView';
import AdminCartaView from '../views/AdminCartaView';
import HomeEmpleado from '../views/admin/home/HomeEmpleado'; 
import EmpleadoPedidosView from '../views/EmpleadoPedidosView';
import EmpleadoReservasView from '../views/admin/reservas/EmpleadoReservasView';
import EmpleadoInventarioView from '../views/EmpleadoInventarioView';
import EmpleadoCocinaView from '../views/EmpleadoCocinaView';
import EmpleadoFacturacionView from '../views/EmpleadoFacturacionView';
import EmpleadoMapaView from '../views/EmpleadoMapaView';
import AdminUsuarioView from '../views/AdminUsuarioView';

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

      {/* Protected routes */}
      <Route path="/cliente/locales" element={protectedRoute(LocalesCliente, 'cliente')} />
      <Route path="/admin/home" element={protectedRoute(HomeEmpleado)} /> {/* ✅ DESCOMENTADO */}
      <Route path="/admin/bar/:barId/carta" element={protectedRoute(AdminCartaView)} />
      <Route path="/admin/bar/:barId/panel" element={protectedRoute(EmpleadoMapaView)} />
      <Route path="/admin/bar/:barId/reservas" element={protectedRoute(EmpleadoReservasView)} /> {/* ✅ DESCOMENTADO */}
      <Route path="/admin/bar/:barId/pedidos" element={protectedRoute(EmpleadoPedidosView)} />
      <Route path="/admin/bar/:barId/inventario" element={protectedRoute(EmpleadoInventarioView)} />
      <Route path="/admin/bar/:barId/cocina" element={protectedRoute(EmpleadoCocinaView)} />
      <Route path="/admin/bar/:barId/facturacion" element={protectedRoute(EmpleadoFacturacionView)} />
      <Route path="/admin/bar/:barId/usuarios" element={protectedRoute(AdminUsuarioView)} />

      {/* 404 - debe ir al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default GlobalRouter;