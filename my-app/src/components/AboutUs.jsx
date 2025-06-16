import React, { useEffect, useState, useRef } from 'react';
import "../css/AboutUs.css";

function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);
  const aboutUsRef = useRef(null);

  useEffect(() => {
    //trigger its callback function when the element it is watching intersects with the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.7) { 
          setIsVisible(true);
        }
      },
      // observer only trigger when the visibility threshold of 70% is passed
      { threshold: 0.7 }
    );

    if (aboutUsRef.current) {
      observer.observe(aboutUsRef.current);
    }

    return () => {
      if (aboutUsRef.current) {
        // stop observing the element to clean up
        observer.unobserve(aboutUsRef.current);
      }
    };
  }, []);

  return (

    <div className='aboutUs-container' ref={aboutUsRef}>
      <div className="aboutUs-content">
        <div className="aboutUs-texts">
          <p className='header'>Cars That <span>Inspire</span> Journeys.</p>
          <p className='mid-text'>Every car in our collection has a story, from cutting-edge models to pre-owned treasures. For you, it’s not just about driving—it’s about the adventure, the freedom, and the memories you’ll create. Find your perfect ride and start your next chapter.</p>
          <p className='last-text'>We know that for you it's not just about driving, it's about experiencing the road.</p>
        </div>
        <div className="aboutUs-info">
          <div className={`about-us-car-image ${isVisible ? "animate" : ""}`}>
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
