import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import { BarProvider } from './context/BarContext';
import { ComandaProvider } from './context/useComandas';
import App from './App';
import './styles/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <UserProvider>
      <BarProvider>
        <ComandaProvider>
          <App />
        </ComandaProvider>
      </BarProvider>
    </UserProvider>
  </BrowserRouter>
);
