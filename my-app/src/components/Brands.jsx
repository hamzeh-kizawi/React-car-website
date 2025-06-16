import React, { useState, useEffect, useContext } from "react";
import "../css/Brands.css";
import Cars from "./Cars";
import { CarContext } from "../contexts/CarContext";

const Brands = () => {
  const {cars, selectedBrand, setSelectedBrand} = useContext(CarContext)

  const brands = [
    { name: "BMW", logo: "/Cars-logo/BMW-logo.png" },
    { name: "Honda", logo: "/Cars-logo/Honda-logo.png" },
    { name: "Mercedes", logo: "/Cars-logo/Mercedes-logo.png" },
    { name: "Tesla", logo: "/Cars-logo/Tesla-logo.png" },
    { name: "Toyota", logo: "/Cars-logo/Toyota-logo.png" },
    { name: "Volkswagen", logo: "/Cars-logo/Volkswagen-logo.png" },
  ];

  // re-sorts the brands array to show the selected brand first
  const sortedBrands = selectedBrand
    // if a brand is selected, create a new array with the selected brand at the front, followed by the rest
    ? [brands.find((b) => b.name === selectedBrand), ...brands.filter((b) => b.name !== selectedBrand)]
    // if no brand is selected use the original order
    : brands;

  return (
    <section id="brands-section" className="brands-container">
      <div className="brands-list">
        {brands.map((brand, index) => (
          <div key={index} className="brand-card" onClick={() => setSelectedBrand(brand.name)}>
            <img src={brand.logo} alt={brand.name} />
          </div>
        ))}
      </div>

      {/* render cars component for each brand dynamically sorted */}
      {sortedBrands.map((brand) => {
        const filteredCars = cars.filter((car) => car.brand === brand.name);
        return filteredCars.length > 0 ? <Cars key={brand.name} brand={brand.name} cars={filteredCars} /> : null;
      })}
    </section>
  );
};

export default Brands;
