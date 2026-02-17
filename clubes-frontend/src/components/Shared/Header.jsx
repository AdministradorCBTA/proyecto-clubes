import './Shared.css';

function Header() {
  return (
    <header className="cbta-header">
      <div className="header-top">
        <div className="container">
          <span>Centro de Bachillerato Tecnológico Agropecuario No 228</span>
        </div>
      </div>
      <div className="header-main">
        <div className="container header-content">
          <div className="logo-area">
            {/* Logo oficial con fallback */}
            <img 
              src="https://cbta228.edu.mx/wp-content/uploads/2021/04/cropped-logo-cbta-228-300x88.png" 
              alt="Logo CBTa 228" 
              className="site-logo" 
              onError={(e) => {e.target.onerror = null; e.target.style.display='none';}} 
            />
          </div>
          <nav className="main-nav">
            <ul>
              <li><a href="https://cbta228.edu.mx/">PLANTEL</a></li>
              <li><a href="https://cbta228.edu.mx/noticias/">NOTICIAS</a></li>
              <li><a href="https://cbta228.edu.mx/admision/">ADMISIÓN</a></li>
              <li><a href="https://cbta228.edu.mx/estudiantes/">ESTUDIANTES</a></li>
              <li><a href="https://cbta228.edu.mx/docentes/">DOCENTES</a></li>
              <li><a href="https://cbta228.edu.mx/contacto/">CONTACTO</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;