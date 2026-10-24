import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MatrimonyAuthProvider } from './context/MatrimonyAuthContext';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MatrimonyAuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MatrimonyAuthProvider>
    </AuthProvider>
  </StrictMode>,
);

