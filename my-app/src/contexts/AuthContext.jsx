import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await fetch("http://localhost:5000/user", {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                await tryRefreshToken();
            } else {
                console.error("Unexpected error fetching user.");
            }
        } catch (error) {
            console.error("Network error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };



    const tryRefreshToken = async () => {
        try {
            const csrfRefreshToken = Cookies.get("csrf_refresh_token");

            const response = await fetch("http://localhost:5000/refresh", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfRefreshToken,
                },
            });

            if (response.ok) {
                console.log("Token refreshed");
                await fetchUser();
            } else {
                console.warn("Refresh token expired or invalid.");
                setUser(null); 
            }
        } catch (err) {
            console.error("Error refreshing token:", err);
            setUser(null);
        }
    };


    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, setUser, fetchUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
