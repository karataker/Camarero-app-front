import React, { useState, useEffect } from 'react';
import { useBares } from '../hooks/useBares';
import '../styles/panelEmpleado.css';

const zonas = ['Interior', 'Terraza', 'Barra', 'Cocina', 'Almacén'];

const PanelEmpleado = () => {
  const { bares, cargarBares, añadirMesa, getBarById } = useBares();
  const [barSeleccionado, setBarSeleccionado] = useState(null);
  const [zonaActiva, setZonaActiva] = useState('Interior');
  const [mostrarInput, setMostrarInput] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState('');

  useEffect(() => {
    cargarBares();
  }, [cargarBares]);

  const barActual = getBarById(barSeleccionado);

  const handleAñadirMesa = async () => {
    if (!nuevoCodigo.trim() || !barSeleccionado) return;

    await añadirMesa(barSeleccionado, {
      codigo: nuevoCodigo.trim(),
      disponible: true,
      comensales: 0,
      pedidoEnviado: false
    });

    setNuevoCodigo('');
    setMostrarInput(false);
  };

  return (
    <div className="panel-empleado">

      {/* Botones de selección de bares */}
      <div className="barra-bares">
        {bares.map((bar) => (
          <button
            key={bar.id}
            className={`bar-tab ${barSeleccionado === bar.id ? 'activo' : ''}`}
            onClick={() => {
              setBarSeleccionado(bar.id);
              setZonaActiva('Interior');
              setMostrarInput(false);
              setNuevoCodigo('');
            }}
          >
            {bar.nombre}
          </button>
        ))}
      </div>

      {/* Zonas y contenido */}
      {barSeleccionado && (
        <>
          <div className="zona-tabs">
            {zonas.map((zona) => (
              <button
                key={zona}
                className={`zona-tab ${zonaActiva === zona ? 'activa' : ''}`}
                onClick={() => setZonaActiva(zona)}
              >
                {zona}
              </button>
            ))}
          </div>

          <div className="zona-contenido">
            <h2>{zonaActiva} - {barActual?.nombre}</h2>

            <div className="grid-mesas">
              {/* Mesas existentes */}
              {barActual?.mesas.map((mesa, i) => (
                <div key={i} className={`mesa-box ${mesa.disponible ? 'disponible' : 'ocupada'}`}>
                  <span className="mesa-numero">{mesa.codigo}</span>

                  {mesa.disponible ? (
                    <span className="mesa-estado">
                      <i className="fas fa-circle-check" style={{ color: 'green' }}></i>
                      Disponible
                    </span>
                  ) : (
                    <>
                      <span className="mesa-comensales">
                        <i className="fas fa-users"></i>
                        {mesa.comensales} comensales
                      </span>
                      <span className="mesa-estado">
                      <i className={`fas ${mesa.pedidoEnviado ? 'fa-utensils icon-pedido-enviado' : 'fa-hourglass-half icon-en-espera'}`} ></i>
                        {mesa.pedidoEnviado ? 'Pedido enviado' : 'En espera'}
                      </span>
                    </>
                  )}
                </div>
              ))}

              {/* Tarjeta para añadir nueva mesa */}
              <div className="mesa-box mesa-add">
                {!mostrarInput ? (
                  <button className="btn-add" onClick={() => setMostrarInput(true)}>+</button>
                ) : (
                  <div className="input-nueva-mesa">
                    <input
                      type="text"
                      placeholder="Código de mesa"
                      value={nuevoCodigo}
                      onChange={(e) => setNuevoCodigo(e.target.value)}
                    />
                    <button onClick={handleAñadirMesa}>Añadir</button>
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