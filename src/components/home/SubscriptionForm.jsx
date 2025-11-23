import React, { useState } from 'react'
import './SubscriptionForm.css';

export const SubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [subscriberCount] = useState(1287); // Simulado, puedes conectar a backend luego
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Correo suscrito:', email);
    setSuccess('El correo fue registrado exitosamente');
    setEmail('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <section className="subscription-section">
      <div className="subscription-wrapper">
        <div className="subscription-stats">
          <h3 className="stats-title">👟 Únete a la comunidad</h3>
          <p className="stats-count">+{subscriberCount} sneakerheads ya están dentro</p>
          <p className="stats-text">Recibe lanzamientos exclusivos, descuentos y contenido urbano directo a tu inbox.</p>
        </div>

        <div className="subscription-card">
          <h3 className="subscription-heading">No te pierdas los drops 🔥</h3>
          <form onSubmit={handleSubmit} className="subscription-form">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="subscription-input"
            />
            <button type="submit" className="subscription-button">
              Suscribirme
            </button>
          </form>
          {success && <div className="mt-2 text-success">{success}</div>}
        </div>
      </div>
    </section>
  );
};
