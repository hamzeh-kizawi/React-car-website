import React, { useState } from 'react';
import BackToMainScreen from '../components/BackToMainScreen';
import { Link, useNavigate } from "react-router-dom";
import "../css/SignUp.css";

function SignUp() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: userName, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/login');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className='sign-up-container'>
      <BackToMainScreen />
      <div className='image-container'>
        <img src="/images/sign-up-side-image.jpg" alt="sign-up-side-image.jpg" />
      </div>

      <div className="sign-up-content">
        <h1>Welcome to SpeedAI</h1>
        <div className='sign-up-header'>Sign up</div>

        <form onSubmit={handleSubmit}>
          <label>UserName*</label>
          <input 
            type="text"
            className='input-style'
            value={userName}
            required
            onChange={(e) => setUserName(e.target.value)}
          />

          <label>Email*</label>
          <input
            type="email"
            className='input-style'
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password*</label>
          <input 
            type="password"
            className='input-style'
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className='sign-up-btn' type="submit">Sign up</button>
        </form>

        <div className="sign-up-footer">
          <p>
            Already signed? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;