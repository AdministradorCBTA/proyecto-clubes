// src/components/ClubList.jsx (Versión Corregida)
import './ClubList.css';

function ClubList({ clubes, onClubClick }) {
  return (
    <div className="clubes-container">
      {clubes.map((club) => (
        <button
          key={club.id}
          className="club-boton"
          // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
          // Cambiamos club.imagen por club.url_imagen
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${club.url_imagen || 'https://via.placeholder.com/250'}')` }}
          onClick={() => onClubClick(club)}
        >
          <h2>{club.nombre}</h2>
        </button>
      ))}
    </div>
  );
}

export default ClubList;