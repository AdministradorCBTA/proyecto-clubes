// import './Shared.css';

// function Header() {
//   return (
//     <header className="cbta-header">
//       <div className="header-top">
//         <div className="container">
//           <span>Centro de Bachillerato Tecnológico Agropecuario No 228</span>
//         </div>
//       </div>
//       <div className="header-main">
//         <div className="container header-content">
//           <div className="logo-area">
//             {/* Logo oficial con fallback */}
//             <img 
//               src="https://cbta228.edu.mx/wp-content/uploads/2021/04/cropped-logo-cbta-228-300x88.png" 
//               alt="Logo CBTa 228" 
//               className="site-logo" 
//               onError={(e) => {e.target.onerror = null; e.target.style.display='none';}} 
//             />
//           </div>
//           <nav className="main-nav">
//             <ul>
//               <li><a href="https://cbta228.edu.mx/">PLANTEL</a></li>
//               <li><a href="https://cbta228.edu.mx/noticias/">NOTICIAS</a></li>
//               <li><a href="https://cbta228.edu.mx/admision/">ADMISIÓN</a></li>
//               <li><a href="https://cbta228.edu.mx/estudiantes/">ESTUDIANTES</a></li>
//               <li><a href="https://cbta228.edu.mx/docentes/">DOCENTES</a></li>
//               <li><a href="https://cbta228.edu.mx/contacto/">CONTACTO</a></li>
//             </ul>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

import React from 'react';

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo / Nombre del Plantel */}
        <a href="https://cbta228.edu.mx/" style={styles.brand}>
          <div style={styles.logoBadge}>CBTa 228</div>
          <div>
            <div style={styles.title}>CBTa 228</div>
            <div style={styles.subtitle}>Gral. Pedro Moreno González</div>
          </div>
        </a>

        {/* Menú de Navegación */}
        <nav style={styles.nav}>
          <a href="https://cbta228.edu.mx/" style={styles.navLink}>Inicio</a>
          <a href="https://cbta228.edu.mx/plantel/" style={styles.navLink}>Plantel</a>
          <a href="https://cbta228.edu.mx/oferta-educativa/" style={styles.navLink}>Oferta Educativa</a>
          <a href="/clubes/" style={{ ...styles.navLink, ...styles.navLinkActive }}>Clubes</a>
          <a href="https://cbta228.edu.mx/contacto/" style={styles.navLink}>Contacto</a>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#1b4332', // Verde institucional Agropecuario
    color: '#ffffff',
    padding: '12px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#ffffff',
  },
  logoBadge: {
    backgroundColor: '#2d6a4f',
    border: '2px solid #52b788',
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    lineHeight: '1.1',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#d8f3dc',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#d8f3dc',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  navLinkActive: {
    color: '#ffffff',
    fontWeight: 'bold',
    borderBottom: '2px solid #52b788',
    paddingBottom: '2px',
  },
};