import React, { useState, useEffect } from 'react';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import QRDownloader from '../components/QRDownloader';
import ComensalesIconos from '../components/ComensalesIconos';
import { Link } from 'react-router-dom';
import '../styles/panelEmpleado.css';

// Dejamos solo las 3 zonas principales
const zonas = ['Interior', 'Terraza', 'Barra'];

const PanelEmpleado = () => {
  const {
    bares,
    cargarBares,
    añadirMesa,
    fusionarMesas,
    desfusionarMesa,
    getBarById
  } = useBares();

  const { barSeleccionado, setBarSeleccionado } = useBar();
  // Removemos el estado de zona activa ya que mostraremos todas
  const [mostrarInputs, setMostrarInputs] = useState({});
  const [nuevosCodigos, setNuevosCodigos] = useState({});
  const [ultimosQRs, setUltimosQRs] = useState({});
  const [mesasParaFusionar, setMesasParaFusionar] = useState({});
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    cargarBares();
    
    // Inicializar estados para cada zona
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
  
  // Filtrar mesas por zona
  const getMesasPorZona = (zona) => {
    return barActual?.mesas.filter(
      (m) => m.zona === zona && m.fusionadaCon === null
    ) || [];
  };

  // Agrupar mesas fusionadas por zona
  const getFusionadasPorMaestraPorZona = (zona) => {
    const resultado = {};
    barActual?.mesas
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
    const codigo = nuevosCodigos[zona]?.trim();
    if (!codigo || !barSeleccionado) return;

    const nuevaMesa = {
      codigo,
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
    setMesasParaFusionar(prev => {
      const nuevos = { ...prev };
      nuevos[zona] = codigo;
      return nuevos;
    });
  };

  return (
    <div className="panel-empleado">
      {barSeleccionado && (
        <>
          {/* Renderizamos cada zona en su propia sección */}
          {zonas.map(zona => (
            <div key={zona} className="zona-seccion">
              <h2>{zona} - {barActual?.nombre}</h2>
              
              <div className="grid-mesas">
                {getMesasPorZona(zona).map((mesa, i) => (
                  <div key={i} className={`mesa-box ${mesa.disponible ? 'disponible' : 'ocupada'}`}>
                    <span className="mesa-numero">{mesa.codigo}</span>

                    {mesa.disponible ? null : (
                      <>
                        <ComensalesIconos cantidad={mesa.comensales} />
                        <span className="mesa-estado">
                          <i
                            className={`fas ${
                              mesa.pedidoEnviado
                                ? 'fa-utensils icon-pedido-enviado'
                                : 'fa-hourglass-half icon-en-espera'
                            }`}
                          ></i>
                          {mesa.pedidoEnviado ? 'Pedido enviado' : 'En espera'}
                        </span>
                      </>
                    )}

                    {/* QR */}
                    {mesa.qrUrl && (
                      <QRDownloader
                        mesaCodigo={mesa.codigo}
                        barId={barSeleccionado}
                        qrUrl={mesa.qrUrl}
                      />
                    )}

                    {/* Mesas fusionadas */}
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

                    {/* Fusionar / Desfusionar */}
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
                          barActual.mesas.find(m => m.codigo === mesasParaFusionar[zona])?.disponible && (
                            <button
                              className="fusionar-con-btn"
                              onClick={() => {
                                fusionarMesas(barSeleccionado, mesasParaFusionar[zona], mesa.codigo);
                                handleSetMesaParaFusionar(zona, null);
                              }}
                            >
                              🔗 Fusionar con {mesasParaFusionar[zona]}
                            </button>
                          )}
                      </>
                    )}
                  </div>
                ))}

                {/* Añadir nueva mesa */}
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
                        value={nuevosCodigos[zona] || ''}
                        onChange={(e) => setNuevosCodigos(prev => ({ ...prev, [zona]: e.target.value }))}
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
        </>
      )}
    </div>
  );
};

export default PanelEmpleado;
