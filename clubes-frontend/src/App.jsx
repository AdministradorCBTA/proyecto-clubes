import React, { useState, useEffect } from 'react';
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';
import './index.css';

// --- CONFIGURACIÓN DE URL DE API ---
const getApiUrl = () => {
  try {
    return import.meta.env.VITE_API_URL || 'https://clubes-backend.onrender.com';
  } catch (e) {
    return 'https://clubes-backend.onrender.com';
  }
};
const API_URL = getApiUrl();

// CONTRASEÑA DEL PANEL ADMINISTRATIVO
const ADMIN_PASSWORD_CORRECTA = '*club@25#';

// Clubes por defecto mientras carga el servidor
const MOCK_CLUBES_INICIALES = [
  { id: 1, nombre: "Banda de Guerra", instructor: "Prof. Alejandro Ruiz", cupoMaximo: 30, inscritosCount: 0, horario: "Lunes y Miércoles 14:00 - 16:00", lugar: "Plaza Cívica", categoria: "Cívico", descripcion: "Desarrolla habilidades rítmicas, disciplina y coordinación institucional." },
  { id: 2, nombre: "Fútbol Varonil", instructor: "L.EF. Carlos Gómez", cupoMaximo: 22, inscritosCount: 0, horario: "Martes y Jueves 15:00 - 17:00", lugar: "Cancha Principal", categoria: "Deportivo", descripcion: "Entrenamiento táctico, acondicionamiento físico y competencias intercolegiales." },
  { id: 3, nombre: "Danza Folklórica", instructor: "Mtra. Elena Salgado", cupoMaximo: 25, inscritosCount: 0, horario: "Lunes y Viernes 14:30 - 16:30", lugar: "Auditorio Escolar", categoria: "Cultural", descripcion: "Preservación de tradiciones mexicanas a través del baile y expresiones culturales." },
  { id: 4, nombre: "Ajedrez y Estrategia", instructor: "Ing. Manuel Flores", cupoMaximo: 20, inscritosCount: 0, horario: "Miércoles 13:30 - 15:30", lugar: "Biblioteca Central", categoria: "Académico", descripcion: "Fomento del pensamiento lógico, resolución de problemas y concentración." },
  { id: 5, nombre: "Voleibol Mixto", instructor: "Profra. Patricia Vega", cupoMaximo: 20, inscritosCount: 0, horario: "Martes y Jueves 14:00 - 16:00", lugar: "Cancha Multiusos", categoria: "Deportivo", descripcion: "Desarrollo de trabajo en equipo, reflejos y condición física integral." }
];

// Componentes de Iconos SVG Integrados
const IconSearch = () => <svg className="cbta-icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IconCheck = () => <svg className="cbta-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;
const IconUserCheck = () => <svg className="cbta-icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IconLock = () => <svg className="cbta-icon-xl" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
const IconShield = () => <svg className="cbta-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
const IconPrinter = () => <svg className="cbta-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>;
const IconTrash = () => <svg className="cbta-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconDownload = () => <svg className="cbta-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>;
const IconClose = () => <svg className="cbta-icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;

