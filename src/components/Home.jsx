import React from "react";
import "../css/Home.css";

const Home = () => {

  const scrollToBrands = () =>{
    const brandsSection = document.getElementById("brands-section")
    if(brandsSection){
      brandsSection.scrollIntoView({behavior: "smooth"})
    }
  }

  return (
    <section id="home" className="home-container">
      <div className="video-background">
        <video autoPlay muted loop className="background-video">
          <source src="/videos/carVideo.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="content">
        <h1>Welcome to SpeedAI</h1>
        <p>Find Your Perfect Car with AI Assistance</p>
        <button onClick={scrollToBrands}>Brands <span className="arrow">→</span></button>
      </div>
    </section>
  );
};

export default Home;
