import { request } from "./apiClient";

const BASE_PATH = "/facturacion/facturas";

/**
 * Obtiene todas las facturas.
 * @returns {Promise<Array>} Lista de facturas
 */
export const getFacturas = async () => {
  const res = await request(BASE_PATH, {}, "GET");
  if (!res.ok) {
    throw new Error("Error al obtener todas las facturas");
  }
  return res.json();
};

/**
 * Obtiene todas las facturas de un bar concreto.
 * @param {number} barId - Identificador del bar
 * @returns {Promise<Array>} Lista de facturas
 */
export const getFacturasPorBar = async (barId) => {
  const res = await request(`${BASE_PATH}/bares/${barId}`, {}, "GET");

  if (!res.ok) {
    throw new Error("Error al obtener las facturas del bar");
  }
  return res.json();
};

/**
 * Obtiene una factura por su ID.
 * @param {number} id - Identificador de la factura
 * @returns {Promise<Object>} Objeto factura
 */
export const getFacturaPorId = async (id) => {
  const res = await request(`${BASE_PATH}/${id}`, {}, "GET");

  if (!res.ok) {
    throw new Error(`Error al obtener la factura con ID ${id}`);
  }
  return res.json();
};

/**
 * Crea una sesión de pago con Stripe y devuelve el ID de sesión.
 * @param {Object} facturaPayload - Contiene los datos de la factura
 * @returns {Promise<{ id: string }>} ID de la sesión de Stripe
 */
export const crearSesionPago = async (facturaPayload) => {
  const res = await request(`${BASE_PATH}/crear-pago`, facturaPayload, "POST");
  if (!res.ok) throw new Error("Error al crear la sesión de pago");
  return res.json();
};

/**
 * Crea una factura a partir de una comanda.
 * @param {Object} comandaDTO - DTO de la comanda (cliente, barId, items, etc.)
 * @returns {Promise<void>}
 */
export const crearFacturaDesdeComanda = async (comandaDTO) => {
  const res = await request(`${BASE_PATH}/crear-desde-comanda`, comandaDTO, "POST");
  if (!res.ok) {
    throw new Error("Error al crear la factura desde comanda");
  }
};

/**
 * Notifica al backend que el pago ha sido exitoso.
 * @param {string} sessionId - ID de la sesión de Stripe
 * @returns {Promise<Object>} Factura actualizada
 */
export const pagoExitoso = async (sessionId) => {
  const res = await request(`${BASE_PATH}/pago-exitoso`, { sessionId }, "POST");
  if (!res.ok) throw new Error("Error al notificar pago exitoso");
  return res.json();
};


/**
 * Confirma una comanda en el sistema de pedidos.
 * @param {Object} comandaPayload - DTO de la comanda
 * @returns {Promise<void>}
 */
export const confirmarComanda = async (comandaPayload) => {
  const res = await request("/pedidos/comandas/confirmar", comandaPayload, "POST");
  if (!res.ok) throw new Error("Error al confirmar la comanda");
};