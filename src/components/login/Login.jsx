import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/context.jsx';
import './Login.css';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setErr] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErr('');
    setLoading(true);
    try {
      await login(form); // <-- enviar el objeto form correcto
      navigate('/');
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Error al iniciar sesión (Axios)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container py-5">
      <h1 className="text-center mb-4">Iniciar sesión</h1>
      <form className="login-form mx-auto" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            id="password"
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="text-danger text-center">{error}</p>}
        <button type="submit" className="btn w-100">Entrar</button>
      </form>
    </div>
  );
};
