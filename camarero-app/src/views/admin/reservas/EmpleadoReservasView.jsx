import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, Link } from 'react-router-dom'; // useParams ya no es necesario, Link podría serlo si lo usas en otra parte
import { Link } from 'react-router-dom'; // Mantén Link si lo usas
import Calendar from 'react-calendar';
import '../../../styles/admin/reservas/empleadoReservasView.css';
import 'react-calendar/dist/Calendar.css';
import { 
  obtenerReservas, 
  actualizarEstadoReserva, 
  crearReserva, 
  actualizarReserva,
  eliminarReserva
} from '../../../services/reservaService.js';
import { useBar } from '../../../context/BarContext'; // Importar useBar
import { useBares } from '../../../hooks/useBares'; // Para obtener el nombre del bar

// ✅ TEMPORAL: Mock solo para mesas hasta tener servicio real
const obtenerMesasDelBar = (barId) => {
  return [
    { id: 'M01', nombre: 'M01', capacidad: 4 },
    { id: 'M02', nombre: 'M02', capacidad: 2 },
    { id: 'M03', nombre: 'M03', capacidad: 6 },
    { id: 'M04', nombre: 'M04', capacidad: 4 },
    { id: 'M05', nombre: 'M05', capacidad: 2 },
    { id: 'M06', nombre: 'M06', capacidad: 4 },
    { id: 'M07', nombre: 'M07', capacidad: 2 },
    { id: 'M08', nombre: 'M08', capacidad: 8 },
  ];
};

// --- Funciones de Ayuda para Tiempos ---
const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return Math.max(inicio1, inicio2) < Math.min(fin1, fin2);
};

const DURACION_RESERVA_EXISTENTE_HORAS = 2;

const FRANJAS_HORARIAS = {
  todas: { nombre: 'Todas', inicioMin: 0, finMin: 24 * 60 - 1 },
  almuerzos: { nombre: 'Almuerzos', inicioMin: horaAMinutos('12:00'), finMin: horaAMinutos('14:00') },
  comidas: { nombre: 'Comidas', inicioMin: horaAMinutos('14:00'), finMin: horaAMinutos('17:00') },
  cenas: { nombre: 'Cenas', inicioMin: horaAMinutos('20:00'), finMin: horaAMinutos('23:59') },
};

