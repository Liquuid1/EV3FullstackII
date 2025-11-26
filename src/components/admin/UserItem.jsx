import React, { useState } from 'react';

export default function UserItem({
    user,
    onUpdate = () => {},   // default noop to evitar errores si padre no envía prop
    onDelete = () => {},   // default noop
    onCreate = () => {}    // default noop (por si se usa desde aquí)
}) {
    const [isActive, setIsActive] = useState(user?.is_active ?? true);
    const [loading, setLoading] = useState(false);

    const baseUrl = 'https://x8ki-letl-twmt.n7.xano.io/api:AZPo4EA2/user';

    const request = async (url, options) => {
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${text}`);
        }
        return res.json().catch(() => null);
    };

    const toggleActive = async () => {
        setLoading(true);
        const newValue = !isActive;
        try {
            const updated = await request(`${baseUrl}/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newValue })
            });
            setIsActive(newValue);
            onUpdate({ ...user, ...(updated || { is_active: newValue }) });
        } catch (err) {
            console.error(err);
            alert('No fue posible cambiar el estado del usuario.');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async () => {
        if (!confirm('¿Eliminar usuario? Esta acción es irreversible.')) return;
        setLoading(true);
        try {
            await request(`${baseUrl}/${user.id}`, { method: 'DELETE' });
            onDelete(user.id);
        } catch (err) {
            console.error(err);
            alert('No fue posible eliminar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    // actualizar user (recibe solo los campos a modificar)
    const editUser = async (fields) => {
        setLoading(true);
        try {
            const updated = await request(`${baseUrl}/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields)
            });
            onUpdate({ ...user, ...(updated || fields) });
            if (fields.is_active !== undefined) setIsActive(fields.is_active);
        } catch (err) {
            console.error(err);
            alert('No fue posible actualizar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    // crear usuario (si necesitas crear desde aquí)
    const createUser = async (newUserData) => {
        setLoading(true);
        try {
            const created = await request(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserData)
            });
            onCreate(created);
        } catch (err) {
            console.error(err);
            alert('No fue posible crear el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-item">
            <div className="user-info">
                <strong>{user.full_name}</strong> — {user.email}
            </div>

            <div className="user-actions">
                <button
                    onClick={toggleActive}
                    disabled={loading}
                    className={`btn ${isActive ? 'btn-danger' : 'btn-success'}`}
                    title={isActive ? 'Bloquear usuario' : 'Desbloquear usuario'}
                >
                    {loading ? 'Procesando...' : (isActive ? 'Bloquear' : 'Desbloquear')}
                </button>

                <button
                    onClick={() => {
                        // ejemplo de uso de editUser: abre un modal en tu app y pasa campos a editUser
                        // aquí solo ejemplo de cambio de nombre (remplázalo por tu UI)
                        const newName = prompt('Nuevo nombre', user.full_name);
                        if (newName) editUser({ full_name: newName });
                    }}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    Editar
                </button>

                <button
                    onClick={deleteUser}
                    disabled={loading}
                    className="btn btn-outline-danger"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};