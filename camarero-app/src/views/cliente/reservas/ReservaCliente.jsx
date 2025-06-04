import React, { useEffect, useState } from 'react';
import '../../../styles/cliente/reservas/reservaCliente.css';
import { crearReserva } from '../../../services/reservaService';
import { obtenerBares } from '../../../services/barService';
import { useNavigate } from 'react-router-dom';
import ReservaModal from '../../../components/ReservaModal';

// --- Funciones Auxiliares para Horarios ---
const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

const minutosAHora = (minutosTotales) => {
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
};

// Definición de franjas horarias permitidas para la reserva del cliente
const FRANJAS_RESERVA_CLIENTE = [
  { id: 'almuerzos', nombreDisplay: 'Almuerzos (12:00 - 13:45)', inicio: '12:00', fin: '13:45' },
  { id: 'comidas', nombreDisplay: 'Comidas (14:00 - 16:45)', inicio: '14:00', fin: '16:45' },
  { id: 'cenas', nombreDisplay: 'Cenas (20:00 - 23:45)', inicio: '20:00', fin: '23:45' },
];

// Genera las opciones para el selector de hora
const generarOpcionesDeHora = () => {
  const step = 15; // Intervalo de 15 minutos
  let opciones = [];
  FRANJAS_RESERVA_CLIENTE.forEach(franja => {
    // Añadir un separador visual para cada franja en el select
    opciones.push({ label: `--- ${franja.nombreDisplay} ---`, value: `sep-${franja.id}`, disabled: true, key: `sep-${franja.id}` });
    let minutosActuales = horaAMinutos(franja.inicio);
    const minutosFin = horaAMinutos(franja.fin);
    while (minutosActuales <= minutosFin) {
      const horaStr = minutosAHora(minutosActuales);
      opciones.push({ label: horaStr, value: horaStr, disabled: false, key: horaStr });
      minutosActuales += step;
    }
  });
  return opciones;
};

const ReservarCliente = () => {
  const [bares, setBares] = useState([]);
  const [barSeleccionado, setBarSeleccionado] = useState('');
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [zona, setZona] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comensales, setComensales] = useState(1);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [opcionesDeHora, setOpcionesDeHora] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargandoBares, setCargandoBares] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargandoBares(true);
        setError('');
        const dataBares = await obtenerBares();
        setBares(dataBares || []); // Asegurar que bares sea un array
      } catch (err) {
        console.error('Error al cargar bares:', err);
        setError('Error al cargar los bares disponibles: ' + err.message);
        setBares([]); // En caso de error, inicializar como array vacío
      } finally {
        setCargandoBares(false);
      }
      setOpcionesDeHora(generarOpcionesDeHora());
    };
    cargarDatosIniciales();
  }, []);

  const handleBarChange = (e) => {
    const id = parseInt(e.target.value);
    setBarSeleccionado(id);
    const bar = bares.find(b => b.id === id);
    const zonasBar = bar?.zonas || ['Interior', 'Terraza'];
    setZonasDisponibles(zonasBar);
    setZona('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!barSeleccionado || !zona || !nombre || !telefono || !email || comensales < 1 || !fechaSeleccionada || !horaSeleccionada) {
      setError('Por favor, completa todos los campos obligatorios, incluyendo fecha y hora.');
      return;
    }
    // Validar que la hora seleccionada no sea un separador
    if (horaSeleccionada.startsWith('sep-')) {
        setError('Por favor, selecciona una hora válida.');
        return;
    }

    const fechaHoraISO = `${fechaSeleccionada}T${horaSeleccionada}:00`; // Asegúrate que la hora tenga segundos si el backend lo requiere

    const reserva = {
      bar: { id: barSeleccionado }, // Información del bar anidada
      zonaPreferida: zona,
      nombreCliente: nombre,
      correoElectronico: email,
      telefono: telefono,
      numeroComensales: parseInt(comensales), // Asegurar que es un número
      fechaHora: fechaHoraISO,
      mensaje: mensaje,
      estado: 'pendiente', // O el estado inicial que defina tu backend
      fechaSolicitud: new Date().toISOString()
    };

    try {
      await crearReserva(barSeleccionado, reserva);
      setMostrarModal(true);
    } catch (err) {
      console.error('Error al crear reserva:', err);
      let errorMessage = 'Error al procesar la reserva.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    // Limpiar formulario o redirigir
    setBarSeleccionado('');
    setZona('');
    setNombre('');
    setEmail('');
    setTelefono('');
    setComensales(1);
    setFechaSeleccionada('');
    setHoraSeleccionada('');
    setMensaje('');
    navigate('/'); // O a donde sea apropiado
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu mesa</h2>

      <form className="reserva-form" onSubmit={handleSubmit}>
        <label htmlFor="bar">Selecciona un bar *</label>
        <select
          id="bar"
          value={barSeleccionado}
          onChange={handleBarChange}
          required
          disabled={cargandoBares}
        >
          <option value="">
            {cargandoBares ? '-- Cargando bares... --' : '-- Selecciona un bar --'}
          </option>
          {bares.map(bar => (
            <option key={bar.id} value={bar.id}>{bar.nombre}</option>
          ))}
        </select>

        {!cargandoBares && bares.length === 0 && (
          <p className="no-bares-warning">
            <i className="fas fa-exclamation-triangle"></i>
            No hay bares disponibles en este momento.
          </p>
        )}

        {zonasDisponibles.length > 0 && (
          <>
            <label htmlFor="zona">Zona preferida *</label>
            <select id="zona" value={zona} onChange={(e) => setZona(e.target.value)} required>
              <option value="">-- Selecciona zona --</option>
              {zonasDisponibles.map((z, idx) => (
                <option key={idx} value={z}>{z}</option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="nombre">Nombre *</label>
        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label htmlFor="email">Correo electrónico *</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="telefono">Teléfono *</label>
        <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

        <label htmlFor="comensales">Número de comensales *</label>
        <input type="number" id="comensales" value={comensales} onChange={(e) => setComensales(parseInt(e.target.value))} min={1} max={20} required />

        {/* Campo de Fecha */}
        <label htmlFor="fechaReserva">Fecha de la reserva *</label>
        <input
          type="date"
          id="fechaReserva"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
          required
        />

        {/* Campo de Hora */}
        <label htmlFor="horaReserva">Hora de la reserva *</label>
        <select
          id="horaReserva"
          value={horaSeleccionada}
          onChange={(e) => setHoraSeleccionada(e.target.value)}
          required
          disabled={!fechaSeleccionada} // Opcional: deshabilitar si no se ha seleccionado fecha
        >
          <option value="">-- Selecciona una hora --</option>
          {opcionesDeHora.map(opt => (
            <option key={opt.key} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor="mensaje">Mensaje o comentarios</label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Déjanos cualquier comentario sobre tu reserva (alergias, ocasión especial, etc.)"
          rows={4}
          maxLength={500}
        />

        <button type="submit" disabled={cargandoBares}>
          <i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i>
          {cargandoBares ? 'Cargando...' : 'Reservar'}
        </button>
      </form>

      {error && <div className="reserva-error">{error}</div>}
      {mostrarModal && <ReservaModal onClose={handleCerrarModal} />}
    </div>
  );
};

export default ReservarCliente;