const MiniMesasView = ({
  todasLasMesas,
  reservasDelDia,
  selectedDate,
  horaConsulta,
  duracionHorasConsulta = 2,
  filtroFranjaActual,
  reservaEnEdicionId = null
}) => {
  if (!selectedDate) {
    return null;
  }

  const getEstadoMesa = (mesaId) => {
    const reservasParaEstaMesa = reservasDelDia.filter(res => res.mesa === mesaId && res.id !== reservaEnEdicionId);

    if (horaConsulta) {
      const inicioConsultaMin = horaAMinutos(horaConsulta);
      const finConsultaMin = inicioConsultaMin + duracionHorasConsulta * 60;

      for (const res of reservasParaEstaMesa) {
        const inicioExistenteMin = horaAMinutos(res.hora);
        const finExistenteMin = inicioExistenteMin + DURACION_RESERVA_EXISTENTE_HORAS * 60;
        if (haySolapamiento(inicioConsultaMin, finConsultaMin, inicioExistenteMin, finExistenteMin)) {
          return { estado: 'ocupada_horario', textoTooltip: `Ocupada de ${res.hora} a aprox. ${new Date(new Date(`1970/01/01 ${res.hora}`).getTime() + DURACION_RESERVA_EXISTENTE_HORAS * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Mesa ${res.mesa})` };
        }
      }
      return { estado: 'libre_horario', textoTooltip: `Libre a las ${horaConsulta} (aprox. ${duracionHorasConsulta}h)` };
    } else {
      if (reservasParaEstaMesa.length > 0) {
        const horariosOcupados = reservasParaEstaMesa.map(r => `${r.hora} (Mesa ${r.mesa})`).join(', ');
        let textoFranja = filtroFranjaActual !== 'todas' ? ` en ${FRANJAS_HORARIAS[filtroFranjaActual].nombre.toLowerCase()}` : ' hoy';
        return { estado: 'ocupada_dia', textoTooltip: `Ocupada${textoFranja} en horarios: ${horariosOcupados}` };
      }
      let textoFranjaLibre = filtroFranjaActual !== 'todas' ? ` durante ${FRANJAS_HORARIAS[filtroFranjaActual].nombre.toLowerCase()}` : ' durante el día';
      return { estado: 'libre_dia', textoTooltip: `Libre${textoFranjaLibre} (verificar horarios específicos)` };
    }
  };

  let titulo = `Disponibilidad de Mesas (${selectedDate.toLocaleDateString()})`;
  if (horaConsulta) {
    titulo += ` a las ${horaConsulta} (aprox. ${duracionHorasConsulta}h)`;
  } else if (filtroFranjaActual && filtroFranjaActual !== 'todas') {
    titulo += ` para ${FRANJAS_HORARIAS[filtroFranjaActual].nombre.toLowerCase()}`;
  }

  return (
    <div className="mini-mesas-container">
      <h4>{titulo}</h4>
      {todasLasMesas.length === 0 ? (
        <p>No hay información de mesas para este bar.</p>
      ) : (
        <div className="mini-mesas-grid">
          {todasLasMesas.map(mesa => {
            const { estado, textoTooltip } = getEstadoMesa(mesa.id);
            let claseCss = '';
            if (estado === 'ocupada_horario' || estado === 'ocupada_dia') claseCss = 'ocupada';
            else if (estado === 'libre_horario' || estado === 'libre_dia') claseCss = 'libre';

            return (
              <div
                key={mesa.id}
                className={`mini-mesa-item ${claseCss}`}
                title={textoTooltip || `Mesa ${mesa.nombre} - Capacidad: ${mesa.capacidad || 'N/A'}`}
              >
                {mesa.nombre}
              </div>
            );
          })}
        </div>
      )}
      {horaConsulta && <p className="nota-disponibilidad">* La disponibilidad horaria asume una duración de {duracionHorasConsulta}h para la nueva reserva y {DURACION_RESERVA_EXISTENTE_HORAS}h para las existentes.</p>}
    </div>
  );
};

