import React, { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import ProductItem from './ProductItem';

const ProductSection = ({ admin }) => {
  const { productos, fetchProductos, agregarProducto, eliminarProducto, modificarProducto } = admin;
  const [accion, setAccion] = useState('listar');
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    if (accion === 'listar') fetchProductos();
  }, [accion, fetchProductos]);

  // helper: normaliza la lista de productos venga como array, { data: [...] } u objeto
  const getListaProductos = () => {
    if (!productos) return [];
    if (Array.isArray(productos)) return productos;
    if (Array.isArray(productos.data)) return productos.data;
    if (typeof productos === 'object') return Object.values(productos);
    return [];
  };

  // Mantener resultados sincronizados con productos cuando cambien
  useEffect(() => {
    setResultados(getListaProductos());
  }, [productos]);

  // Función para buscar productos por nombre (robusta ante diferentes shapes)
  const buscarProductos = (q) => {
    const term = (typeof q === 'string' ? q : query).trim().toLowerCase();
    const lista = getListaProductos();
    if (!term) {
      setResultados(lista);
      return lista;
    }
    const encontrados = lista.filter(p => {
      const nombre = (p.nombre || p.name || p.title || p.titulo || '').toString().toLowerCase();
      return nombre.includes(term);
    });
    setResultados(encontrados);
    return encontrados;
  };

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
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); buscarProductos(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') buscarProductos(e.target.value || query); }}
              style={{ flex: 1, padding: '6px 8px' }}
            />
            <button className="admin-btn-main" onClick={() => buscarProductos(query)}>Buscar</button>
            <button className="admin-btn-secondary" onClick={() => { setQuery(''); buscarProductos(''); }}>Limpiar</button>
          </div>

          <ul className="admin-list">
            {(resultados || []).map(p => (
              <ProductItem
                key={p.id || p._id}
                product={p}
                onDelete={() => eliminarProducto(p.id || p._id)}
                onSave={(datos) => modificarProducto(p.id || p._id, datos)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default ProductSection;