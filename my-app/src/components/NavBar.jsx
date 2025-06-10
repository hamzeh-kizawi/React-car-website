import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/NavBar.css";
import SearchBar from "./SearchBar";
import Logout from "./Logout";
import { useAuth } from "../contexts/AuthContext";

function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showLogout, setShowLogout] = useState(false);

    const { user } = useAuth();

    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
                <div className="logo">
                    <button onClick={() => scrollToSection("home")} className="logo-button">SpeedAI</button>
                </div>

                <div className="navbar-links">
                    <button onClick={() => scrollToSection("home")} className="home-page">
                        Home
                    </button>
                    <button onClick={() => scrollToSection("brands-section")} className="brands-page">
                        Brands
                    </button>
                    <Link to="/discussions">Discussions</Link>
                </div>

                <div className="search" onClick={() => setShowSearch(true)}>
                    <input type="text" placeholder="Search" readOnly />
                    <ion-icon name="search-outline" />
                </div>

                <div className="login">
                {user ? (
                    <button className="username-button" onClick={() => setShowLogout(true)}>
                        {user.username === "Guest" ? "Guest" : user.username}
                    </button>
                ) : (
                    <Link className="login-link" to="/Login">
                        <button className="login-button">LOGIN</button>
                    </Link>
                )}
                </div>
            </nav>
            {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
            {showLogout && <Logout onClose={() => setShowLogout(false)} />}
        </>
    );
}

export default NavBar;
