import React, { useState } from 'react';
import './ContactForm.css';
export const ContactForm = () => {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes integrar con tu backend o servicio de correo
    // Mostrar mensaje de éxito y limpiar formulario
    setSuccess('Usuario registrado exitosamente');
    setForm({ nombre: '', email: '', mensaje: '' });
    // Quitar el mensaje después de 3 segundos
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre</label>
        <input value={form.nombre} type="text" name="nombre" className="form-control" onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Correo electrónico</label>
        <input value={form.email} type="email" name="email" className="form-control" onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Mensaje</label>
        <textarea value={form.mensaje} name="mensaje" className="form-control" rows="4" onChange={handleChange} required></textarea>
      </div>
      {success && <div className="alert alert-success text-center">{success}</div>}
      <button type="submit" className="btn btn-dark w-100">Enviar</button>
    </form>
  );
};

