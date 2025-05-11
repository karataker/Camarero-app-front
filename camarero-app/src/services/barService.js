// src/services/barService.js

const API_URL = 'http://localhost:8080/api/bares';

export const obtenerBares = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener los bares');
  }
  const data = await response.json();
  return data;
};

export const crearMesa = async (barId, nuevaMesa) => {
  const response = await fetch(`${API_URL}/${barId}/mesas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaMesa)
  });
  if (!response.ok) {
    throw new Error('Error al crear nueva mesa');
  }
  const data = await response.json();
  return data;
};

export const obtenerMesas = async (barId) => {
  const response = await fetch(`${API_URL}/${barId}/mesas`);
  if (!response.ok) {
    throw new Error('Error al obtener las mesas del bar');
  }
  const data = await response.json();
  return data;
};