import React from 'react';

const Register = () => {
  const handleRegister = (e) => {
    e.preventDefault();
    alert('Cuenta registrada (mock)');
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nombre completo" required />
        <input type="email" placeholder="Correo electrónico" required />
        <input type="password" placeholder="Contraseña" required />
        <select required>
          <option value="">Selecciona tipo de usuario</option>
          <option value="cliente">Cliente</option>
          <option value="admin">Empleado</option>
        </select>
        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  );
};

export default Register;