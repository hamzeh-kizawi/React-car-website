import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../css/Logout.css';
import { useAuth } from '../contexts/AuthContext';

function Logout({ onClose }) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            const csrfToken = Cookies.get('csrf_access_token');

            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (response.ok) {
                logout();     
                onClose();   
                navigate('/');
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
            }
        } catch (error) {
            console.error("An error occurred during logout:", error);
        }
    };
    return (
        
        <div className="logout-overlay">
            <div className="logout-modal">
                <h2>Confirm Logout</h2>
                <p>Are you sure you want to logout?</p>
                <div className="logout-buttons">
                    <button onClick={handleLogout}>Yes</button>
                    <button onClick={onClose}>No</button>
                </div>
            </div>
        </div>
    );
}

export default Logout;
