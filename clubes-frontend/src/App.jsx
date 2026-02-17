import { useState, useEffect } from 'react';
import './index.css';
import ClubList from './components/ClubList';
import LoginModal from './components/LoginModal';
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';

// Fallback para evitar errores si import.meta no está definido
const getApiUrl = () => {
    try {
        return import.meta.env.VITE_API_URL;
    } catch (e) {
        return 'https://clubes-backend.onrender.com';
    }
};
const API_URL = getApiUrl();

function App() {
    const [clubesData, setClubesData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [clubSeleccionado, setClubSeleccionado] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/clubes`)
            .then(res => res.json())
            .then(data => setClubesData(data))
            .catch(err => console.error("Error al cargar clubes:", err));
    }, []);

    const handleClubClick = (club) => {
        setClubSeleccionado(club);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setClubSeleccionado(null);
    };

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
            if (!response.ok) throw new Error(data.mensaje);
            alert(data.mensaje);
            handleCloseModal();
        } catch (error) {
            console.error("Error en la inscripción:", error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="app-wrapper" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <Header />
            
            <main style={{flex: 1, padding: '20px 0'}}>
                <h1 style={{textAlign: 'center', margin: '20px 0', color: '#1b5e20'}}>Inscripción a Clubes</h1>
                <ClubList clubes={clubesData} onClubClick={handleClubClick} />
            </main>
            
            <LoginModal 
                visible={modalVisible} 
                onClose={handleCloseModal}
                onInscribir={handleInscribir}
                club={clubSeleccionado}
            />
            
            <Footer />
        </div>
    );
}

export default App;