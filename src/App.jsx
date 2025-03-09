import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import { CarProvider } from './contexts/CarContext';
import './App.css';

function App() {
  return (
    <CarProvider>
      <NavBar />
      <Home />
      <Brands />
    </CarProvider>
  );
}

export default App;
