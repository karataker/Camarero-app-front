import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CartaDigitalAdmin from '../components/CartaDigitalAdmin';
import '../styles/adminCartaView.css';

const AdminCartaView = () => {
  const { barId } = useParams();
  
  return (
    <div className="carta-digital-admin">
      <div className="carta-header">
        <h1>Carta Digital</h1>
      </div>

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