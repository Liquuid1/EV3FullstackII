import React, { useState, useEffect } from 'react';
import { FiltroBar } from '../components/products/FiltroBar';
import { Search } from '../components/products/Search';
import { ProductGrid } from '../components/products/ProductGrid';
import './Products.css';

export const Products = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Consumir el endpoint al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/product');
        const data = await response.json();

        // Normalizar la respuesta a un array para evitar errores si el backend devuelve un objeto
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data?.data)) {
          items = data.data;
        } else if (Array.isArray(data?.products)) {
          items = data.products;
        } else {
          // Si no es array, intentar convertir objetos con un solo registro a array
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            items = [data];
          } else {
            items = [];
          }
        }

        if (items.length === 0) throw new Error('No se encontraron productos');
        setProductos(items);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('No se pudieron cargar los productos');
        setProductos([
          { id: 1, title: 'Producto de ejemplo 1', image: '../assets/placeholder.jpg', base_price: 1000, category_id: 'sneakers' },
          { id: 2, title: 'Producto de ejemplo 2', image: '../assets/placeholder.jpg', base_price: 1500, category_id: 'boots' },
          { id: 3, title: 'Producto de ejemplo 3', image: '../assets/placeholder.jpg', base_price: 2000, category_id: 'sandals' },
          { id: 4, title: 'Producto de ejemplo 4', image: '../assets/placeholder.jpg', base_price: 2500, category_id: 'formal' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Escuchar eventos globales de productos creados en el admin
  useEffect(() => {
    const handler = (e) => {
      try {
        const p = e?.detail;
        if (!p) return;
        setProductos(prev => {
          if (!Array.isArray(prev)) return [p];
          // evitar duplicados si ya está
          if (prev.some(x => x.id === p.id || x._id === p._id)) return prev;
          return [p, ...prev];
        });
      } catch (err) {
        // noop
      }
    };
    window.addEventListener('productosUpdated', handler);
    return () => window.removeEventListener('productosUpdated', handler);
  }, []);

  // Derivar categorías a partir de los productos para asegurar consistencia
  const categoriasDerivadas = React.useMemo(() => {
    try {
      const arr = Array.isArray(productos) ? productos : [];
      const map = new Map();
      arr.forEach(p => {
        const id = p.category_id ?? p.category ?? p.categoria ?? 'sin-categoria';
        const name = p.category_name ?? p.category_label ?? p.name ?? id;
        if (!map.has(id)) map.set(id, { id, name });
      });
      return Array.from(map.values());
    } catch (e) {
      return [];
    }
  }, [productos]);

  const agregarAlCarrito = (producto, talla) => {
    if (!talla) return alert('Selecciona una talla');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Crear item estándar
    const item = {
      id: producto.id,
      title: producto.title || producto.nombre || '',
      image: producto.image || producto.imagen || null,
      base_price: Number(producto.base_price || producto.precio || 0),
      talla: talla,
      cantidad: 1
    };

    // Si ya existe el mismo producto con misma talla, incrementar cantidad
    const existenteIndex = carrito.findIndex(it => it.id === item.id && String(it.talla) === String(item.talla));
    if (existenteIndex >= 0) {
      carrito[existenteIndex].cantidad = (carrito[existenteIndex].cantidad || 1) + 1;
    } else {
      carrito.push(item);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito');
  };
  
  // 🔍 Filtrar productos según búsqueda y categoría
  const productosArray = Array.isArray(productos) ? productos : [];
  const productosFiltrados = productosArray.filter((p) => {
    try {
      const titulo = (p.title || p.nombre || '').toString().toLowerCase();
      const coincideBusqueda = titulo.includes(busqueda.toLowerCase());
      const coincideFiltro =
        filtro === 'todos' || p.category_id === filtro || p.category_id === parseInt(filtro);
      return coincideBusqueda && coincideFiltro;
    } catch (err) {
      console.error('Error al filtrar productos:', err);
      return false; // no incluir en filtrado en caso de error
    }
  });

  return (
    <div className="container-fluid mt-5 productos-page">
      <h1 className="text-center mb-4">Productos 🔥</h1>
      <p className="text-center mb-5">Encuentra tu estilo, camina con actitud.</p>

      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <Search setBusqueda={setBusqueda} />
        </div>
      </div>
      <FiltroBar setFiltro={setFiltro} filtroActivo={filtro} categorias={categoriasDerivadas} />

      {loading ? (
        <p className="text-center">Cargando productos...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <ProductGrid productos={productosFiltrados} agregarAlCarrito={agregarAlCarrito} />
      )}
    </div>
  );
};
