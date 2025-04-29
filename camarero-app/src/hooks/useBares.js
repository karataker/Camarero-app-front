import { useState, useCallback } from 'react';
import { obtenerBares, crearMesa } from '../services/barServiceMock';

export const useBares = () => {
  const [bares, setBares] = useState([]);

  const cargarBares = useCallback(async () => {
    try {
      const data = await obtenerBares();
      setBares(data);
    } catch (error) {
      console.error('Error cargando bares', error);
    }
  }, []);

  const añadirMesa = async (barId, nuevaMesa) => {
    try {
      await crearMesa(barId, nuevaMesa);
      await cargarBares(); // vuelve a traer los bares actualizados
    } catch (error) {
      console.error('Error creando mesa', error);
    }
  };

  const getBarById = (barId) => {
    return bares.find(bar => bar.id === barId);
  };

  return {
    bares,
    cargarBares,
    añadirMesa,
    getBarById
  };
};