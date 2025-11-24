export async function createOrder(orderData, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creating order');
  }
  return res.json();
}

export async function createOrderItem(itemData, token = null) {
  // Ajusta esta ruta si tu backend la expone diferente (p. ej. /order_items)
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order_item', {
    method: 'POST',
    headers,
    body: JSON.stringify(itemData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creating order item');
  }
  return res.json();
}

// --- Helpers to support frontend listing ---
export async function listOrdersByUser(userId, token = null) {
  try {
    const url = `https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order?user_id=${encodeURIComponent(userId)}`;
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error fetching orders');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch (err) {
    console.error('listOrdersByUser error:', err);
    throw err;
  }
}

export async function listOrderItems(orderId, token = null) {
  try {
    const url = `https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order_item?order_id=${encodeURIComponent(orderId)}`;
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error fetching order items');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch (err) {
    console.error('listOrderItems error:', err);
    throw err;
  }
}