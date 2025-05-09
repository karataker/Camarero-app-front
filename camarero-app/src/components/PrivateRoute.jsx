import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const PrivateRoute = ({ children, tipo }) => {
  const { usuario } = useUser();

  if (!usuario) {
    return <Navigate to="/" />;
  }

  if (tipo && usuario.tipo !== tipo) {
    return <Navigate to="/login-empleado" />;
  }

  return children;
};

export default PrivateRoute;