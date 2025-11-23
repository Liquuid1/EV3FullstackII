import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './checkout.css';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2';

export default function Checkout() {
  const { orderId } = useParams();
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!orderId) {
      setError('No se recibió orderId en la URL.');
      setLoading(false);
      return () => { mounted = false; };
    }

    const fetchOrderItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // obtener items de /order_completa/{order_id}
        const r = await fetch(`${API_BASE}/order_completa?order_id=${orderId}`, { headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(`order_completa fetch failed: ${r.status}`);
        const data = await r.json();

        if (!Array.isArray(data) || data.length === 0) {
          if (mounted) setItems([]);
          return;
        }

        // por cada item, pedir product/{product_id} para obtener nombre e imagen
        const enriched = await Promise.all(data.map(async (it) => {
          const productId = it.product_id ?? it.productId ?? it.product ?? null;
          let title = it.title ?? it.name ?? null;
          let imageUrl = it.imageUrl ?? it.image?.url ?? it.image ?? null;

          if (productId) {
            try {
              const rp = await fetch(`${API_BASE}/product/${productId}`, { headers: { Accept: 'application/json' } });
              if (rp.ok) {
                const prod = await rp.json();
                // nombre
                title = title || prod.name || prod.title || prod.product_name || null;
                // imagen: probar varias propiedades comunes
                let candidate = null;
                if (Array.isArray(prod.images) && prod.images.length) candidate = prod.images[0];
                else if (Array.isArray(prod.files) && prod.files.length) candidate = prod.files[0];
                else if (Array.isArray(prod.media) && prod.media.length) candidate = prod.media[0];
                else if (prod.image) candidate = prod.image;
                else if (prod.main_image) candidate = prod.main_image;
                else if (prod.thumbnail) candidate = prod.thumbnail;

                const url = typeof candidate === 'string'
                  ? candidate
                  : (candidate?.url ?? candidate?.src ?? candidate?.path ?? null);

                imageUrl = imageUrl || url || null;
              }
            } catch (e) {
              // si falla el fetch de producto, seguir con placeholders
            }
          }

          return {
            ...it,
            title: title || `Producto ${productId ?? it.id ?? ''}`,
            imageUrl: imageUrl || '/placeholder.png',
          };
        }));

        if (mounted) {
          setItems(enriched);
          // opcional: si la respuesta trae datos de orden en items[0].order_* podríamos setOrder aquí
          setOrder(null);
        }
      } catch (err) {
        if (mounted) setError('No se pudo cargar los items del pedido.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrderItems();

    return () => { mounted = false; };
  }, [orderId]);

  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const cleaned = String(v).replace(/[^0-9\-,.]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const computedTotal = items.reduce((acc, it) => {
    const unit = toNumber(it.unit_price ?? it.precio_unitario ?? it.base_price ?? 0);
    const qty = toNumber(it.qty ?? it.cantidad ?? 1);
    const line = toNumber(it.line_total ?? (unit * qty));
    return acc + line;
  }, 0);

  // Formateador CLP sin decimales
  const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  return (
    <div className="checkout-page container py-5">
      <h1>Resumen de tu compra</h1>

      {orderId && (
        <p className="muted">Pedido #{orderId}{order?.order_number ? ` — ${order.order_number}` : ''}</p>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {error && <p className="error">{error}</p>}

          {items.length === 0 ? (
            <div className="empty-summary">
              <p>No se encontraron artículos para mostrar.</p>
              <Link to="/">Volver al inicio</Link>
            </div>
          ) : (
            <div className="summary">
              <ul className="summary-list">
                {items.map((item, idx) => {
                  const title = item.title || `Producto ${item.product_id ?? item.id ?? idx + 1}`;
                  const qty = toNumber(item.qty ?? item.cantidad ?? 1);
                  const unit = toNumber(item.unit_price ?? item.precio_unitario ?? item.base_price ?? 0);
                  const line = toNumber(item.line_total ?? (qty * unit));
                  const imageSrc = item.imageUrl || '/placeholder.png';
                  return (
                    <li key={item.id ?? item.product_id ?? idx} className="summary-item">
                      <img src={imageSrc} alt={title} />
                      <div className="summary-item-info">
                        <h4>{title}</h4>
                        <p>Cantidad: {qty}</p>
                        <p>Precio unitario: {CLP.format(unit)}</p>
                        <p>Subtotal: {CLP.format(line)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="summary-total">
                <p>Subtotal: {CLP.format(computedTotal)}</p>
                {order?.shipping_cost != null && <p>Envío: {CLP.format(toNumber(order.shipping_cost))}</p>}
                <h3>Total: {CLP.format(computedTotal)}</h3>
                <div className="actions">
                  <Link to="/" className="btn btn-primary">Seguir comprando</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { Checkout };