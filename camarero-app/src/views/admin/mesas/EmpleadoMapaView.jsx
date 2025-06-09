import React, { useState, useEffect } from 'react';
import { useBares } from '../../../hooks/useBares';
import { useBar } from '../../../context/BarContext';
import QRDownloader from '../../../components/QRDownloader';
import ComensalesIconos from '../../../components/ComensalesIconos';
import AdminNavigation from '../../../components/AdminNavigation'; // <-- AÑADIR IMPORT
import '../../../styles/admin/mesas/empleadoMapaView.css';
import { obtenerMesas } from '../../../services/barService';

// Usa exactamente los valores que envía el back:
const zonas = ['Interior', 'Terraza', 'Barra'];

const EmpleadoMapaView = () => {
  const {
    bares,
    cargarBares,
    añadirMesa,
    fusionarMesas,
    desfusionarMesa,
    getBarById,
    eliminarMesa
  } = useBares();

  const { barSeleccionado } = useBar();

  const [mesas, setMesas] = useState([]);
  const [mostrarInputs, setMostrarInputs] = useState({});
  const [nuevosCodigos, setNuevosCodigos] = useState({});
  const [ultimosQRs, setUltimosQRs] = useState({});
  const [mesasParaFusionar, setMesasParaFusionar] = useState({});

  // Carga los bares una vez
  useEffect(() => {
    cargarBares();
    const estadosIniciales = {};
    zonas.forEach(zona => {
      estadosIniciales[zona] = false;
    });
    setMostrarInputs(estadosIniciales);
    setNuevosCodigos({});
    setUltimosQRs({});
    setMesasParaFusionar({});
  }, [cargarBares]);

  // Cuando cambia el bar seleccionado, carga sus mesas
  useEffect(() => {
    if (!barSeleccionado) {
      setMesas([]);
      return;
    }
    (async () => {
      try {
        const data = await obtenerMesas(barSeleccionado);
        setMesas(data);
      } catch (err) {
        console.error('Error cargando mesas:', err);
        setMesas([]);
      }
    })();
  }, [barSeleccionado]);

  const barActual = getBarById(barSeleccionado);

  const getMesasPorZona = zona =>
    mesas.filter(m => m.zona === zona && m.fusionadaCon === null);

  const getFusionadasPorMaestraPorZona = zona => {
    const resultado = {};
    mesas
      .filter(m => m.fusionadaCon && m.zona === zona)
      .forEach(m => {
        if (!resultado[m.fusionadaCon]) resultado[m.fusionadaCon] = [];
        resultado[m.fusionadaCon].push(m.codigo);
      });
    return resultado;
  };

  const handleAñadirMesa = async zona => {
    const entrada = nuevosCodigos[zona] || {};
    const codigo = entrada.codigo?.trim();
    // Asegúrate de que 'capacidad' se maneje como número desde el input.
    // El input type="number" devuelve un string, así que hay que parsearlo.
    const capacidad = parseInt(entrada.capacidad, 10); 

    if (!codigo || !capacidad || isNaN(capacidad) || capacidad <= 0 || !barSeleccionado) {
      alert('Por favor, introduce un código válido y una capacidad numérica mayor que 0.');
      return;
    }

    // Prepara los datos de la mesa SIN el 'bar' anidado.
    // 'zona' viene del parámetro de la función, que es 'Interior', 'Terraza', o 'Barra'.
    // Asegúrate que este formato coincida con lo que espera el backend para el campo 'zona'.
    const nuevaMesaData = {
      codigo,
      capacidad, // Ya es un número
      disponible: true,
      comensales: 0,
      pedidoEnviado: false,
      zona, // ej. 'Interior', 'Terraza', 'Barra'
      fusionadaCon: null
      // NO incluyas 'bar: { id: barSeleccionado }' aquí
    };

    try {
      // Llama a añadirMesa con barSeleccionado (como barId) y nuevaMesaData por separado
      const mesaCreada = await añadirMesa(barSeleccionado, nuevaMesaData); 
      
      if (mesaCreada) {
        // Asumiendo que mesaCreada tiene qrUrl si la creación fue exitosa y el servicio la añade
        setUltimosQRs(prev => ({ ...prev, [zona]: mesaCreada }));
        setNuevosCodigos(prev => ({ ...prev, [zona]: { codigo: '', capacidad: '' } }));
        setMostrarInputs(prev => ({ ...prev, [zona]: false }));
        
        // Recargar mesas para reflejar el cambio
        const data = await obtenerMesas(barSeleccionado);
        setMesas(data);
      } else {
        // Esto puede ocurrir si el backend, por ejemplo, no crea la mesa (ej. código duplicado)
        // y el servicio/hook retorna null o undefined.
        console.warn('La mesa no pudo ser creada. Respuesta del servidor:', mesaCreada);
        alert('No se pudo crear la mesa. Es posible que el código ya exista o haya ocurrido un error.');
      }
    } catch (err) {
      console.error('Error añadiendo mesa:', err);
      alert(`Error al añadir la mesa: ${err.message || 'Error desconocido.'}`);
    }
  };

  const handleSetMesaParaFusionar = (zona, codigo) => {
    setMesasParaFusionar(prev => ({ ...prev, [zona]: codigo }));
  };

  const puedeEliminarMesa = mesa =>
    mesa.fusionadaCon === null && !mesas.some(m => m.fusionadaCon === mesa.codigo);

  const handleEliminarMesa = async codigoMesa => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar esta mesa?');
    if (!confirmacion) return;
    try {
      await eliminarMesa(barSeleccionado, codigoMesa);
      const data = await obtenerMesas(barSeleccionado);
      setMesas(data);
    } catch (err) {
      console.error('Error eliminando mesa:', err);
      alert('No se pudo eliminar la mesa. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="panel-empleado">
      {/* Añadir navegación de admin */}
      <AdminNavigation />
      
      <div className="mapa-header">
        <h1>Mapa de Mesas {barActual?.nombre && `- ${barActual.nombre}`}</h1>
      </div>

      {!barSeleccionado && (
        <div className="seleccionar-bar-mensaje">
          <p><i className="fas fa-info-circle"></i> Por favor, selecciona un bar desde el menú superior para gestionar sus mesas.</p>
        </div>
      )}

      {barSeleccionado && zonas.map(zona => (
        <div key={zona} className="zona-seccion">
          <h2>{zona} - {barActual?.nombre}</h2>
          <div className="grid-mesas">
            {getMesasPorZona(zona).map((mesa) => (
              <div key={mesa.codigo} className={`mesa-box ${mesa.disponible ? 'disponible' : 'ocupada'}`}>
                <span className="mesa-numero">{mesa.codigo}</span>
                {/* Mostrar la capacidad de la mesa */}
                {typeof mesa.capacidad === 'number' && (
                  <div className="mesa-info-item mesa-capacidad">
                    Capacidad: {mesa.capacidad}
                  </div>
                )}

                {!mesa.disponible && (
                  <>
                    {typeof mesa.comensales === "number" && mesa.comensales > 0 && (
                      <div className="mesa-info-item mesa-comensales">
                        Comensales: <ComensalesIconos cantidad={mesa.comensales} />
                      </div>
                    )}
                    <span className="mesa-info-item mesa-estado">
                      <i className={`fas ${mesa.pedidoEnviado ? 'fa-utensils icon-pedido-enviado' : 'fa-hourglass-half icon-en-espera'}`}></i>
                      {mesa.pedidoEnviado ? 'Pedido enviado' : 'En espera'}
                    </span>
                  </>
                )}

                <QRDownloader
                  mesaCodigo={mesa.codigo}
                  barId={barSeleccionado}
                  qrUrl={mesa.qrUrl}
                />

                {getFusionadasPorMaestraPorZona(zona)[mesa.codigo] && (
                  <>
                    <div className="mesa-fusionadas-list">
                      <strong>Incluye:</strong> {getFusionadasPorMaestraPorZona(zona)[mesa.codigo].join(', ')}
                    </div>
                    <button
                      className="fusionar-con-btn desfusionar-btn"
                      onClick={async () => {
                        await desfusionarMesa(barSeleccionado, mesa.codigo);
                        const data = await obtenerMesas(barSeleccionado);
                        setMesas(data);
                      }}
                    >
                      Desfusionar
                    </button>
                  </>
                )}

                {mesa.fusionadaCon ? (
                  <div className="mesa-fusion-info">
                    🔗 Fusionada con {mesa.fusionadaCon}
                  </div>
                ) : (
                  mesa.disponible && (
                    <>
                      <button
                        className="fusion-btn"
                        onClick={() => handleSetMesaParaFusionar(zona, mesa.codigo)}
                      >
                        Fusionar mesa...
                      </button>
                      {mesasParaFusionar[zona] && mesa.codigo !== mesasParaFusionar[zona] && mesas.find(m => m.codigo === mesasParaFusionar[zona])?.disponible && !mesas.some(m => m.fusionadaCon === mesa.codigo) && (
                        <button
                          className="fusionar-con-btn"
                          onClick={async () => {
                            await fusionarMesas(barSeleccionado, mesasParaFusionar[zona], mesa.codigo);
                            const data = await obtenerMesas(barSeleccionado);
                            setMesas(data);
                            handleSetMesaParaFusionar(zona, null);
                          }}
                        >
                          🔗 Fusionar con {mesasParaFusionar[zona]}
                        </button>
                      )}
                    </>
                  )
                )}

                {puedeEliminarMesa(mesa) && (
                  <span
                    className="icono-eliminar-mesa"
                    onClick={() => handleEliminarMesa(mesa.codigo)}
                    title="Eliminar mesa"
                  >
                    &times;
                  </span>
                )}
              </div>
            ))}

            <div className="mesa-box mesa-add">
              {!mostrarInputs[zona] ? (
                <button
                  className="btn-add"
                  onClick={() => {
                    setMostrarInputs(prev => ({ ...prev, [zona]: true }));
                    setUltimosQRs(prev => ({ ...prev, [zona]: null }));
                  }}
                >
                  +
                </button>
              ) : (
                <div className="input-nueva-mesa">
                  <input
                    type="text"
                    placeholder="Código"
                    value={nuevosCodigos[zona]?.codigo || ''}
                    onChange={e => setNuevosCodigos(prev => ({
                      ...prev,
                      [zona]: { ...prev[zona], codigo: e.target.value }
                    }))}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Capacidad"
                    value={nuevosCodigos[zona]?.capacidad || ''}
                    onChange={e => setNuevosCodigos(prev => ({
                      ...prev,
                      [zona]: { ...prev[zona], capacidad: parseInt(e.target.value, 10) || 0 }
                    }))}
                  />
                  <button onClick={() => handleAñadirMesa(zona)}>Añadir</button>
                  <button 
                    onClick={() => {
                      setMostrarInputs(prev => ({ ...prev, [zona]: false }));
                      setNuevosCodigos(prev => ({ ...prev, [zona]: { codigo: '', capacidad: '' } })); 
                    }}
                    className="btn-cancelar-nueva-mesa"
                  >
                    Cancelar
                  </button>

                  {ultimosQRs[zona] && (
                    <QRDownloader
                      mesaCodigo={ultimosQRs[zona].codigo}
                      barId={barSeleccionado}
                      qrUrl={ultimosQRs[zona].qrUrl}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmpleadoMapaView;