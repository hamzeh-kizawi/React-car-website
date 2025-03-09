import React, { useState, useEffect } from "react";
import "../css/Brands.css";
import Cars from "./Cars";

const Brands = () => {
  const [cars, setCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/cars")
      .then((response) => response.json())
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars: ", error));
  }, []);

  const brands = [
    { name: "BMW", logo: "/Cars-logo/BMW-logo.png" },
    { name: "Honda", logo: "/Cars-logo/Honda-logo.png" },
    { name: "Mercedes", logo: "/Cars-logo/Mercedes-logo.png" },
    { name: "Tesla", logo: "/Cars-logo/Tesla-logo.png" },
    { name: "Toyota", logo: "/Cars-logo/Toyota-logo.png" },
    { name: "Volkswagen", logo: "/Cars-logo/Volkswagen-logo.png" },
  ];

  const sortedBrands = selectedBrand
    ? [brands.find((b) => b.name === selectedBrand), ...brands.filter((b) => b.name !== selectedBrand)]
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

      {/* Render Cars component for each brand, dynamically sorted */}
      {sortedBrands.map((brand) => {
        const filteredCars = cars.filter((car) => car.brand === brand.name);
        return filteredCars.length > 0 ? <Cars key={brand.name} brand={brand.name} cars={filteredCars} /> : null;
      })}
    </section>
  );
};

export default Brands;
