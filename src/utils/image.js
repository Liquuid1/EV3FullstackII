// Normaliza distintos formatos de imagen que pueden venir del backend.
// Exporta por defecto y también como named export `resolveImageUrl`.
function resolveImageUrl(candidate) {
	if (!candidate) return 'https://via.placeholder.com/300x300?text=no+image';

	// cadena -> asumir url ya válida
	if (typeof candidate === 'string') return candidate;

	// array -> tomar el primer elemento útil
	if (Array.isArray(candidate)) return resolveImageUrl(candidate[0]);

	// objeto -> buscar propiedades comunes
	if (typeof candidate === 'object') {
		const prefer = ['url', 'path', 'src', 'image', 'file', 'secure_url'];
		for (const k of prefer) {
			if (candidate[k]) return candidate[k];
		}

		// a veces el backend devuelve sólo un id numérico o string
		if (candidate.id || candidate._id) {
			const id = candidate.id || candidate._id;
			const base = import.meta.env.VITE_XANO_STORE_BASE || '';
			// construir una ruta por si el proyecto usa el endpoint product_image
			// el formato final dependerá de tu backend; ajustar si es necesario
			return `${base}/api:3024072/product_image/${id}`;
		}
	}

	return 'https://via.placeholder.com/300x300?text=no+image';
}

export default resolveImageUrl;
export { resolveImageUrl };
