import React, { useState } from 'react';
import './ProductCard.css';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../common/ImageWithFallback';
 
export const ProductCard = ({ producto, agregarAlCarrito }) => {
  const [talla, setTalla] = useState('');
  const tallas = producto?.talla && Array.isArray(producto.talla) && producto.talla.length > 0
    ? producto.talla
    : [38,39,40,41,42,43,44,45];

  const imagenSrc = producto?.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes[0]?.url
    : (producto?.image?.url || producto?.imagen || null);

  return (
    <div className="card product-card h-200 shadow-sm">
      <Link to={`/producto/${producto.id}`} className="text-decoration-none text-dark">
        <ImageWithFallback
          src={imagenSrc}
          alt={producto.title}
          className="card-img-top"
        />
        <h5 className="card-title mt-2">{producto.title}</h5>
      </Link>
      <div className="product-price">${Number(producto.base_price || 0).toLocaleString('es-CL')}</div>
      <div className="card-body d-flex flex-column justify-content-between">
        <p className="card-text text-muted">{producto.description}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="product-card-controls">
            {/* price moved above */}
            <select value={talla} onChange={(e) => setTalla(e.target.value)} className="form-select form-select-sm">
              <option value="">Talla</option>
              {tallas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              className="btn btn-success btn-sm"
              onClick={() => agregarAlCarrito(producto, talla)}
              disabled={!talla}
            >
              Agregar 🛒
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
