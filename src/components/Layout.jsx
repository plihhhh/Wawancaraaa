import { Link, useLocation } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import AdminLogin from './AdminLogin'

export default function Layout({ children }) {
  const { isAdmin, logout, setShowLogin } = useAdmin()
  const location = useLocation()

  return (
    <>
      <header className="app-header">
        <Link to="/" className="app-header-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="rgba(255,255,255,.15)"/>
            <path d="M7 9h4v10H7V9zm5 0h4v10h-4V9zm5 0h4v10h-4V9z" fill="rgba(255,255,255,.3)"/>
            <path d="M8 13l2 2-2 2M13 13l2 2-2 2M18 13l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>Sistem Wawancara Organisasi</h1>
        </Link>
        <div className="header-actions">
          {isAdmin && (
            <Link to="/pengaturan" className="btn btn-header" style={location.pathname === '/pengaturan' ? { background: 'rgba(255,255,255,.25)' } : {}}>
              ⚙️ Pengaturan
            </Link>
          )}
          {isAdmin ? (
            <button className="btn btn-header" onClick={logout}>🔓 Keluar Admin</button>
          ) : (
            <button className="btn btn-header" onClick={() => setShowLogin(true)}>🔒 Admin</button>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <AdminLogin />
    </>
  )
}
