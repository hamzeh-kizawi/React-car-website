import React from 'react'
import "../css/Brands.css"

const Brands = () => {
  const brands = [
    { name: "BMW", logo: "/Cars-logo/BMW-logo.png" },
    { name: "Honda", logo: "/Cars-logo/Honda-logo.png" },
    { name: "Mercedes", logo: "/Cars-logo/Mercedes-logo.png" },
    { name: "Tesla", logo: "/Cars-logo/Tesla-logo.png" },
    { name: "Toyota", logo: "/Cars-logo/Toyota-logo.png" },
    { name: "Volkswagen", logo: "/Cars-logo/Volkswagen-logo.png" },
  ];
  const brandCard = brands.map((brand, index) => (
    <div key={index} className = "brand-card">
      <img src = {brand.logo} alt= {brand.name} />
    </div>
  ))


  return (
    <section id='brands-section' className='brands-container'>
      <div className='brands-list'>
        {brandCard}
      </div>
    </section>
  )
}

export default Brands