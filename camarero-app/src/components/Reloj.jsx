import React, { useEffect, useState } from 'react';
import '../styles/relojCocina.css'; // Asegúrate de importar este CSS

const Reloj = ({ formato = 'HH:mm:ss' }) => {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => n.toString().padStart(2, '0');
  const mostrarHora = () => {
    const h = pad(hora.getHours());
    const m = pad(hora.getMinutes());
    const s = pad(hora.getSeconds());
    return formato === 'HH:mm' ? `${h}:${m}` : `${h}:${m}:${s}`;
  };

  return (
    <div className="reloj-cocina">
      <span>{mostrarHora()}</span>
    </div>
  );
};

export default Reloj;