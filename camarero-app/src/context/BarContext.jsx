import { createContext, useContext, useState } from 'react';

const BarContext = createContext();

export const useBar = () => useContext(BarContext);

export const BarProvider = ({ children }) => {
  const [barSeleccionado, setBarSeleccionado] = useState(null);

  return (
    <BarContext.Provider value={{ barSeleccionado, setBarSeleccionado }}>
      {children}
    </BarContext.Provider>
  );
};
