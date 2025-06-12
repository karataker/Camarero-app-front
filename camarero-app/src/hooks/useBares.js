import { useState, useCallback } from 'react';
import {
  obtenerBares,
  obtenerMesas,
  crearMesa as crearMesaApi,
  desfusionarMesa as desfusionarMesaApi,
  fusionarMesas as fusionarMesasApi,
  eliminarMesa as eliminarMesaApi
} from '../services/barService.js';

export const useBares = () => {
  const [bares, setBares] = useState([]);

  const cargarBares = useCallback(async () => {
    try {
      const listaDeBares = await obtenerBares();
      if (listaDeBares && listaDeBares.length > 0) {
        const baresConMesas = await Promise.all(
          listaDeBares.map(async (bar) => {
            try {
              const mesasDelBar = await obtenerMesas(bar.id); 
              return { ...bar, mesas: mesasDelBar || [] };
            } catch (errorMesas) {
              console.error(`Error al cargar mesas para el bar ${bar.id}:`, errorMesas);
              return { ...bar, mesas: [] };
            }
          })
        );
        setBares(baresConMesas);
      } else {
        setBares([]);
      }
    } catch (error) {
      console.error("Error al cargar bares:", error);
      setBares([]);
    }
  }, []);

  const añadirMesa = async (barId, nuevaMesa) => {
    const bar = bares.find(b => b.id === barId);
    if (!bar) return null;

    const yaExiste = bar.mesas.some(m => m.codigo === nuevaMesa.codigo);
    if (yaExiste) {
      console.warn(`Ya existe una mesa con el código ${nuevaMesa.codigo}`);
      return null;
    }

    try {

      const mesaCreada = await crearMesaApi(barId, nuevaMesa);

      const mesaConQR = {
        ...mesaCreada,
        qrUrl: `${window.location.origin}/cliente/${barId}/${mesaCreada.codigo}`
      };

      setBares(prev =>
        prev.map(bar =>
          bar.id === barId
            ? { ...bar, mesas: [...bar.mesas, mesaConQR] }
            : bar
        )
      );

      return mesaConQR;
    } catch (error) {
      console.error('Error al crear mesa:', error);
      return null;
    }
  };

  const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
    try {
      await fusionarMesasApi(barId, mesaPrincipalCodigo, mesaSecundariaCodigo);
      await cargarBares();
    } catch (err) {
      console.error("Error al fusionar mesas:", err);
    }
  };

  const desfusionarMesa = async (barId, mesaMaestraCodigo) => {
    try {
      const mesasActualizadas = await desfusionarMesaApi(barId, mesaMaestraCodigo);
      setBares(prev =>
        prev.map(bar =>
          bar.id === barId ? { ...bar, mesas: mesasActualizadas } : bar
        )
      );
    } catch (err) {
      console.error("Error al desfusionar mesas:", err);
    }
  };

  const eliminarMesa = async (barId, mesaCodigo) => {
    try {
      await eliminarMesaApi(barId, mesaCodigo);
      setBares(prev =>
        prev.map(bar =>
          bar.id === barId
            ? { ...bar, mesas: bar.mesas.filter(m => m.codigo !== mesaCodigo) }
            : bar
        )
      );

      return true;
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      return false;
    }
  };

  const getBarById = (id) => bares.find(b => b.id === id);

  return {
    bares,
    cargarBares,
    añadirMesa,
    fusionarMesas,
    desfusionarMesa,
    eliminarMesa,
    getBarById
  };
};
