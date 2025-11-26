import React, { useState, useEffect } from 'react';
import UserItem from './UserItem';
import "./UserSection.css";

export default function UserSection(props) {
    const { admin } = props;
    const { usuarios, fetchUsuarios, agregarUsuario, eliminarUsuario, modificarUsuario } = admin;

    const [accion, setAccion] = useState('listar');
    const [users, setUsers] = useState([]);         // lista mostrada (filtrada)
    const [allUsers, setAllUsers] = useState([]);   // copia completa para filtrado local
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const baseUrl = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/user';

    useEffect(() => {
        if (accion === 'listar') {
            fetchUsuarios();
            fetchAllUsers();
        }
    }, [accion, fetchUsuarios]);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(baseUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAllUsers(data || []);
            setUsers(data || []);
        } catch (err) {
            console.error('No se pudo cargar la lista de usuarios:', err);
            setAllUsers([]);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado local por email (sin llamadas al servidor)
    const searchByEmail = (email) => {
        const q = (email || '').trim().toLowerCase();
        if (!q) {
            setUsers(allUsers);
            return;
        }
        const filtered = allUsers.filter(u => (u.email || '').toLowerCase().includes(q));
        setUsers(filtered);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchByEmail(query);
    };

    const handleClear = () => {
        setQuery('');
        setUsers(allUsers);
    };

    // handlers que actualizan las listas locales cuando UserItem llama onDelete/onUpdate
    const handleDelete = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        setAllUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleUpdate = (updatedUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    return (
        <section className="admin-section">
            <h3>Usuarios</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <button className={`admin-btn-main${accion === 'agregar' ? ' active' : ''}`} onClick={() => setAccion('agregar')}>Agregar</button>
                <button className={`admin-btn-main${accion === 'listar' ? ' active' : ''}`} onClick={() => setAccion('listar')}>Listar</button>
            </div>

            {accion === 'agregar' && (
                <UserForm onSubmit={async (payload) => {
                    const ok = await agregarUsuario(payload);
                    if (ok) setAccion('listar');
                    return ok; // devolver resultado para que el form pueda reaccionar correctamente
                }} />
            )}

            {accion === 'listar' && (
                <>
                    {/* Encabezado de columnas: Usuario --- Correo --- Rol */}
                    <div className="admin-list-header" style={{marginBottom:8}}>
                        <div className="user-col user-name">Usuario</div>
                        <div className="user-col user-email">Correo</div>
                        <div className="user-col user-role">Rol</div>
                        <div className="user-col user-actions">Acciones</div>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="user-search-form" style={{ marginBottom: 12 }}>
                        <input
                            type="text"
                            placeholder="Buscar por correo..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ padding: 8, width: 280 }}
                        />
                        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
                            {loading ? 'Cargando...' : 'Buscar'}
                        </button>
                        <button type="button" onClick={handleClear} style={{ marginLeft: 8 }}>
                            Limpiar
                        </button>
                    </form>
                    <ul className="admin-list">
                    {users.map(u => (
                        <UserItem key={u.id} user={u} onDelete={() => eliminarUsuario(u.id)} onSave={(datos) => modificarUsuario(u.id, datos)} />
                    ))}
                    {users.length === 0 && !loading && <div>No hay usuarios para mostrar.</div>}
                    </ul>
                    </>
            )}
        </section>
    );
};