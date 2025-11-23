export async function createOrder(orderData) {
  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creating order');
  }
  return res.json();
}

export async function createOrderItem(itemData) {
  // Ajusta esta ruta si tu backend la expone diferente (p. ej. /order_items)
  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/order_item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(itemData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creating order item');
  }
  return res.json();
}