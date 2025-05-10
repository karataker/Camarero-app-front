import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import '../styles/empleadoReservasView.css';
import 'react-calendar/dist/Calendar.css';

const EmpleadoReservasView = () => {
  const { barId } = useParams();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nuevaReserva, setNuevaReserva] = useState({
    fecha: '',
    hora: '',
    nombre: '',
    personas: 1,
    telefono: '',
    email: '',
    mensaje: ''
  });

  useEffect(() => {
    cargarReservas();
  }, [barId]);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      // TODO: Replace with actual API call
      const mockReservas = [
        {
          id: 1,
          fecha: '2025-05-05',
          hora: '20:30',
          nombre: 'Juan Pérez',
          personas: 4,
          telefono: '666555444',
          email: 'juan@email.com',
          estado: 'pendiente',
          mensaje: 'Mesa cerca de ventana si es posible',
          fechaSolicitud: '2025-05-04T10:30:00',
          mesa: null // Pending reservations don't have a table assigned
        },
        {
          id: 2,
          fecha: '2025-05-05',
          hora: '21:00',
          nombre: 'María García',
          personas: 2,
          telefono: '666777888',
          email: 'maria@email.com',
          estado: 'confirmada',
          mensaje: '',
          fechaSolicitud: '2025-05-03T15:20:00',
          mesa: 'M01' // Confirmed reservation with M01 table
        },
        {
          id: 3,
          fecha: '2025-05-05',
          hora: '21:30',
          nombre: 'Carlos Rodríguez',
          personas: 6,
          telefono: '666999000',
          email: 'carlos@email.com',
          estado: 'confirmada',
          mensaje: 'Celebración de cumpleaños',
          fechaSolicitud: '2025-05-03T09:15:00',
          mesa: 'M04' // Confirmed reservation with M04 table
        },
        {
          id: 4,
          fecha: '2025-05-06',
          hora: '14:00',
          nombre: 'Ana Martínez',
          personas: 3,
          telefono: '666111222',
          email: 'ana@email.com',
          estado: 'pendiente',
          mensaje: '',
          fechaSolicitud: '2025-05-04T18:45:00',
          mesa: null
        },
        {
          id: 5,
          fecha: '2025-05-06',
          hora: '14:30',
          nombre: 'Luis Sánchez',
          personas: 2,
          telefono: '666333444',
          email: 'luis@email.com',
          estado: 'confirmada',
          mensaje: 'Mesa tranquila para reunión',
          fechaSolicitud: '2025-05-02T11:20:00',
          mesa: 'M02' // Confirmed reservation with M02 table
        },
        {
          id: 6,
          fecha: '2025-05-07',
          hora: '13:30',
          nombre: 'Elena López',
          personas: 5,
          telefono: '666555666',
          email: 'elena@email.com',
          estado: 'confirmada',
          mensaje: 'Comida familiar',
          fechaSolicitud: '2025-05-03T16:10:00',
          mesa: 'M03' // Confirmed reservation with M03 table
        },
        {
          id: 7,
          fecha: '2025-05-07',
          hora: '14:00',
          nombre: 'Roberto Díaz',
          personas: 4,
          telefono: '666777999',
          email: 'roberto@email.com',
          estado: 'confirmada',
          mensaje: '',
          fechaSolicitud: '2025-05-03T17:30:00',
          mesa: 'M01' // Confirmed reservation with M01 table
        },
        {
          id: 8,
          fecha: '2025-05-07',
          hora: '21:00',
          nombre: 'Carmen Ruiz',
          personas: 2,
          telefono: '666888000',
          email: 'carmen@email.com',
          estado: 'pendiente',
          mensaje: 'Mesa para dos',
          fechaSolicitud: '2025-05-04T19:15:00',
          mesa: null
        }
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

  const handleNuevaReserva = (e) => {
    e.preventDefault();
    const reserva = {
      id: Date.now(),
      ...nuevaReserva,
      estado: 'confirmada',
      fechaSolicitud: new Date().toISOString()
    };
    setReservas(prev => [reserva, ...prev]);
    setMostrarFormulario(false);
    setNuevaReserva({
      fecha: '',
      hora: '',
      nombre: '',
      personas: 1,
      telefono: '',
      email: '',
      mensaje: ''
    });
  };

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada');

  if (cargando) {
    return <div className="reservas-loading">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="reservas-error">{error}</div>;
  }

  return (
    <div className="empleado-reservas-view">
      <div className="empleado-breadcrumb">
        <Link to="/admin/home">Panel</Link>
        <span>/</span>
        <Link to={`/admin/bar/${barId}`}>Bar</Link>
        <span>/</span>
        <span>Reservas</span>
      </div>

      <div className="reservas-header">
        <h1>Gestión de Reservas</h1>
        <button 
          className="btn-nueva-reserva"
          onClick={() => setMostrarFormulario(true)}
        >
          <i className="fas fa-plus"></i> Nueva Reserva
        </button>
      </div>

      <div className="reservas-container">
        {/* Pending Reservations Section - Now first */}
        <div className="reservas-pendientes-section">
          <h2>Reservas Pendientes de Confirmación</h2>
          <div className="reservas-grid">
            {reservasPendientes.map(reserva => (
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

        {/* Calendar Section - Now second */}
        <div className="calendario-reservas-section">
          <h2>Calendario de Reservas</h2>
          <div className="calendario-layout">
            <div className="calendario-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const reservasDelDia = reservasConfirmadas.filter(
                    r => r.fecha === dateStr
                  ).sort((a, b) => a.hora.localeCompare(b.hora));

                  if (reservasDelDia.length === 0) return null;

                  return (
                    <div className="calendario-reservas">
                      {reservasDelDia.slice(0, 3).map((reserva) => (
                        <div 
                          key={reserva.id} 
                          className="mini-reserva"
                          title={`${reserva.nombre} - ${reserva.personas} personas`}
                        >
                          {reserva.hora} ({reserva.personas}p)
                        </div>
                      ))}
                      {reservasDelDia.length > 3 && (
                        <div className="mini-reserva-count">
                          +{reservasDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  );
                }}
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return reservasConfirmadas.some(r => r.fecha === dateStr) ? 'tiene-reservas' : '';
                }}
              />
            </div>
            
            <div className="reservas-dia-container">
              <h3>Reservas para {selectedDate.toLocaleDateString()}</h3>
              <div className="reservas-dia">
                {reservasConfirmadas
                  .filter(r => new Date(r.fecha).toDateString() === selectedDate.toDateString())
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(reserva => (
                    <div key={reserva.id} className="reserva-dia-card">
                      <span className="mesa">Mesa {reserva.mesa}</span>
                      <span className="hora">{reserva.hora}</span>
                      <span className="nombre">{reserva.nombre}</span>
                      <span className="personas">{reserva.personas} personas</span>
                    </div>
                  ))}
                {reservasConfirmadas.filter(r => 
                  new Date(r.fecha).toDateString() === selectedDate.toDateString()
                ).length === 0 && (
                  <div className="no-reservas">No hay reservas para este día</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-reserva">
            <h2>Nueva Reserva</h2>
            <form onSubmit={handleNuevaReserva}>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha:</label>
                  <input
                    type="date"
                    value={nuevaReserva.fecha}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      fecha: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora:</label>
                  <input
                    type="time"
                    value={nuevaReserva.hora}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      hora: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={nuevaReserva.nombre}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      nombre: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Personas:</label>
                  <input
                    type="number"
                    value={nuevaReserva.personas}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      personas: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    value={nuevaReserva.telefono}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      telefono: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={nuevaReserva.email}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      email: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mensaje:</label>
                  <textarea
                    value={nuevaReserva.mensaje}
                    onChange={(e) => setNuevaReserva({
                      ...nuevaReserva,
                      mensaje: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">Guardar</button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadoReservasView;