import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  if (sessionStorage.getItem('adminAuth') !== 'authenticated') {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  return <>{children}</>
}
