import React from 'react';
import { ContactForm } from '../components/contact/ContactForm';
import { ContactDetails } from '../components/contact/ContactDetails';
import './Contact.css';

export const Contact = () => {
  return (
    <div className="contact-page container py-5">
      <h1 className="text-center mb-4">Contacto</h1>
      <p className="text-center mb-5">¿Tienes dudas, sugerencias o quieres colaborar? ¡Estamos aquí para ti!</p>

      <div className="row">
        <div className="col-md-6 mb-4">
          <ContactForm />
        </div>
        <div className="col-md-6">
          <ContactDetails />
        </div>
      </div>
    </div>
  );
};

