import React, { useEffect, useState } from 'react';
import UserForm from './UserForm';
import UserItem from './UserItem';

const UserSection = ({ admin }) => {
  const { usuarios, fetchUsuarios, agregarUsuario, eliminarUsuario, modificarUsuario } = admin;
  const [accion, setAccion] = useState('listar');

  useEffect(() => {
    if (accion === 'listar') fetchUsuarios();
  }, [accion, fetchUsuarios]);

  return (
    <section className="admin-section">
      <h3>Usuarios</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button className={`admin-btn-main${accion === 'agregar' ? ' active' : ''}`} onClick={() => setAccion('agregar')}>Agregar</button>
        <button className={`admin-btn-main${accion === 'listar' ? ' active' : ''}`} onClick={() => setAccion('listar')}>Listar</button>
      </div>

      {accion === 'agregar' && (
        <UserForm onSubmit={async (payload) => {
          const ok = await agregarUsuario(payload);
          if (ok) setAccion('listar');
          return ok; // devolver resultado para que el form pueda reaccionar correctamente
        }} />
      )}

      {accion === 'listar' && (
        <>
          {/* Encabezado de columnas: Usuario --- Correo --- Rol */}
          <div className="admin-list-header" style={{marginBottom:8}}>
            <div className="user-col user-name">Usuario</div>
            <div className="user-col user-email">Correo</div>
            <div className="user-col user-role">Rol</div>
            <div className="user-col user-actions">Acciones</div>
          </div>
          <ul className="admin-list">
          {usuarios.map(u => (
            <UserItem key={u.id} user={u} onDelete={() => eliminarUsuario(u.id)} onSave={(datos) => modificarUsuario(u.id, datos)} />
          ))}
        </ul>
        </>
      )}
    </section>
  );
};

export default UserSection;