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
      <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
        {/* Columna izquierda: información persistente (no se borra al editar) */}
        <div style={{minWidth:220, maxWidth:320, padding:10, background:'#f8f9fa', borderRadius:6, fontSize:13}}>
          <div style={{marginBottom:8}}><strong>SKU:</strong> {original.sku_base}</div>
          <div style={{marginBottom:8}}><strong>Título:</strong> {original.title}</div>
          <div style={{marginBottom:8}}><strong>Slug:</strong> {original.slug}</div>
          <div style={{marginBottom:8}}><strong>Descripción:</strong> <div style={{color:'#444'}}>{original.description}</div></div>
          <div style={{marginBottom:8}}><strong>Marca:</strong> {original.brand}</div>
          <div style={{marginBottom:8}}><strong>Base:</strong> {Number(original.base_price) ? `$${original.base_price}` : 'info adicional'}</div>
        </div>

        {/* Columna derecha: edición o vista compacta */}
        <div style={{flex:1}}>
          {editing ? (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <label>SKU</label>
              <input value={p.sku_base} onChange={e => setP({ ...p, sku_base: e.target.value })} />
              <label>Título</label>
              <input value={p.title} onChange={e => setP({ ...p, title: e.target.value })} />
              <label>Slug</label>
              <input value={p.slug} onChange={e => setP({ ...p, slug: e.target.value })} />
              <label>Descripción</label>
              <textarea value={p.description} onChange={e => setP({ ...p, description: e.target.value })} rows={4} />
              <label>Marca</label>
              <input value={p.brand} onChange={e => setP({ ...p, brand: e.target.value })} />
              <label>Base (precio)</label>
              <input type="number" value={p.base_price} onChange={e => setP({ ...p, base_price: Number(e.target.value) })} />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="save-btn" disabled={isProcessing} onClick={handleSave}>
                  {isProcessing ? 'Guardando...' : 'Guardar'}
                </button>
                <button className="cancel-btn" disabled={isProcessing} onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:16, fontWeight:700}}>{product.title}</div>
                <div style={{color:'#666', marginTop:6}}>{product.description}</div>
                <div style={{marginTop:8}}><strong>Marca:</strong> {product.brand}</div>
                <div style={{marginTop:4}}><strong>Precio:</strong> {Number(product.base_price) ? `$${product.base_price}` : 'info adicional'}</div>
              </div>

              <div style={{display:'flex', gap:8}}>
                <button onClick={handleDelete} disabled={isProcessing}>Eliminar</button>
                <button className="edit-btn" onClick={() => setEditing(true)} disabled={isProcessing}>Editar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ProductItem;