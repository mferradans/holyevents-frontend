import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verificar si hay un token en localStorage

  return token ? children : <Navigate to="/admin/login" />; // Si hay token, renderiza la ruta, si no, redirige al login
};

export default PrivateRoute;
