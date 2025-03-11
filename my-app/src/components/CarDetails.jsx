import React, { useEffect } from "react";
import "../css/CarDetails.css";

export const CarDetails = ({ car, onClose }) => {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!car) return null;

  return (
    <div className="cars-details-component">
      <div className="car-details-model">
        <button className="close-btn" onClick={onClose}>✖</button>
        <img className="car-details-image" src={car.image} alt={car.name} />
        <h2>{car.name}</h2>
        <div className="flex-info">
          <div className="left-side">
            <p><strong>Price: </strong>${car.price}</p>
            <p><strong>Type: </strong>{car.type}</p>
            <p><strong>Model Year: </strong>{car.model_year}</p>
            <p><strong>Engine Type: </strong>{car.engine_type}</p>
          </div>
          <div className="right-side">
            <p><strong>Fuel Type: </strong>{car.fuel_type}</p>
            <p><strong>Fuel Efficiency: </strong>{car.fuel_efficiency} MPG</p>
            <p><strong>Horsepower: </strong>{car.horsepower} HP</p>
            <p><strong>Seating Capacity: </strong>{car.seating_capacity}</p>
          </div>
        </div>
        <div className="description">
          <p><strong>Description:</strong> {car.description}</p>
        </div>
      </div>
    </div>
  );
};
