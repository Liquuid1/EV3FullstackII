import React, { useState } from 'react';

const NON_ADMIN_ROLES = [
  // Roles permitidos desde la UI. Los roles con privilegios de administrador
  // (p.ej. 'admin', 'superadmin') no deben poder asignarse aquí.
  'user'
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ nombre: '', correo: '', rol: NON_ADMIN_ROLES[0] });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.nombre || String(form.nombre).trim().length < 2) err.nombre = 'Nombre mínimo 2 caracteres';
    if (!form.correo || !emailRe.test(String(form.correo))) err.correo = 'Correo inválido';
    if (!NON_ADMIN_ROLES.includes(form.rol)) err.rol = 'No puedes asignar roles de administrador desde aquí';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const ok = await onSubmit({
        nombre: String(form.nombre).trim(),
        correo: String(form.correo).trim(),
        rol: String(form.rol)
      });
      if (ok) {
        setForm({ nombre: '', correo: '', rol: NON_ADMIN_ROLES[0] });
        setErrors({});
        alert('Usuario agregado correctamente');
      } else {
        alert('No se pudo agregar el usuario. Revisa la consola para más detalles.');
      }
    } catch (err) {
      console.error('UserForm handleSubmit error', err);
      alert('Error al guardar el usuario');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-form" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
      <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
      {errors.nombre && <small style={{ color: 'crimson' }}>{errors.nombre}</small>}

      <input placeholder="Correo" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
      {errors.correo && <small style={{ color: 'crimson' }}>{errors.correo}</small>}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        Rol (solo roles permitidos desde la UI)
        <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
          {NON_ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      {errors.rol && <small style={{ color: 'crimson' }}>{errors.rol}</small>}

      <button onClick={handleSubmit} disabled={busy}>{busy ? 'Guardando...' : 'Agregar Usuario'}</button>
    </div>
  );
};

export default UserForm;