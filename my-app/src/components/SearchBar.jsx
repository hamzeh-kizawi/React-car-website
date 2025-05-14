import React, { useState, useContext, useEffect, useRef } from "react";
import "../css/SearchBar.css";
import { CarContext } from "../contexts/CarContext";
import { CarDetails } from "./CarDetails";

const SearchBar = ({ onClose, filteredCarNames = [] }) => {
  const { cars } = useContext(CarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const inputRef = useRef(null);

  const filteredCars = filteredCarNames.length > 0
    ? cars.filter((car) =>
        filteredCarNames.some(name =>
          car.name.toLowerCase().includes(name.toLowerCase())
        )
      )
    : cars.filter((car) =>
        car.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedCar) {
          setSelectedCar(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedCar]);

  return (
    <div className="search-overlay">
      <button className="close-btn" onClick={onClose}>✖</button>
      <h2>Search for cars</h2>
      <input
        type="text"
        ref={inputRef}
        className="search-input"
        placeholder="Start typing to see products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="search-results">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div
              key={car.id}
              className="search-item"
              onClick={() => setSelectedCar(car)}
            >
              <img src={car.image} alt={car.name} className="car-image" />
              <div className="car-info">
                <h4>{car.name}</h4>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No cars found</p>
        )}
      </div>

      {selectedCar && (
        <CarDetails car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
};

export default SearchBar;
