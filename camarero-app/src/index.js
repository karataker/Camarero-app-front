import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import { BarProvider } from './context/BarContext';
import { ComandaProvider } from './context/useComandas';
import { CarritoProvider } from './context/carritoContext';
import App from './App';
import './styles/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <UserProvider>
      <BarProvider>
        <ComandaProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </ComandaProvider>
      </BarProvider>
    </UserProvider>
  </BrowserRouter>
);
