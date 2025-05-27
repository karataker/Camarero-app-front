import React, { useState, useEffect } from 'react';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import QRDownloader from '../components/QRDownloader';
import ComensalesIconos from '../components/ComensalesIconos';
import '../styles/empleadoMapaView.css';

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

  const [mostrarInputs, setMostrarInputs] = useState({});
  const [nuevosCodigos, setNuevosCodigos] = useState({});
  const [ultimosQRs, setUltimosQRs] = useState({});
  const [mesasParaFusionar, setMesasParaFusionar] = useState({});

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

  const barActual = getBarById(barSeleccionado);

  const getMesasPorZona = (zona) => {
    if (!barActual || !Array.isArray(barActual.mesas)) return [];
    return barActual.mesas.filter(m => m.zona === zona && m.fusionadaCon === null);
  };

  const getFusionadasPorMaestraPorZona = (zona) => {
    const resultado = {};
    if (!barActual || !Array.isArray(barActual.mesas)) return resultado;

    barActual.mesas
      .filter((m) => m.fusionadaCon && m.zona === zona)
      .forEach((m) => {
        if (!resultado[m.fusionadaCon]) {
          resultado[m.fusionadaCon] = [];
        }
        resultado[m.fusionadaCon].push(m.codigo);
      });

    return resultado;
  };

  const handleAñadirMesa = async (zona) => {
    const entrada = nuevosCodigos[zona] || {};
    const codigo = entrada.codigo?.trim();
    const capacidad = entrada.capacidad;

    if (!codigo || !capacidad || !barSeleccionado) return;

    const nuevaMesa = {
      codigo,
      capacidad,
      disponible: true,
      comensales: 0,
      pedidoEnviado: false,
      zona: zona,
      fusionadaCon: null
    };

    const mesaCreada = await añadirMesa(barSeleccionado, nuevaMesa);
    if (mesaCreada) {
      setUltimosQRs(prev => ({ ...prev, [zona]: mesaCreada }));
      setNuevosCodigos(prev => ({ ...prev, [zona]: '' }));
      setMostrarInputs(prev => ({ ...prev, [zona]: false }));
    }
  };

  const handleSetMesaParaFusionar = (zona, codigo) => {
    setMesasParaFusionar(prev => ({ ...prev, [zona]: codigo }));
  };

  const puedeEliminarMesa = (mesa) => {
    // Solo se pueden eliminar mesas que no estén fusionadas
    return mesa.fusionadaCon === null && !barActual?.mesas.some(m => m.fusionadaCon === mesa.codigo);
  };

  const handleEliminarMesa = async (codigoMesa) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar esta mesa?");
    if (confirmacion) {
      const resultado = await eliminarMesa(barSeleccionado, codigoMesa);
      if (!resultado) {
        alert("No se pudo eliminar la mesa. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="panel-empleado">
      {barSeleccionado && zonas.map(zona => (
        <div key={zona} className="zona-seccion">
          <h2>{zona} - {barActual?.nombre}</h2>
          <div className="grid-mesas">
            {getMesasPorZona(zona).map((mesa, i) => (
              <div key={i} className={`mesa-box ${mesa.disponible ? 'disponible' : 'ocupada'}`}>
                <span className="mesa-numero">{mesa.codigo}</span>

                {!mesa.disponible && (
                  <>
                    {typeof mesa.comensales === "number" && mesa.comensales > 0 && (
                      <div className="mesa-comensales">
                        <ComensalesIconos cantidad={mesa.comensales} />
                      </div>
                    )}
                    <span className="mesa-estado">
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
                      onClick={() => desfusionarMesa(barSeleccionado, mesa.codigo)}
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
                  <>
                    {mesa.disponible && (
                      <button
                        className="fusion-btn"
                        onClick={() => handleSetMesaParaFusionar(zona, mesa.codigo)}
                      >
                        Fusionar mesa...
                      </button>
                    )}

                    {mesasParaFusionar[zona] &&
                      mesa.codigo !== mesasParaFusionar[zona] &&
                      mesa.disponible &&
                      barActual.mesas.find(m => m.codigo === mesasParaFusionar[zona])?.disponible &&
                      !barActual.mesas.some(m => m.fusionadaCon === mesa.codigo) && (
                        <button
                          className="fusionar-con-btn"
                          onClick={() => {
                            fusionarMesas(barSeleccionado, mesasParaFusionar[zona], mesa.codigo)
                              .then(() => {
                                cargarBares();
                                handleSetMesaParaFusionar(zona, null);
                              });
                          }}
                        >
                          🔗 Fusionar con {mesasParaFusionar[zona]}
                        </button>
                      )}
                  </>
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
                <button className="btn-add" onClick={() => {
                  setMostrarInputs(prev => ({ ...prev, [zona]: true }));
                  setUltimosQRs(prev => ({ ...prev, [zona]: null }));
                }}>
                  +
                </button>
              ) : (
            <div className="input-nueva-mesa">
                <input
                  type="text"
                  placeholder="Código"
                  value={nuevosCodigos[zona]?.codigo || ''}
                  onChange={(e) =>
                    setNuevosCodigos(prev => ({
                      ...prev,
                      [zona]: { ...prev[zona], codigo: e.target.value }
                    }))
                  }
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Capacidad"
                  value={nuevosCodigos[zona]?.capacidad || ''}
                  onChange={(e) =>
                    setNuevosCodigos(prev => ({
                      ...prev,
                      [zona]: { ...prev[zona], capacidad: parseInt(e.target.value, 10) || 0 }
                    }))
                  }
                />
                <button onClick={() => handleAñadirMesa(zona)}>Añadir</button>

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