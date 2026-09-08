// import './Shared.css';

// function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="cbta-footer">
//       <div className="footer-content container">
//         <div className="footer-info">
//           <h3>CENTRO DE BACHILLERATO TECNOLÓGICO AGROPECUARIO No 228</h3>
//           <p>AV. LAS AGUILILLAS 18A COL. LAS AGUILILLAS C.P. 45850</p>
//           <p>IXTLAHUACÁN DE LOS MEMBRILLOS, JALISCO. MÉXICO</p>
//           <p>TEL. +52 (37) 6762-0048</p>
//         </div>
//         <div className="footer-links">
//           <h4>ENLACES RÁPIDOS</h4>
//           <ul>
//              <li><a href="https://cbta228.edu.mx/aviso-de-privacidad/">Aviso de Privacidad</a></li>
//              <li><a href="https://cbta228.edu.mx/mapa-del-sitio/">Mapa del Sitio</a></li>
//              <li><a href="/clubes/admin">Acceso Administrativo</a></li>
//           </ul>
//         </div>
//       </div>
//       <div className="footer-bottom">
//         <div className="container">
//           <p>&copy; {currentYear} CBTa 228. Todos los derechos reservados.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export default Footer;

import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Columna 1: Información del Plantel */}
        <div style={styles.column}>
          <h4 style={styles.heading}>CBTa No. 228</h4>
          <p style={styles.subtext}>"Gral. Pedro Moreno González"</p>
          <p style={styles.text}>
            Centro de Bachillerato Tecnológico Agropecuario No. 228. Formación técnica y académica de excelencia.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Enlaces Rápidos</h4>
          <ul style={styles.list}>
            <li><a href="https://cbta228.edu.mx/" style={styles.link}>Inicio</a></li>
            <li><a href="https://cbta228.edu.mx/plantel/" style={styles.link}>Nuestro Plantel</a></li>
            <li><a href="https://cbta228.edu.mx/oferta-educativa/" style={styles.link}>Oferta Educativa</a></li>
            <li><a href="/clubes/" style={styles.link}>Inscripción a Clubes</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Contacto</h4>
          <p style={styles.text}>📍 Av. Las Aguilillas 18A, Col. Las Aguilillas, C.P. 45850. Ixtlahuacán de los Membrillos, Jalisco.</p>
          <p style={styles.text}>📞 <a href="tel:+523767620048" style={styles.link}>+52 (37) 6762-0048</a></p>
          <p style={styles.text}>✉️ <a href="mailto:contacto@cbta228.edu.mx" style={styles.link}>contacto@cbta228.edu.mx</a></p>
        </div>
      </div>

      {/* Barra de Copyright */}
      <div style={styles.copyright}>
        © {new Date().getFullYear()} CENTRO DE BACHILLERATO TECNOLÓGICO AGROPECUARIO No 228. Todos los derechos reservados.
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#081c15',
    color: '#d8f3dc',
    paddingTop: '40px',
    marginTop: 'auto',
    fontFamily: 'sans-serif',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px 30px 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  heading: {
    color: '#ffffff',
    fontSize: '1.1rem',
    marginBottom: '8px',
    borderBottom: '2px solid #2d6a4f',
    paddingBottom: '5px',
    display: 'inline-block',
  },
  subtext: {
    fontSize: '0.85rem',
    color: '#74c69d',
    fontStyle: 'italic',
  },
  text: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    color: '#95d5b2',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
  copyright: {
    backgroundColor: '#020804',
    textAlign: 'center',
    padding: '15px 20px',
    fontSize: '0.8rem',
    color: '#74c69d',
    borderTop: '1px solid #1b4332',
  },
};