import React from 'react';
import { BlogCard } from './BlogCard';
import './BlogList.css';

export const BlogList = ({ entradas }) => {
  if (entradas.length === 0) {
    return <p className="text-center text-muted">No hay entradas disponibles 😕</p>;
  }

  return (
    <div className="blog-list">
      {entradas.map((entrada) => (
        <BlogCard key={entrada.id} entrada={entrada} />
      ))}
    </div>
  );
};
