// src/main.jsx (Versión Corregida y Final)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Login from './components/Login.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- LÍNEA CLAVE AÑADIDA --- */}
    {/* Le decimos al router que la aplicación vive dentro de la carpeta /clubes/ */}
    <BrowserRouter basename="/clubes">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <RutaProtegida>
            <AdminPanel />
          </RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)