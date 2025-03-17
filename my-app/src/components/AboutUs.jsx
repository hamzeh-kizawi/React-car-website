import React from 'react';
import "../css/AboutUs.css";

function AboutUs() {
  return (
    <div className='aboutUs-container'>
      <div className="aboutUs-content">
        <div className="aboutUs-texts">
          <p className='header'>Cars That <span>Inspire</span> Journeys.</p>
          <p className='mid-text'>Every car in our collection has a story, from cutting-edge models to pre-owned treasures. For you, it’s not just about driving—it’s about the adventure, the freedom, and the memories you’ll create. Find your perfect ride and start your next chapter.</p>
          <p className='last-text'>We know that for you it's not just about driving, it's about experiencing the road.</p>
        </div>
        <div className="aboutUs-info">
          <div className="about-us-car-image">
            <img src="./images/about-us-image.jpg" alt="about us image" />
          </div>
          <div className="information">
            <div className="left-side-info">
              <div className='left-side-first'>
                <p className='numbers'>+900</p>
                <p>Cars sold</p>
              </div>
              <div className='left-side-second'>
                <p className='numbers'>%90</p>
                <p>Recommendation rate</p>
              </div>
            </div>
            <div className="right-side-info">
              <div className='right-side-first'>
                <p className='numbers'>+600</p>
                <p>Satisfied customers</p>
              </div>
              <div className='right-side-second'>
                <p className='numbers'>+6</p>
                <p>Years of experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;