import { request } from "./apiClient";

export const crearReserva = async (barId, reserva) => {
  const res = await request(`/api/bares/${barId}/reservas`, reserva, 'POST');
  if (!res.ok) throw new Error('Error al enviar la reserva');
  return res.json();
};

export const obtenerReservas = async (barId) => {
  const res = await request(`/api/bares/${barId}/reservas`, {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
};

export const eliminarReserva = async (id) => {
  const res = await request(`/api/reservas/${id}`, {}, 'DELETE');
  if (!res.ok) throw new Error('Error al eliminar la reserva');
  return true;
};

export const actualizarReserva = async (id, reservaActualizada) => {
  const res = await request(`/api/reservas/${id}`, reservaActualizada, 'PUT');
  if (!res.ok) throw new Error('Error al actualizar la reserva');
  return res.json();
}