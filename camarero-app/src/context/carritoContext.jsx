import React, { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarProducto = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(p => p.id === producto.id);
      if (existente) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarProducto = (id) => {
    setCarrito(prev => prev
      .map(p => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p)
      .filter(p => p.cantidad > 0));
  };

  const vaciarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregarProducto, quitarProducto, vaciarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};