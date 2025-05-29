import React, { useEffect, useState } from 'react';
import '../../../styles/cliente/reservas/reservaCliente.css';
// ✅ CAMBIAR: Importar servicios reales
import { crearReserva } from '../../../services/reservaService';
import { obtenerBares } from '../../../services/barService'; // ✅ CAMBIAR: Usar barService real
import { descargarCartaPDF } from '../../../services/reservaServiceMock'; // Mantener solo PDF mock
import { useNavigate } from 'react-router-dom';
import ReservaModal from '../../../components/ReservaModal';

const ReservarCliente = () => {
  const [bares, setBares] = useState([]);
  const [barSeleccionado, setBarSeleccionado] = useState('');
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [zona, setZona] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comensales, setComensales] = useState(1);
  const [fechaHora, setFechaHora] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargandoBares, setCargandoBares] = useState(true); // ✅ AÑADIR loading state

  const navigate = useNavigate();

  useEffect(() => {
    const cargarBares = async () => {
      try {
        setCargandoBares(true);
        setError('');
        // ✅ CAMBIAR: Usar servicio real de barService.js
        const data = await obtenerBares();
        setBares(data);
      } catch (err) {
        console.error('Error al cargar bares:', err);
        setError('Error al cargar los bares disponibles: ' + err.message);
      } finally {
        setCargandoBares(false);
      }
    };
    cargarBares();
  }, []);

  const handleBarChange = (e) => {
    const id = parseInt(e.target.value);
    setBarSeleccionado(id);
    const bar = bares.find(b => b.id === id);
    
    // ✅ ADAPTAR: Los bares del servicio real pueden tener estructura diferente
    // Asumir que el servicio real devuelve bares con zonas o usar zonas por defecto
    const zonasBar = bar?.zonas || ['Interior', 'Terraza']; // Zonas por defecto si no vienen del backend
    setZonasDisponibles(zonasBar);
    setZona('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!barSeleccionado || !zona || !nombre || !telefono || !email || comensales < 1 || !fechaHora) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const reserva = {
      barId: barSeleccionado, 
      zonaPreferida: zona,
      nombreCliente: nombre,
      correoElectronico: email,
      telefono: telefono,
      numeroComensales: comensales,
      fechaHora: fechaHora,
      mensaje: mensaje,
      estado: 'pendiente',    
      fechaSolicitud: new Date().toISOString()
    };

    try {
      await crearReserva(reserva);
      await descargarCartaPDF(barSeleccionado);
      setMostrarModal(true);
    } catch (err) {
      console.error('Error al crear reserva:', err);
      setError('Error al procesar la reserva: ' + err.message);
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    navigate(-1);
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

        {/* ✅ MOSTRAR aviso si no hay bares */}
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

        <label htmlFor="fechaHora">Fecha y hora *</label>
        <input
          type="datetime-local"
          id="fechaHora"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
        />

        <label htmlFor="mensaje">Mensaje o comentarios</label>
        <textarea
          id="mensaje"
          value={mensaje}          
          onChange={(e) => setMensaje(e.target.value)}
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
