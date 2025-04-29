import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUsuario } = useUser();

  const handleLogin = (e) => {
    e.preventDefault();
    const tipoUsuario = e.target.tipo.value;

    const mockUsuario = {
      tipo: tipoUsuario,
      nombre: 'Juan Pérez'
    };

    setUsuario(mockUsuario);

    if (tipoUsuario === 'cliente') {
      navigate('/cliente/locales');
    } else {
      navigate('/admin/comandas');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Correo electrónico" required />
          <input type="password" placeholder="Contraseña" required />
          <select name="tipo" required>
            <option value="cliente">Cliente</option>
            <option value="admin">Empleado</option>
          </select>
          <button type="submit">Entrar</button>
        </form>
        <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
      </div>
    </div>
  );
};

export default Login;