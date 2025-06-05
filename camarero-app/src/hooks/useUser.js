import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuarioInternal] = useState(null); // Renombrado para evitar conflicto
  const [loadingUser, setLoadingUser] = useState(true); // Para manejar la carga asíncrona

  useEffect(() => {
    // Intenta cargar el usuario desde localStorage al montar inicialmente
    try {
      const storedUser = localStorage.getItem('camareroAppUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Aquí podrías querer añadir una validación de esta sesión de usuario,
        // por ejemplo, haciendo una llamada a la API si solo almacenas un token.
        // Por simplicidad, usaremos directamente el usuario almacenado.
        setUsuarioInternal(parsedUser);
      }
    } catch (error) {
      console.error("Error al cargar el usuario desde localStorage:", error);
      // Potencialmente limpiar el almacenamiento corrupto
      localStorage.removeItem('camareroAppUser');
    } finally {
      setLoadingUser(false); // Terminado el intento de cargar el usuario
    }
  }, []); // El array vacío asegura que se ejecute solo al montar

  const setUsuario = (userData) => {
    if (userData) {
      localStorage.setItem('camareroAppUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('camareroAppUser'); // Limpiar en logout
    }
    setUsuarioInternal(userData);
  };

  // Opcional: No renderizar hijos hasta que el estado del usuario esté determinado,
  // o pasar loadingUser si los componentes necesitan saberlo.
  if (loadingUser) {
    return null; // O un spinner de carga, o un esqueleto de UI
  }

  return (
    <UserContext.Provider value={{ usuario, setUsuario, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);