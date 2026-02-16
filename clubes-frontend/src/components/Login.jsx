// src/components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Crearemos este archivo

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al iniciar sesión.');
            }
            localStorage.setItem('authToken', data.token); // Guardar el token
            navigate('/admin'); // Redirigir al panel de admin
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Acceso de Administrador</h2>
                <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Ingresar</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}
export default Login;