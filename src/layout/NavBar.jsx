import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/context.jsx'
import logo from '../assets/logo.jpg'
import './NavBar.css'

export const NavBar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isLogged = !!user
  const isAdmin = user?.role_id === 7

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-2">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" width="30" height="30" className="d-inline-block align-text-top me-2" />
          SNKR HOOD
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Centro: siempre mostrar mismos enlaces que cuando no hay sesión */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about">Nosotros</Link></li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contacto</a>
            </li>
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {/* Derecha: dependiendo del estado de sesión y rol */}
            {!isLogged && (
              <>
                <Link className="btn btn-outline-primary" to="/login">Login</Link>
                <Link className="btn btn-outline-secondary" to="/registro">Registrarse</Link>
                <Link className="btn btn-outline-success" to="/carrito">Carrito</Link>
              </>
            )}

            {isLogged && isAdmin && (
              <>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
                <Link className="btn btn-outline-primary" to="/admin">Admin Panel</Link>
              </>
            )}

            {isLogged && !isAdmin && (
              <>
                <Link className="btn btn-outline-success" to="/carrito">Carrito</Link>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
                <Link className="btn btn-outline-primary" to="/mis-ordenes">Mis Pedidos</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
