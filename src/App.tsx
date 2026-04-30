import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import Moradores from './pages/Moradores'
import Reclamacao from './pages/Reclamacao'
import Analise from './pages/Analise'
import Planta from './pages/Planta'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reclamacao" element={<Reclamacao />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/moradores" element={
            <ProtectedRoute><Moradores /></ProtectedRoute>
          } />
          <Route path="/analise" element={
            <ProtectedRoute><Analise /></ProtectedRoute>
          } />
          <Route path="/planta" element={
            <ProtectedRoute><Planta /></ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
