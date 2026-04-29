import { Navigate, useLocation } from 'react-router-dom'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '1234'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  if (sessionStorage.getItem('adminAuth') !== ADMIN_PIN) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  return <>{children}</>
}
