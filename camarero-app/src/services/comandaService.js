import { request } from './apiClient';

// Función para obtener comandas por mesa
export const getComandasPorMesa = async (barId, mesaCodigo) => {
  try {
    const path = `/pedidos/comandas/${barId}/${mesaCodigo}`;
    const response = await request(path, {}, 'GET');
    
    if (!response.ok) {
      throw new Error(`Error en GET comandas: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener comandas:', error);
    throw error;
  }
};


// Función para confirmar una comanda
export const confirmarComanda = async (comandaDTO) => {
  try {
    const path = `/pedidos/comandas/confirmar`;
    const response = await request(path, comandaDTO, 'POST');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al confirmar comanda: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error al confirmar comanda:', error);
    throw error;
  }
};

// Función para obtener comandas por bar
export const getComandasPorBar = async (barId) => {
  try {
    const path = `/pedidos/comandas/${barId}`;
    const response = await request(path, {}, 'GET'); 

    if (!response.ok) {
      throw new Error(`Error en GET comandas por bar: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) {
        return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener comandas por bar:', error);
    throw error;
  }
};


// Función para actualizar el estado de un item de comanda
export const actualizarEstadoItem = async (itemId, nuevoEstado) => {
  try {

    const path = `/pedidos/comandas/items/${itemId}?nuevoEstado=${nuevoEstado}`;
    const response = await request(path, {}, 'PATCH');

    if (!response.ok) {
      throw new Error(`Error al actualizar estado del item: ${response.status} ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error en actualizarEstadoItem:', error);
    throw error;
  }
};

// Función para marcar todas las comandas de una mesa como terminadas
export const terminarComandasPorMesa = async (barId, mesaCodigo) => {
  const res = await request(`/pedidos/comandas/${barId}/${mesaCodigo}/terminar`, {}, 'PUT');
  if (!res.ok) throw new Error('Error al marcar las comandas como terminadas');
  return true;
};
