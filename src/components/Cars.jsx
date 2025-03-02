import React from "react";
import "../css/Cars.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function Cars({ brand, cars }) {
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 4 },
    desktop: { breakpoint: { max: 1024, min: 800 }, items: 3 },
    tablet: { breakpoint: { max: 800, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <>
      <p className="car-section-name">{brand} Section</p>
      <Carousel responsive={responsive}>
        {cars.map((car) => (
          <div className="card" key={car.id}>
            <div className="product-image">
              <img src={car.image} alt={car.name} />
            </div>
            <div className="car-name">{car.name}</div>
            <div className="car-info">
              <div className="horse-power">
                <img src="/horsepower-icon.png" alt="horsepower-icon" />
                <p>{car.horsepower}</p>
              </div>
              <div className="fuel-type">
                <img src="/fuel-icon.png" alt="fuel-type-icon" />
                <p>{car.fuel_type}</p>
              </div>
              <div className="transmission-type">
                <img src="/transmission-icon.png" alt="transmission-icon" />
                <p>{car.transmission_type}</p>
              </div>
            </div>
            <div className="price-info">
              <p>${car.price}</p>
              <a href="#">View Details</a>
            </div>
          </div>
        ))}
      </Carousel>
    </>
  );
}
