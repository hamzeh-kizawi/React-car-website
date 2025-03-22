import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { CarProvider } from './contexts/CarContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // ✅ fixed import path

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CarProvider>
        <App />
      </CarProvider>
    </AuthProvider>
  </BrowserRouter>
)
