import React, { useEffect, useMemo, useState } from 'react'
import './MisOrdenes.css'

export function MisOrdenes() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('ordenes')) || JSON.parse(localStorage.getItem('orders')) || []
    const carrito = JSON.parse(localStorage.getItem('carrito')) || []
    const envio = JSON.parse(localStorage.getItem('envio')) || null

    const list = Array.isArray(storedOrders) ? [...storedOrders] : []

    if (carrito && carrito.length > 0) {
      const totalCart = carrito.reduce((acc, it) => acc + (Number(it.base_price || 0) * (it.cantidad || 1)), 0)
      list.unshift({
        id: 'carrito',
        fecha: new Date().toISOString(),
        productos: carrito,
        estado: 'En carrito',
        total: totalCart,
      })
    }

    if (envio && envio.productos && envio.productos.length > 0) {
      const totalEnvio = envio.productos.reduce((acc, it) => acc + (Number(it.base_price || 0) * (it.cantidad || 1)), 0)
      list.unshift({
        id: 'envio',
        fecha: envio.fecha || new Date().toISOString(),
        productos: envio.productos,
        estado: envio.estado || 'En envío',
        total: totalEnvio,
      })
    }

    setOrders(list)
  }, [])

  const formatCurrency = (v) => Number(v || 0).toLocaleString('es-CL')

  return (
    <div className="mis-ordenes container py-5">
      <h1 className="mb-4 text-center">Mis Pedidos</h1>

      {orders.length === 0 ? (
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
                      <img src={(p.image && p.image.url) ? p.image.url : (p.image || '/placeholder.png')} alt={p.title || p.name || 'producto'} />
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
