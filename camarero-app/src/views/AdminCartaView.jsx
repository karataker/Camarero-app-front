import React from 'react';
import { useParams, Link } from 'react-router-dom';
import CartaDigitalAdmin from '../components/CartaDigitalAdmin';
import '../styles/adminCartaView.css';

const AdminCartaView = () => {
  const { barId } = useParams();
  
  return (
    <div className="admin-carta-view">
      <div className="admin-breadcrumb">
        <Link to="/admin/panel">Panel</Link>
        <span>/</span>
        <Link to={`/admin/bar/${barId}`}>Bar</Link>
        <span>/</span>
        <span>Carta Digital</span>
      </div>
      
      <h1>Gestión de Carta Digital</h1>
      
      <div className="admin-stats">
        <div className="stat-card out-of-stock">
          <span className="stat-title">Productos sin stock</span>
          <span className="stat-value">5</span>
        </div>
        <div className="stat-card low-stock">
          <span className="stat-title">Productos con bajo stock</span>
          <span className="stat-value">12</span>
        </div>
      </div>
      
      <CartaDigitalAdmin barId={barId} />
    </div>
  );
};

export default AdminCartaView;