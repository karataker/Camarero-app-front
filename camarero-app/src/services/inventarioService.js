import { request } from "./apiClient";

const BASE_PATH = "/inventario";

export const getInventario = async () => {
  const res = await request(`${BASE_PATH}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener el inventario");
  return res.json();
};

export const getInventarioByBar = async (barId) => {
  const res = await request(`${BASE_PATH}/bar/${barId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener el inventario por bar");
  return res.json();
};

export const getProductoInventario = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "GET");
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
};

export const getStockProducto = async (id) => {
  const res = await request(`${BASE_PATH}/${id}/stock`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener el stock");
  return res.json();
};

export const getBajoMinimo = async () => {
  const res = await request(`${BASE_PATH}/bajo-minimo`, {}, "GET");
  if (!res.ok) throw new Error("Error al cargar productos críticos");
  return res.json();
};

export const createProductoInventario = async (data) => {
  const res = await request(`${BASE_PATH}`, data, "POST");
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
};

export const updateProductoInventario = async (id, data) => {
  const res = await request(`${BASE_PATH}/${id}`, data, "PUT");
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
};

export const deleteProductoInventario = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "DELETE");
  if (!res.ok) throw new Error("Error al eliminar producto");
};

export const ajustarEntrada = async (id, cantidad) => {
  const res = await request(`${BASE_PATH}/${id}/ajustar/entrada`, { cantidad }, "POST");
  if (!res.ok) throw new Error("Error al ajustar entrada");
  return res.json();
};

export const ajustarSalida = async (id, cantidad) => {
  const res = await request(`${BASE_PATH}/${id}/ajustar/salida`, { cantidad }, "POST");
  if (!res.ok) throw new Error("Error al ajustar salida");
  return res.json();
};

export const getCategoriasByBar = async (barId) => {
  const res = await request(`${BASE_PATH}/categorias/bar/${barId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las categorías");
  return res.json();
};

export const createCategoria = async (data) => {
  const res = await request(`${BASE_PATH}/categorias`, data, "POST");
  if (!res.ok) throw new Error("Error al crear categoría");
  return res.json();
};

export const getPedidosByProveedor = async (proveedorId) => {
  const res = await request(`${BASE_PATH}/pedidos/proveedor/${proveedorId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener pedidos");
  return res.json();
};

export const getPedidosByBarConDetalles = async (barId) => {
  const res = await request(`${BASE_PATH}/pedidos/bar/${barId}/detalles`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener pedidos");
  return res.json();
};

export const getProveedoresByBar = async (barId) => {
  const res = await request(`${BASE_PATH}/proveedores/bar/${barId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener proveedores");
  return res.json();
};

export const createProveedor = async (proveedor) => {
  const res = await request(`${BASE_PATH}/proveedores`, proveedor, "POST");
  if (!res.ok) throw new Error("Error al crear proveedor");
  return res.json();
};

export const updateProveedor = async (id, proveedor) => {
  const res = await request(`${BASE_PATH}/proveedores/${id}`, proveedor, "PUT");
  if (!res.ok) throw new Error("Error al actualizar proveedor");
  return res.json();
};

export const deleteProveedor = async (id) => {
  const res = await request(`${BASE_PATH}/proveedores/${id}`, {}, "DELETE");
  if (!res.ok) throw new Error("Error al eliminar proveedor");
};

export const createPedidoConDetalles = async (pedidoConDetalles) => {
  const res = await request(`${BASE_PATH}/pedidos`, pedidoConDetalles, "POST");
  if (!res.ok) throw new Error("Error al crear el pedido");
  return res.json();
};