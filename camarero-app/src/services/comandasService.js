import { request } from './apiClient'; // Importar la función request

/**
 * Obtiene todas las comandas de una mesa específica.
 * @param {number|string} barId - El ID del bar.
 * @param {string} mesaCodigo - El código (ID) de la mesa.
 * @returns {Promise<Array>} Lista de comandas.
 */
export const getComandasPorMesa = async (barId, mesaCodigo) => {
  try {
    // El path ya no necesita API_BASE_URL
    const path = `/pedidos/comandas/${barId}/${mesaCodigo}`;
    console.log(`Requesting GET ${path}`);
    // Usar la función request del apiClient
    // El tercer argumento es el método HTTP, el segundo es el cuerpo (vacío para GET)
    const response = await request(path, {}, 'GET');
    if (!response.ok) {
      // El manejo de errores puede permanecer similar, o centralizarse más en apiClient si se desea
      throw new Error(`Error en GET comandas: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener comandas:', error);
    throw error;
  }
};

/**
 * Envía una comanda para procesar (confirmar) en el back-end.
 * @param {Object} comandaDTO - DTO de la comanda a enviar.
 * @returns {Promise<string>} Mensaje de éxito o error.
 */
export const confirmarComanda = async (comandaDTO) => {
  try {
    const path = `/pedidos/comandas/confirmar`;
    console.log(`Requesting POST ${path}`, comandaDTO);
    // Usar la función request del apiClient
    // El segundo argumento es el cuerpo de la petición
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

// --- FUNCIÓN NUEVA AÑADIDA JM (Refactorizada para usar apiClient) ---
/**
 * Obtiene todas las comandas de un bar específico.
 * @param {string} barId - El ID del bar.
 * @returns {Promise<Array>} Lista de todas las comandas del bar.
 */
export const getComandasPorBar = async (barId) => {
  try {
    const path = `/pedidos/comandas/${barId}`; // Path sin API_BASE_URL
    console.log(`Requesting GET ${path}`);
    // Usar la función request del apiClient
    const response = await request(path, {}, 'GET'); 

    if (!response.ok) {
      throw new Error(`Error en GET comandas por bar: ${response.status} ${response.statusText}`);
    }
    // El apiClient ya maneja el caso de 204 devolviendo null o un objeto vacío
    // si se configuró así, o la respuesta cruda.
    // Si la respuesta es 204, response.json() podría fallar si el cuerpo está realmente vacío.
    // Es mejor verificar el status code aquí si se espera un array vacío explícitamente para 204.
    if (response.status === 204) {
        return []; // Devuelve array vacío si no hay contenido
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener comandas por bar:', error);
    throw error;
  }
};

