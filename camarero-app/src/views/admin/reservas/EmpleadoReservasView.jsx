import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import { obtenerMesas } from '../../../services/barService.js';
import { useBar } from '../../../context/BarContext';
import { useBares } from '../../../hooks/useBares';
import AdminNavigation from '../../../components/AdminNavigation';

const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

const minutosAFormatoHora = (totalMinutos) => {
  if (typeof totalMinutos !== 'number' || isNaN(totalMinutos)) return '00:00';
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
};

const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return Math.max(inicio1, inicio2) < Math.min(fin1, fin2);
};

const DURACION_RESERVA_EXISTENTE_HORAS = 2;

const generarFranjasHorarias = (intervaloMinutos) => {
  const franjas = [];
  for (let horas = 0; horas < 24; horas++) {
    for (let minutos = 0; minutos < 60; minutos += intervaloMinutos) {
      const horaFormateada = horas.toString().padStart(2, '0');
      const minutoFormateado = minutos.toString().padStart(2, '0');
      franjas.push(`${horaFormateada}:${minutoFormateado}`);
    }
  }
  return franjas;
};

const FRANJAS_HORARIAS_MODAL = generarFranjasHorarias(15);

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
          return { estado: 'ocupada_horario', textoTooltip: `Ocupada de ${res.hora} a aprox. ${minutosAFormatoHora(inicioExistenteMin + DURACION_RESERVA_EXISTENTE_HORAS * 60)} (Mesa ${res.mesa})` };
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
        <p>No hay mesas configuradas para este bar.</p>
      ) : (
        <div className="mini-mesas-grid">
          {todasLasMesas.map(mesa => {
            const { estado, textoTooltip } = getEstadoMesa(mesa.id);
            let claseCss = '';
            if (estado === 'ocupada_horario' || estado === 'ocupada_dia') claseCss = 'ocupada';
            else if (estado === 'libre_horario' || estado === 'libre_dia') claseCss = 'libre';
            if (mesa.disponible === false) {
              claseCss += ' mesa-no-disponible-globalmente';
            }

            return (
              <div
                key={mesa.id}
                className={`mini-mesa-item ${claseCss}`}
                title={textoTooltip || `Mesa ${mesa.nombre || mesa.codigo} - Capacidad: ${mesa.capacidad || 'N/A'}${mesa.disponible === false ? ' (No disponible)' : ''}`}
              >
                {mesa.nombre || mesa.codigo}
                {mesa.disponible === false && <span className="indicador-no-disponible-global" title="Mesa no disponible actualmente"> (ND)</span>}
              </div>
            );
          })}
        </div>
      )}
      {horaConsulta && <p className="nota-disponibilidad">* La disponibilidad horaria asume una duración de {duracionHorasConsulta}h para la nueva reserva y {DURACION_RESERVA_EXISTENTE_HORAS}h para las existentes.</p>}
    </div>
  );
};


