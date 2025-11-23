export function logout(navigate) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userData');
  // any other keys
  // notify listeners
  try { window.dispatchEvent(new Event('authChanged')); } catch(e){}
  if (navigate) navigate('/login');
}

export function getCurrentUser() {
  try {
    const u = localStorage.getItem('user') || localStorage.getItem('userData');
    if (!u) return null;
    return JSON.parse(u);
  } catch (err) {
    return null;
  }
}
