import React from 'react';
import './BlogCard.css';

export const BlogCard = ({ entrada }) => {
  const { title, description, slug, created_at } = entrada;

  // created_at puede venir en segundos; ajustar según tu API
  const fecha = created_at ? new Date(created_at * 1000).toLocaleDateString('es-CL') : '';

  return (
    <article className="blog-card">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{description}</p>
        <p className="card-text mt-auto">
          <small className="text-muted">Publicado el {fecha}</small>
        </p>
        <a href={`/blog/${slug}`} className="btn btn-sm mt-3 read-btn">
          Leer más
        </a>
      </div>
    </article>
  );
};
