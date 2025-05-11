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
    const bar = bares.find(b => b.id === barId);
    if (!bar) return null;

    const yaExiste = bar.mesas.some(m => m.codigo === nuevaMesa.codigo);
    if (yaExiste) {
      console.warn(`Ya existe una mesa con el código ${nuevaMesa.codigo}`);
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
    setBares((prevBares) =>
      prevBares.map((bar) => {
        if (bar.id !== barId) return bar;
  
        const mesaPrincipal = bar.mesas.find(m => m.codigo === mesaPrincipalCodigo);
        const mesaSecundaria = bar.mesas.find(m => m.codigo === mesaSecundariaCodigo);
  
        // Solo fusionar si ambas existen y están disponibles
        if (!mesaPrincipal || !mesaSecundaria) return bar;
        if (!mesaPrincipal.disponible || !mesaSecundaria.disponible) return bar;
  
        // Marcar secundaria como fusionada con principal
        const nuevasMesas = bar.mesas.map(mesa => {
          if (mesa.codigo === mesaSecundariaCodigo) {
            return {
              ...mesa,
              fusionadaCon: mesaPrincipalCodigo,
              disponible: false // opcional si se quiere ocultar su "disponibilidad"
            };
          }
          return mesa;
        });
  
        return {
          ...bar,
          mesas: nuevasMesas
        };
      })
    );
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
            if (m.codigo === mesaMaestraCodigo) {
              return {
                ...m,
                disponible: true,
                comensales: 0,
                pedidoEnviado: false
              };
            }

            if (mesasFusionadas.some(fm => fm.codigo === m.codigo)) {
              return {
                ...m,
                fusionadaCon: null,
                disponible: true,
                comensales: 0,
                pedidoEnviado: false
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
