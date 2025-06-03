import { useEffect, useState } from "react";
import {
  getCategoriasByBar,
  getProductosByBar,
  crearProducto,
  actualizarProducto,
  toggleVisibleProducto,
} from "../services/menuService";

export const useCarta = (barId) => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  const cargarCarta = async () => {
    const [cats, prods] = await Promise.all([
      getCategoriasByBar(barId),
      getProductosByBar(barId)
    ]);
    setCategorias(cats);
    setProductos(prods);
  };

  useEffect(() => {
    if (barId) cargarCarta();
  }, [barId]);

  return {
    categorias,
    productos,
    crearProducto,
    actualizarProducto,
    toggleVisibleProducto,
    recargar: cargarCarta,
  };
};