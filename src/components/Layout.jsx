import { useAuth } from '../context/AuthContext'
import { LogOut, Home } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>🏠</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
            Renter Tracker
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)', display: 'none' }} className="email-label">
            {user?.email}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
