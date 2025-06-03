import { createContext, useContext, useEffect, useState } from 'react';

const BarContext = createContext();

export const useBar = () => useContext(BarContext);

export const BarProvider = ({ children }) => {
  const [barSeleccionado, setBarSeleccionadoState] = useState(() => {
    const guardado = localStorage.getItem("barSeleccionado");
    return guardado ? parseInt(guardado) : null;
  });

  const setBarSeleccionado = (barId) => {
    setBarSeleccionadoState(barId);
    if (barId !== null) {
      localStorage.setItem("barSeleccionado", barId);
    } else {
      localStorage.removeItem("barSeleccionado");
    }
  };

  return (
    <BarContext.Provider value={{ barSeleccionado, setBarSeleccionado }}>
      {children}
    </BarContext.Provider>
  );
};