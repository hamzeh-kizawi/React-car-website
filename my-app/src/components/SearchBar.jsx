import React, { useState, useContext } from "react";
import "../css/SearchBar.css";
import { CarContext } from "../contexts/CarContext";
import { CarDetails } from "./CarDetails";

const SearchBar = ({ onClose }) => {
  const { cars } = useContext(CarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);


  const filteredCars = cars.filter((car) =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="search-overlay">
      <button className="close-btn" onClick={onClose}>✖</button>
      <h2>Search for products</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Start typing to see products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchQuery && (
        <div className="search-results">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <div key={car.id} className="search-item" onClick={() => setSelectedCar(car)}>
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
      )}

      {selectedCar && <CarDetails car={selectedCar} onClose={() => setSelectedCar(null)} />}
    </div>
  );
};

export default SearchBar;
