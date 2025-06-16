import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { CarProvider } from './contexts/CarContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      {/* CarProvider fetches and holds all the car data making it available throughout the app */}
      <CarProvider>
        <App />
      </CarProvider>
    </AuthProvider>
  </BrowserRouter>
)
