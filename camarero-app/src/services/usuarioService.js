import { request } from "./apiClient";

const BASE_PATH = "/auth/usuarios";

const obtenerUsuariosPorBar = async (barId) => {
  const response = await request(`${BASE_PATH}/bar/${barId}`, {}, "GET");
  const data = await response.json();
  return data;
};

const crearUsuario = async (usuario) => {
  const response = await request(BASE_PATH, usuario, "POST");
  if (!response.ok) throw new Error("Error al crear el usuario");
};

const eliminarUsuario = async (id) => {
  const response = await request(`${BASE_PATH}/${id}`, {}, "DELETE");
  if (!response.ok) throw new Error("Error al eliminar el usuario");
};

export default {
  obtenerUsuariosPorBar,
  crearUsuario,
  eliminarUsuario,
};