import React, { useState, useRef } from 'react';
import { uploadImages, createProduct, attachImagesToProduct } from '../../api/xano';

const ProductForm = ({
  onSubmit, // optional callback recibirá el producto final
}) => {
  const [form, setForm] = useState({
    sku_base: '',
    title: '',
    slug: '',
    description: '',
    brand: '',
    base_price: 0
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false); // <-- guard contra reentradas

  const handleFilesChange = (e) => {
    setFiles(e?.target?.files ? Array.from(e.target.files) : []);
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return; // ya se está enviando
    if (!form.sku_base || !form.title) {
      alert('Completa los campos requeridos');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    try {
      // 1) crear producto sin imágenes
      const productPayload = {
        sku_base: String(form.sku_base),
        title: String(form.title),
        slug: String(form.slug),
        description: String(form.description),
        brand: String(form.brand),
        base_price: Number(form.base_price)
      };
      const created = await createProduct(undefined, productPayload);
      console.log('Producto creado:', created);
      const productId = created.id ?? created._id ?? null;
      if (!productId) {
        throw new Error('No se obtuvo id del producto creado');
      }

      let finalProduct = created;

      // 2) subir imágenes si hay archivos seleccionados
      // Defensive conversion: acepta FileList, array o undefined
      const filesToUpload = files ? Array.from(files) : [];
      console.log('filesToUpload:', filesToUpload);

      if (filesToUpload.length > 0) {
        console.log('Uploading files:', filesToUpload);
        // pasar token como primer argumento (undefined si no usas auth)
        const imagesResponse = await uploadImages(undefined, filesToUpload);
        console.log('Imágenes subidas:', imagesResponse);
        // 3) patch product con el JSON devuelto por upload
        // usar la función importada attachImagesToProduct
        finalProduct = await attachImagesToProduct(undefined, productId, imagesResponse);
      }

      alert('Producto creado correctamente');
      // opcional: limpiar form
      setForm({
        sku_base: '',
        title: '',
        slug: '',
        description: '',
        brand: '',
        base_price: 0
      });
      setFiles([]);

      // NOTIFICACIÓN AL PADRE: desactivada para evitar doble creación
      // if (onSubmit) {
      //   try { onSubmit(finalProduct); } catch (e) { /* noop */ }
      // }

      // Si prefieres notificar al padre sin que intente crear de nuevo,
      // reemplaza la llamada anterior por:
      // if (onSubmit) { try { onSubmit({ action: 'created', product: finalProduct }); } catch(e){} }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="admin-form" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
      <input placeholder="SKU Base" value={form.sku_base} onChange={e => setForm({ ...form, sku_base: e.target.value })} />
      <input placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
      <input placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
      <input placeholder="Precio base" type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} />
      <label>
        Imágenes (múltiples)
        <input type="file" accept="image/*" multiple onChange={handleFilesChange} />
      </label>
      <div>
        {files.length > 0 && <small>{files.length} archivo(s) seleccionado(s)</small>}
      </div>
      <button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Procesando...' : 'Agregar Producto'}
      </button>
    </div>
  );
};

export default ProductForm;