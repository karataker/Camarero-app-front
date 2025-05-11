import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/login.css'; // Usamos los mismos estilos de login

const LoginEmpleado = () => {
  const navigate = useNavigate();
  const { setUsuario } = useUser();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const matricula = e.target.matricula.value;
      const password = e.target.password.value;

      // Simulamos login (mock)
      if (matricula === '1234' && password === 'admin') {
        const mockUsuario = {
          tipo: 'admin',
          nombre: 'Admin Demo'
        };
        setUsuario(mockUsuario);
        localStorage.setItem('isAdmin', 'true'); // Add this line
        localStorage.setItem('token', 'dummy-token'); // Add this line
        navigate('/admin/home');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      alert('Matrícula o contraseña incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Login Empleado</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="matricula" placeholder="Matrícula de empleado" required />
          <input type="password" name="password" placeholder="Contraseña" required />
          <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginEmpleado;