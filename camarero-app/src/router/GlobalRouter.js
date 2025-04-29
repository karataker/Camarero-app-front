import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login';
import Register from '../views/Register';
import LocalesCliente from '../views/LocalesCliente';
import LoginEmpleado from '../views/LoginEmpleado';
import PrivateRoute from '../components/PrivateRoute';
import NotFound from '../views/NotFound';
import PanelEmpleado from '../views/PanelEmpleado';

const GlobalRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login-empleado" element={<LoginEmpleado />} />
      <Route path="*" element={<NotFound />} />

      {/* Cliente */}
      <Route path="/cliente/locales" element={
        <PrivateRoute tipo="cliente">
          <LocalesCliente />
        </PrivateRoute>
      } />

      {/* Admin */}
      <Route path="/admin/panel" element={
        <PrivateRoute tipo="admin">
          <PanelEmpleado />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default GlobalRouter;