import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUsuario } = useUser();

  const handleLogin = (e) => {
    e.preventDefault();

    const tipoUsuario = 'cliente'; // forzado
    const mockUsuario = {
      tipo: tipoUsuario,
      nombre: 'Cliente Demo'
    };

    setUsuario(mockUsuario);
    navigate('/cliente/locales');
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Correo electrónico" required />
          <input type="password" placeholder="Contraseña" required />
          <input type="hidden" name="tipo" value="cliente" />
          <button type="submit">Entrar</button>
        </form>
        <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
      </div>
    </div>
  );
};

export default Login;