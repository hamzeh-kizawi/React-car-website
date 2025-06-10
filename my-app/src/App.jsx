import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Chatbot from './components/Chatbot';
import SearchBar from './components/SearchBar';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DiscussionPage from './pages/DiscussionPage';
import PostDetailPage from './pages/PostDetailPage'; 

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [filteredCarNames, setFilteredCarNames] = useState([]);
  const location = useLocation();

  const handleShowRecommendations = (carNames) => {
    setFilteredCarNames(carNames);
    setShowSearch(true);
  };

  const hideChatBotOnPages = ['/login', '/signup', '/discussions']; 
  
  const showChatBotOnPage = !hideChatBotOnPages.some(path => location.pathname.toLowerCase().startsWith(path)) &&
                           !location.pathname.toLowerCase().startsWith('/discussions/'); 

  const showNavBar = location.pathname === '/';


  return (
    <>
      {showNavBar && <NavBar />}

      <Routes>
        <Route
          path='/'
          element={
            <>
              <Home />
              <AboutUs />
              <Brands />
              <ContactUs />
            </>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/discussions' element={<DiscussionPage />} />
        <Route path='/discussions/:postId' element={<PostDetailPage />} />

      </Routes>

      {showChatBotOnPage && (
        <Chatbot onShowRecommendations={handleShowRecommendations} />
      )}

      {showSearch && location.pathname === '/' && (
        <SearchBar
          onClose={() => setShowSearch(false)}
          filteredCarNames={filteredCarNames}
        />
      )}
    </>
  );
}

export default App;