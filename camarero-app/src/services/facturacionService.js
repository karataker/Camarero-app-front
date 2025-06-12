import { request } from "./apiClient";

const BASE_PATH = "/facturacion/facturas";


export const getFacturas = async () => {
  const res = await request(BASE_PATH, {}, "GET");
  if (!res.ok) {
    throw new Error("Error al obtener todas las facturas");
  }
  return res.json();
};


export const getFacturasPorBar = async (barId) => {
  const res = await request(`${BASE_PATH}/bares/${barId}`, {}, "GET");

  if (!res.ok) {
    throw new Error("Error al obtener las facturas del bar");
  }
  return res.json();
};



export const getFacturaPorId = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "GET");

  if (!res.ok) {
    throw new Error(`Error al obtener la factura con ID ${id}`);
  }
  return res.json();
};

// Función para crear una sesión de pago con Stripe
export const crearSesionPago = async (facturaPayload) => {
  const res = await request(`${BASE_PATH}/crear-pago`, facturaPayload, "POST");
  if (!res.ok) throw new Error("Error al crear la sesión de pago");
  return res.json();
};

// Función para crear una factura desde una comanda
export const crearFacturaDesdeComanda = async (comandaDTO) => {
  const res = await request(`${BASE_PATH}/crear-desde-comanda`, comandaDTO, "POST");
  if (!res.ok) {
    throw new Error("Error al crear la factura desde comanda");
  }
};

// Función para notificar un pago exitoso a través de Stripe
export const pagoExitoso = async (sessionId) => {
  const res = await request(`${BASE_PATH}/pago-exitoso`, { sessionId }, "POST");
  if (!res.ok) throw new Error("Error al notificar pago exitoso");
  return res.json();
};


export const confirmarComanda = async (comandaPayload) => {
  const res = await request("/pedidos/comandas/confirmar", comandaPayload, "POST");
  if (!res.ok) throw new Error("Error al confirmar la comanda");
};