import React, { useState } from 'react';

const ProductItem = ({ product, onDelete, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [p, setP] = useState({
    sku_base: product.sku_base || '',
    title: product.title || '',
    slug: product.slug || '',
    description: product.description || '',
    brand: product.brand || '',
    base_price: product.base_price || 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const original = {
    sku_base: product.sku_base || '',
    title: product.title || '',
    slug: product.slug || '',
    description: product.description || '',
    brand: product.brand || '',
    base_price: product.base_price || 0
  };

  const handleSave = async () => {
    // Si no hay cambios, simplemente cerrar edición
    if (JSON.stringify(p) === JSON.stringify(original)) {
      setEditing(false);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await onSave(p);
      // Si el handler devuelve el producto actualizado, sincronizamos
      if (result && (result.id || result._id || result.sku_base)) {
        setP({
          sku_base: result.sku_base ?? p.sku_base,
          title: result.title ?? p.title,
          slug: result.slug ?? p.slug,
          description: result.description ?? p.description,
          brand: result.brand ?? p.brand,
          base_price: result.base_price ?? p.base_price
        });
      }
      // Si el handler devolvió true/undefined asumimos éxito
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Error al guardar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (isProcessing) return;
    if (!confirm('¿Eliminar este producto?')) return;
    setIsProcessing(true);
    try {
      await onDelete();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Error al eliminar');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <li>
      {editing ? (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <input value={p.sku_base} onChange={e => setP({ ...p, sku_base: e.target.value })} />
          <input value={p.title} onChange={e => setP({ ...p, title: e.target.value })} />
          <input value={p.slug} onChange={e => setP({ ...p, slug: e.target.value })} />
          <input value={p.description} onChange={e => setP({ ...p, description: e.target.value })} />
          <input value={p.brand} onChange={e => setP({ ...p, brand: e.target.value })} />
          <input type="number" value={p.base_price} onChange={e => setP({ ...p, base_price: Number(e.target.value) })} />
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button className="save-btn" disabled={isProcessing} onClick={handleSave}>
              {isProcessing ? 'Guardando...' : 'Guardar'}
            </button>
            <button className="cancel-btn" disabled={isProcessing} onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <b>{product.title}</b> - {product.brand} - ${product.base_price} <br/>
          <span style={{fontSize:'0.95em',color:'#0077b6'}}>{product.description}</span>
          <div style={{display:'flex', gap:8, marginTop:8, marginLeft:'auto'}}>
            <button onClick={handleDelete} disabled={isProcessing}>Eliminar</button>
            <button className="edit-btn" onClick={() => setEditing(true)} disabled={isProcessing}>Editar</button>
          </div>
        </>
      )}
    </li>
  );
};

export default ProductItem;