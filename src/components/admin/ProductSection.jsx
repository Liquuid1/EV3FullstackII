import React, { useState, useEffect } from 'react';
import ProductItem from './ProductItem';
import "./ProductSection.css";

export default function ProductSection(props) {
    const { admin } = props;
    const { fetchProductos, agregarProducto, eliminarProducto, modificarProducto } = admin;

    // estados para productos y búsqueda local
    const [products, setProducts] = useState([]);       // lista mostrada (filtrada)
    const [allProducts, setAllProducts] = useState([]); // copia completa para filtrado local
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const baseUrl = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/product';

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(baseUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAllProducts(data || []);
            setProducts(data || []);
        } catch (err) {
            console.error('No se pudo cargar la lista de productos:', err);
            setAllProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado local por nombre de producto (sin llamadas al servidor)
    const searchByName = (name) => {
        const q = (name || '').trim().toLowerCase();
        if (!q) {
            setProducts(allProducts);
            return;
        }
        const filtered = allProducts.filter(p => {
            const n = ((p.name || p.title || p.product_name) + '').toLowerCase();
            return n.includes(q);
        });
        setProducts(filtered);
    };

    const handleSearchSubmit = (e) => {
        e && e.preventDefault();
        searchByName(query);
    };

    const handleClear = () => {
        setQuery('');
        setProducts(allProducts);
    };

    // handlers para mantener sincronía cuando ProductItem hace onDelete/onUpdate
    const handleDelete = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setAllProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleUpdate = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    return (
        <div className="product-section">
            <form onSubmit={handleSearchSubmit} className="product-search-form" style={{ marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre de producto..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ padding: 8, width: 320 }}
                />
                <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
                    {loading ? 'Cargando...' : 'Buscar'}
                </button>
                <button type="button" onClick={handleClear} style={{ marginLeft: 8 }}>
                    Limpiar
                </button>
            </form>

            <div className="products-list">
                {products.map(product => (
                    <ProductItem
                        key={product.id}
                        product={product}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                ))}
                {products.length === 0 && !loading && <div className="empty">No hay productos para mostrar.</div>}
            </div>
        </div>
    );
}