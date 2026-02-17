import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import Header from './Shared/Header';
import Footer from './Shared/Footer';

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

    // --- NUEVOS ESTADOS PARA LA GALERÍA ---
    const [showGallery, setShowGallery] = useState(false);
    const [serverImages, setServerImages] = useState([]);
    const [targetField, setTargetField] = useState(null); // 'new' para crear, 'edit' para editar

    const getToken = () => localStorage.getItem('authToken');
    
    // Fallback seguro para la URL de la API
    const getApiUrl = () => {
        try {
            return import.meta.env.VITE_API_URL;
        } catch (e) {
            // Fallback para entornos donde import.meta no está disponible
            return 'https://clubes-backend.onrender.com';
        }
    };
    const API_URL = getApiUrl();

    // --- Carga Inicial de Clubes ---
    const fetchClubs = () => {
        fetch(`${API_URL}/clubes`)
            .then(response => response.json())
            .then(data => setClubes(data))
            .catch(err => setError('No se pudo cargar la lista de clubes.'));
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    // --- LÓGICA DE LA GALERÍA ---
    const openGallery = (field) => {
        setTargetField(field); 
        setShowGallery(true);
        
        // Pedir la lista de imágenes al servidor
        fetch(`${API_URL}/api/imagenes-disponibles`)
            .then(res => res.json())
            .then(data => {
                setServerImages(data);
            })
            .catch(err => {
                console.error("Error cargando galería:", err);
                alert("No se pudieron cargar las imágenes del servidor.");
            });
    };

    const selectImage = (url) => {
        if (targetField === 'new') {
            setNewClubImageUrl(url);
        } else if (targetField === 'edit') {
            setEditImageUrl(url);
        }
        setShowGallery(false);
    };

    // --- Funciones CRUD ---

    const handleCreateClub = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/clubes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ nombre: newClubName, cupo_maximo: newClubCapacity, url_imagen: newClubImageUrl }),
        })
        .then(res => res.ok ? res.json() : Promise.reject('Error'))
        .then((nuevoClub) => {
            setClubes(curr => [...curr, nuevoClub]);
            setNewClubName('');
            setNewClubCapacity('');
            setNewClubImageUrl('');
        })
        .catch(() => setError('No se pudo crear el club.'));
    };

    const handleUpdateClub = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/clubes/${editingClub.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ nombre: editName, cupo_maximo: editCapacity, url_imagen: editImageUrl }),
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) navigate('/login');
            if (res.ok) {
                fetchClubs();
                setEditingClub(null);
            }
        });
    };

    const handleDeleteClub = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este club?')) {
            fetch(`${API_URL}/clubes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            }).then(res => {
                if (res.status === 401 || res.status === 403) navigate('/login');
                if (res.ok) fetchClubs();
            });
        }
    };

    const handleDownloadList = async (clubId, clubNombre) => {
        try {
            const res = await fetch(`${API_URL}/exportar/${clubId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.status === 401 || res.status === 403) return navigate('/login');
            if (!res.ok) throw new Error('Error descarga');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Lista-${clubNombre}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) { setError('Error al descargar la lista.'); }
    };

    const handleStartEdit = (club) => {
        setEditingClub(club);
        setEditName(club.nombre);
        setEditCapacity(club.cupo_maximo);
        setEditImageUrl(club.url_imagen || '');
    };

    // --- Renderizado ---
    return (

        //Envolver
        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <Header />
            
            <main style={{flex: 1}}>
                        <div className="admin-container">
                            <div className="admin-header">
                                <h1>Panel de Administrador</h1>
                                <button onClick={() => { localStorage.removeItem('authToken'); navigate('/login'); }} className="logout-button">Cerrar Sesión</button>
                            </div>
                            <Link to="/" className="back-link">← Volver a la página principal</Link>
                            
                            {/* Formulario de Creación */}
                            <div className="form-card">
                                <h2>Agregar Nuevo Club</h2>
                                <form onSubmit={handleCreateClub} className="club-form">
                                    <input type="text" placeholder="Nombre del club" value={newClubName} onChange={e => setNewClubName(e.target.value)} required />
                                    <input type="number" placeholder="Cupo" value={newClubCapacity} onChange={e => setNewClubCapacity(e.target.value)} required />
                                    
                                    {/* Input con botón de galería */}
                                    <div className="input-group-image">
                                        <input type="text" placeholder="URL de la imagen" value={newClubImageUrl} onChange={e => setNewClubImageUrl(e.target.value)} />
                                        <button type="button" onClick={() => openGallery('new')} className="gallery-btn" title="Escoger imagen del servidor">🖼️</button>
                                    </div>
                                    
                                    <button type="submit">Agregar Club</button>
                                </form>
                            </div>

                            <h2>Gestionar Clubes</h2>
                            {error && <p className="error-message">{error}</p>}
                            <div className="club-list">
                                {clubes.map(club => (
                                    <div key={club.id} className="club-item">
                                        {editingClub && editingClub.id === club.id ? (
                                            /* Formulario de Edición */
                                            <form onSubmit={handleUpdateClub} className="edit-form">
                                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                                                <input type="number" value={editCapacity} onChange={e => setEditCapacity(e.target.value)} />
                                                <div className="input-group-image">
                                                    <input type="text" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} />
                                                    <button type="button" onClick={() => openGallery('edit')} className="gallery-btn">🖼️</button>
                                                </div>
                                                <div className="edit-actions">
                                                    <button type="submit" className="save-button">Guardar</button>
                                                    <button type="button" onClick={() => setEditingClub(null)}>Cancelar</button>
                                                </div>
                                            </form>
                                        ) : (
                                            /* Vista Normal */
                                            <>
                                                <img src={club.url_imagen || 'https://via.placeholder.com/100'} alt={club.nombre} className="club-thumbnail" />
                                                <div className="club-info">
                                                    <h2>{club.nombre}</h2>
                                                    <p>Inscritos: {club.inscritos_actuales} / {club.cupo_maximo}</p>
                                                </div>
                                                <div className="club-actions">
                                                    <button onClick={() => handleDownloadList(club.id, club.nombre)} className="action-button download-button">Lista</button>
                                                    <button onClick={() => handleStartEdit(club)} className="action-button edit-button">Editar</button>
                                                    <button onClick={() => handleDeleteClub(club.id)} className="action-button delete-button">Eliminar</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* --- MODAL DE GALERÍA --- */}
                            {showGallery && (
                                <div className="modal-overlay">
                                    <div className="modal-contenido gallery-modal">
                                        <button className="cerrar-btn" onClick={() => setShowGallery(false)}>&times;</button>
                                        <h3>Galería de Imágenes</h3>
                                        <p>Selecciona una imagen cargada en el servidor (public/images):</p>
                                        
                                        {serverImages.length > 0 ? (
                                            <div className="gallery-grid">
                                                {serverImages.map((img, index) => (
                                                    <div key={index} className="gallery-item" onClick={() => selectImage(img.url)}>
                                                        <div className="img-wrapper">
                                                            <img src={img.url} alt={img.nombre} loading="lazy" />
                                                        </div>
                                                        <span>{img.nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-images">
                                                <p>⚠️ No se encontraron imágenes.</p>
                                                <small>Sube imágenes a la carpeta <b>clubes-backend/public/images</b> y haz push a GitHub.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
        
            </main>

            <Footer />
        </div>
        //Envolver    
    );
}

export default AdminPanel;