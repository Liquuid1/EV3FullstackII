import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { Blog } from './pages/Blog'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { NavBar } from './layout/NavBar'
import { Footer } from './layout/Footer'
import { Login } from './components/login/Login'
import { Registro } from './components/registro/Registro'
import { Carrito } from './components/carrito/carrito'

import { ProductoDetalle } from './components/productsDetail/productoDetalle'
import { Admin } from './components/admin/Admin'

import { useAuth } from './context/context.jsx'

function App() {

  const { user } = useAuth()

  return (
    <div className="app-root">
      <NavBar user={user} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/blog' element={<Blog />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          <Route path='/registro' element={<Registro />} />
          <Route path='/carrito' element={<Carrito />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />

          <Route path="/admin" element={<Admin />} />
        </Routes>
      <Footer />
    </div>
  )
}

export default App
