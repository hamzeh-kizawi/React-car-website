import React, { createContext, useState, useEffect } from "react";

export const CarContext = createContext();

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/cars")
      .then((response) => response.json())
      .then((data) => setCars(data))
      .catch((error) => console.error("Error fetching cars: ", error));
  }, []);

  return (
    <CarContext.Provider value={{ cars, selectedBrand, setSelectedBrand }}>
      {children}
    </CarContext.Provider>
  );
};
