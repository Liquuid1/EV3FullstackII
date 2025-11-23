import React, { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import ProductItem from './ProductItem';

const ProductSection = ({ admin }) => {
  const { productos, fetchProductos, agregarProducto, eliminarProducto, modificarProducto } = admin;
  const [accion, setAccion] = useState('listar');

  useEffect(() => {
    if (accion === 'listar') fetchProductos();
  }, [accion, fetchProductos]);

  return (
    <section className="admin-section">
      <h3>Productos</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button className={`admin-btn-main${accion === 'agregar' ? ' active' : ''}`} onClick={() => setAccion('agregar')}>Agregar</button>
        <button className={`admin-btn-main${accion === 'listar' ? ' active' : ''}`} onClick={() => setAccion('listar')}>Listar</button>
      </div>

      {accion === 'agregar' && (
        <ProductForm onSubmit={async (payload) => {
          // Si el hijo notifica que ya creó el producto:
          if (payload && payload.action === 'created' && payload.product) {
            // sólo refrescamos la lista y navegamos a listar (evita doble creación)
            await fetchProductos();
            setAccion('listar');
            return;
          }

          // Caso legacy: si el hijo envía directamente el producto creado (con id), refrescar también
          if (payload && (payload.id || payload._id)) {
            await fetchProductos();
            setAccion('listar');
            return;
          }

          // Fallback: si el hijo no creó el producto y manda datos para crear, usamos agregarProducto
          const ok = await agregarProducto(payload);
          if (ok) setAccion('listar');
        }} />
      )}

      {accion === 'listar' && (
        <ul className="admin-list">
          {productos.map(p => (
            <ProductItem key={p.id} product={p} onDelete={() => eliminarProducto(p.id)} onSave={(datos) => modificarProducto(p.id, datos)} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductSection;