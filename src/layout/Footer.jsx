import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Footer.css'

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row">

          {/* Branding y Newsletter */}
          <div className="col-md-4 mb-4">
            <h2 className="text-uppercase">Snkr Hood</h2>
            <p>Tu tienda de zapatillas urbanas en Chile.</p>
            <FooterNewsletter />
            <div className="col-md-6 pt-4">
              <h6>Legal</h6>
              <ul className="list-unstyled">
                <li><Link to="/terminos">Términos y condiciones</Link></li>
                <li><Link to="/privacidad">Política de privacidad</Link></li>
                <li><Link to="/cookies">Política de cookies</Link></li>
              </ul>
            </div>
          </div>

          {/* Navegación */}
          <div className="col-md-2 mb-4">
            <div>
              <h5>Explora</h5>
              <ul className="list-unstyled">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/products">Productos</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/about">Nosotros</Link></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contacto</a></li>
              </ul>
            </div>
            <div>
              <h6>Métodos de pago</h6>
              <ul className="list-unstyled">
                <li>Visa</li>
                <li>Mastercard</li>
                <li>PayPal</li>
              </ul>
            </div>
          </div>

          {/* Cuenta y ayuda */}
          <div className="col-md-3 mb-4">
            <h5>Tu cuenta</h5>
            <ul className="list-unstyled">
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/registro">Registrarse</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-md-3 mb-4">
            <h5>Contacto</h5>
            <p>Email: contacto@snkrhood.cl</p>
            <p>Teléfono: +56 9 1234 5678</p>
            <p>Horario: Lun a Vie, 10:00–18:00</p>
            <h5 className="mt-3">Redes</h5>
            <ul className="list-unstyled">
              <li><a href="https://instagram.com/snkrhood" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com/@snkrhood" target="_blank" rel="noreferrer">TikTok</a></li>
              <li><a href="https://facebook.com/snkrhood" target="_blank" rel="noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-1">
          <small>&copy; {new Date().getFullYear()} Snkr Hood. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  )
}

const FooterNewsletter = () => {
  const [email, setEmail] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('El correo fue registrado exitosamente');
    setEmail('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <>
      <form className="d-flex" onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control me-2" placeholder="Tu correo electrónico" required />
        <button type="submit" className="btn btn-danger">Suscribirme</button>
      </form>
      {success && <div className="mt-2 text-success">{success}</div>}
    </>
  )
}
