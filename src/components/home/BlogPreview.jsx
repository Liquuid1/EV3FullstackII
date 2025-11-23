import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogPreview.css';



export const BlogPreview = () => {

  const [latestPost, setLatestPost] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('latestBlog');
    if (cached) {
      try { setLatestPost(JSON.parse(cached)); } catch(e){}
      setLoading(false);
      return;
    }

    fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/blog_post/1') // ajusta si tienes filtro de published=true
      .then((res) => res.json())
      .then((data) => {
        setLatestPost(data);
        try { sessionStorage.setItem('latestBlog', JSON.stringify(data)); } catch(e){}
      })
      .catch((err) => console.error('Error al cargar blog:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="blog-preview-section">
      <h2 className="blog-title">{latestPost?.title || (loading ? 'Cargando...' : 'Sin artículos')}</h2>
      <div className="blog-card">
        <div className="blog-content">
          <h3 className="blog-post-title">{latestPost?.excerpt || (loading ? 'Cargando...' : 'No hay contenido')}</h3>
          {latestPost?.id ? <Link to={`/blog/${latestPost.id}`} className="blog-read-more">Leer más →</Link> : null}
        </div>
      </div>
    </section>
  );
}
