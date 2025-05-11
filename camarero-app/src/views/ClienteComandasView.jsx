import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/clienteComandasView.css';
import { useComandas } from '../context/useComandas';

const ClienteComandas = () => {
  const { mesaId, barId } = useParams();
  const navigate = useNavigate();
  const { comandas, comensales } = useComandas();

  const nuevaComanda = () => {
    navigate(`/cliente/${barId}/${mesaId}`);
  };

  const marcharse = () => {
    navigate(`/cliente/${barId}/${mesaId}/pago`);
  };

  return (
    <div className="cliente-comandas-view">
      <h2>Resumen de Comandas - Mesa {mesaId}</h2>

      {comensales && (
        <div className="comensales-info">
          <i className="fas fa-users"></i> <strong>Comensales:</strong> {comensales}
        </div>
      )}

      <div className="comandas-listado">
        {comandas.length === 0 ? (
          <p className="sin-comandas">No hay comandas registradas para esta mesa.</p>
        ) : (
          comandas.map(comanda => (
            <div key={comanda.id} className="comanda-card">
              <div className="comanda-header">
                <h3>Comanda #{comanda.id}</h3>
                <span className={`estado ${comanda.estado}`}>
                  {comanda.estado === 'listo' ? 'Listo para recoger' : 'En preparación'}
                </span>
              </div>
              <p className="comanda-fecha">{comanda.fecha}</p>
              <ul className="comanda-items">
                {comanda.items.map((item, idx) => (
                  <li key={idx}>
                    {item.nombre} x{item.cantidad}
                    <span className={`estado-individual ${
                      item.recogido
                        ? 'recogido'
                        : item.disponible
                        ? 'retirable'
                        : 'pendiente'
                    }`}>
                      {item.recogido
                        ? 'Recogido'
                        : item.disponible
                        ? 'Listo en barra'
                        : 'Preparándose'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="comanda-estimado">⏱ {comanda.estimado}</div>
            </div>
          ))
        )}
      </div>

      <div className="acciones-comandas">
        <button className="btn-secundario" onClick={nuevaComanda}>Solicitar nueva comanda</button>
        <button className="btn-principal" onClick={marcharse}>Me marcho, quiero pagar</button>
      </div>
    </div>
  );
};

export default ClienteComandas;