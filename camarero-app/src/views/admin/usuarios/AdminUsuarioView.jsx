import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usuarioService from '../../../services/usuarioService';
import '../../../styles/admin/usuarios/adminUsuarioView.css';

const AdminUsuarioView = () => {
  const { barId } = useParams();
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    matricula: '',
    contrasena: '',
    nombre: '',
    apellidos: '',
    email: '',
    rol: { id: 1 },
    barId: parseInt(barId),
  });

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioService.obtenerUsuariosPorBar(barId);
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [barId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rol_id') {
      setNuevoUsuario({ ...nuevoUsuario, rol: { id: parseInt(value) } });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, [name]: value });
    }
  };

  const handleGuardar = async () => {
    try {
      await usuarioService.crearUsuario(nuevoUsuario);
      setNuevoUsuario({
        matricula: '',
        contrasena: '',
        nombre: '',
        apellidos: '',
        email: '',
        rol: { id: 1 },
        barId: parseInt(barId),
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al crear usuario', error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await usuarioService.eliminarUsuario(id);
      fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario', error);
    }
  };

  return (
    <div className="admin-usuario-container">
      <h2>Gestión de Usuarios</h2>

      <div className="usuario-formulario">
        <input name="matricula" value={nuevoUsuario.matricula} onChange={handleChange} placeholder="Matrícula" />
        <input name="contrasena" type="password" value={nuevoUsuario.contrasena} onChange={handleChange} placeholder="Contraseña" />
        <input name="nombre" value={nuevoUsuario.nombre} onChange={handleChange} placeholder="Nombre" />
        <input name="apellidos" value={nuevoUsuario.apellidos} onChange={handleChange} placeholder="Apellidos" />
        <input name="email" type="email" value={nuevoUsuario.email} onChange={handleChange} placeholder="Email" />
        <select name="rol_id" value={nuevoUsuario.rol.id} onChange={handleChange}>
          <option value={1}>CAMARERO</option>
          <option value={2}>ADMIN</option>
          <option value={4}>COCINERO</option>
        </select>
        <button type="submit" onClick={handleGuardar}>Guardar Usuario</button>
      </div>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Matrícula</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(usuarios) && usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.apellidos}</td>
              <td>{usuario.matricula}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol?.nombre}</td>
              <td>
                <button className="boton-eliminar" onClick={() => handleEliminar(usuario.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsuarioView;
