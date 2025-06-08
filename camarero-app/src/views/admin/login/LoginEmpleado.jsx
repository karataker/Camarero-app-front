import React, { useState } from "react";
import { login } from "../../../services/apiClient";
import { useUser } from "../../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import "../../../styles/admin/login/login.css"; 

const LoginEmpleado = () => {
  const [matricula, setMatricula] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const { setUsuario } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await login(matricula, contrasena);
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsuario({ matricula: payload.sub, tipo: payload.rol });
      setTimeout(() => {
        navigate("/admin/home");
      }, 50);
    } catch (err) {
      setError("Matrícula o contraseña incorrecta.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Login Empleado</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="matricula"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginEmpleado;