const formatearFechaA_YYYYMMDD_Local = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EmpleadoReservasView = () => {
  const { barSeleccionado } = useBar();
  const { bares, cargarBares: cargarBaresHook } = useBares();
  const [nombreBarActual, setNombreBarActual] = useState('');

  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState(null);
  
  const [mesasDelBarActual, setMesasDelBarActual] = useState([]);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [errorMesas, setErrorMesas] = useState(null);


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

  useEffect(() => {
    cargarBaresHook();
  }, [cargarBaresHook]);

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

  const cargarReservas = useCallback(async () => {
    if (!barSeleccionado) {
      setReservas([]);
      setCargandoReservas(false);
      return;
    }
    try {
      setCargandoReservas(true);
      setErrorReservas(null);
      const data = await obtenerReservas(barSeleccionado);
      console.log('Datos CRUDOS de reservas del backend:', data);

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
      console.log('Reservas FORMATEADAS:', reservasFormateadas);

      const reservasOrdenadas = reservasFormateadas.sort((a, b) =>
        new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      );

      setReservas(reservasOrdenadas);

    } catch (err) {
      setErrorReservas('Error al cargar las reservas: ' + err.message);
    } finally {
      setCargandoReservas(false);
    }
  }, [barSeleccionado]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  useEffect(() => {
    const fetchMesasDelBar = async () => {
      if (!barSeleccionado) {
        setMesasDelBarActual([]);
        setCargandoMesas(false);
        setErrorMesas(null);
        return;
      }
      try {
        setCargandoMesas(true);
        setErrorMesas(null);
        const dataMesas = await obtenerMesas(barSeleccionado);
        setMesasDelBarActual(dataMesas || []);
      } catch (err) {
        console.error('Error cargando mesas del bar:', err);
        setErrorMesas('Error al cargar las mesas del bar: ' + err.message);
        setMesasDelBarActual([]);
      } finally {
        setCargandoMesas(false);
      }
    };

    fetchMesasDelBar();
  }, [barSeleccionado]);

  const abrirModalParaCrear = (fechaSeleccionada, horaSugerida = '') => {
    setModoModal('crear');
    let horaInicial = horaSugerida;
    if (!horaSugerida && FRANJAS_HORARIAS_MODAL.length > 0) {
      //posibilidad de que no haya franjas horarias definidas
      }

    setReservaActualFormulario({
      id: null,
      fecha: formatearFechaA_YYYYMMDD_Local(fechaSeleccionada),
      hora: horaInicial,
      nombre: '',
      personas: 1,
      telefono: '',
      email: '',
      mensaje: '',
      mesa: null,
      estado: 'pendiente',
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

    const barIdNumerico = parseInt(barSeleccionado, 10);
    if (isNaN(barIdNumerico)) {
        alert('Error: ID del bar no válido.');
        return;
    }

    try {
      if (modoModal === 'crear') {
        const datosReserva = {
          bar: { id: barIdNumerico },
          nombreCliente: reservaActualFormulario.nombre,
          correoElectronico: reservaActualFormulario.email,
          telefono: reservaActualFormulario.telefono,
          numeroComensales: parseInt(reservaActualFormulario.personas, 10),
          fechaHora: `${reservaActualFormulario.fecha}T${reservaActualFormulario.hora}:00`,
          mensaje: reservaActualFormulario.mensaje,
          estado: 'confirmada',
          mesa: { id: reservaActualFormulario.mesa }
        };

        await crearReserva(datosReserva);
        await cargarReservas(); 
        
      } else if (modoModal === 'editar') { 
        const datosActualizados = {
          bar: { id: barIdNumerico },
          nombreCliente: reservaActualFormulario.nombre,
          correoElectronico: reservaActualFormulario.email,
          telefono: reservaActualFormulario.telefono,
          numeroComensales: parseInt(reservaActualFormulario.personas, 10),
          fechaHora: `${reservaActualFormulario.fecha}T${reservaActualFormulario.hora}:00`,
          mensaje: reservaActualFormulario.mensaje,
          mesa: { id: reservaActualFormulario.mesa },
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

    setModoModal('editar'); 
    setReservaActualFormulario({
      ...reservaAConfirmar,
      estado: 'confirmada',
      personas: reservaAConfirmar.personas || reservaAConfirmar.numeroComensales || reservaAConfirmar.comensales || 1,
    });
    setSelectedDate(new Date(reservaAConfirmar.fecha + 'T00:00:00Z'));
    setMostrarModal(true);
  };

  const handleRechazarReserva = async (reservaId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud de reserva? Esta acción no se puede deshacer.')) {
      try {
        console.log('🔄 Eliminando reserva:', reservaId);
        await eliminarReserva(reservaId);
        console.log('✅ Reserva eliminada');
        await cargarReservas();
        alert('La solicitud de reserva ha sido eliminada.');
      } catch (error) {
        console.error('❌ Error al eliminar reserva:', error);
        alert('Error al eliminar la reserva: ' + error.message);
      }
    }
  };

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada');

  const reservasFiltradasDelDiaSeleccionado = React.useMemo(() => {
    const fechaSeleccionadaFormateada = formatearFechaA_YYYYMMDD_Local(selectedDate);
    let reservasDelDia = reservasConfirmadas.filter(r =>
      r.fecha === fechaSeleccionadaFormateada
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

  if (cargandoReservas && !barSeleccionado) {
    return <div className="reservas-loading">Selecciona un bar para ver las reservas.</div>;
  }
  
  if (cargandoReservas || cargandoMesas) {
    return <div className="reservas-loading">Cargando datos...</div>;
  }

  if (errorReservas) {
    return <div className="reservas-error">{errorReservas}</div>;
  }
  if (errorMesas) {
    return <div className="reservas-error">{errorMesas}</div>;
  }


  return (
    <div className="empleado-reservas-view">
      {/* Navegación de admin */}
      <AdminNavigation />
      
      <div className="reservas-header">
        <h1>Gestión de Reservas {nombreBarActual && `- ${nombreBarActual}`}</h1>
        {barSeleccionado && (
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

      {barSeleccionado && (
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
                {Object.keys(FRANJAS_HORARIAS).map(keyFranja => {
                  const franja = FRANJAS_HORARIAS[keyFranja];
                  let textoBoton = franja.nombre;
                  if (keyFranja !== 'todas') {
                    const inicioHora = minutosAFormatoHora(franja.inicioMin);
                    const finHora = minutosAFormatoHora(franja.finMin);
                    textoBoton += ` (${inicioHora} - ${finHora})`;
                  }
                  return (
                    <button
                      key={keyFranja}
                      className={`btn-filtro-franja ${filtroFranja === keyFranja ? 'active' : ''}`}
                      onClick={() => setFiltroFranja(keyFranja)}
                    >
                      {textoBoton}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="calendario-layout">
              <div className="calendario-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileContent={({ date, view }) => {
                    if (view === 'month') {
                      const localDateString = formatearFechaA_YYYYMMDD_Local(date);
                      let reservasDelTile = reservasConfirmadas.filter(r =>
                        r.fecha === localDateString
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
                          {reservasDelTile.slice(0, 2).map((reserva) => {
                            let mesaDisplayString = '';
                            let mesaTitleString = 'N/A';

                            if (reserva.mesa != null) {
                              const mesaObjeto = mesasDelBarActual.find(m => m.id === reserva.mesa);
                              if (mesaObjeto) {
                                const nombreMesa = mesaObjeto.nombre || mesaObjeto.codigo;
                                mesaTitleString = nombreMesa || `Mesa ID ${reserva.mesa}`;
                                if (nombreMesa && typeof nombreMesa === 'string') {
                                  mesaDisplayString = `(${nombreMesa.substring(0, 3)})`;
                                } else {
                                  mesaDisplayString = `(ID ${reserva.mesa})`;
                                }
                              } else {
                                mesaTitleString = `Mesa ID ${reserva.mesa}`;
                                const idStr = String(reserva.mesa);
                                mesaDisplayString = `(${idStr.substring(0, Math.min(3, idStr.length))})`;
                              }
                            }
                            return (
                              <div
                                key={reserva.id}
                                className="mini-reserva"
                                title={`${reserva.nombre} - ${nombreBarActual} - ${mesaTitleString} - ${reserva.personas}p`}
                              >
                                {reserva.hora.substring(0, 5)} {mesaDisplayString}
                              </div>
                            );
                          })}
                          {reservasDelTile.length > 2 && (
                            <div className="mini-reserva-count">
                              +{reservasDelTile.length - 2} más
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                  tileClassName={({ date, view }) => {
                    if (view === 'month') {
                      const localDateString = formatearFechaA_YYYYMMDD_Local(date);
                      let reservasDelTile = reservasConfirmadas.filter(r =>
                        r.fecha === localDateString
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
                    }
                    return '';
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
                  {reservasFiltradasDelDiaSeleccionado.map(reserva => {
                    let nombreMesaMostrado = 'N/A';
                    if (reserva.mesa != null) {
                      const mesaObjeto = mesasDelBarActual.find(m => m.id === reserva.mesa);
                      if (mesaObjeto) {
                        nombreMesaMostrado = mesaObjeto.codigo || mesaObjeto.nombre || `ID ${reserva.mesa}`;
                      } else {
                        nombreMesaMostrado = `ID ${reserva.mesa}`;
                      }
                    }

                    return (
                      <div key={reserva.id} className="reserva-dia-card">
                        <div className="reserva-dia-info">
                          <span className="mesa">Mesa {nombreMesaMostrado}</span>
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
                    );
                  })}
                  {reservasFiltradasDelDiaSeleccionado.length === 0 && (
                    <div className="no-reservas">
                      No hay reservas para este día{filtroFranja !== 'todas' ? ` en la franja de ${FRANJAS_HORARIAS[filtroFranja].nombre.toLowerCase()}` : ''} para {nombreBarActual || 'este bar'}.
                    </div>
                  )}
                </div>

                <MiniMesasView
                  todasLasMesas={mesasDelBarActual}
                  reservasDelDia={reservasFiltradasDelDiaSeleccionado}
                  selectedDate={selectedDate}
                  horaConsulta={
                    mostrarModal && reservaActualFormulario.fecha === formatearFechaA_YYYYMMDD_Local(selectedDate) && reservaActualFormulario.hora
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

      {mostrarModal && barSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>{modoModal === 'crear' ? 'Nueva Reserva Manual' : 'Modificar Reserva'}</h3>

            <div className="form-grupo">
              <label htmlFor="fecha">Fecha:</label>
              <input type="date" id="fecha" name="fecha" value={reservaActualFormulario.fecha} onChange={handleInputChangeModal} />
            </div>
            <div className="form-grupo">
              <label htmlFor="hora">Hora:</label>
              <select
                id="hora"
                name="hora"
                value={reservaActualFormulario.hora}
                onChange={handleInputChangeModal}
                className="form-control-select"
              >
                <option value="" disabled>Selecciona una hora</option>
                {FRANJAS_HORARIAS_MODAL.map(franja => (
                  <option key={franja} value={franja}>
                    {franja}
                  </option>
                ))}
              </select>
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
                {mesasDelBarActual.map(mesa => {
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
                      title={!disponible ? `Mesa ${mesa.nombre || mesa.codigo} ocupada en este horario` : `Seleccionar Mesa ${mesa.nombre || mesa.codigo}`}
                    >
                      {mesa.nombre || mesa.codigo}
                    </button>
                  );
                })}
                 {mesasDelBarActual.length === 0 && !cargandoMesas && <p>No hay mesas configuradas para este bar.</p>}
                 {cargandoMesas && <p>Cargando mesas...</p>}
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