import { request } from "./apiClient";

const BASE_QR_URL = "http://localhost:8762"; // Cambiar si el backend se mueve

const generarQrUrl = (barId, mesaNombre) =>
  `${BASE_QR_URL}/${barId}/${mesaNombre}`;

export const obtenerBares = async () => {
  const res = await request("/api/bares", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener los bares");
  return res.json();
};

// Obtener mesas de un bar - barId now in path
export const obtenerMesas = async (barId) => {
  const res = await request(`/api/bares/${barId}/mesas`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las mesas del bar");
  const data = await res.json();

  return data.map((mesa) => ({
    ...mesa,
    qrUrl: generarQrUrl(barId, mesa.codigo)
  }));
};

// Obtener todas las mesas de todos los bares. Added 30/05/2025
// This endpoint might need to be adjusted if you no longer want a global /api/mesas.
// If you only ever access mesas via a bar, you can remove this.
export const obtenerTodasLasMesas = async () => {
  // If you keep this, ensure your backend has an endpoint for it (e.g., a dedicated /api/mesas that returns all)
  // Or, iterate through all bars and then get their mesas.
  console.warn("`obtenerTodasLasMesas` might not be compatible with new endpoint structure. Consider refactoring.");
  const res = await request("/api/mesas", {}, "GET"); // Assuming /api/mesas without barId still returns all
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

// Fusionar mesas - barId now in path
export const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
  const payload = {
    mesaPrincipalCodigo,
    mesaSecundariaCodigo
  };
  const res = await request(`/api/bares/${barId}/mesas/fusionar`, payload, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al fusionar las mesas: ${errorBody}`);
  }
  return res.ok;
};

// Crear nueva mesa - barId now in path
export const crearMesa = async (barId, nuevaMesaData) => {
  const payload = {
    ...nuevaMesaData
    // No need to include bar: { id: barId } in payload as barId is in the path
  };
  const res = await request(`/api/bares/${barId}/mesas`, payload, "POST");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al crear nueva mesa: ${errorBody}`);
  }
  return res.json();
};

export const añadirMesa = crearMesa;

// Desfusionar todas las mesas unidas a una principal - barId now in path
export const desfusionarMesa = async (barId, codigoMaestra) => {
  const res = await request(`/api/bares/${barId}/mesas/desfusionar/${codigoMaestra}`, {}, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al desfusionar la mesa: ${errorBody}`);
  }
  return res.json();
};

// Eliminar mesa - barId now in path
export const eliminarMesa = async (barId, codigoMesa) => {
  const res = await request(`/api/bares/${barId}/mesas/${codigoMesa}`, {}, "DELETE");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al eliminar la mesa: ${errorBody}`);
  }
  return res.ok;
};