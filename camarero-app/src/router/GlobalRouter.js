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
import PedidoConfirmado from '../views/PedidoConfirmado';
import AdminCartaView from '../views/AdminCartaView';
import HomeAdmin from '../views/HomeAdmin';
import PanelEmpleado from '../views/PanelEmpleado';
import AdminPedidosView from '../views/AdminPedidosView';

const GlobalRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeCliente />} />
      <Route path="/reservar" element={<ReservaCliente />} />
      
      {/* Ruta existente */}
      <Route path="/bar/:barId/mesa/:mesaId" element={<FormularioPedido />} />
      
      {/* RUTAS NUEVAS para QR - mantienen el formato de la URL en QRDownloader */}
      <Route path="/cliente/bar/:barId/mesa/:mesaId" element={<ClienteCartaView />} />
      <Route path="/cliente/:barId/:mesaId/pedido-confirmado" element={<PedidoConfirmado />} />
      
      <Route path="/escanear" element={<EscanearQR />} />
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="/login-empleado" element={<LoginEmpleado />} />
      <Route path="*" element={<NotFound />} />

      {/* Cliente */}
      <Route path="/cliente/locales" element={
        <PrivateRoute tipo="cliente">
          <LocalesCliente />
        </PrivateRoute>
      } />

      {/* Admin */}
      <Route path="/admin/home" element={
        <PrivateRoute tipo="admin">
          <HomeAdmin />
        </PrivateRoute>
      } />
      
      {/* Panel Empleado route */}
      <Route path="/admin/panel" element={
        <PrivateRoute tipo={['admin', 'camarero']}>
          <PanelEmpleado />
        </PrivateRoute>
      } />

      {/* Ruta para la gestión de carta (admin) */}
      <Route path="/admin/bar/:barId/carta" element={
        <PrivateRoute tipo="admin">
          <AdminCartaView />
        </PrivateRoute>
      } />

      {/* Ruta para la gestión de pedidos (admin) */}
      <Route path="/admin/bar/:barId/pedidos" element={
        <PrivateRoute tipo="admin">
          <AdminPedidosView />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default GlobalRouter;