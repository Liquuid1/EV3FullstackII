import React from 'react';
import { BlogCard } from './BlogCard';
import './BlogList.css';

export const BlogList = ({ entradas }) => {
  if (entradas.length === 0) {
    return <p className="text-center text-muted">No hay entradas disponibles 😕</p>;
  }

  return (
    <div className="row">
      {entradas.map((entrada) => (
        <div key={entrada.id} className="col-12 col-md-6 col-lg-4 mb-4">
          <BlogCard entrada={entrada} />
        </div>
      ))}
    </div>
  );
};
