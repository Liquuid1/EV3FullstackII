import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthModule from '../../context/context';
import { createOrder, createOrderItem } from '../../api/orders';
import './carrito.css';

export const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // carga inicial y sincronización entre pestañas
  useEffect(() => {
    const load = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(Array.isArray(stored) ? stored : []);
      } catch {
        setCarrito([]);
      }
    };
    load();
    const onStorage = (e) => { if (e.key === 'carrito') load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // recalcula total para UI (no confíes solo en este valor para el envío)
  useEffect(() => {
    const computed = carrito.reduce((acc, item) => {
      const p = toNumber(item.base_price);
      const q = toNumber(item.cantidad ?? 1);
      return acc + p * q;
    }, 0);
    setTotal(computed);
  }, [carrito]);

  const eliminarProducto = (id, talla) => {
    const actualizado = carrito.filter(item => !(item.id === id && String(item.talla) === String(talla)));
    setCarrito(actualizado);
    localStorage.setItem('carrito', JSON.stringify(actualizado));
  };

  // resolver auth: intenta Context o hook exportado, luego fallback a localStorage/JWT
  const ResolvedAuthContext = AuthModule.AuthContext || AuthModule.Context || AuthModule.AppContext || null;
  const authFromContext = ResolvedAuthContext ? useContext(ResolvedAuthContext) : null;
  const authFromHook = typeof AuthModule.useAuth === 'function' ? AuthModule.useAuth() : null;
  const authDefaultExport = AuthModule.default || null;
  const auth = authFromContext || authFromHook || (authDefaultExport && (authDefaultExport.user || authDefaultExport)) || null;

  const getUserId = () => {
    try {
      // desde auth object (varias formas)
      if (auth) {
        const u = auth.user || auth.currentUser || auth.authUser || auth;
        if (u && (u.id || u.user_id)) return u.id ?? u.user_id;
      }

      // desde localStorage
      const stored = JSON.parse(localStorage.getItem('user') || localStorage.getItem('authUser') || 'null');
      if (stored && (stored.id || stored.user_id)) return stored.id ?? stored.user_id;

      // desde token JWT (clave token/authToken)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            return payload.sub ?? payload.user_id ?? payload.id ?? 0;
          } catch {}
        }
      }
    } catch {}
    return 0;
  };

  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const cleaned = String(v).replace(/[^0-9\-,.]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const handleCheckout = async () => {
    if (!carrito.length) return;
    setIsProcessing(true);
    setError(null);
    try {
      const userId = getUserId();
      // recalcular total y normalizar
      const computedTotal = carrito.reduce((acc, item) => {
        const price = toNumber(item.base_price);
        const qty = toNumber(item.cantidad ?? 1);
        return acc + price * qty;
      }, 0);
      const totalToSend = Number(computedTotal.toFixed(2));

      const orderPayload = {
        status: 'pending',
        total_amount: totalToSend,
        user_id: userId,
      };

      const orderResp = await createOrder(orderPayload);
      const orderId = orderResp?.id ?? orderResp?.orderId ?? orderResp?._id;
      if (!orderId) throw new Error('No se recibió orderId del servidor');

      // crear items (normalizar campos)
      const itemPromises = carrito.map(item => {
        console.log('Creando item para orderId', orderId, 'con datos:', {
          order_id: orderId,
          product_id: item.id,
          talla: item.talla,
          cantidad: toNumber(item.cantidad ?? 1),
          precio_unitario: toNumber(item.base_price),
        });
        const qty = toNumber(item.cantidad ?? 1);
        const unit_price = toNumber(item.base_price);
        const line_total = Number((qty * unit_price).toFixed(2));
        return createOrderItem({
          qty,
          unit_price,
          line_total,
          order_id: orderId,
          product_id: item.id,
          talla: item.talla,
        });
      });

      await Promise.all(itemPromises);

      // limpieza y redirección
      localStorage.removeItem('carrito');
      setCarrito([]);
      setIsProcessing(false);
      // pasar orderId también via state para asegurar que Checkout pueda leerlo
      navigate(`/checkout/${orderId}`, { state: { orderId } });
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error procesando pedido');
      setIsProcessing(false);
    }
  };

  return (
    <div className="carrito-page container py-5">
      <h1>Tu carrito</h1>
      {carrito.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div className="carrito-lista">
          {carrito.map(item => {
            const key = item.id ? `${item.id}-${item.talla ?? 'no-talla'}` : Math.random();
            const qty = toNumber(item.cantidad ?? 1);
            const price = toNumber(item.base_price);
            const subtotal = price * qty;
            return (
              <div key={key} className="carrito-item">
                <img src={item.image?.url ?? '/placeholder.png'} alt={item.title ?? 'producto'} />
                <div className="carrito-detalle">
                  <h5>{item.title}</h5>
                  <p>Talla: {String(item.talla ?? '—')}</p>
                  <p>Cantidad: {qty}</p>
                  <p>Precio unitario: ${price.toLocaleString('es-CL')}</p>
                  <p>Subtotal: ${subtotal.toLocaleString('es-CL')}</p>
                  <button onClick={() => eliminarProducto(item.id, item.talla)}>Eliminar</button>
                </div>
              </div>
            );
          })}
          <div className="carrito-total">
            <h4>Total: ${Number(total || 0).toLocaleString('es-CL')}</h4>
            <button className="btn-checkout" onClick={handleCheckout} disabled={isProcessing}>
              {isProcessing ? 'Procesando…' : 'Pagar'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};