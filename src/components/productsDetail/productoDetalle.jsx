import React, { useState, useEffect } from 'react';
import './productoDetalle.css';
import { useParams } from 'react-router-dom';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState();
  const [talla, setTalla] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState('/img/default.jpg');
  const tallasDisponibles = [38, 39, 40, 41, 42, 43, 44, 45];

  useEffect(() => {
    fetch(`https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/product/${id}`)
      .then(res => res.json())
      .then(data => {
        setProducto(data);
        const firstImg = (data?.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0 && data.imagenes[0]?.url)
          ? data.imagenes[0].url
          : (data?.image?.url || data?.imagen || '/img/default.jpg');
        setSelectedImage(firstImg);
      })
      .catch(err => console.error(err));
  }, [id]);

  const agregarAlCarrito = () => {
    if (!talla) return alert('Selecciona una talla');

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const nuevoItem = {
      id: producto.id,
      title: producto.title || producto.nombre || '',
      image: (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0)
        ? producto.imagenes[0].url
        : (producto.image || producto.imagen || null),
      base_price: Number(producto.base_price || producto.precio || 0),
      talla: talla,
      cantidad: cantidad || 1,
    };

    const existenteIndex = carrito.findIndex(it => it.id === nuevoItem.id && String(it.talla) === String(nuevoItem.talla));
    if (existenteIndex >= 0) {
      carrito[existenteIndex].cantidad = (carrito[existenteIndex].cantidad || 1) + nuevoItem.cantidad;
    } else {
      carrito.push(nuevoItem);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
  };

  if (!producto) return <p className="text-center">Cargando producto...</p>;

  return (
    <div className="producto-detalle container py-5">
      <div className="detalle-card">
        <div className="imagen-principal">
          <ImageWithFallback src={selectedImage} alt={producto.nombre || producto.title} />
        </div>

        {/* Thumbnails: mostrar todas las imágenes del producto */}
        <div className="thumbnails d-flex gap-2 my-2">
          {(producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) ? (
            producto.imagenes.map((img, idx) => {
              const url = img?.url || img;
              return (
                <ImageWithFallback
                  key={idx}
                  src={url}
                  alt={`${producto.nombre || producto.title} ${idx + 1}`}
                  className={`thumb ${selectedImage === url ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(url)}
                  style={{ cursor: 'pointer', width: 64, height: 64, objectFit: 'cover' }}
                />
              );
            })
          ) : (
            <ImageWithFallback src={producto.image?.url || producto.imagen || '/img/default.jpg'} alt="default" style={{ width: 64, height: 64, objectFit: 'cover' }} />
          )}
        </div>

        <div className="detalle-info">
          <h2>{producto.nombre || producto.title}</h2>
          <p className="precio">${Number(producto.base_price || producto.precio || 0).toLocaleString('es-CL') || "-"}</p>
          <p className="descripcion">{producto.descripcion || producto.description}</p>

          <label>Talla:</label>
            <select value={talla} onChange={(e) => setTalla(e.target.value)}>
              <option value="">Selecciona</option>
              {tallasDisponibles.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          <label>Cantidad:</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          />

          <button className="btn-agregar" onClick={agregarAlCarrito}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};
