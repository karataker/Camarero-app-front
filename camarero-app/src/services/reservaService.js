import { request } from "./apiClient";


export const crearReserva = async (reserva) => {
  const res = await request('/api/reservas', reserva, 'POST');
  if (!res.ok) throw new Error('Error al enviar la reserva');
  return res.json();
};


export const obtenerReservas = async () => {
  const res = await request('/api/reservas', {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
};



