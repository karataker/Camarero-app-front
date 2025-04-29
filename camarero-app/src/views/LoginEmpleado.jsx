import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/login.css'; // Usamos los mismos estilos de login

const LoginEmpleado = () => {
  const navigate = useNavigate();
  const { setUsuario } = useUser();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const matricula = e.target.matricula.value;
    const password = e.target.password.value;

    // Validación simple (mock)
    if (matricula === '1234' && password === 'admin') {
      const mockUsuario = {
        tipo: 'admin',
        nombre: 'Empleado Demo'
      };
      setUsuario(mockUsuario);
      navigate('/admin/panel');
    } else {
      alert('Matrícula o contraseña incorrectas');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Login Empleado</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="matricula" placeholder="Matrícula de empleado" required />
          <input type="password" name="password" placeholder="Contraseña" required />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginEmpleado;