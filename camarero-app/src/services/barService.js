import { request } from "./apiClient";

const BASE_QR_URL = "http://localhost:8762"; // Cambiar si el backend se mueve

const generarQrUrl = (barId, mesaNombre) =>
  `${BASE_QR_URL}/${barId}/${mesaNombre}`;

// Obtener todos los bares
export const obtenerBares = async () => {
  // MODIFICADO: Endpoint para obtener todos los bares
  const res = await request("/api/bares", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener los bares");
  return res.json();
};

// Obtener mesas de un bar
export const obtenerMesas = async (barId) => {
  // MODIFICADO: Endpoint para obtener mesas, barId como query param
  const res = await request(`/api/mesas?barId=${barId}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las mesas del bar");
  const data = await res.json();

  return data.map((mesa) => ({
    ...mesa,
    qrUrl: generarQrUrl(barId, mesa.codigo) // Asumiendo que barId aquí es el Long/int esperado
  }));
};

// Obtener todas las mesas de todos los bares. Añadido 30/05/2025
export const obtenerTodasLasMesas = async () => {
  const res = await request("/api/mesas", {}, "GET"); // Asume que /api/mesas sin barId devuelve todas
  if (!res.ok) throw new Error("Error al obtener todas las mesas");
  const data = await res.json();

  // Asumimos que cada mesa en 'data' tiene una propiedad 'bar' que es un objeto con 'id'
  return data.map((mesa) => {
    if (!mesa.bar || typeof mesa.bar.id === 'undefined') {
      console.warn(`Mesa con código ${mesa.codigo} no tiene información de bar.id. No se generará QR.`);
      return {
        ...mesa,
        qrUrl: null // O alguna URL por defecto o manejar el error de otra forma
      };
    }
    return {
      ...mesa,
      qrUrl: generarQrUrl(mesa.bar.id, mesa.codigo)
    };
  });
};

// Fusionar mesas
export const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
  // MODIFICADO: Endpoint para fusionar mesas, barId en el cuerpo del payload
  const payload = {
    barId: barId.toString(), // Asegurarse que el backend espera String o convertir a Number si es necesario
    mesaPrincipalCodigo,
    mesaSecundariaCodigo
  };
  const res = await request(`/api/mesas/fusionar`, payload, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al fusionar las mesas: ${errorBody}`);
  }
  return res.ok;
};

// Crear nueva mesa
export const crearMesa = async (barId, nuevaMesaData) => {
  // Construir el payload incluyendo el objeto bar con su id
  const payload = {
    ...nuevaMesaData,
    bar: { id: barId } // El backend espera el bar anidado aquí
  };
  // La URL es solo /api/mesas, el barId ahora está en el payload
  const res = await request(`/api/mesas`, payload, "POST");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al crear nueva mesa: ${errorBody}`);
  }
  return res.json();
};

// Alias para mantener consistencia con el hook useBares:
export const añadirMesa = crearMesa;

// Desfusionar todas las mesas unidas a una principal
export const desfusionarMesa = async (barId, codigoMaestra) => {
  // MODIFICADO: Endpoint para desfusionar, barId como query param
  const res = await request(`/api/mesas/desfusionar/${codigoMaestra}?barId=${barId}`, {}, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al desfusionar la mesa: ${errorBody}`);
  }
  return res.json();
};

export const eliminarMesa = async (barId, codigoMesa) => {
  // MODIFICADO: Endpoint para eliminar mesa, barId como query param
  const res = await request(`/api/mesas/${codigoMesa}?barId=${barId}`, {}, "DELETE");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al eliminar la mesa: ${errorBody}`);
  }
  // DELETE requests might not return a body or return a 204 No Content.
  // Returning true or res.ok is fine.
  return res.ok; 
};
