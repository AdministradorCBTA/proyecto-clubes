import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
    // --- Hooks y Estados ---
    const [clubes, setClubes] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Estados para el formulario de creación
    const [newClubName, setNewClubName] = useState('');
    const [newClubCapacity, setNewClubCapacity] = useState('');
    const [newClubImageUrl, setNewClubImageUrl] = useState('');

    // Estados para el formulario de edición
    const [editingClub, setEditingClub] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    // --- Funciones de Ayuda y Carga de Datos ---
    const getToken = () => localStorage.getItem('authToken');

    const fetchClubs = () => {
        fetch(`${import.meta.env.VITE_API_URL}/clubes`)
            .then(response => response.json())
            .then(data => setClubes(data))
            .catch(err => setError('No se pudo cargar la lista de clubes.'));
    };

    useEffect(() => {
        fetchClubs();
    }, []);


    // --- Funciones para las Acciones del Administrador ---

    const handleCreateClub = (e) => {
        e.preventDefault();
        fetch(`${import.meta.env.VITE_API_URL}/clubes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ nombre: newClubName, cupo_maximo: newClubCapacity, url_imagen: newClubImageUrl }),
        })
        .then(res => res.ok ? res.json() : Promise.reject('Error al crear'))
        .then((nuevoClub) => {
            setClubes(clubesActuales => [...clubesActuales, nuevoClub]);
            setNewClubName('');
            setNewClubCapacity('');
            setNewClubImageUrl('');
        })
        .catch(() => setError('No se pudo crear el club.'));
    };

    const handleUpdateClub = (e) => {
        e.preventDefault();
        fetch(`${import.meta.env.VITE_API_URL}/clubes/${editingClub.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ nombre: editName, cupo_maximo: editCapacity, url_imagen: editImageUrl }),
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) navigate('/login');
            if (!res.ok) throw new Error('No se pudo actualizar');
            fetchClubs();
            setEditingClub(null);
        })
        .catch(() => setError('No se pudo actualizar el club.'));
    };

    const handleDeleteClub = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este club?')) {
            fetch(`${import.meta.env.VITE_API_URL}/clubes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
            .then(res => {
                if (res.status === 401 || res.status === 403) navigate('/login');
                if (!res.ok) throw new Error('No se pudo eliminar');
                fetchClubs();
            })
            .catch(() => setError('No se pudo eliminar el club.'));
        }
    };

    const handleDownloadList = async (clubId, clubNombre) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/exportar/${clubId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.status === 401 || response.status === 403) {
                navigate('/login');
                return;
            }
            if (!response.ok) throw new Error('No se pudo descargar el archivo.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Inscritos-${clubNombre.replace(/ /g, "_")}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('No se pudo descargar la lista.');
        }
    };

    const handleStartEdit = (club) => {
        setEditingClub(club);
        setEditName(club.nombre);
        setEditCapacity(club.cupo_maximo);
        setEditImageUrl(club.url_imagen || '');
    };
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    // --- Renderizado del Componente ---
    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Panel de Administrador</h1>
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </div>
            <Link to="/" className="back-link">← Volver a la página principal</Link>
            
            <div className="form-card">
                <h2>Agregar Nuevo Club</h2>
                <form onSubmit={handleCreateClub} className="club-form">
                    <input type="text" placeholder="Nombre del club" value={newClubName} onChange={e => setNewClubName(e.target.value)} required />
                    <input type="number" placeholder="Cupo máximo" value={newClubCapacity} onChange={e => setNewClubCapacity(e.target.value)} required />
                    <input type="text" placeholder="URL de la imagen" value={newClubImageUrl} onChange={e => setNewClubImageUrl(e.target.value)} />
                    <button type="submit">Agregar Club</button>
                </form>
            </div>

            <h2>Gestionar Clubes</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="club-list">
                {clubes.map(club => (
                    <div key={club.id} className="club-item">
                        {editingClub && editingClub.id === club.id ? (
                            <form onSubmit={handleUpdateClub} className="edit-form">
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                                <input type="number" value={editCapacity} onChange={e => setEditCapacity(e.target.value)} />
                                <input type="text" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="URL de la imagen" />
                                <div className="edit-actions">
                                    <button type="submit" className="save-button">Guardar</button>
                                    <button type="button" onClick={() => setEditingClub(null)}>Cancelar</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <img src={club.url_imagen || 'https://via.placeholder.com/100'} alt={club.nombre} className="club-thumbnail" />
                                <div className="club-info">
                                    <h2>{club.nombre}</h2>
                                    <p>Inscritos: {club.inscritos_actuales} / {club.cupo_maximo}</p>
                                </div>
                                <div className="club-actions">
                                    <button onClick={() => handleDownloadList(club.id, club.nombre)} className="action-button download-button">Descargar</button>
                                    <button onClick={() => handleStartEdit(club)} className="action-button edit-button">Editar</button>
                                    <button onClick={() => handleDeleteClub(club.id)} className="action-button delete-button">Eliminar</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;