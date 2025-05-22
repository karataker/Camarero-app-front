import { useState, useCallback } from 'react';
import {
  obtenerBares,
  crearMesa,
  desfusionarMesa,
  fusionarMesas as fusionarMesasApi
} from '../services/barService.js';

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
    const bar = bares.find(b => b.id === barId);
    if (!bar) return null;

    const yaExiste = bar.mesas.some(m => m.nombre === nuevaMesa.nombre);
    if (yaExiste) {
      console.warn(`Ya existe una mesa con el nombre ${nuevaMesa.nombre}`);
      return null;
    }

    const mesaCreada = await crearMesa(barId, nuevaMesa);

    setBares(prev =>
      prev.map(bar =>
        bar.id === barId
          ? { ...bar, mesas: [...bar.mesas, mesaCreada] }
          : bar
      )
    );

    return mesaCreada;
  };

  const fusionarMesas = async (barId, mesaPrincipalCodigo, mesaSecundariaCodigo) => {
    try {
      await fusionarMesasApi(barId, mesaPrincipalCodigo, mesaSecundariaCodigo);

      setBares((prevBares) =>
        prevBares.map((bar) => {
          if (bar.id !== barId) return bar;

          const nuevasMesas = bar.mesas.map((mesa) => {
            if (mesa.nombre === mesaSecundariaCodigo) {
              return {
                ...mesa,
                fusionadaCon: mesaPrincipalCodigo,
                estado: "reservada"
              };
            }
            return mesa;
          });

          return { ...bar, mesas: nuevasMesas };
        })
      );
    } catch (err) {
      console.error("Error al fusionar mesas:", err);
    }
  };

  const desfusionarMesa = (barId, mesaMaestraCodigo) => {
    setBares(prev =>
      prev.map(bar => {
        if (bar.id !== barId) return bar;

        const mesasFusionadas = bar.mesas.filter(
          m => m.fusionadaCon === mesaMaestraCodigo
        );

        return {
          ...bar,
          mesas: bar.mesas.map(m => {
            if (m.nombre === mesaMaestraCodigo || mesasFusionadas.some(fm => fm.nombre === m.nombre)) {
              return {
                ...m,
                fusionadaCon: null,
                estado: "disponible",
                comensales: 0
              };
            }
            return m;
          })
        };
      })
    );
  };

  const getBarById = (id) => bares.find(b => b.id === id);

  return {
    bares,
    cargarBares,
    añadirMesa,
    fusionarMesas,
    desfusionarMesa,
    getBarById
  };
};