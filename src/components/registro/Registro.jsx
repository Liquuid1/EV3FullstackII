import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';

export const Registro = () => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Aseguramos que el rol asignado sea 'cliente' y no se pueda manipular desde frontend
      const payload = { ...form, role: 'cliente' };
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:cRiGHljp/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al registrarse');

      // Guardar token y redirigir
  localStorage.setItem('token', data.token);

      const meRes = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:cRiGHljp/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json',
        },
      });

      const user = await meRes.json();
      localStorage.setItem('user', JSON.stringify(user));

      // Redirigir según rol (debiera ser cliente al registrarse)
      if (user.role === 'administrador' || user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/cliente');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="registro-page container py-5">
      <h1 className="text-center mb-4">Crear cuenta</h1>
      <p className="text-center mb-5">Únete a SNKR HOOD y camina con actitud 🔥</p>

      <form className="registro-form mx-auto" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre completo</label>
          <input type="text" name="nombre" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Correo electrónico</label>
          <input type="email" name="email" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input type="password" name="password" className="form-control" onChange={handleChange} required />
        </div>
        {error && <p className="text-danger text-center">{error}</p>}
        <button type="submit" className="btn w-100">Registrarse</button>
        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
};
