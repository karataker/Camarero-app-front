import React, { useEffect, useState } from 'react';
import '../../../styles/cliente/reservas/reservaCliente.css';
import { obtenerBaresYzonas, enviarReserva, descargarCartaPDF } from '../../../services/reservaServiceMock';
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
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarBares = async () => {
      const data = await obtenerBaresYzonas();
      setBares(data);
    };
    cargarBares();
  }, []);

  const handleBarChange = (e) => {
    const id = parseInt(e.target.value);
    setBarSeleccionado(id);
    const bar = bares.find(b => b.id === id);
    setZonasDisponibles(bar ? bar.zonas : []);
    setZona('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!barSeleccionado || !zona || !nombre || !telefono || !email || comensales < 1 || !fechaHora) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const reserva = {
      barId: barSeleccionado,
      zona,
      nombre,
      email,
      telefono,
      comensales,
      fechaHora
    };

    try {
      await enviarReserva(reserva);
      await descargarCartaPDF(barSeleccionado);
      setMostrarModal(true);
    } catch (err) {
      setError('Error al procesar la reserva.');
    }
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    navigate(-1); // volver atrás
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu mesa</h2>

      <form className="reserva-form" onSubmit={handleSubmit}>
        <label htmlFor="bar">Selecciona un bar</label>
        <select id="bar" value={barSeleccionado} onChange={handleBarChange} required>
          <option value="">-- Selecciona un bar --</option>
          {bares.map(bar => (
            <option key={bar.id} value={bar.id}>{bar.nombre}</option>
          ))}
        </select>

        {zonasDisponibles.length > 0 && (
          <>
            <label htmlFor="zona">Zona preferida</label>
            <select id="zona" value={zona} onChange={(e) => setZona(e.target.value)} required>
              <option value="">-- Selecciona zona --</option>
              {zonasDisponibles.map((z, idx) => (
                <option key={idx} value={z}>{z}</option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="nombre">Nombre</label>
        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label htmlFor="email">Correo electrónico</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="telefono">Teléfono</label>
        <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

        <label htmlFor="comensales">Número de comensales</label>
        <input type="number" id="comensales" value={comensales} onChange={(e) => setComensales(parseInt(e.target.value))} min={1} max={20} required />

        <label htmlFor="fechaHora">Fecha y hora</label>
        <input
          type="datetime-local"
          id="fechaHora"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
        />

        <button type="submit">
          <i className="fas fa-calendar-check" style={{ marginRight: '8px' }}></i>
          Reservar
        </button>
      </form>

      {error && <div className="reserva-error">{error}</div>}

      {mostrarModal && <ReservaModal onClose={handleCerrarModal} />}
    </div>
  );
};

export default ReservarCliente;
