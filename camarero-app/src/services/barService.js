import { request } from "./apiClient";

const BASE_QR_URL = "http://localhost:8762"; // This is your base for QR URLs

// CORRECTED: Changed backticks and removed extra slashes around BASE_QR_URL
// The correct syntax for template literals is `${variableName}`
const generarQrUrl = (barId, mesaCodigo) =>
  `${BASE_QR_URL}/${barId}/${mesaCodigo}`; // Corrected template literal syntax

// Obtener todos los bares
export const obtenerBares = async () => {
  const res = await request("/api/bares", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener los bares");
  return res.json();
};

// Obtener mesas de un bar (modificado para obtener todas las mesas del bar)
export const obtenerMesas = async (barId) => {
  // Assuming the latest backend structure for mesas is /api/bares/{barId}/mesas
  const res = await request(`/api/bares/${barId}/mesas`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las mesas del bar");
  const data = await res.json();

  return data.map((mesa) => ({
    ...mesa,
    qrUrl: generarQrUrl(barId, mesa.codigo) // This will now correctly use the BASE_QR_URL value
  }));
};

// NUEVA FUNCIÓN: Ocupar una mesa
export const ocuparMesa = async (barId, mesaCodigo, comensales) => {
  const payload = { comensales };
  const res = await request(`/api/bares/${barId}/mesas/${mesaCodigo}/ocupar`, payload, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al ocupar la mesa: ${errorBody}`);
  }
  return res.json(); // Returns the updated Mesa object
};

// Other existing functions (ensure they also use the updated backend paths)

export const obtenerTodasLasMesas = async () => {
  // This endpoint might be problematic if /api/mesas no longer returns all mesas across bars
  // Consider if this function is still needed or how it should fetch if barId is always required.
  const res = await request("/api/mesas", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener todas las mesas");
  const data = await res.json();

  return data.map((mesa) => {
    if (!mesa.bar || typeof mesa.bar.id === 'undefined') {
      console.warn(`Mesa con código ${mesa.codigo} no tiene información de bar.id. No se generará QR.`);
      return {
        ...mesa,
        qrUrl: null
      };
    }
    return {
      ...mesa,
      qrUrl: generarQrUrl(mesa.bar.id, mesa.codigo)
    };
  });
};

export const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
  const payload = {
    mesaPrincipalCodigo,
    mesaSecundariaCodigo
  };
  // Ensure the backend endpoint matches this (e.g., /api/bares/{barId}/mesas/fusionar)
  const res = await request(`/api/bares/${barId}/mesas/fusionar`, payload, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al fusionar las mesas: ${errorBody}`);
  }
  return res.ok;
};

export const crearMesa = async (barId, nuevaMesaData) => {
  const payload = {
    ...nuevaMesaData
  };
  // Ensure the backend endpoint matches this (e.g., /api/bares/{barId}/mesas)
  const res = await request(`/api/bares/${barId}/mesas`, payload, "POST");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al crear nueva mesa: ${errorBody}`);
  }
  return res.json();
};

export const añadirMesa = crearMesa;

export const desfusionarMesa = async (barId, codigoMaestra) => {
  // Ensure the backend endpoint matches this (e.g., /api/bares/{barId}/mesas/desfusionar/{codigo})
  const res = await request(`/api/bares/${barId}/mesas/desfusionar/${codigoMaestra}`, {}, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al desfusionar la mesa: ${errorBody}`);
  }
  return res.json();
};

export const eliminarMesa = async (barId, codigoMesa) => {
  // Ensure the backend endpoint matches this (e.g., /api/bares/{barId}/mesas/{codigoMesa})
  const res = await request(`/api/bares/${barId}/mesas/${codigoMesa}`, {}, "DELETE");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al eliminar la mesa: ${errorBody}`);
  }
  return res.ok;
};

export const obtenerBarPorId = async (barId) => {
  // Use the 'request' utility for consistency and correct base URL handling
  const res = await request(`/api/bares/${barId}`, {}, "GET"); //
  if (!res.ok) { //
    const errorBody = await res.text(); // Optional: get more detailed error from response
    throw new Error(`Error al obtener la información del bar: ${errorBody}`); //
  }
  return res.json(); //
};