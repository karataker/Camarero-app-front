import { request } from "./apiClient";

const BASE_QR_URL = "http://localhost:8762";

const generarQrUrl = (barId, mesaCodigo) =>
  `${BASE_QR_URL}/${barId}/${mesaCodigo}`;

// Obtener todos los bares
export const obtenerBares = async () => {
  const res = await request("/api/bares", {}, "GET");
  if (!res.ok) throw new Error("Error al obtener los bares");
  return res.json();
};

export const obtenerMesas = async (barId) => {
  const res = await request(`/api/bares/${barId}/mesas`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener las mesas del bar");
  const data = await res.json();

  return data.map((mesa) => ({
    ...mesa,
    qrUrl: generarQrUrl(barId, mesa.codigo)
  }));
};


export const ocuparMesa = async (barId, mesaCodigo, comensales) => {
  const payload = { comensales };
  const res = await request(`/api/bares/${barId}/mesas/${mesaCodigo}/ocupar`, payload, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al ocupar la mesa: ${errorBody}`);
  }
  return res.json();
};

export const obtenerTodasLasMesas = async () => {
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
  const res = await request(`/api/bares/${barId}/mesas`, payload, "POST");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al crear nueva mesa: ${errorBody}`);
  }
  return res.json();
};

export const añadirMesa = crearMesa;

export const desfusionarMesa = async (barId, codigoMaestra) => {
  const res = await request(`/api/bares/${barId}/mesas/desfusionar/${codigoMaestra}`, {}, "PUT");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al desfusionar la mesa: ${errorBody}`);
  }
  return res.json();
};

export const eliminarMesa = async (barId, codigoMesa) => {
  const res = await request(`/api/bares/${barId}/mesas/${codigoMesa}`, {}, "DELETE");
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al eliminar la mesa: ${errorBody}`);
  }
  return res.ok;
};

export const obtenerBarPorId = async (barId) => {
  const res = await request(`/api/bares/${barId}`, {}, "GET"); 
  if (!res.ok) { 
    const errorBody = await res.text();
    throw new Error(`Error al obtener la información del bar: ${errorBody}`);
  }
  return res.json();
};

export const getMesaPorId = async (barId, mesaId) => {
  const res = await request(`/api/bares/${barId}/mesas`, {}, 'GET');
  if (!res.ok) throw new Error('Error al obtener la mesa');
  const mesas = await res.json();
  return mesas.find(m => m.id === parseInt(mesaId)); 
};

export const liberarMesa = async (barId, mesaId) => {
  const res = await request(`/api/bares/${barId}/mesas/id/${mesaId}/liberar`, {}, 'PUT');
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error al liberar la mesa: ${errorBody}`);
  }
  return res.json();
};