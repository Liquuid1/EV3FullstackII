import React from 'react'
import { Link } from 'react-router-dom';
import './HeroSection.css';

export const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Bienvenido a SNKR HOOD</h1>
        <p className="hero-subtitle">
          La tienda urbana de zapatillas más 🔥 de Chile. Encuentra tu estilo, camina con actitud.
        </p>
        <Link to="/products">
          <button className="hero-button">Explorar productos</button>
        </Link>
      </div>
    </section>
  );
};
