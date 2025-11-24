import React, { useEffect, useMemo, useState } from 'react'
import './MisOrdenes.css'
import { listOrdersByUser, listOrderItems } from '../api/orders'
import { getCurrentUser } from '../utils/auth'
import localOrders from '../utils/localOrders'

export function MisOrdenes() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    // mover loadOrders fuera para permitir llamadas desde eventos
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        // local fallbacks/snapshots: prefer new `mis_pedidos` storage, fall back to legacy 'ordenes'
        const fallbackStored = localOrders.getOrders().length > 0
          ? localOrders.getOrders()
          : (JSON.parse(localStorage.getItem('ordenes')) || JSON.parse(localStorage.getItem('orders')) || [])
        const carrito = JSON.parse(localStorage.getItem('carrito')) || []
        const envio = JSON.parse(localStorage.getItem('envio')) || null
        const list = Array.isArray(fallbackStored) ? [...fallbackStored] : []
        if (envio && envio.productos && envio.productos.length > 0) {
          const totalEnvio = envio.productos.reduce((acc, it) => acc + (Number(it.base_price || 0) * (it.cantidad || 1)), 0)
          list.unshift({ id: 'envio', fecha: envio.fecha || new Date().toISOString(), productos: envio.productos, estado: envio.estado || 'En envío', total: totalEnvio })
        }

        // try backend
        const current = getCurrentUser()
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || null
        const userId = current && (current.id || current.user_id) ? (current.id ?? current.user_id) : null
        if (userId) {
          const serverOrders = await listOrdersByUser(userId, token)
          const enhanced = await Promise.all((serverOrders || []).map(async (o) => {
            const orderKey = o.id ?? o._id ?? o.orderId
            const items = await listOrderItems(orderKey, token)
            const productos = Array.isArray(items) ? items.map(it => ({
              id: it.product_id || it.productId || it.product || null,
              cantidad: it.qty || it.cantidad || 1,
              talla: it.talla || it.size || null,
              base_price: it.unit_price || it.precio_unitario || it.unit_price || 0,
              title: it.product_title || it.title || it.name || '',
              image: it.image || it.product_image || null,
            })) : []

            return {
              id: orderKey,
              fecha: o.created_at || o.fecha || o.createdAt || new Date().toISOString(),
              productos,
              estado: o.status || o.estado || '—',
              total: o.total_amount ?? o.total ?? o.amount ?? productos.reduce((a, p) => a + (Number(p.base_price || 0) * Number(p.cantidad || 1)), 0),
            }
          }))

          const final = [...list, ...enhanced]
          if (!cancelled) setOrders(final)
        } else {
          if (!cancelled) setOrders(list)
        }
      } catch (err) {
        console.error('Error cargando pedidos:', err)
        if (!cancelled) setError(err?.message || 'Error cargando pedidos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOrders()

    // escuchar cambios en localStorage desde otras pestañas
    const onStorage = (e) => {
      if (e.key === 'ordenes' || e.key === 'orders') {
        loadOrders()
      }
    }

    // escuchar evento personalizado disparado por Carrito en la misma pestaña
    const onOrdenesUpdated = () => {
      loadOrders()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('ordenesUpdated', onOrdenesUpdated)
    // listen for updates to our localOrders helper
    const onMisPedidos = () => loadOrders()
    window.addEventListener('misPedidosUpdated', onMisPedidos)

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ordenesUpdated', onOrdenesUpdated)
      window.removeEventListener('misPedidosUpdated', onMisPedidos)
    }
  }, [])

  const formatCurrency = (v) => Number(v || 0).toLocaleString('es-CL')

  return (
    <div className="mis-ordenes container py-5">
      <h1 className="mb-4 text-center">Mis Pedidos</h1>
      {/* Botón de importación eliminado por requerimiento del cliente */}

      {loading ? (
        <p className="text-center">Cargando pedidos…</p>
      ) : error ? (
        <div className="text-center">
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Recargar pedidos</button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center">No hay pedidos ni artículos en el carrito.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o, idx) => (
            <div className="order-card p-3 mb-3" key={o.id || idx}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>Pedido:</strong> {o.id}
                </div>
                <div>
                  <span className="badge bg-light text-dark">{o.estado}</span>
                </div>
              </div>

              <div className="order-products mb-2">
                {Array.isArray(o.productos) && o.productos.length > 0 ? (
                  o.productos.map((p, i) => (
                    <div className="order-product d-flex align-items-center" key={p.id ? `${p.id}-${p.talla || i}` : i}>
                      <img src={(p.image && p.image.url) ? p.image.url : (p.image || 'https://via.placeholder.com/150')} alt={p.title || p.name || 'producto'} />
                      <div className="ms-3">
                        <div className="fw-bold">{p.title || p.name || 'Producto'}</div>
                        <div>Talla: {p.talla || '-'}</div>
                        <div>Cantidad: {p.cantidad || 1}</div>
                        <div>Precio unitario: ${formatCurrency(p.base_price || p.price || 0)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No hay productos en este pedido.</div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">Fecha: {o.fecha ? new Date(o.fecha).toLocaleString() : '-'}</div>
                <div className="text-end">
                  <div className="h5 mb-1">Total: ${formatCurrency(o.total || 0)}</div>
                  <button className="btn btn-outline-success btn-sm">Ver detalle</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MisOrdenes
