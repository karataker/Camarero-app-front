import React, { useEffect, useRef, useState } from 'react';
import { getNotificacionesPorTipoYBar, marcarNotificacionesComoLeidas } from '../services/notificacionService';
import Bell from './Bell';
import '../styles/admin/notificaciones/bellDropdown.css';
import { useNavigate } from 'react-router-dom';

const BellDropdown = ({ barId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const todas = await getNotificacionesPorTipoYBar('pedido', barId);
        setNotificaciones(todas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)));
        setNoLeidas(todas.filter(n => !n.leida).length);
      } catch (err) {
        console.error('Error al cargar notificaciones:', err);
      }
    };

    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(interval);
  }, [barId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
        setSeleccionada(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificacionClick = (noti) => {
    setSeleccionada(noti.id);

    if (noti.tipo === 'pedido') {
      navigate(`/admin/bar/${barId}/cocina`);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await marcarNotificacionesComoLeidas('pedido');
      const actualizadas = notificaciones.map(n => ({ ...n, leida: true }));
      setNotificaciones(actualizadas);
      setNoLeidas(0);
    } catch (err) {
      console.error('Error al marcar como leídas:', err);
    }
  };

  return (
    <div className="bell-dropdown-wrapper" ref={wrapperRef}>
      <div onClick={() => setAbierto(!abierto)} title="Notificaciones">
        <Bell notificaciones={noLeidas} />
      </div>

      {abierto && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">
            <h4>Notificaciones</h4>
          </div>

          {notificaciones.length === 0 ? (
            <div className="notif-vacio">Sin notificaciones</div>
          ) : (
            <>
              <ul className="notif-lista-scroll">
                {notificaciones.map((n) => (
                  <li
                    key={n.id}
                    className={`notif-item ${n.leida ? 'leida' : 'no-leida'} ${n.id === seleccionada ? 'seleccionada' : ''}`}
                    onClick={() => handleNotificacionClick(n)}
                  >
                    <span>
                     {n.mensaje}
                    </span>
                    <span className="notif-fecha">
                      {new Date(n.fechaCreacion).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              {noLeidas > 0 && (
                <button className="marcar-todo-btn" onClick={handleMarcarTodasComoLeidas}>
                  Marcar todas como leído
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BellDropdown;
