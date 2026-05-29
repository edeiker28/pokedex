import { NavLink } from 'react-router-dom'
import { useTeamStore } from '../store/teamStore'

export default function Navbar() {
  const teamCount = useTeamStore(s => s.team.length)

  return (
    <nav className="sticky top-0 z-50 bg-gamer-bg/95 backdrop-blur border-b border-gamer-purple/20 shadow-glow-purple">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-mono text-gamer-purple-light text-lg font-bold hover:text-gamer-purple transition-colors">
          ⚡ PokéDex
        </NavLink>

        <div className="flex items-center gap-6">
          <NavLink
            to="/pokedex"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-gamer-purple-light border-b-2 border-gamer-purple pb-0.5' : 'text-slate-400 hover:text-white'}`
            }
          >
            Pokédex
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-gamer-purple-light border-b-2 border-gamer-purple pb-0.5' : 'text-slate-400 hover:text-white'}`
            }
          >
            Team Builder
          </NavLink>
        </div>

        <NavLink
          to="/team"
          className="bg-gamer-red/20 border border-gamer-red/50 hover:bg-gamer-red/30 transition-colors rounded-full px-3 py-1 text-xs font-mono text-red-300 shadow-glow-red"
        >
          🏆 Equipo ({teamCount}/6)
        </NavLink>
      </div>
    </nav>
  )
}
