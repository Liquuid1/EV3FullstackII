import React, { useState } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/context.jsx';
import { useAdminData } from '../../hooks/useAdminData';
import ProductSection from './ProductSection';
import UserSection from './UserSection';
import OrdersSection from './OrdersSection'; // agregado

export const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const admin = useAdminData();

  const [seccion, setSeccion] = useState('');

  return (
    <div className="admin-panel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Panel de Administracion</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: 32 }}>
        <button className={`admin-btn-main${seccion === 'productos' ? ' active' : ''}`} onClick={() => setSeccion('productos')}>Productos</button>
        <button className={`admin-btn-main${seccion === 'usuarios' ? ' active' : ''}`} onClick={() => setSeccion('usuarios')}>Usuarios</button>
        <button className={`admin-btn-main${seccion === 'pedidos' ? ' active' : ''}`} onClick={() => setSeccion('pedidos')}>Pedidos</button> {/* agregado */}
      </div>

      {seccion === '' && (
        <div className="admin-welcome">
          <h3>Bienvenido/a al Panel de Administración</h3>
          <p>Selecciona una sección para gestionar productos o usuarios.</p>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Admin" style={{width: '120px', margin: '24px auto', display: 'block', opacity: 0.7}} />
        </div>
      )}

      {seccion === 'productos' && <ProductSection admin={admin} />}

      {seccion === 'usuarios' && <UserSection admin={admin} />}

      {seccion === 'pedidos' && <OrdersSection admin={admin} />} {/* agregado */}
    </div>
  );
};