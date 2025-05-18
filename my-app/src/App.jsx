import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Chatbot from './components/ChatBot';
import SearchBar from './components/SearchBar';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [filteredCarNames, setFilteredCarNames] = useState([]);

  const location = useLocation();

  const handleShowRecommendations = (carNames) => {
    setFilteredCarNames(carNames);
    setShowSearch(true);
  };

  const showChatBot = location.pathname !== "/login" && location.pathname !== "/Login" && location.pathname !== "/SignUp";

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

      {showChatBot && (
        <Chatbot onShowRecommendations={handleShowRecommendations} />
      )}

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
