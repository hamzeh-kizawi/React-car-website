import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../css/NavBar.css";
import { CarContext } from "../contexts/CarContext";

function NavBar() {
  const { cars } = useContext(CarContext); // FIXED: Using correct context name
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="logo">
        <Link to="/">SpeedAI</Link>
      </div>

      <div className="navbar-links">
        <button onClick={() => scrollToSection("home")} className="home-page">
          Home
        </button>
        <button onClick={() => scrollToSection("brands-section")} className="brands-page">
          Brands
        </button>
        <Link to="/my-list">My List</Link>
      </div>

      <div className="search">
        <input type="text" placeholder="Search" />
        <ion-icon name="search-outline" />
      </div>

      <div className="login">
        <button className="login-button">LOGIN</button>
      </div>
    </nav>
  );
}

export default NavBar;
