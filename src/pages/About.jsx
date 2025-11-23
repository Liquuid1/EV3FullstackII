import React from 'react';
import { MisionVision } from '../components/about/MisionVision';
import { Historia } from '../components/about/Historia';
import { Equipo } from '../components/about/Equipo';
import './About.css';

export const About = () => {
  return (
    <div className="about-page container-fluid py-5">
      <h1 className="text-center mb-4">NOSOTROS</h1>
      <p className="text-center mb-5">Más que una tienda, somos cultura urbana en movimiento.</p>

      <MisionVision />
      <Historia />
      <Equipo />
    </div>
  );
};

