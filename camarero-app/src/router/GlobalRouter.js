import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../views/Login';
import Register from '../views/Register';
import LocalesCliente from '../views/LocalesCliente';
import ComandaCliente from '../views/ComandaCliente';
import AlmacenAdmin from '../views/AlmacenAdmin';
import ComandasAdmin from '../views/ComandasAdmin';
import PrivateRoute from '../components/PrivateRoute';

const GlobalRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Cliente */}
      <Route path="/cliente/locales" element={
        <PrivateRoute tipo="cliente">
          <LocalesCliente />
        </PrivateRoute>
      } />
      <Route path="/cliente/comanda" element={
        <PrivateRoute tipo="cliente">
          <ComandaCliente />
        </PrivateRoute>
      } />

      {/* Admin */}
      <Route path="/admin/almacen" element={
        <PrivateRoute tipo="admin">
          <AlmacenAdmin />
        </PrivateRoute>
      } />
      <Route path="/admin/comandas" element={
        <PrivateRoute tipo="admin">
          <ComandasAdmin />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default GlobalRouter;