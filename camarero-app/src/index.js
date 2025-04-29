import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter} from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import App from './App';
import './styles/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Crear un root para la app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizamos la app dentro del root
root.render(
<BrowserRouter>
    <UserProvider> 
      <App />
    </UserProvider>
  </BrowserRouter>
);