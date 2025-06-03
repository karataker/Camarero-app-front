import { request } from "./apiClient";

const BASE_PATH = "/menu/productos";

export const getProductosByBar = async (barId) => {
  const res = await request(`${BASE_PATH}/bar/${barId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener productos del menú");
  return res.json();
};

export const getProductoMenu = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "GET");
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
};

export const createProductoMenu = async (data) => {
  const res = await request(`${BASE_PATH}`, data, "POST");
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
};

export const updateProductoMenu = async (id, data) => {
  const res = await request(`${BASE_PATH}/${id}`, data, "PUT");
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
};

export const deleteProducto = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "DELETE");
  if (!res.ok) throw new Error("Error al eliminar producto");
};

export const getRacionesDisponibles = async (productoId) => {
  const res = await request(`${BASE_PATH}/${productoId}/raciones-disponibles`, {}, "GET");
  if (!res.ok) throw new Error("Error al calcular raciones");
  return res.json();
};

export const getCategoriasByBar = async (barId) => {
  const res = await request(`/menu/categorias/bar/${barId}`, {}, "GET");
  if (!res.ok) throw new Error("No se pudieron obtener las categorías");
  return res.json();
};