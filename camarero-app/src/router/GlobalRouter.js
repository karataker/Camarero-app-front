import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeCliente from '../views/cliente/home/HomeCliente';
import ReservaCliente from '../views/cliente/reservas/ReservaCliente';
import EscanearQRAsignarMesa from '../views/cliente/qr/EscanearQRAsignarmesa';
import EscanearQRVerCarta from '../views/cliente/qr/EscanearQRVerCarta';
import FormularioPedido from '../views/FormularioPedido';
import LocalesCliente from '../views/LocalesCliente';
import LoginEmpleado from '../views/LoginEmpleado';
import PrivateRoute from '../components/PrivateRoute';
import NotFound from '../views/NotFound';
import ClienteCartaDigitalView from '../views/cliente/carta/ClienteCartaDigitalView';
import ClienteCartaSoloLecturaView from '../views/cliente/carta/ClienteCartaSoloLecturaView';
import ClienteComandas from '../views/ClienteComandasView';
import HomeEmpleado from '../views/admin/home/HomeEmpleado'; 
import EmpleadoPedidosView from '../views/EmpleadoPedidosView';
import EmpleadoReservasView from '../views/admin/reservas/EmpleadoReservasView';
import EmpleadoCocinaView from '../views/EmpleadoCocinaView';
import EmpleadoFacturacionView from '../views/EmpleadoFacturacionView';
import EmpleadoMapaView from '../views/admin/mesas/EmpleadoMapaView';
import AdminUsuarioView from '../views/admin/usuarios/AdminUsuarioView';
import AdminInventarioView from '../views/admin/inventario/AdminInventarioView';
import AdminCartaView from '../views/admin/carta/AdminCartaView';
import AdminComprasView from '../views/admin/Compras/AdminComprasView';
import PagoExitoso from '../views/cliente/pagos/PagoExitoso';
import PagoCancelado from '../views/cliente/pagos/PagoCancelado';
import AdminAnaliticasView from '../views/admin/analiticas/AdminAnaliticasView';


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
      <Route path="/cliente/:barId/:mesaId" element={<ClienteCartaDigitalView/>} />
      <Route path="/cliente/:barId/:mesaId/comandas" element={<ClienteComandas />} />
      <Route path="/escanear" element={<EscanearQRAsignarMesa />} /> 
      <Route path="/login-empleado" element={<LoginEmpleado />} />
      <Route path="/cliente/pago-exitoso" element={<PagoExitoso />} />
      <Route path="/cliente/pago-cancelado" element={<PagoCancelado />} />
      <Route path="/escanear-ver-carta" element={<EscanearQRVerCarta />} />
      <Route path="/ver-carta/:barId" element={<ClienteCartaSoloLecturaView/>} />

      {/* Protected routes */}
      <Route path="/cliente/locales" element={protectedRoute(LocalesCliente, 'cliente')} />
      <Route path="/admin/home" element={protectedRoute(HomeEmpleado)} /> 
      <Route path="/admin/bar/:barId/carta" element={protectedRoute(AdminCartaView)} />
      <Route path="/admin/bar/:barId/panel" element={protectedRoute(EmpleadoMapaView)} />
      <Route path="/admin/bar/:barId/reservas" element={protectedRoute(EmpleadoReservasView)} /> 
      <Route path="/admin/bar/:barId/pedidos" element={protectedRoute(EmpleadoPedidosView)} />
      <Route path="/admin/bar/:barId/inventario" element={protectedRoute(AdminInventarioView)} />
      <Route path="/admin/bar/:barId/compras" element={protectedRoute(AdminComprasView)} />
      <Route path="/admin/bar/:barId/cocina" element={protectedRoute(EmpleadoCocinaView)} />
      <Route path="/admin/bar/:barId/facturacion" element={protectedRoute(EmpleadoFacturacionView)} />
      <Route path="/admin/bar/:barId/usuarios" element={protectedRoute(AdminUsuarioView)} />
      <Route path="/admin/bar/:barId/analiticas" element={protectedRoute(AdminAnaliticasView)} />

      {/* 404 - debe ir al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default GlobalRouter;