const EmpleadoReservasView = () => {
  // const { barId } = useParams(); // Ya no se usa useParams para el barId
  const { barSeleccionado } = useBar(); // Usar barSeleccionado del contexto
  const { bares, cargarBares: cargarBaresHook } = useBares(); // Renombrar para evitar conflicto con cargarReservas
  const [nombreBarActual, setNombreBarActual] = useState('');

  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtroFranja, setFiltroFranja] = useState('todas');
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState('crear');
  const [reservaActualFormulario, setReservaActualFormulario] = useState({
    id: null,
    fecha: '',
    hora: '',
    nombre: '',
    personas: 1,
    telefono: '',
    email: '',
    mensaje: '',
    mesa: null,
    estado: 'pendiente',
  });

  const [duracionReservaHoras] = useState(2);

  // Cargar la lista de todos los bares una vez
  useEffect(() => {
    cargarBaresHook();
  }, [cargarBaresHook]);

  // Establecer el nombre del bar actual cuando barSeleccionado o la lista de bares cambie
  useEffect(() => {
    if (barSeleccionado && bares.length > 0) {
      const barIdNum = parseInt(barSeleccionado, 10);
      const bar = bares.find(b => b.id === barIdNum);
      if (bar) {
        setNombreBarActual(bar.nombre);
      } else {
        console.warn(`Bar con ID ${barIdNum} no encontrado en la lista de bares.`);
        setNombreBarActual('');
      }
    } else {
      setNombreBarActual('');
    }
  }, [barSeleccionado, bares]);

  // Envuelve cargarReservas en useCallback y haz que dependa de barSeleccionado (del contexto)
  const cargarReservas = useCallback(async () => {
    if (!barSeleccionado) {
      setReservas([]);
      setCargando(false);
      // console.log('[EmpleadoReservasView] cargarReservas: No barSeleccionado, clearing reservations.');
      return;
    }
    try {
      setCargando(true);
      setError(null);
      // console.log(`[EmpleadoReservasView] cargarReservas: Fetching reservations for barSeleccionado: ${barSeleccionado}`);
      const data = await obtenerReservas(barSeleccionado); // Usar barSeleccionado del contexto
      // console.log('[EmpleadoReservasView] cargarReservas: Data received:', data);
      
      const reservasFormateadas = data.map(res => {
        let fecha = '';
        let hora = '';
        
        if (res.fechaHora) {
          const fechaHoraObj = new Date(res.fechaHora);
          fecha = fechaHoraObj.toISOString().split('T')[0];
          hora = fechaHoraObj.toTimeString().substring(0, 5);
        } else if (res.fecha && res.hora) { 
          fecha = res.fecha;
          hora = res.hora;
        }

        return {
          id: res.id,
          fecha,
          hora,
          nombre: res.nombreCliente || res.nombre || '', 
          personas: res.numeroComensales || res.comensales || res.personas || 1, 
          telefono: res.telefono || '',
          email: res.correoElectronico || res.email || '', 
          mensaje: res.mensaje || '',
          mesa: res.mesaId || (res.mesa ? (typeof res.mesa === 'object' ? res.mesa.id : res.mesa) : null), 
          estado: res.estado || 'pendiente',
          fechaSolicitud: res.fechaSolicitud || res.createdAt || new Date().toISOString(), 
          zona: res.zonaPreferida || res.zona || '' 
        };
      });

      const reservasOrdenadas = reservasFormateadas.sort((a, b) =>
        new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      );

      setReservas(reservasOrdenadas);
      // console.log('[EmpleadoReservasView] cargarReservas: Reservations state updated.');

    } catch (err) {
      // console.error('[EmpleadoReservasView] cargarReservas: Error loading reservations:', err);
      setError('Error al cargar las reservas: ' + err.message);
    } finally {
      setCargando(false);
      // console.log('[EmpleadoReservasView] cargarReservas: Loading finished.');
    }
  }, [barSeleccionado]); // useCallback ahora depende de barSeleccionado del contexto

  // El useEffect ahora depende de la función cargarReservas memoizada.
  // Se ejecutará cuando cargarReservas cambie (es decir, cuando barSeleccionado cambie).
  useEffect(() => {
    // console.log('[EmpleadoReservasView] useEffect for cargarReservas triggered. Current barSeleccionado:', barSeleccionado);
    cargarReservas();
  }, [cargarReservas]); // La dependencia de la función memoizada es correcta

  const abrirModalParaCrear = (fechaSeleccionada, horaSugerida = '') => {
    setModoModal('crear');
    setReservaActualFormulario({
      id: null,
      fecha: fechaSeleccionada.toISOString().split('T')[0],
      hora: horaSugerida,
      nombre: '',
      personas: 1,
      telefono: '',
      email: '',
      mensaje: '',
      mesa: null,
    });
    setMostrarModal(true);
  };

  const abrirModalParaEditar = (reservaAEditar) => {
    setModoModal('editar');
    setReservaActualFormulario({
      ...reservaAEditar,
      personas: reservaAEditar.personas || 1,
    });
    setSelectedDate(new Date(reservaAEditar.fecha + 'T00:00:00'));
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleInputChangeModal = (e) => {
    const { name, value } = e.target;
    // Si el campo es 'personas', asegúrate de que se guarda como número
    if (name === 'personas') {
      setReservaActualFormulario(prev => ({ ...prev, [name]: parseInt(value, 10) || 1 }));
    } else {
      setReservaActualFormulario(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMesaChangeModal = (mesaId) => {
    setReservaActualFormulario(prev => ({ ...prev, mesa: mesaId }));
  };

  const handleGuardarReservaModal = async () => {
    if (!reservaActualFormulario.nombre || !reservaActualFormulario.fecha || !reservaActualFormulario.hora || !reservaActualFormulario.mesa) {
      alert('Por favor, completa los campos obligatorios (nombre, fecha, hora, mesa).');
      return;
    }

    // Usar barSeleccionado del contexto
    const barIdNumerico = parseInt(barSeleccionado, 10);
    if (isNaN(barIdNumerico)) {
        alert('Error: ID del bar no válido.');
        return;
    }

    try {
      if (modoModal === 'crear') {
        const datosReserva = {
          bar: { id: barIdNumerico }, // Enviar como objeto Bar anidado
          nombreCliente: reservaActualFormulario.nombre,
          correoElectronico: reservaActualFormulario.email,
          telefono: reservaActualFormulario.telefono,
          numeroComensales: parseInt(reservaActualFormulario.personas, 10),
          fechaHora: `${reservaActualFormulario.fecha}T${reservaActualFormulario.hora}:00`,
          mensaje: reservaActualFormulario.mensaje,
          estado: reservaActualFormulario.estado || 'confirmada', // Usar estado del formulario o 'confirmada'
          mesa: { id: reservaActualFormulario.mesa } // Enviar como objeto Mesa anidado
        };

        await crearReserva(datosReserva);
        await cargarReservas(); 
        
      } else if (modoModal === 'editar') { 
        const datosActualizados = {
          bar: { id: barIdNumerico }, // Enviar como objeto Bar anidado
          nombreCliente: reservaActualFormulario.nombre,
          correoElectronico: reservaActualFormulario.email,
          telefono: reservaActualFormulario.telefono,
          numeroComensales: parseInt(reservaActualFormulario.personas, 10),
          fechaHora: `${reservaActualFormulario.fecha}T${reservaActualFormulario.hora}:00`,
          mensaje: reservaActualFormulario.mensaje,
          mesa: { id: reservaActualFormulario.mesa }, // Enviar como objeto Mesa anidado
          estado: reservaActualFormulario.estado, 
        };
        await actualizarReserva(reservaActualFormulario.id, datosActualizados); 
        await cargarReservas(); 
      }

      cerrarModal();
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert(`Error al ${modoModal === 'crear' ? 'crear' : 'actualizar'} la reserva: ${error.message}`);
    }
  };

  const handleConfirmarReserva = async (reservaId) => {
    const reservaAConfirmar = reservas.find(r => r.id === reservaId); 
    if (!reservaAConfirmar) {
      alert('Error: No se encontró la reserva para confirmar.');
      return;
    }

    // Abrir el modal en modo 'editar', pre-llenado con los datos de la reserva pendiente.
    // El estado se pre-establece a 'confirmada'. El usuario asignará una mesa.
    setModoModal('editar'); 
    setReservaActualFormulario({
      ...reservaAConfirmar, // Carga todos los datos existentes de la reserva
      estado: 'confirmada',   // Establece el estado a 'confirmada'
      // Asegúrate que 'personas' (usado en el form) esté seteado si el campo original es otro
      personas: reservaAConfirmar.personas || reservaAConfirmar.numeroComensales || reservaAConfirmar.comensales || 1,
      // La mesa (reservaAConfirmar.mesa) será null o el valor anterior, el usuario la seleccionará/confirmará en el modal.
      // Si la reserva pendiente ya tenía una zona preferida, puedes mantenerla o dejar que se derive de la mesa.
    });
    // Sincronizar el calendario con la fecha de la reserva que se está confirmando
    setSelectedDate(new Date(reservaAConfirmar.fecha + 'T00:00:00Z')); // Añadir 'Z' para UTC si es necesario
    setMostrarModal(true);
  };

  const handleRechazarReserva = async (reservaId) => {
    // ✅ CAMBIAR: Confirmar antes de eliminar
    if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud de reserva? Esta acción no se puede deshacer.')) {
      try {
        console.log('🔄 Eliminando reserva:', reservaId);
        await eliminarReserva(reservaId); // ✅ USAR eliminarReserva
        console.log('✅ Reserva eliminada');
        await cargarReservas(); // Recargar todas las reservas
        alert('La solicitud de reserva ha sido eliminada.');
      } catch (error) {
        console.error('❌ Error al eliminar reserva:', error);
        alert('Error al eliminar la reserva: ' + error.message);
      }
    }
  };

  const obtenerTodasLasMesasDelBar = (currentBarId) => {
    // Usar currentBarId (que será barSeleccionado)
    return obtenerMesasDelBar(currentBarId);
  };

  // Usar barSeleccionado del contexto
  const todasLasMesasDelBar = obtenerTodasLasMesasDelBar(barSeleccionado);

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada');

  const reservasFiltradasDelDiaSeleccionado = React.useMemo(() => {
    let reservasDelDia = reservasConfirmadas.filter(r =>
      r.fecha === selectedDate.toISOString().split('T')[0]
    );

    if (filtroFranja !== 'todas' && FRANJAS_HORARIAS[filtroFranja]) {
      const franjaActual = FRANJAS_HORARIAS[filtroFranja];
      reservasDelDia = reservasDelDia.filter(res => {
        const inicioReservaMin = horaAMinutos(res.hora);
        const finReservaMin = inicioReservaMin + DURACION_RESERVA_EXISTENTE_HORAS * 60;
        return haySolapamiento(inicioReservaMin, finReservaMin, franjaActual.inicioMin, franjaActual.finMin);
      });
    }

    return reservasDelDia.sort((a, b) => a.hora.localeCompare(b.hora));
  }, [reservasConfirmadas, selectedDate, filtroFranja]);

  if (cargando && !barSeleccionado) { // Añadir condición para no mostrar "Cargando" si no hay bar
    return <div className="reservas-loading">Selecciona un bar para ver las reservas.</div>;
  }
  
  if (cargando) {
    return <div className="reservas-loading">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="reservas-error">{error}</div>;
  }

  return (
    <div className="empleado-reservas-view">
      <div className="reservas-header">
        <h1>Gestión de Reservas {nombreBarActual && `- ${nombreBarActual}`}</h1>
        {barSeleccionado && ( // Solo mostrar botón si hay un bar seleccionado
          <button className="btn-nueva-reserva" onClick={() => abrirModalParaCrear(selectedDate, '')}>
            <i className="fas fa-plus"></i> Nueva Reserva Manual
          </button>
        )}
      </div>

      {!barSeleccionado && (
        <div className="seleccionar-bar-mensaje">
          <p><i className="fas fa-info-circle"></i> Por favor, selecciona un bar desde el menú superior para gestionar sus reservas.</p>
        </div>
      )}

      {barSeleccionado && ( // Solo mostrar contenido si hay un bar seleccionado
        <div className="reservas-container">
          <div className="reservas-pendientes-section">
            <h2>Reservas Pendientes de Confirmación {nombreBarActual && <span className="subtitulo-bar">({nombreBarActual})</span>}</h2>
            <div className="reservas-grid">
              {reservasPendientes.map(reserva => (
                <div key={reserva.id} className={`reserva-card estado-${reserva.estado}`}>
                  <div className="reserva-header">
                    <h3>{reserva.nombre}</h3>
                    {nombreBarActual && <span className="reserva-bar-nombre-card">Bar: {nombreBarActual}</span>}
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
                    {reserva.zona && (
                      <p><i className="fas fa-map-marker-alt"></i> Zona: {reserva.zona}</p>
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
              {reservasPendientes.length === 0 && (
                <p className="no-reservas-pendientes">No hay reservas pendientes de confirmación para {nombreBarActual || 'este bar'}.</p>
              )}
            </div>
          </div>

          <div className="calendario-reservas-section">
            <div className="calendario-header-controls">
              <h2>Calendario de Reservas {nombreBarActual && <span className="subtitulo-bar">({nombreBarActual})</span>}</h2>
              <div className="filtro-franja-horaria">
                <span>Filtrar por: </span>
                {Object.keys(FRANJAS_HORARIAS).map(keyFranja => (
                  <button
                    key={keyFranja}
                    className={`btn-filtro-franja ${filtroFranja === keyFranja ? 'active' : ''}`}
                    onClick={() => setFiltroFranja(keyFranja)}
                  >
                    {FRANJAS_HORARIAS[keyFranja].nombre}
                  </button>
                ))}
              </div>
            </div>
            <div className="calendario-layout">
              <div className="calendario-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={({ date }) => {
                    let reservasDelTile = reservasConfirmadas.filter(r =>
                      r.fecha === date.toISOString().split('T')[0]
                    );

                    if (filtroFranja !== 'todas' && FRANJAS_HORARIAS[filtroFranja]) {
                      const franjaActual = FRANJAS_HORARIAS[filtroFranja];
                      reservasDelTile = reservasDelTile.filter(res => {
                        const inicioReservaMin = horaAMinutos(res.hora);
                        const finReservaMin = inicioReservaMin + DURACION_RESERVA_EXISTENTE_HORAS * 60;
                        return haySolapamiento(inicioReservaMin, finReservaMin, franjaActual.inicioMin, franjaActual.finMin);
                      });
                    }
                    reservasDelTile.sort((a, b) => a.hora.localeCompare(b.hora));

                    if (reservasDelTile.length === 0) return null;

                    return (
                      <div className="calendario-reservas">
                        {reservasDelTile.slice(0, 2).map((reserva) => (
                          <div
                            key={reserva.id}
                            className="mini-reserva"
                            title={`${reserva.nombre} - ${nombreBarActual} - ${reserva.mesa} - ${reserva.personas}p`}
                          >
                            {reserva.hora.substring(0, 5)} {reserva.mesa ? `(${reserva.mesa.substring(0, 3)})` : ''}
                          </div>
                        ))}
                        {reservasDelTile.length > 2 && (
                          <div className="mini-reserva-count">
                            +{reservasDelTile.length - 2} más
                          </div>
                        )}
                      </div>
                    );
                  }}
                  tileClassName={({ date }) => {
                    let reservasDelTile = reservasConfirmadas.filter(r =>
                      r.fecha === date.toISOString().split('T')[0]
                    );
                    if (filtroFranja !== 'todas' && FRANJAS_HORARIAS[filtroFranja]) {
                      const franjaActual = FRANJAS_HORARIAS[filtroFranja];
                      reservasDelTile = reservasDelTile.filter(res => {
                        const inicioReservaMin = horaAMinutos(res.hora);
                        const finReservaMin = inicioReservaMin + DURACION_RESERVA_EXISTENTE_HORAS * 60;
                        return haySolapamiento(inicioReservaMin, finReservaMin, franjaActual.inicioMin, franjaActual.finMin);
                      });
                    }
                    return reservasDelTile.length > 0 ? 'tiene-reservas' : '';
                  }}
                />
              </div>

              <div className="reservas-dia-container">
                <h3>
                  Reservas para {selectedDate.toLocaleDateString()}
                  {filtroFranja !== 'todas' && ` (${FRANJAS_HORARIAS[filtroFranja].nombre})`}
                  {nombreBarActual && <span className="subtitulo-bar-dia"> ({nombreBarActual})</span>}
                </h3>
                <div className="reservas-dia">
                  {reservasFiltradasDelDiaSeleccionado.map(reserva => (
                    <div key={reserva.id} className="reserva-dia-card">
                      <div className="reserva-dia-info">
                        <span className="mesa">Mesa {reserva.mesa || 'N/A'}</span>
                        <span className="hora">{reserva.hora}</span>
                        <span className="nombre">{reserva.nombre}</span>
                        <span className="personas">{reserva.personas} personas</span>
                      </div>
                      <div className="reserva-dia-acciones">
                        <button
                          className="btn-accion-reserva btn-modificar"
                          onClick={() => abrirModalParaEditar(reserva)}
                          title="Modificar Reserva"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {reservasFiltradasDelDiaSeleccionado.length === 0 && (
                    <div className="no-reservas">
                      No hay reservas para este día{filtroFranja !== 'todas' ? ` en la franja de ${FRANJAS_HORARIAS[filtroFranja].nombre.toLowerCase()}` : ''} para {nombreBarActual || 'este bar'}.
                    </div>
                  )}
                </div>

                <MiniMesasView
                  todasLasMesas={todasLasMesasDelBar}
                  reservasDelDia={reservasFiltradasDelDiaSeleccionado}
                  selectedDate={selectedDate}
                  horaConsulta={
                    mostrarModal && reservaActualFormulario.fecha === selectedDate.toISOString().split('T')[0] && reservaActualFormulario.hora
                      ? reservaActualFormulario.hora
                      : null
                  }
                  duracionHorasConsulta={duracionReservaHoras}
                  filtroFranjaActual={filtroFranja}
                  reservaEnEdicionId={modoModal === 'editar' ? reservaActualFormulario.id : null}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && barSeleccionado && ( // Solo mostrar modal si hay bar seleccionado
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>{modoModal === 'crear' ? 'Nueva Reserva Manual' : 'Modificar Reserva'}</h3>

            <div className="form-grupo">
              <label htmlFor="fecha">Fecha:</label>
              <input type="date" id="fecha" name="fecha" value={reservaActualFormulario.fecha} onChange={handleInputChangeModal} />
            </div>
            <div className="form-grupo">
              <label htmlFor="hora">Hora:</label>
              <input type="time" id="hora" name="hora" value={reservaActualFormulario.hora} onChange={handleInputChangeModal} />
            </div>
            <div className="form-grupo">
              <label htmlFor="nombre">Nombre Cliente:</label>
              <input type="text" id="nombre" name="nombre" value={reservaActualFormulario.nombre} onChange={handleInputChangeModal} placeholder="Nombre del cliente" />
            </div>
            <div className="form-grupo">
              <label htmlFor="personas">Personas:</label>
              <input type="number" id="personas" name="personas" value={reservaActualFormulario.personas} onChange={handleInputChangeModal} min="1" />
            </div>
            <div className="form-grupo">
              <label htmlFor="telefono">Teléfono:</label>
              <input type="tel" id="telefono" name="telefono" value={reservaActualFormulario.telefono} onChange={handleInputChangeModal} placeholder="Teléfono de contacto" />
            </div>
            <div className="form-grupo">
              <label htmlFor="email">Email (opcional):</label>
              <input type="email" id="email" name="email" value={reservaActualFormulario.email} onChange={handleInputChangeModal} placeholder="Email de contacto" />
            </div>
            <div className="form-grupo">
              <label>Mesa Asignada:</label>
              <div className="selector-mesas-modal">
                {todasLasMesasDelBar.map(mesa => {
                  let disponible = true;
                  const inicioConsultaMin = horaAMinutos(reservaActualFormulario.hora);
                  const finConsultaMin = inicioConsultaMin + duracionReservaHoras * 60;

                  reservasConfirmadas.forEach(r => {
                    if (r.mesa === mesa.id && r.fecha === reservaActualFormulario.fecha) {
                      if (modoModal === 'editar' && r.id === reservaActualFormulario.id) {
                        return;
                      }
                      const inicioExistenteMin = horaAMinutos(r.hora);
                      const finExistenteMin = inicioExistenteMin + DURACION_RESERVA_EXISTENTE_HORAS * 60;
                      if (haySolapamiento(inicioConsultaMin, finConsultaMin, inicioExistenteMin, finExistenteMin)) {
                        disponible = false;
                      }
                    }
                  });

                  return (
                    <button
                      key={mesa.id}
                      className={`btn-mesa-modal ${reservaActualFormulario.mesa === mesa.id ? 'selected' : ''} ${!disponible ? 'ocupada-modal' : ''}`}
                      onClick={() => disponible && handleMesaChangeModal(mesa.id)}
                      disabled={!disponible && reservaActualFormulario.mesa !== mesa.id}
                      title={!disponible ? `Mesa ${mesa.nombre} ocupada en este horario` : `Seleccionar Mesa ${mesa.nombre}`}
                    >
                      {mesa.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="form-grupo">
              <label htmlFor="mensaje">Comentarios (opcional):</label>
              <textarea id="mensaje" name="mensaje" value={reservaActualFormulario.mensaje} onChange={handleInputChangeModal} placeholder="Preferencias, alergias, etc."></textarea>
            </div>

            <div className="modal-acciones">
              <button onClick={handleGuardarReservaModal} className="btn-principal">
                {modoModal === 'crear' ? 'Crear Reserva' : 'Guardar Cambios'}
              </button>
              <button onClick={cerrarModal} className="btn-secundario">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadoReservasView;