import React, { useState, useEffect } from 'react';
import './OrdersSection.css';
import localOrders from '../../utils/localOrders';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  // detalles por pedido
  const [detailsMap, setDetailsMap] = useState({}); // { orderId: [items] }
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsErrorMap, setDetailsErrorMap] = useState({}); // { orderId: errorMsg }
  const [openDetails, setOpenDetails] = useState({}); // { orderId: true }

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/order`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Error al obtener pedidos: ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error actualizando pedido ${res.status}: ${text}`);
      }
      const updated = await res.json().catch(() => null);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? (updated && typeof updated === 'object' ? { ...o, ...updated } : { ...o, status }) : o))
      );
      // Actualizar copias locales solo si el admin aprobó o rechazó (si no hace nada, queda 'pending')
      if (status === 'aprobado' || status === 'rechazado') {
        try {
          const localList = localOrders.getOrders();
          if (Array.isArray(localList) && localList.length > 0) {
            const localEstado = status === 'aprobado' ? 'finalizado' : 'rechazado';
            const updatedLocal = localList.map(x => (String(x.id) === String(orderId) ? { ...x, estado: localEstado, status: localEstado } : x));
            localOrders.saveOrders(updatedLocal);
          }
        } catch (e) {
          // ignore
        }
        try {
          const legacy = JSON.parse(localStorage.getItem('ordenes') || '[]');
          if (Array.isArray(legacy) && legacy.length > 0) {
            const localEstado = status === 'aprobado' ? 'finalizado' : 'rechazado';
            const updatedLegacy = legacy.map(x => (String(x.id) === String(orderId) ? { ...x, estado: localEstado, status: localEstado } : x));
            localStorage.setItem('ordenes', JSON.stringify(updatedLegacy));
            try { window.dispatchEvent(new CustomEvent('ordenesUpdated')); } catch (e) {}
          }
        } catch (e) {
          // ignore
        }
      }
      // si hay detalles ya cargados, también actualiza su estado localmente
      setDetailsMap(prev => {
        if (!prev[orderId]) return prev;
        return { ...prev };
      });
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchOrderDetails = async orderId => {
    setDetailsLoadingId(orderId);
    setDetailsErrorMap(prev => ({ ...prev, [orderId]: null }));
    try {
      const res = await fetch(`${API_BASE}/order_completa?order_id=${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al obtener detalles ${res.status}: ${text}`);
      }
      const data = await res.json();
      setDetailsMap(prev => ({ ...prev, [orderId]: Array.isArray(data) ? data : [] }));
      setOpenDetails(prev => ({ ...prev, [orderId]: true }));
    } catch (err) {
      console.error(err);
      setDetailsErrorMap(prev => ({ ...prev, [orderId]: 'No se pudieron cargar los detalles.' }));
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const toggleDetails = orderId => {
    // si ya cargados, alterna visibilidad; si no, carga
    if (detailsMap[orderId]) {
      setOpenDetails(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    } else {
      fetchOrderDetails(orderId);
    }
  };

  return (
    <div className="orders-section">
      <h3>Pedidos</h3>

      {loading && <p className="muted">Cargando pedidos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && orders.length === 0 && <p className="muted">No hay pedidos disponibles.</p>}

      {!loading && orders.length > 0 && (
        <ul className="orders-list">
          {orders.map(order => {
            const isDetailsOpen = !!openDetails[order.id];
            const details = detailsMap[order.id] || [];
            const detailsLoading = detailsLoadingId === order.id;
            const detailsError = detailsErrorMap[order.id] ?? null;

            return (
              <li key={order.id} className="order-card">
                <div className="order-details">
                  <div className="order-row">
                    <strong className="order-title">Pedido #{order.id}</strong>
                    <span className="order-number">{order.order_number ? `#${order.order_number}` : ''}</span>
                  </div>
                  <div className="order-meta">
                    <span>Creado: <time>{order.created_at ?? '—'}</time></span>
                    <span>Total: <strong>${order.total_amount ?? order.subtotal ?? 0}</strong></span>
                    <span>Envío: ${order.shipping_cost ?? 0}</span>
                    <span>Método: {order.payment_method ?? '—'}</span>
                  </div>
                  <div className="order-row">
                    <div className="order-status">Estado: <em className={`status ${String(order.status ?? 'pendiente').toLowerCase()}`}>{order.status ?? 'pendiente'}</em></div>
                    <div className="order-user">Usuario ID: {order.user_id ?? '—'}</div>
                  </div>

                  {isDetailsOpen && (
                    <div className="details-panel">
                      {detailsLoading && <p className="muted">Cargando detalles...</p>}
                      {detailsError && <p className="error">{detailsError}</p>}
                      {!detailsLoading && !detailsError && details.length === 0 && <p className="muted">No hay productos asociados a este pedido.</p>}
                      {!detailsLoading && details.length > 0 && (
                        <ul className="details-list">
                          {details.map(item => (
                            <li key={item.id} className="detail-item">
                              <div className="detail-left">
                                <div className="detail-line"><strong>Producto ID:</strong> {item.product_id}</div>
                                <div className="detail-line"><strong>Talla:</strong> {String(item.talla ?? '—')}</div>
                              </div>
                              <div className="detail-right">
                                <div className="detail-line"><strong>Cantidad:</strong> {item.qty}</div>
                                <div className="detail-line"><strong>Precio unitario:</strong> ${item.unit_price}</div>
                                <div className="detail-line"><strong>Total línea:</strong> ${item.line_total}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <button
                    className="btn approve"
                    onClick={() => updateStatus(order.id, 'aprobado')}
                    disabled={updatingId === order.id || order.status === 'aprobado'}
                  >
                    {updatingId === order.id ? 'Procesando...' : 'Aprobar'}
                  </button>
                  <button
                    className="btn reject"
                    onClick={() => updateStatus(order.id, 'rechazado')}
                    disabled={updatingId === order.id || order.status === 'rechazado'}
                  >
                    {updatingId === order.id ? 'Procesando...' : 'Rechazar'}
                  </button>
                  <button
                    className="btn details"
                    onClick={() => toggleDetails(order.id)}
                    disabled={detailsLoadingId === order.id}
                  >
                    {openDetails[order.id] ? 'Ocultar detalles' : (detailsLoadingId === order.id ? 'Cargando...' : 'Ver detalles')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OrdersSection;