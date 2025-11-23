import React from 'react';
import '../../components/blog/BlogList';
import './BlogCard.css';

export const BlogCard = ({ entrada }) => {
  const { title, description, slug, created_at } = entrada;

  return (
    <div className="card blog-card h-100 shadow-sm">
      <div className="card-body d-flex flex-column justify-content-between">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{description}</p>
        <p className="card-text">
          <small className="text-muted">
            Publicado el {new Date(created_at * 1000).toLocaleDateString('es-CL')}
          </small>
        </p>
        <a href={`/blog/${slug}`} className="btn btn-outline-dark btn-sm mt-auto">
          Leer más
        </a>
      </div>
    </div>
  );
};
