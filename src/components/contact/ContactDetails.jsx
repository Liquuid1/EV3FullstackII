import React from 'react';
import './ContactDetails.css';
export const ContactDetails = () => {
  return (
    <div className="contact-details">
      <h4>Información de contacto</h4>
      <p><strong>Email:</strong> contacto@snkrhood.cl</p>
      <p><strong>Teléfono:</strong> +56 9 1246 7892</p>
      <p><strong>Horario:</strong> Lunes a Viernes de 10:00 a 18:00</p>

      <h5 className="mt-4">Redes sociales</h5>
      <ul className="list-unstyled">
        <li><a href="https://instagram.com/snkrhood" target="_blank">Instagram</a></li>
        <li><a href="https://tiktok.com/@snkrhood" target="_blank">TikTok</a></li>
        <li><a href="https://facebook.com/snkrhood" target="_blank">Facebook</a></li>
      </ul>

      <h5 className="mt-4">Ubicación</h5>
      <p>📍 Av. Pajaritos 1234, Maipú, Santiago, Chile</p>
    </div>
  );
};
