import axios from "axios";

const SNKR_BASE = import.meta.env.VITE_XANO_STORE_BASE;

// Cambiado: sólo devolver Authorization si token es truthy
export const makeAuthHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export async function createProduct(token, payload) {
  const { data } = await axios.post(
    `${SNKR_BASE}/product`,
    payload,
    { 
      headers: { 
        ...makeAuthHeader(token),
        "Content-Type": "application/json"
      } 
    }
  );
  return data;
}

export async function uploadImages(token, files) {
  const fd = new FormData();

  // el backend espera 'content[]' como array de archivos
  for (const f of files || []) fd.append("content[]", f);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const { data } = await axios.post(
      `${SNKR_BASE}/upload/image`,
      fd,
      { headers } // NO fijar Content-Type aquí
    );
    const arr = Array.isArray(data) ? data : (data?.files || data?.content || data?.["content[]"] || []);
    return arr;
  } catch (err) {
    console.error('uploadImages error:', err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
}

export async function attachImagesToProduct(token, productId, imagesFullArray) {
  const { data } = await axios.patch(
    `${SNKR_BASE}/product/${productId}`,
    { imagenes: imagesFullArray },
    { 
      headers: { 
        "Content-Type": "application/json"
      } 
    }
  );
  return data; // Devolvemos los datos actualizados del producto
}

export async function listProducts({ token, limit = 12, offset = 0, q = "" } = {}) {

  const params = {};

  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  if (q) params.q = q;

  const { data } = await axios.get(`${SNKR_BASE}/product`, {
    headers: { ...makeAuthHeader(token) },
    params,
  });


  return Array.isArray(data) ? data : (data?.items ?? []);
}
