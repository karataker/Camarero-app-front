import { request } from "./apiClient";

const BASE_PATH = "/facturacion/facturas";

/**
 * Crea una sesión de pago con Stripe y devuelve la URL de checkout.
 * @param {Object} facturaPayload - Contiene cliente, barId e items del pedido.
 * @returns {Promise<{ url: string }>} URL de Stripe
 */
export const crearSesionPago = async (facturaPayload) => {
  const res = await request(`${BASE_PATH}/crear-pago`, facturaPayload, "POST");
  if (!res.ok) throw new Error("Error al crear la sesión de pago");
  return res.json(); // { url: "https://checkout.stripe.com/..." }
};
