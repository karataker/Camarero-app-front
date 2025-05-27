import { request } from "./apiClient";

const BASE_QR_URL = "http://localhost:8762"; // Cambiar si el backend se mueve

const generarQrUrl = (barId, mesaNombre) =>
  `${BASE_QR_URL}/${barId}/${mesaNombre}`;

// Obtener todos los bares
export const obtenerBares = async () => {
  const res = await request("/api/bares", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener los bares");
  return res.json();
};

// Obtener mesas de un bar
export const obtenerMesas = async (barId) => {
  const res = await request(`/api/bares/${barId}/mesas`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las mesas del bar");
  const data = await res.json();

  return data.map((mesa) => ({
    ...mesa,
    qrUrl: generarQrUrl(barId, mesa.codigo)
  }));
};

// Fusionar mesas
export const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
  const res = await request(`/api/bares/${barId}/mesas/fusionar`, {
    mesaPrincipalCodigo,
    mesaSecundariaCodigo
  }, "PUT");
  if (!res.ok) throw new Error("Error al fusionar las mesas");
  return res.ok;
};

// Crear nueva mesa
export const crearMesa = async (barId, nuevaMesa) => {
  const res = await request(`/api/bares/${barId}/mesas`, nuevaMesa, "POST");
  if (!res.ok) throw new Error("Error al crear nueva mesa");
  return res.json();
};

// Desfusionar todas las mesas unidas a una principal
export const desfusionarMesa = async (barId, codigoMaestra) => {
  const res = await request(`/api/bares/${barId}/mesas/desfusionar/${codigoMaestra}`, {}, "PUT");
  if (!res.ok) throw new Error("Error al desfusionar la mesa");
  return res.json();
};

export const eliminarMesa = async (barId, codigoMesa) => {
  const res = await request(`/api/bares/${barId}/mesas/${codigoMesa}`, {}, "DELETE");
  if (!res.ok) throw new Error("Error al eliminar la mesa");
  return true;
};
