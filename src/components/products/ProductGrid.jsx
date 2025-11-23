import React from 'react';
import { ProductCard } from './ProductCard';
import './ProductGrid.css';

export const ProductGrid = ({ productos, agregarAlCarrito }) => {
  if (productos.length === 0) {
    return <p className="text-center text-muted">No se encontraron productos 😕</p>;
  }

  return (
    <div className="container my-4">
      <div className="row">
          {productos.map((producto) => (
            <div key={producto.id} className="col-8 col-md-6 col-lg-4 mb-4 mx-auto">
              <ProductCard producto={producto} agregarAlCarrito={agregarAlCarrito} />
            </div>
          ))}
      </div>
    </div>
  );
};
