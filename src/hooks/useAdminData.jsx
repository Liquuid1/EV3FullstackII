import { useState, useCallback } from 'react';

const BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2';

export const useAdminData = () => {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const fetchProductos = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/product`);
      const data = await res.json();
      if (Array.isArray(data)) setProductos(data);
    } catch (err) {
      console.error('fetchProductos error', err);
    }
  }, []);

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/user`);
      const data = await res.json();
      if (Array.isArray(data)) setUsuarios(data);
    } catch (err) {
      console.error('fetchUsuarios error', err);
    }
  }, []);

  const agregarProducto = async (payload) => {
    try {
      const res = await fetch(`${BASE}/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchProductos();
        return true;
      }
      console.error('agregarProducto fallo', await res.text());
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`${BASE}/product/${id}`, { method: 'DELETE' });
      if (res.ok) setProductos(prev => prev.filter(p => p.id !== id));
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const modificarProducto = async (id, payload) => {
    try {
      const res = await fetch(`${BASE}/product/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchProductos();
        return true;
      }
      console.error('modificarProducto fallo', res.status);
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const agregarUsuario = async (payload) => {
    try {
      console.debug('agregarUsuario: payload ->', payload);
      const XANO_API_KEY = import.meta.env.VITE_XANO_API_KEY;
      const headers = { 'Content-Type': 'application/json' };
      if (XANO_API_KEY) {
        // Enviar Authorization Bearer si se define la API key en .env
        headers.Authorization = `Bearer ${XANO_API_KEY}`;
      }

      const res = await fetch(`${BASE}/user`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      // leer texto para poder mostrar en consola aunque no sea JSON
      const text = await res.text();
      let data = text;
      try { data = JSON.parse(text); } catch (e) { /* no-json response */ }

      console.debug('agregarUsuario: response status ->', res.status, 'body ->', data);

      if (res.ok) {
        await fetchUsuarios();
        return true;
      }

      console.error('agregarUsuario fallo', res.status, data);
      return false;
    } catch (err) {
      console.error('agregarUsuario exception', err);
      return false;
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      const res = await fetch(`${BASE}/user/${id}`, { method: 'DELETE' });
      if (res.ok) setUsuarios(prev => prev.filter(u => u.id !== id));
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const modificarUsuario = async (id, payload) => {
    try {
      const res = await fetch(`${BASE}/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchUsuarios();
        return true;
      }
      console.error('modificarUsuario fallo', res.status);
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return {
    productos,
    usuarios,
    fetchProductos,
    fetchUsuarios,
    agregarProducto,
    eliminarProducto,
    modificarProducto,
    agregarUsuario,
    eliminarUsuario,
    modificarUsuario
  };
};