import React from 'react';
import { Link } from 'react-router-dom';
import './AboutTeaser.css';

export const AboutTeaser = () => {
  return (
    <section className="about-section">
      <div className="about-card">
        <h2 className="about-title">Más que zapatillas, somos cultura urbana</h2>
        <p className="about-text">
          SNKR HOOD nació en las calles de Santiago con una misión clara: redefinir el estilo urbano. Cada par que ofrecemos tiene actitud, historia y propósito. Somos más que una tienda, somos una comunidad.
        </p>
        <Link to="/about">
          <button className="about-button">Conócenos más</button>
        </Link>
      </div>
    </section>
  );
};
