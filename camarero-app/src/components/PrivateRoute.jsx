import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const PrivateRoute = ({ children, tipo }) => {
  const { usuario } = useUser();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (tipo && usuario.tipo !== tipo) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;