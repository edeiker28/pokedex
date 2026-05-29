import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import ErrorBoundary from './ErrorBoundary'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gamer-bg text-slate-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
