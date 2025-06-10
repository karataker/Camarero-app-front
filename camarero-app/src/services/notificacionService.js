import { request } from './apiClient';

export const contarNoLeidas = async (tipo, barId) => {
  const res = await request(`/notificaciones/${tipo}/bar/${barId}/no-leidas`, {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
};

export const getNotificacionesPorTipoYBar = async (tipo, barId) => {
  const res = await request(`/notificaciones/${tipo}/bar/${barId}`, {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
};


export const marcarNotificacionesComoLeidas = async (tipo) => {
  const res = await request(`/notificaciones/${tipo}/marcar-leidas`, {}, 'PUT');
  if (!res.ok) {
    throw new Error('Error al marcar notificaciones como leídas');
  }
};