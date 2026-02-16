import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

function LoginModal({ visible, onClose, onInscribir, club }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // --- NUEVO ESTADO ---
    // Este estado controlará si el formulario se está enviando.
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!visible) {
        return null;
    }
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            alert("Por favor, llena ambos campos.");
            return;
        }

        // --- DESACTIVAMOS EL BOTÓN ---
        setIsSubmitting(true);

        try {
            // Pasamos los datos a la función onInscribir que está en App.jsx
            // Usamos 'await' para esperar a que termine la inscripción
            await onInscribir({ email, password });
            onClose(); // Cerramos el modal solo si la inscripción fue exitosa
        } catch (error) {
            // El error ya se muestra con un 'alert' en App.jsx
            // No necesitamos hacer nada extra aquí.
        } finally {
            // --- REACTIVAMOS EL BOTÓN ---
            // Esto se ejecuta siempre, tanto si hubo éxito como si hubo error.
            setIsSubmitting(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-contenido">
                <button className="cerrar-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
                <h3>Inscripción para {club?.nombre}</h3>
                <p>Introduce tus datos para continuar.</p>
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="tucorreo@cbta228.edu.mx"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting} // Desactivamos el input
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting} // Desactivamos el input
                    />
                    {/* --- BOTÓN INTELIGENTE --- */}
                    <button type="submit" className="inscribir-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Inscribiendo...' : 'Inscribirme'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;