import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import BackToMainScreen from '../components/BackToMainScreen';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className='main-container'>
      <BackToMainScreen />
      <div className='image-container'>
        <img src="/images/login-side-image.jpg" alt="login-side-image" />
      </div>
      <div className='login-content'>
        <h1> Welcome to <span>SpeedAI</span></h1>
        <form onSubmit={handleSubmit}>
          <label>Email*</label>
          <input
            type='email'
            className='input-style'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password*</label>
          <input
            type="password"
            className='input-style'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className='login-button' type='submit'>
            Login
          </button>
        </form>
        <div className='guest-container'>
          <button className='guest-login-btn'>
            Continue as a Guest
          </button>
        </div>
        <div className='sign-up-footer'>
          <p>Don't have an account? <Link to="/SignUp">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;