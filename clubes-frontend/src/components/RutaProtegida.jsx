// src/components/RutaProtegida.jsx
import { Navigate } from 'react-router-dom';

function RutaProtegida({ children }) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Si no hay token, redirigir al login
        return <Navigate to="/login" />;
    }
    return children; // Si hay token, mostrar el componente (AdminPanel)
}
export default RutaProtegida;