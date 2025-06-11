import { request } from "./apiClient";

const BASE_PATH = "/analiticas";

export const getResumenAnalitico = async (barId, anio) => {
  const res = await request(`${BASE_PATH}/bar/${barId}/resumen/${anio}`, {}, "GET");
  if (!res.ok) throw new Error("Error al obtener resumen analítico");
  return res.json();
};