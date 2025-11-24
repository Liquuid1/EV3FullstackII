// Utilities to store and manage local orders for "Mis Pedidos"
const STORAGE_KEY = 'mis_pedidos';
const EVENT_NAME = 'misPedidosUpdated';

export function getOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.warn('localOrders.getOrders parse error', e);
    return [];
  }
}

export function saveOrders(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr || []));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
    return true;
  } catch (e) {
    console.error('localOrders.saveOrders error', e);
    return false;
  }
}

export function addOrder(order) {
  try {
    const list = getOrders();
    list.unshift(order);
    saveOrders(list);
    return order;
  } catch (e) {
    console.error('localOrders.addOrder error', e);
    return null;
  }
}

export function clearOrders() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {}
}

export function onUpdate(cb) {
  if (typeof cb !== 'function') return () => {};
  const handler = () => cb(getOrders());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export default { getOrders, saveOrders, addOrder, clearOrders, onUpdate };
