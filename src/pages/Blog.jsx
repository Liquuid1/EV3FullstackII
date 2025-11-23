import React, { useState, useEffect } from 'react';
import { BlogList } from '../components/blog/BlogList';
import './Blog.css';

export const Blog = () => {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/blog_post');
        const data = await res.json();

        const entradasAdaptadas = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              slug: item.slug,
              created_at: item.created_at,
            }))
          : [];

        setEntradas(entradasAdaptadas);
      } catch (err) {
        console.error('Error al cargar el blog:', err);
        setError('No se pudieron cargar las entradas');
      } finally {
        setLoading(false);
      }
    };

    fetchEntradas();
  }, []);

  return (
    <div className="container-fluid blog-page">
      <h1 className="text-center mb-4">Blog</h1>
      <p className="text-center mb-5">Historias, lanzamientos y cultura sneaker.</p>

      {loading ? (
        <p className="text-center">Cargando entradas...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <BlogList entradas={entradas} />
      )}
    </div>
  );
};

