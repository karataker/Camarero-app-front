import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import '../styles/empleadoReservasView.css';
import 'react-calendar/dist/Calendar.css';
// Importar los mocks
import { mockReservas, obtenerMesasDelBar } from '../mocks/reservasMocks';

// --- Funciones de Ayuda para Tiempos ---
const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

/**
 * Verifica si dos rangos de tiempo se solapan.
 * Todos los tiempos son en minutos desde la medianoche.
 * @param {number} inicio1 Inicio del primer rango
 * @param {number} fin1 Fin del primer rango
 * @param {number} inicio2 Inicio del segundo rango
 * @param {number} fin2 Fin del segundo rango
 * @returns {boolean} True si hay solapamiento, false en caso contrario
 */
const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return Math.max(inicio1, inicio2) < Math.min(fin1, fin2);
};
// --- Fin Funciones de Ayuda ---

const DURACION_RESERVA_EXISTENTE_HORAS = 2; // Duración estándar para reservas existentes

const FRANJAS_HORARIAS = {
  todas: { nombre: 'Todas', inicioMin: 0, finMin: 24 * 60 - 1 }, // Cubre todo el día
  almuerzos: { nombre: 'Almuerzos', inicioMin: horaAMinutos('12:00'), finMin: horaAMinutos('14:00') },
  comidas: { nombre: 'Comidas', inicioMin: horaAMinutos('14:00'), finMin: horaAMinutos('17:00') },
  cenas: { nombre: 'Cenas', inicioMin: horaAMinutos('20:00'), finMin: horaAMinutos('23:59') },
};

const MiniMesasView = ({
  todasLasMesas,
  reservasDelDia, // Ya vienen filtradas por franja si aplica (o todas si filtroFranja es 'todas')
  selectedDate,
  horaConsulta,
  duracionHorasConsulta = 2,
  filtroFranjaActual, // 'todas', 'almuerzos', etc.
  reservaEnEdicionId = null // Para excluir la reserva en edición de las comprobaciones
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
  const { barId } = useParams();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtroFranja, setFiltroFranja] = useState('todas');
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' o 'editar'
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
  });

  const [duracionReservaHoras] = useState(2);

  useEffect(() => {
    cargarReservas();
  }, [barId]);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      // Usar los datos mock importados
      const reservasOrdenadas = [...mockReservas].sort((a, b) =>
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
    setReservaActualFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleMesaChangeModal = (mesaId) => {
    setReservaActualFormulario(prev => ({ ...prev, mesa: mesaId }));
  };

  const handleGuardarReservaModal = async () => {
    if (!reservaActualFormulario.nombre || !reservaActualFormulario.fecha || !reservaActualFormulario.hora || !reservaActualFormulario.mesa) {
      alert('Por favor, completa los campos obligatorios (nombre, fecha, hora, mesa).');
      return;
    }

    if (modoModal === 'crear') {
      const nuevaReservaConId = {
        ...reservaActualFormulario,
        id: Date.now(),
        estado: 'confirmada',
        fechaSolicitud: new Date().toISOString(),
      };
      setReservas(prev => [...prev, nuevaReservaConId].sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)));
    } else if (modoModal === 'editar') {
      setReservas(prev => prev.map(res =>
        res.id === reservaActualFormulario.id
          ? { ...res, ...reservaActualFormulario }
          : res
      ).sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)));
    }
    cerrarModal();
  };

  const handleConfirmarReserva = async (reservaId) => {
    const mesasDisponibles = obtenerTodasLasMesasDelBar(barId).map(m => m.id);
    let mesaAsignada = null;

    const reservaAConfirmar = reservas.find(r => r.id === reservaId);
    if (reservaAConfirmar) {
      const reservasConfirmadasEseDiaHora = reservas.filter(
        r => r.estado === 'confirmada' &&
          r.fecha === reservaAConfirmar.fecha &&
          r.hora === reservaAConfirmar.hora
      ).map(r => r.mesa);

      mesaAsignada = mesasDisponibles.find(m => !reservasConfirmadasEseDiaHora.includes(m)) || mesasDisponibles[0] || 'M01';
    }

    setReservas(prevReservas =>
      prevReservas.map(reserva =>
        reserva.id === reservaId
          ? { ...reserva, estado: 'confirmada', mesa: reserva.mesa || mesaAsignada }
          : reserva
      )
    );
  };

  const handleRechazarReserva = async (reservaId) => {
    setReservas(prevReservas =>
      prevReservas.map(reserva =>
        reserva.id === reservaId
          ? { ...reserva, estado: 'rechazada' }
          : reserva
      )
    );
  };

  // Reemplazar la función obtenerTodasLasMesasDelBar con la importada
  const obtenerTodasLasMesasDelBar = (currentBarId) => {
    return obtenerMesasDelBar(currentBarId);
  };

  const todasLasMesasDelBar = obtenerTodasLasMesasDelBar(barId);

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

  if (cargando) {
    return <div className="reservas-loading">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="reservas-error">{error}</div>;
  }

  return (
    <div className="reservas-view">
      <div className="reservas-header">
        <h1>Gestión de Reservas</h1>
        <button className="btn-nueva-reserva" onClick={() => abrirModalParaCrear(selectedDate, '')}>
          <i className="fas fa-plus"></i> Nueva Reserva Manual
        </button>
      </div>

      <div className="reservas-container">
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

        <div className="calendario-reservas-section">
          <div className="calendario-header-controls">
            <h2>Calendario de Reservas</h2>
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
                          title={`${reserva.nombre} - ${reserva.mesa} - ${reserva.personas}p`}
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
                    No hay reservas para este día{filtroFranja !== 'todas' ? ` en la franja de ${FRANJAS_HORARIAS[filtroFranja].nombre.toLowerCase()}` : ''}.
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

      {mostrarModal && (
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