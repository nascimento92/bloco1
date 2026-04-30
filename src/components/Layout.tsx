import { NavLink, useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  useLocation() // re-renderiza ao trocar de rota para reler o sessionStorage
  const isAdmin = sessionStorage.getItem('adminAuth') === 'authenticated'
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('adminAuth')
    navigate('/')
  }

  return (
    <>
      <header className="site-header">
        <img className="logo" src={`${import.meta.env.BASE_URL}images.png`} alt="Logo do Condomínio" />
        <h1>Bloco 1</h1>
        <p>Regras de Boa Convivência</p>
      </header>

      <nav className="nav-bar">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Regras
        </NavLink>
        <NavLink to="/reclamacao" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Registrar Barulho
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/moradores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Moradores
            </NavLink>
            <NavLink to="/analise" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Análise
            </NavLink>
            <NavLink to="/planta" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Planta
            </NavLink>
            <button className="nav-link nav-logout" onClick={handleLogout}>
              Sair
            </button>
          </>
        )}
        {!isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Admin
          </NavLink>
        )}
      </nav>

      <main className="page-main">
        {children}
      </main>

      <footer className="site-footer">
        Bloco 1 &mdash; Juntos por uma convivência melhor ♥
      </footer>
    </>
  )
}
