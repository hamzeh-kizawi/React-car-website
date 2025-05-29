import React, { useState } from 'react';
import BackToMainScreen from '../components/BackToMainScreen';
import { Link, useNavigate } from "react-router-dom";
import "../css/SignUp.css"; 

function SignUp() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState(""); 
  const [successMessage, setSuccessMessage] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccessMessage(""); 

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) { 
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userName, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
            navigate('/login');
        }, 1500); 
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
        console.error("Registration submit error:", err);
        setError("An error occurred during registration. Please try again later.");
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

        {error && <p className="error-message-signup">{error}</p>} 
        {successMessage && <p className="success-message-signup">{successMessage}</p>} 

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-username">UserName*</label>
          <input 
            id="signup-username"
            type="text"
            className='input-style'
            value={userName}
            required
            onChange={(e) => setUserName(e.target.value)}
          />

          <label htmlFor="signup-email">Email*</label>
          <input
            id="signup-email"
            type="email"
            className='input-style'
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="signup-password">Password*</label>
          <input 
            id="signup-password"
            type="password"
            className='input-style'
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          
          <label htmlFor="signup-confirm-password">Confirm Password*</label>
          <input 
            id="signup-confirm-password"
            type="password"
            className='input-style'
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className='sign-up-btn' type="submit">Sign up</button>
        </form>

        <div className="sign-up-footer">
          <p>
            Already signed up? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;