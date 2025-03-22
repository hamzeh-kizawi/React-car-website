// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import BackToMainScreen from '../components/BackToMainScreen';
import { useAuth } from "../contexts/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset previous errors

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                await fetchUser(); // Refresh user from token
                navigate('/');
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Login error:", err);
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
                {error && <p className="error-message">{error}</p>}
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
