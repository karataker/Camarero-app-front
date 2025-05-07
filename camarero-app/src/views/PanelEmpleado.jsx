import React, { useState, useEffect } from 'react';
import { useBares } from '../hooks/useBares';
import { useBar } from '../context/BarContext';
import QRDownloader from '../components/QRDownloader';
import '../styles/panelEmpleado.css';

const zonas = ['Interior', 'Terraza', 'Barra', 'Cocina', 'Almacén'];

const PanelEmpleado = () => {
  const {
    bares,
    cargarBares,
    añadirMesa,
    fusionarMesas,
    desfusionarMesa,
    getBarById
  } = useBares();

  const { barSeleccionado } = useBar();
  const [zonaActiva, setZonaActiva] = useState('Interior');
  const [mostrarInput, setMostrarInput] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [ultimoQR, setUltimoQR] = useState(null);
  const [mesaParaFusionar, setMesaParaFusionar] = useState(null);

  useEffect(() => {
    cargarBares();
  }, [cargarBares]);

  const barActual = getBarById(barSeleccionado);

  // Filtrar mesas por zona y que no estén fusionadas con otra
  const mesasFiltradas = barActual?.mesas.filter(
    (m) => m.zona === zonaActiva && m.fusionadaCon === null
  );

  // Agrupar mesas fusionadas
  const fusionadasPorMaestra = {};
  barActual?.mesas
    .filter((m) => m.fusionadaCon && m.zona === zonaActiva)
    .forEach((m) => {
      if (!fusionadasPorMaestra[m.fusionadaCon]) {
        fusionadasPorMaestra[m.fusionadaCon] = [];
      }
      fusionadasPorMaestra[m.fusionadaCon].push(m.codigo);
    });

  const handleAñadirMesa = async () => {
    const codigo = nuevoCodigo.trim();
    if (!codigo || !barSeleccionado) return;

    const nuevaMesa = {
      codigo,
      disponible: true,
      comensales: 0,
      pedidoEnviado: false,
      zona: zonaActiva,
      fusionadaCon: null 
    };

    const mesaCreada = await añadirMesa(barSeleccionado, nuevaMesa);
    if (mesaCreada) {
      setUltimoQR(mesaCreada);
      setNuevoCodigo('');
      setMostrarInput(false);
    }
  };

  return (
    <div className="panel-empleado">

      {barSeleccionado && (
        <>
          {/* Selección de zonas */}
          <div className="zona-tabs">
            {zonas.map((zona) => (
              <button
                key={zona}
                className={`zona-tab ${zonaActiva === zona ? 'activa' : ''}`}
                onClick={() => {
                  setZonaActiva(zona);
                  setUltimoQR(null);
                  setMesaParaFusionar(null);
                }}
              >
                {zona}
              </button>
            ))}
          </div>

          <div className="zona-contenido">
            <h2>{zonaActiva} - {barActual?.nombre}</h2>

            <div className="grid-mesas">
              {mesasFiltradas.map((mesa, i) => (
                <div key={i} className={`mesa-box ${mesa.disponible ? 'disponible' : 'ocupada'}`}>
                  <span className="mesa-numero">{mesa.codigo}</span>

                  {mesa.disponible ? null : (
                    <>
                      <span className="mesa-comensales">
                        <i className="fas fa-users icon-users"></i>
                        {mesa.comensales} comensales
                      </span>
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
                  {fusionadasPorMaestra[mesa.codigo] && (
                     <>
                    <div className="mesa-fusionadas-list">
                      <strong>Incluye:</strong> {fusionadasPorMaestra[mesa.codigo].join(', ')}
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
                            onClick={() => setMesaParaFusionar(mesa.codigo)}
                          >
                            Fusionar mesa...
                          </button>
                        )}

                      {mesaParaFusionar &&
                        mesa.codigo !== mesaParaFusionar &&
                        mesa.disponible &&
                        barActual.mesas.find(m => m.codigo === mesaParaFusionar)?.disponible && (
                          <button
                            className="fusionar-con-btn"
                            onClick={() => {
                              fusionarMesas(barSeleccionado, mesaParaFusionar, mesa.codigo);
                              setMesaParaFusionar(null);
                            }}
                          >
                            🔗 Fusionar con {mesaParaFusionar}
                          </button>
                        )}
                    </>
                  )}

                </div>
              ))}

              {/* Añadir nueva mesa */}
              <div className="mesa-box mesa-add">
                {!mostrarInput ? (
                  <button className="btn-add" onClick={() => {setMostrarInput(true); setUltimoQR(null);}}> + </button>
                ) : (
                  <div className="input-nueva-mesa">
                    <input
                      type="text"
                      placeholder="Código"
                      value={nuevoCodigo}
                      onChange={(e) => setNuevoCodigo(e.target.value)}
                    />
                    <button onClick={handleAñadirMesa}>Añadir</button>

                    {ultimoQR && (
                      <QRDownloader
                        mesaCodigo={ultimoQR.codigo}
                        barId={barSeleccionado}
                        qrUrl={ultimoQR.qrUrl}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PanelEmpleado;