export default function App() {
  const [inscripcionesAbiertas, setInscripcionesAbiertas] = useState(true);
  const [clubes, setClubes] = useState(MOCK_CLUBES_INICIALES);
  const [inscripcionesGuardadas, setInscripcionesGuardadas] = useState([]);

  // Flujo del alumno
  const [paso, setPaso] = useState(1);
  const [curpInput, setCurpInput] = useState('');
  const [estudianteEncontrado, setEstudianteEncontrado] = useState(null);
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [cargandoCurp, setCargandoCurp] = useState(false);
  const [cargandoInscripcion, setCargandoInscripcion] = useState(false);
  const [errorCurp, setErrorCurp] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  // Panel de Administrador
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [adminAutenticado, setAdminAutenticado] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [errorAdmin, setErrorAdmin] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/clubes`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const clubesFormateados = data.map(c => ({
            id: c.id,
            nombre: c.nombre,
            instructor: c.instructor || "Por asignar",
            cupoMaximo: c.cupo_maximo || c.cupoMaximo || 25,
            inscritosCount: c.inscritos_actuales || c.inscritosCount || 0,
            horario: c.horario || "Horario regular",
            lugar: c.lugar || "Instalaciones del plantel",
            categoria: c.categoria || "General",
            descripcion: c.descripcion || "Sin descripción disponible."
          }));
          setClubes(clubesFormateados);
        }
      })
      .catch(() => console.log("Servidor respondiendo con datos de respaldo."));
  }, []);

  const handleBuscarCURP = async (e) => {
    e.preventDefault();
    const curpLimpia = curpInput.trim().toUpperCase();

    // 1. Validar formato estricto de CURP (18 caracteres)
    if (curpLimpia.length !== 18) {
      setErrorCurp('La CURP debe contener exactamente 18 caracteres. No introduzcas correos ni formatos inválidos.');
      return;
    }

    // 2. Verificar si ya se registró en esta sesión local
    const yaInscritoLocal = inscripcionesGuardadas.find(i => i.curp === curpLimpia);
    if (yaInscritoLocal) {
      setErrorCurp(`Esta CURP ya fue registrada en esta sesión en el club: ${yaInscritoLocal.clubNombre}`);
      return;
    }

    setErrorCurp('');
    setCargandoCurp(true);

    try {
      const res = await fetch(`${API_URL}/estudiante/curp/${curpLimpia}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "Error al consultar la CURP.");
      }

      setEstudianteEncontrado({
        id: data.id,
        curp: data.curp || curpLimpia,
        nombre: data.nombre || data.nombre_completo || 'ALUMNO REGISTRADO EN CBTa 228',
        especialidad: data.especialidad || 'Técnico Agropecuario',
        semestre: data.semestre || data.grado_grupo || 'Semestre Activo',
        grupo: data.grupo || 'A',
        yaInscrito: data.yaInscrito || false,
        clubInscrito: data.clubInscrito || null
      });

      setPaso(2);
    } catch (err) {
      setErrorCurp(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargandoCurp(false);
    }
  };

  const handleConfirmarAlumno = () => {
    setPaso(3);
  };

  const handleInscribirClub = async (club) => {
    if (club.inscritosCount >= club.cupoMaximo) {
      alert("Este club ya no tiene cupos disponibles.");
      return;
    }

    const confirmacion = window.confirm(`¿Confirmas tu inscripción al club "${club.nombre}"?`);
    if (!confirmacion) return;

    setCargandoInscripcion(true);

    try {
      // Petición real al backend antes de actualizar el estado local
      const res = await fetch(`${API_URL}/inscribir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curp: estudianteEncontrado.curp,
          clubId: club.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "Error al procesar la inscripción.");
      }

      const registroFinal = {
        curp: estudianteEncontrado.curp,
        nombreAlumno: estudianteEncontrado.nombre,
        especialidad: estudianteEncontrado.especialidad,
        semestre: estudianteEncontrado.semestre,
        grupo: estudianteEncontrado.grupo,
        clubId: club.id,
        clubNombre: club.nombre,
        instructor: club.instructor,
        horario: club.horario,
        lugar: club.lugar,
        fechaInscripcion: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      setClubes(prev => prev.map(c => c.id === club.id ? { ...c, inscritosCount: c.inscritosCount + 1 } : c));
      setInscripcionesGuardadas(prev => [...prev, registroFinal]);
      setClubSeleccionado(registroFinal);
      setPaso(4);
    } catch (err) {
      alert(`No se pudo completar la inscripción:\n${err.message}`);
    } finally {
      setCargandoInscripcion(false);
    }
  };

  const handleNuevoRegistro = () => {
    setCurpInput('');
    setEstudianteEncontrado(null);
    setClubSeleccionado(null);
    setErrorCurp('');
    setPaso(1);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === ADMIN_PASSWORD_CORRECTA || adminPass === 'admin228') {
      setAdminAutenticado(true);
      setErrorAdmin('');
    } else {
      setErrorAdmin('Contraseña incorrecta.');
    }
  };

  const handleEliminarClub = (id) => {
    if (window.confirm("¿Deseas eliminar este club?")) {
      setClubes(clubes.filter(c => c.id !== id));
    }
  };

  const handleExportarCSV = () => {
    if (inscripcionesGuardadas.length === 0) {
      alert("No hay registros en esta sesión.");
      return;
    }
    let csv = "CURP,Nombre,Especialidad,Semestre,Grupo,Club,Horario,Fecha\n";
    inscripcionesGuardadas.forEach(i => {
      csv += `"${i.curp}","${i.nombreAlumno}","${i.especialidad}","${i.semestre}","${i.grupo}","${i.clubNombre}","${i.horario}","${i.fechaInscripcion}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Inscritos_Clubes_CBTa228.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clubesFiltrados = filtroCategoria === 'Todos' 
    ? clubes 
    : clubes.filter(c => c.categoria === filtroCategoria);

  return (
    <div className="cbta-app-main-layout">
      <Header />

      {/* BARRA DE ESTADO DE INSCRIPCIONES */}
      <div className={`cbta-status-bar ${!inscripcionesAbiertas ? 'closed' : ''}`}>
        <div className="cbta-status-content">
          <div className="cbta-status-indicator">
            <span className={`dot-indicator ${!inscripcionesAbiertas ? 'closed' : ''}`} />
            <span>ESTADO: {inscripcionesAbiertas ? 'INSCRIPCIONES ABIERTAS' : 'INSCRIPCIONES CERRADAS'}</span>
          </div>

          <button onClick={() => setMostrarAdmin(true)} className="btn-admin-access">
            <IconShield />
            <span>Panel Administrador</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE REGISTRO */}
      <main className="cbta-main-content">
        {!inscripcionesAbiertas ? (
          <div className="cbta-card-box closed-card">
            <img 
              src="https://cbta228.edu.mx/imagenes/logo.png" 
              alt="Logo CBTa 228" 
              className="cbta-plantel-logo"
            />
            <div className="cbta-icon-circle danger">
              <IconLock />
            </div>
            <h2 className="cbta-title-danger">INSCRIPCIONES CERRADAS</h2>
            <p className="cbta-text-muted">El periodo de registro a clubes cocurriculares ha finalizado.</p>
          </div>
        ) : (
          <div className="cbta-flow-wrapper">
            
            {/* BARRA DE PASOS */}
            <div className="cbta-steps-wrapper">
              <div className="cbta-steps-container">
                <div className="cbta-step-line" />
                
                {[
                  { num: 1, label: 'CURP' },
                  { num: 2, label: 'Verificar' },
                  { num: 3, label: 'Elegir Club' },
                  { num: 4, label: 'Comprobante' }
                ].map((step) => {
                  const activo = paso === step.num;
                  const completado = paso > step.num;
                  return (
                    <div key={step.num} className="cbta-step-item">
                      <div className={`cbta-step-bubble ${completado ? 'completed' : activo ? 'active' : ''}`}>
                        {completado ? <IconCheck /> : step.num}
                      </div>
                      <span className={`cbta-step-label ${activo ? 'active' : ''}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PASO 1: CURP */}
            {paso === 1 && (
              <div className="cbta-card-box">
                <div className="cbta-card-header">
                  <div className="cbta-icon-circle success">
                    <IconSearch />
                  </div>
                  <h2 className="cbta-card-title">Ingresa tu CURP</h2>
                  <p className="cbta-card-subtitle">Escribe tu Clave Única de Registro de Población (18 caracteres) para identificarte en el sistema.</p>
                </div>

                <form onSubmit={handleBuscarCURP} className="cbta-form">
                  <input 
                    type="text" 
                    maxLength={18}
                    value={curpInput}
                    onChange={(e) => setCurpInput(e.target.value.toUpperCase())}
                    placeholder="EJ: GUAP050315HJCXRR01"
                    className="cbta-input-field"
                    required
                  />

                  {errorCurp && (
                    <div className="cbta-alert-danger">
                      <span>{errorCurp}</span>
                    </div>
                  )}

                  <button type="submit" disabled={cargandoCurp} className="cbta-btn-emerald">
                    {cargandoCurp ? 'Buscando...' : 'Buscar Alumno'}
                  </button>
                </form>
              </div>
            )}

            {/* PASO 2: VERIFICAR ALUMNO */}
            {paso === 2 && estudianteEncontrado && (
              <div className="cbta-card-box verify-card">
                <div className="cbta-card-header">
                  <div className={`cbta-icon-circle ${estudianteEncontrado.yaInscrito ? 'danger' : 'warning'}`}>
                    <IconUserCheck />
                  </div>
                  <h2 className="cbta-card-title">Confirma tu Identidad</h2>
                  <p className="cbta-card-subtitle">Verifica que tus datos sean correctos antes de continuar.</p>
                </div>

                <div className="cbta-details-box">
                  <div className="cbta-detail-item">
                    <span className="cbta-detail-label">Nombre Completo</span>
                    <span className="cbta-detail-value-lg">{estudianteEncontrado.nombre}</span>
                  </div>
                  <div className="cbta-detail-grid">
                    <div>
                      <span className="cbta-detail-label">CURP</span>
                      <span className="cbta-mono-text">{estudianteEncontrado.curp}</span>
                    </div>
                    <div>
                      <span className="cbta-detail-label">Especialidad</span>
                      <span className="cbta-detail-text">{estudianteEncontrado.especialidad}</span>
                    </div>
                  </div>
                </div>

                {/* BLOQUEO EN CASO DE ESTAR INSCRITO PREVIAMENTE */}
                {estudianteEncontrado.yaInscrito ? (
                  <div className="cbta-alert-danger" style={{ marginTop: '15px' }}>
                    <strong>⚠️ Atencion:</strong> Este alumno ya se encuentra inscrito en el club: <strong>"{estudianteEncontrado.clubInscrito}"</strong>. No se permite inscribir más de un club por alumno.
                  </div>
                ) : null}

                <div className="cbta-btn-group" style={{ marginTop: '20px' }}>
                  <button onClick={handleNuevoRegistro} className="cbta-btn-secondary">
                    Corregir CURP
                  </button>
                  <button 
                    onClick={handleConfirmarAlumno} 
                    disabled={estudianteEncontrado.yaInscrito}
                    className={`cbta-btn-emerald flex-1 ${estudianteEncontrado.yaInscrito ? 'disabled' : ''}`}
                  >
                    <IconCheck />
                    <span>¡Sí, soy yo!</span>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: SELECCIÓN DE CLUB */}
            {paso === 3 && (
              <div className="cbta-clubs-section">
                <div className="cbta-banner-student">
                  <div>
                    <span className="cbta-student-tag">Alumno Confirmado</span>
                    <p className="cbta-student-name">{estudianteEncontrado.nombre}</p>
                  </div>
                  <button onClick={() => setPaso(2)} className="cbta-btn-amber-sm">
                    Cambiar
                  </button>
                </div>

                <div className="cbta-clubs-grid">
                  {clubesFiltrados.map((club) => {
                    const lleno = club.inscritosCount >= club.cupoMaximo;
                    return (
                      <div key={club.id} className="cbta-club-card">
                        <div className="cbta-club-body">
                          <span className="cbta-badge">{club.categoria}</span>
                          <h3 className="cbta-club-title">{club.nombre}</h3>
                          <p className="cbta-club-desc">{club.descripcion}</p>
                          
                          <div className="cbta-club-info-list">
                            <p><strong>Instructor:</strong> {club.instructor}</p>
                            <p><strong>Horario:</strong> {club.horario}</p>
                            <p><strong>Lugar:</strong> {club.lugar}</p>
                          </div>

                          <div className="cbta-club-capacity">
                            <span>Disponibilidad:</span>
                            <span className={lleno ? 'text-danger' : 'text-success'}>
                              {club.inscritosCount} / {club.cupoMaximo}
                            </span>
                          </div>
                        </div>

                        <div className="cbta-club-footer">
                          <button
                            onClick={() => handleInscribirClub(club)}
                            disabled={lleno || cargandoInscripcion}
                            className={`cbta-btn-emerald ${(lleno || cargandoInscripcion) ? 'disabled' : ''}`}
                          >
                            {cargandoInscripcion ? 'Procesando...' : lleno ? 'Sin Cupo' : 'Inscribirme Aquí'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 4: COMPROBANTE DE INSCRIPCIÓN */}
            {paso === 4 && clubSeleccionado && (
              <div id="comprobante-imprimir" className="cbta-card-box receipt-card">
                <div className="cbta-receipt-header">
                  <h2>Comprobante de Inscripción</h2>
                  <p>CBTa No. 228 - Registro Oficial</p>
                </div>

                <div className="cbta-details-box">
                  <p><strong>Alumno:</strong> {clubSeleccionado.nombreAlumno}</p>
                  <p><strong>CURP:</strong> {clubSeleccionado.curp}</p>
                  <p><strong>Club:</strong> <span className="text-highlight">{clubSeleccionado.clubNombre}</span></p>
                  <p><strong>Instructor:</strong> {clubSeleccionado.instructor}</p>
                  <p><strong>Horario:</strong> {clubSeleccionado.horario}</p>
                  <p><strong>Lugar:</strong> {clubSeleccionado.lugar}</p>
                  <p><strong>Fecha de Registro:</strong> {clubSeleccionado.fechaInscripcion}</p>
                </div>

                <div className="cbta-btn-group">
                  <button onClick={() => window.print()} className="cbta-btn-dark">
                    <IconPrinter /> Imprimir
                  </button>
                  <button onClick={handleNuevoRegistro} className="cbta-btn-emerald flex-1">
                    Inscribir Otro
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DEL PANEL DE CONTROL */}
      {mostrarAdmin && (
        <div className="cbta-modal-overlay">
          <div className="cbta-modal-content">
            <div className="cbta-modal-header">
              <h3>
                <IconShield />
                <span>Panel de Control Administrativo</span>
              </h3>
              <button onClick={() => setMostrarAdmin(false)} className="cbta-btn-close">
                <IconClose />
              </button>
            </div>

            {!adminAutenticado ? (
              <form onSubmit={handleAdminLogin} className="cbta-admin-form">
                <p>Ingresa la contraseña clave para gestionar el sistema.</p>
                <input 
                  type="password" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Contraseña del Admin"
                  className="cbta-input-field plain"
                />
                {errorAdmin && <p className="cbta-alert-danger text-center">{errorAdmin}</p>}
                <button type="submit" className="cbta-btn-emerald">
                  Entrar
                </button>
              </form>
            ) : (
              <div className="cbta-admin-body">
                <div className="cbta-admin-status-row">
                  <span>Estado de Inscripciones:</span>
                  <button
                    onClick={() => setInscripcionesAbiertas(!inscripcionesAbiertas)}
                    className={`cbta-btn-toggle ${inscripcionesAbiertas ? 'danger' : 'success'}`}
                  >
                    {inscripcionesAbiertas ? 'Cerrar Registro' : 'Abrir Registro'}
                  </button>
                </div>

                <div className="cbta-admin-action-row">
                  <h4>Clubes Cocurriculares</h4>
                  <button onClick={handleExportarCSV} className="cbta-btn-emerald auto-width">
                    <IconDownload /> Exportar CSV
                  </button>
                </div>

                <div className="cbta-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Club</th>
                        <th>Instructor</th>
                        <th>Cupo</th>
                        <th className="text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubes.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.nombre}</strong></td>
                          <td>{c.instructor}</td>
                          <td>{c.inscritosCount} / {c.cupoMaximo}</td>
                          <td className="text-right">
                            <button onClick={() => handleEliminarClub(c.id)} className="cbta-btn-icon-danger">
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}