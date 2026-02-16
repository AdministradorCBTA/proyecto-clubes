// src/App.jsx (Versión Completa y Funcional)
import { useState, useEffect } from 'react';
import './index.css';
import ClubList from './components/ClubList';
import LoginModal from './components/LoginModal';

// URL base del backend desde la variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

function App() {
    const [clubesData, setClubesData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [clubSeleccionado, setClubSeleccionado] = useState(null);

    // Cargar los clubes del backend al iniciar
    useEffect(() => {
        fetch(`${API_URL}/clubes`)
            .then(res => res.json())
            .then(data => setClubesData(data))
            .catch(err => console.error("Error al cargar clubes:", err));
    }, []);

    // --- LÓGICA PARA ABRIR EL MODAL ---
    const handleClubClick = (club) => {
        setClubSeleccionado(club);
        setModalVisible(true); // Esta línea es la que hace visible el modal
    };

    // --- LÓGICA PARA CERRAR EL MODAL ---
    const handleCloseModal = () => {
        setModalVisible(false);
        setClubSeleccionado(null);
    };

    // --- LÓGICA PARA MANEJAR LA INSCRIPCIÓN ---
    const handleInscribir = async (datosLogin) => {
        if (!clubSeleccionado) return;

        try {
            const response = await fetch(`${API_URL}/inscribir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: datosLogin.email,
                    password: datosLogin.password,
                    clubId: clubSeleccionado.id,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.mensaje);
            }
            alert(data.mensaje);
            handleCloseModal();
        } catch (error) {
            console.error("Error en la inscripción:", error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <>
            <h1>Elige tu Club</h1>
            {/* Se pasa la función handleClubClick al componente de la lista */}
            <ClubList clubes={clubesData} onClubClick={handleClubClick} />
            
            <LoginModal 
                visible={modalVisible} 
                onClose={handleCloseModal}
                onInscribir={handleInscribir}
                club={clubSeleccionado}
            />
        </>
    );
}

export default App;
