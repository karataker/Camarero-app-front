import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComandasPorMesa, terminarComandasPorMesa } from '../services/comandaService';
import { getMesaPorId, liberarMesa  } from '../services/barService';

export const useComandas = (barId, mesaId) => {
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [comensales, setComensales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nombreMesa, setNombreMesa] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener comandas
      const data = await getComandasPorMesa(barId, mesaId);
      // Filtrar las que no estén terminadas
      const activas = data.filter(c => c.estado !== 'terminado');
      setComandas(activas);

      // Obtener código de mesa
      const mesa = await getMesaPorId(barId, mesaId);
      setNombreMesa(mesa?.codigo || mesaId);

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!barId || !mesaId) return;

    cargarDatos();

    const intervalo = setInterval(() => {
      cargarDatos();
    }, 60000); // cada 1 minuto

    return () => clearInterval(intervalo);
  }, [barId, mesaId]);

  const marcharse = async () => {
    try {
      await terminarComandasPorMesa(barId,mesaId);
      await liberarMesa(barId,mesaId);
      navigate('/');
    } catch (err) {
      console.error("Error al terminar comandas:", err);
    }
  };

  return {
    comandas,
    comensales,
    nombreMesa,
    loading,
    error,
    marcharse,
  };
};