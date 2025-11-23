import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ProductPreview.css';


export const ProductPreview = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  // start index of the visible window (we show 3 items at a time)
  const [start, setStart] = useState(0);
  const containerRef = useRef(null);
  const pointerData = useRef({ active:false, startX:0, lastX:0 });
  // Por defecto mostrar 4 items en escritorio (ajustable según ancho)
  const [layout, setLayout] = useState({ itemWidth: 240, gap: 20, containerWidth: 900, visibleCount: 4 });
  
  useEffect(() => {
    // Try using cached preview to avoid refetching on every visit
    const cached = sessionStorage.getItem('productPreview');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // if cache has fewer than 6 items, expand by duplicating so desktop shows enough
          let preview = parsed.slice();
          if (preview.length < 6) {
            const base = preview.slice();
            let i = 0;
            while (preview.length < 6 && base.length > 0) {
              const item = base[i % base.length];
              const copy = { ...item, id: `${item.id}-dup-cache-${i}` };
              preview.push(copy);
              i += 1;
            }
          }
          // set cache-derived preview immediately but DO NOT return: always fetch fresh data
          setProductList(preview);
          setLoading(false);
          console.debug('[ProductPreview] loaded from cache (temp), items=', preview.length);
          // continue to fetch fresh preview to ensure we get up-to-date items (and 6 items)
        }
      } catch (e) { /* fallthrough to fetch */ }
    }
    fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/product')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // seleccionar hasta 6 productos aleatorios (estáticos) para permitir desplazamiento en escritorio
          const shuffled = data.slice().sort(() => 0.5 - Math.random());
          let preview = shuffled.slice(0, Math.min(6, shuffled.length));
          // si la API devolvió menos de 6, duplicar elementos (rotándolos) hasta tener 6
          if (preview.length > 0 && preview.length < 6) {
            const base = preview.slice();
            let i = 0;
            while (preview.length < 6) {
              const item = base[i % base.length];
              // crear una copia ligera con id modificado para key único
              const copy = { ...item, id: `${item.id}-dup-${i}` };
              preview.push(copy);
              i += 1;
            }
          }
          setProductList(preview);
          try { sessionStorage.setItem('productPreview', JSON.stringify(preview)); } catch(e){}
          console.debug('[ProductPreview] fetched preview items=', preview.length);
        } else {
          console.error('La respuesta de productos no es un array:', data);
          setProductList([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setProductList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Measure container and compute item width for showing 3 items
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerWidth = Math.floor(container.getBoundingClientRect().width);
      const gap = 20;
      // determine visibleCount from window width (ensures mobile displays 1)
  const vw = window.innerWidth || containerWidth;
  // Ajuste de visibilidad: mostrar 4 items en pantallas grandes, 3 en pantallas anchas,
  // 2 en tablets y 1 en móviles pequeños.
  const visibleCount = vw >= 1100 ? 4 : (vw >= 900 ? 3 : (vw >= 600 ? 2 : 1));
      const itemWidth = Math.floor((containerWidth - Math.max(0, (visibleCount - 1) * gap)) / visibleCount);
      setLayout({ itemWidth, gap, containerWidth, visibleCount });
      setStart((s) => Math.min(s, Math.max(0, (productList.length || 0) - visibleCount)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [productList, loading]);

  // reset start index when the preview items change
  useEffect(() => setStart(0), [productList]);

  // add swipe support on mobile (when visibleCount === 1)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onPointerDown = (e) => {
      pointerData.current.active = true;
      pointerData.current.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      pointerData.current.lastX = pointerData.current.startX;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
      if (!pointerData.current.active) return;
      pointerData.current.lastX = e.clientX || (e.touches && e.touches[0].clientX) || pointerData.current.lastX;
    };
    const onPointerUp = (e) => {
      if (!pointerData.current.active) return;
      pointerData.current.active = false;
      const dx = (pointerData.current.lastX || 0) - (pointerData.current.startX || 0);
      const threshold = 40; // px to consider swipe
      if (dx < -threshold) {
        // swipe left -> next
        setStart((s) => Math.min((productList.length || 0) - layout.visibleCount, s + 1));
      } else if (dx > threshold) {
        // swipe right -> prev
        setStart((s) => Math.max(0, s - 1));
      }
      try { el.releasePointerCapture && el.releasePointerCapture(e.pointerId); } catch(e) {}
    };

    // Touch fallback handlers for environments without PointerEvents
    const onTouchStart = (ev) => {
      pointerData.current.active = true;
      const t = ev.touches && ev.touches[0];
      pointerData.current.startX = (t && t.clientX) || 0;
      pointerData.current.lastX = pointerData.current.startX;
    };
    const onTouchMove = (ev) => {
      if (!pointerData.current.active) return;
      const t = ev.touches && ev.touches[0];
      if (t) pointerData.current.lastX = t.clientX;
    };
    const onTouchEnd = () => {
      if (!pointerData.current.active) return;
      pointerData.current.active = false;
      const dx = (pointerData.current.lastX || 0) - (pointerData.current.startX || 0);
      const threshold = 40;
      if (dx < -threshold) setStart((s) => Math.min((productList.length || 0) - layout.visibleCount, s + 1));
      else if (dx > threshold) setStart((s) => Math.max(0, s - 1));
    };

    // only enable when single visible item (mobile)
    if (layout.visibleCount === 1) {
      // Pointer events (preferred)
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
      el.addEventListener('pointercancel', onPointerUp);

      // Touch fallback
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: true });
      el.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      try {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);

        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
      } catch (e) {}
    };
  }, [layout.visibleCount, productList]);

  return (
    <section className="product-preview-section">
      <h2 className="product-title">Lo más 🔥 del momento</h2>
      <div className="product-grid">
        {(() => {
          const maxStart = Math.max(0, (productList.length || 0) - layout.visibleCount);
          const step = 1; // advance by 1 (as requested)
          return (
            <div>
              <div className="carousel-controls top">
                <button
                  className="carousel-btn prev"
                  onClick={() => {
                    console.debug('[ProductPreview] prev click ->', start);
                    setStart((s) => Math.max(0, s - step));
                  }}
                  aria-label="Anterior"
                  disabled={start <= 0}
                >
                  ‹
                </button>
                <button
                  className="carousel-btn next"
                  onClick={() => {
                    console.debug('[ProductPreview] next click ->', start);
                    setStart((s) => Math.min(maxStart, s + step));
                  }}
                  aria-label="Siguiente"
                  disabled={start >= maxStart}
                >
                  ›
                </button>
              </div>
              {/* controles anteriores/siguientes arriba (se mantienen) */}
            </div>
          );
        })()}
        <div className="carousel-wrap" ref={containerRef}>
          {loading ? (
            // placeholders
            <div className="carousel-track">
              {[1,2,3].map((i) => (
                <div key={i} className="product-card placeholder" style={{ width: layout.itemWidth }}>
                  <div className="product-image-wrapper" style={{background:'#f0f0f0',height:140}} />
                  <h3 className="product-name">Cargando...</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="carousel-track" style={{ transform: `translateX(-${start * (layout.itemWidth + layout.gap)}px)` }}>
              {productList.map((product, idx) => (
                <div key={product.id} className="product-card" style={{ width: layout.itemWidth }}>
                  <div className="product-image-wrapper">
                    <img loading="lazy" src={(product.image && product.image.url) ? product.image.url : '/placeholder.png'} alt={product.title || 'producto'} className="product-image" />
                  </div>
                  <h3 className="product-name">{product.title}</h3>
                  <p className="product-price">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(Number(product.base_price || 0))}
                  </p>
                </div>
              ))}
            </div>
          )}
        
          {/* -------------------------------------------------------------- */}
          {/* BLOQUE: indicadores (4 círculos) movidos debajo de product-card */}
          {/* Se colocan aquí dentro de .product-grid para quedar justo debajo del carrusel */}
          {/* indicadores movidos: ahora este bloque será renderizado fuera de .product-grid */}

        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* BLOQUE: indicadores (4 círculos) como elemento separado del product-grid */}
      {(() => {
        const total = Math.max(1, (productList.length || 0) - layout.visibleCount + 1);
        if (!productList.length || total <= 1) return null;
        return (
          <div className="carousel-indicators" role="tablist" aria-label="Paginación de productos">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                className={`indicator ${start === i ? 'active' : ''}`}
                onClick={() => setStart(i)}
                aria-current={start === i}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        );
      })()}

      {/* BLOQUE: botones (uno oscuro tipo hero, y otro claro tipo product-preview) */}
      <div className="product-buttons">
        {/* Botón oscuro: tono inspirado en HeroSection */}
        <Link to="/products">
          <button className="product-button dark">Ver todos los productos</button>
        </Link>

        {/* Botón claro: tono acorde a la sección de preview (secundario) */}
        <Link to="/products">
          <button className="product-button light">Explorar destacados</button>
        </Link>
      </div>
      {/* -------------------------------------------------------------- */}
    </section>
  );
}
