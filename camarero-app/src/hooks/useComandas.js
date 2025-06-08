import { useState, useEffect } from 'react';
import { getComandasPorMesa } from '../services/comandasService';

/**
 * Un hook personalizado para obtener y gestionar las comandas de una mesa.
 * @param {string} barId - El ID del bar.
 * @param {string} mesaId - El ID de la mesa.
 * @returns {Object} Un objeto con el estado de las comandas: { comandas, comensales, loading, error }.
 */
export const useComandas = (barId, mesaId) => {
  // Estado para almacenar las comandas
  const [comandas, setComandas] = useState([]);
  // Estado para almacenar el número de comensales
  const [comensales, setComensales] = useState(0);
  // Estado para saber si los datos están cargando
  const [loading, setLoading] = useState(true);
  // Estado para capturar cualquier error
  const [error, setError] = useState(null);
  // Estado para almacenar el nombre de la mesa
  const [nombreMesa, setNombreMesa] = useState('');

  useEffect(() => {
    // Si no tenemos barId o mesaId, no hacemos nada.
    if (!barId || !mesaId) return;

    // Función asíncrona para cargar los datos
    const cargarComandas = async () => {
      try {
        setLoading(true);
        // La 'data' que llega aquí es directamente el array de comandas
        const data = await getComandasPorMesa(barId, mesaId); 
        
        setComandas(data); // Asigna directamente el array
        setComensales(4); // Asigna un valor por defecto o elimínalo si no lo usas
        
        // Aquí podrías obtener más información sobre la mesa si es necesario
        // const datosMesa = await fetchMesaInfo(barId, mesaId);
        // setNombreMesa(datosMesa.nombre); // o datosMesa.codigo
        
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err); // Guardamos el error
      } finally {
        setLoading(false); // Terminamos de cargar (con éxito o error)
      }
    };

    cargarComandas();

    // El array de dependencias [barId, mesaId] asegura que este efecto
    // se vuelva a ejecutar solo si uno de estos IDs cambia.
  }, [barId, mesaId]);

  // Devolvemos el estado para que el componente pueda usarlo
  return { comandas, comensales, nombreMesa, loading, error };
};