import NavBar from './components/NavBar';
import Home from './components/Home';
import Brands from './components/Brands';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Chatbot from './components/ChatBot';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
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

      <Chatbot />
    </>
  );
}

export default App;