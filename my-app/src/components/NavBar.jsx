import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/NavBar.css";
import SearchBar from "./SearchBar";


function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
          <button onClick={()=> scrollToSection("home")} className="logo-button">SpeedAI</button>
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

        <div className="search" onClick={() => setShowSearch(true)}>
          <input type="text" placeholder="Search" readOnly />
          <ion-icon name="search-outline" />
        </div>

        <div className="login">
        <Link className="login-link" to="/Login"><button className="login-button">LOGIN</button></Link>
        </div>
      </nav>

      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
    </>
  );
}

export default NavBar;
