import './Shared.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="cbta-footer">
      <div className="footer-content container">
        <div className="footer-info">
          <h3>CENTRO DE BACHILLERATO TECNOLÓGICO AGROPECUARIO No 228</h3>
          <p>AV. LAS AGUILILLAS 18A COL. LAS AGUILILLAS C.P. 45850</p>
          <p>IXTLAHUACÁN DE LOS MEMBRILLOS, JALISCO. MÉXICO</p>
          <p>TEL. +52 (37) 6762-0048</p>
        </div>
        <div className="footer-links">
          <h4>ENLACES RÁPIDOS</h4>
          <ul>
             <li><a href="https://cbta228.edu.mx/aviso-de-privacidad/">Aviso de Privacidad</a></li>
             <li><a href="https://cbta228.edu.mx/mapa-del-sitio/">Mapa del Sitio</a></li>
             <li><a href="/clubes/admin">Acceso Administrativo</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} CBTa 228. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;