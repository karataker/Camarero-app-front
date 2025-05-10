import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/empleadoReservasView.css';

const EmpleadoReservasView = () => {
  const { barId } = useParams();
  const [reservas, setReservas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, [barId, filtroEstado]);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      // TODO: Replace with actual API call
      const mockReservas = [
        {
          id: 1,
          fecha: '2024-05-15',
          hora: '20:30',
          nombre: 'Juan Pérez',
          personas: 4,
          telefono: '666555444',
          email: 'juan@email.com',
          estado: 'pendiente',
          mensaje: 'Mesa cerca de ventana si es posible',
          fechaSolicitud: '2024-05-10T10:30:00'
        },
        // Add more mock data as needed
      ];
      
      // Sort by request date (newest first)
      const reservasOrdenadas = mockReservas.sort((a, b) => 
        new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      );
      
      setReservas(reservasOrdenadas);
    } catch (err) {
      setError('Error al cargar las reservas');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmarReserva = async (reservaId) => {
    try {
      // TODO: Replace with actual API call
      setReservas(prevReservas =>
        prevReservas.map(reserva =>
          reserva.id === reservaId
            ? { ...reserva, estado: 'confirmada' }
            : reserva
        )
      );
    } catch (err) {
      console.error('Error al confirmar la reserva:', err);
    }
  };

  const handleRechazarReserva = async (reservaId) => {
    try {
      // TODO: Replace with actual API call
      setReservas(prevReservas =>
        prevReservas.map(reserva =>
          reserva.id === reservaId
            ? { ...reserva, estado: 'rechazada' }
            : reserva
        )
      );
    } catch (err) {
      console.error('Error al rechazar la reserva:', err);
    }
  };

  if (cargando) {
    return <div className="reservas-loading">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="reservas-error">{error}</div>;
  }

  return (
    <div className="empleado-reservas-view">
      <div className="empleado-breadcrumb">
        <Link to="/empleado/home">Panel</Link>
        <span>/</span>
        <Link to={`/empleado/bar/${barId}`}>Bar</Link>
        <span>/</span>
        <span>Reservas</span>
      </div>

      <h1>Gestión de Reservas</h1>

      <div className="filtros-reservas">
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-estado"
        >
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="todas">Todas</option>
        </select>
      </div>

      <div className="reservas-grid">
        {reservas
          .filter(reserva => filtroEstado === 'todas' || reserva.estado === filtroEstado)
          .map(reserva => (
            <div key={reserva.id} className={`reserva-card estado-${reserva.estado}`}>
              <div className="reserva-header">
                <h3>{reserva.nombre}</h3>
                <span className="reserva-fecha">
                  {new Date(reserva.fecha).toLocaleDateString()} - {reserva.hora}
                </span>
              </div>

              <div className="reserva-detalles">
                <p><i className="fas fa-users"></i> {reserva.personas} personas</p>
                <p><i className="fas fa-phone"></i> {reserva.telefono}</p>
                <p><i className="fas fa-envelope"></i> {reserva.email}</p>
                {reserva.mensaje && (
                  <p className="reserva-mensaje">
                    <i className="fas fa-comment"></i> {reserva.mensaje}
                  </p>
                )}
              </div>

              <div className="reserva-footer">
                <span className="fecha-solicitud">
                  Solicitado: {new Date(reserva.fechaSolicitud).toLocaleString()}
                </span>
                {reserva.estado === 'pendiente' && (
                  <div className="reserva-acciones">
                    <button
                      className="btn-confirmar"
                      onClick={() => handleConfirmarReserva(reserva.id)}
                    >
                      <i className="fas fa-check"></i> Confirmar
                    </button>
                    <button
                      className="btn-rechazar"
                      onClick={() => handleRechazarReserva(reserva.id)}
                    >
                      <i className="fas fa-times"></i> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EmpleadoReservasView;