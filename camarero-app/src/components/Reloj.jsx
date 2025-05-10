import React, { useEffect, useState } from 'react';

const Reloj = ({ formato = 'HH:mm:ss' }) => {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formato simple: HH:mm:ss o HH:mm
  const pad = (n) => n.toString().padStart(2, '0');
  const mostrarHora = () => {
    const h = pad(hora.getHours());
    const m = pad(hora.getMinutes());
    const s = pad(hora.getSeconds());
    if (formato === 'HH:mm') return `${h}:${m}`;
    return `${h}:${m}:${s}`;
  };

  return (
    <span className="reloj">{mostrarHora()}</span>
  );
};

export default Reloj;