import React, { createContext, useContext, useState } from 'react';

const ComandaContext = createContext();

export const ComandaProvider = ({ children }) => {
  const [comandas, setComandas] = useState([]);

  const agregarComanda = (nueva) => {
    setComandas(prev => [...prev, nueva]);
  };

  const limpiarComandas = () => {
    setComandas([]);
  };

  return (
    <ComandaContext.Provider value={{ comandas, agregarComanda, limpiarComandas }}>
      {children}
    </ComandaContext.Provider>
  );
};

export const useComandas = () => {
  const context = useContext(ComandaContext);
  if (!context) throw new Error("useComandas debe usarse dentro de un ComandaProvider");
  return context;
};