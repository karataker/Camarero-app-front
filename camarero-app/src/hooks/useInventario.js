import { useEffect, useState } from "react";
import {
  getInventarioByBar,
  createProductoInventario,
  updateProductoInventario,
  deleteProductoInventario,
} from "../services/inventarioService";

export const useInventario = (barId) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarInventario = async () => {
    if (!barId) return;
    setCargando(true);
    try {
      const data = await getInventarioByBar(barId);
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const crearProducto = async (producto) => {
    const nuevo = await createProductoInventario({ ...producto, barId });
    setProductos((prev) => [...prev, nuevo]);
  };

  const actualizarProducto = async (id, producto) => {
    const actualizado = await updateProductoInventario(id, producto);
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? actualizado : p))
    );
  };

  const eliminarProducto = async (id) => {
    await deleteProductoInventario(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    cargarInventario();
  }, [barId]);

  return {
    productos,
    cargando,
    error,
    cargarInventario,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  };
};