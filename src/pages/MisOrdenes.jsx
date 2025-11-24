import React, { useEffect, useState } from 'react'
import './MisOrdenes.css'
import { getCurrentUser } from '../utils/auth'
import { useAuth } from '../context/context.jsx'

export function MisOrdenes() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const API_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/mis-pedidos'

    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Usuario actual:', user.id)


        const res = await fetch(API_URL+`?user_id=${user.id}`, { method: 'GET', signal: controller.signal })
        console.log('Respuesta pedidos:', res)
        if (!res.ok) throw new Error(`Error al obtener pedidos: ${res.status}`)
        const data = await res.json()
        console.log('Datos pedidos:', data)

        // Mapear los campos que vienen desde la API para que la vista los muestre
        const mapped = Array.isArray(data) ? data.map(d => ({
          // conservar todos los campos originales
          ...d,
          // alias usados en la UI
          estado: d.status,
          fecha: d.created_at,
          total: d.total_amount,
          raw: d,
        })) : []

        if (!cancelled) setOrders(mapped)

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando pedidos:', err)
          if (!cancelled) setError(err?.message || 'Error cargando pedidos')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOrders()

    const onStorage = (e) => {
      if (e.key === 'ordenes' || e.key === 'orders' || e.key === 'mis-pedidos') loadOrders()
    }
    const onOrdenesUpdated = () => loadOrders()

    window.addEventListener('storage', onStorage)
    window.addEventListener('ordenesUpdated', onOrdenesUpdated)

    return () => {
      cancelled = true
      controller.abort()
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ordenesUpdated', onOrdenesUpdated)
    }
  }, [])

  const formatCurrency = (v) => Number(v || 0).toLocaleString('es-CL')

  return (
    <div className="mis-ordenes container py-5">
      <h1 className="mb-4 text-center">Mis Pedidos</h1>

      {loading ? (
        <p className="text-center">Cargando pedidos…</p>
      ) : error ? (
        <div className="text-center">
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Recargar pedidos</button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center">No hay pedidos registrados para este usuario.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o, idx) => (
            <div className="order-card p-3 mb-3" key={o.id ?? idx}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>Pedido:</strong> {o.order_number || o.id}
                </div>
                <div>
                  <span className="badge bg-light text-dark">{o.estado}</span>
                </div>
              </div>

              <div className="order-meta mb-2">
                <div className="text-muted">Fecha: {o.fecha ? new Date(o.fecha).toLocaleString() : '-'}</div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div className="text-end">
                  <div className="h5 mb-1">Total: ${formatCurrency(o.total)}</div>
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
