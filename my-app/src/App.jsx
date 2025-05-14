import { useState } from 'react';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Chatbot from './components/ChatBot';
import SearchBar from './components/SearchBar';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [filteredCarNames, setFilteredCarNames] = useState([]);

  const handleShowRecommendations = (carNames) => {
    setFilteredCarNames(carNames);
    setShowSearch(true);
  };

  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <>
              <NavBar />
              <Home />
              <AboutUs />
              <Brands />
              <ContactUs />
            </>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/SignUp' element={<SignUp />} />
      </Routes>

      
      <Chatbot onShowRecommendations={handleShowRecommendations} />

      {showSearch && (
        <SearchBar
          onClose={() => setShowSearch(false)}
          filteredCarNames={filteredCarNames}
        />
      )}
    </>
  );
}

export default App;
