import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../styles/cliente/comandas/clienteComandasView.css';
// Importamos nuestro nuevo hook
import { useComandas } from '../../../hooks/useComandas';

const ClienteComandasView = () => {
  const { barId, mesaId } = useParams();
  const navigate = useNavigate();
  // Se elimina nuevaComanda de la desestructuración
  const { comandas, comensales, nombreMesa, marcharse, loading, error } = useComandas(barId, mesaId);

  // Manejo de estados de carga y error
  if (loading) {
    return <div className="loading-view">Cargando comandas...</div>;
  }

  if (error) {
    return <div className="error-view">Error al cargar comandas: {error}</div>;
  }

  return (
    <div className="cliente-comandas-view">
      <div className="titulo-y-acciones-header">
        <h2>Resumen de Comandas - Mesa {nombreMesa || mesaId}</h2>
        <button className="btn-volver-carta" onClick={() => navigate(`/cliente/${barId}/${mesaId}`)}>
          <i className="fas fa-arrow-left"></i>
          Volver a la carta, quiero pedir algo más
        </button>
      </div>

      <div className="comandas-listado">
        {comandas.length === 0 ? (
          <p className="sin-comandas">No hay comandas registradas para esta mesa.</p>
        ) : (
          comandas.map(comanda => (
            <div key={comanda.id} className="comanda-card">
              <div className="comanda-header">
                <h3>Comanda #{comanda.id}</h3>
                <span className={`estado ${comanda.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {comanda.estado}
                </span>
              </div>
              <p className="comanda-fecha">{new Date(comanda.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <ul className="comanda-items">
                {comanda.items && comanda.items.map((item, idx) => (
                  <li key={idx}>
                    {item.nombre} x{item.cantidad}
                    <span className={`estado-individual ${
                      item.recogido
                        ? 'recogido'
                        : item.disponibleEnBarra // Asumiendo que este es el campo correcto
                        ? 'retirable'
                        : 'pendiente'
                    }`}>
                      {item.recogido
                        ? 'Recogido'
                        : item.disponibleEnBarra
                        ? 'Listo en barra'
                        : 'Preparándose'}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Tiempo estimado eliminado */}
            </div>
          ))
        )}
      </div>
      <div className="acciones-comandas">
        {/* Botón "Solicitar nueva comanda" eliminado */}
        <button className="btn-principal" onClick={marcharse}>Me marcho, dejar libre la mesa</button>
      </div>
    </div>
  );
};

export default ClienteComandasView;