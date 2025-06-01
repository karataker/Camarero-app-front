import { request } from "./apiClient";

export const crearReserva = async (barId, reserva) => {
  // barId is now part of the URL, and the reserva object should already contain the bar reference if needed by backend.
  // The backend service will handle setting the bar based on the barId from the path.
  const res = await request(`/api/bares/${barId}/reservas`, reserva, 'POST');
  if (!res.ok) throw new Error('Error al enviar la reserva');
  return res.json();
};

export const obtenerReservas = async (barId) => {
  const res = await request(`/api/bares/${barId}/reservas`, {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
};

// Assuming elimination by ID is still global, or if you need bar-specific, change to /api/bares/{barId}/reservas/{id}
export const eliminarReserva = async (id) => {
  const res = await request(`/api/reservas/${id}`, {}, 'DELETE');
  if (!res.ok) throw new Error('Error al eliminar la reserva');
  return true;
};

// Assuming update by ID is still global, or if you need bar-specific, change to /api/bares/{barId}/reservas/{id}
export const actualizarReserva = async (id, reservaActualizada) => {
  const res = await request(`/api/reservas/${id}`, reservaActualizada, 'PUT');
  if (!res.ok) throw new Error('Error al actualizar la reserva');
  return res.json();
}