import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import { CarProvider } from './contexts/CarContext';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path='/'
      element={
      <>
        <NavBar />
        <Home />
        <Brands />
      </>
      }>   
      </Route>

      <Route path='/login'
      element={<Login />}
      >
      </Route>
    </Routes>
    
  );
}

export default App;
